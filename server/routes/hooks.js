const { Router } = require("express");
const { v4: uuidv4 } = require("uuid");
const { stmts, db } = require("../db");
const { broadcast } = require("../websocket");

const router = Router();

function ensureSession(sessionId, data) {
  let session = stmts.getSession.get(sessionId);
  if (!session) {
    stmts.insertSession.run(
      sessionId,
      data.session_name || `Session ${sessionId.slice(0, 8)}`,
      "active",
      data.cwd || null,
      data.model || null,
      null
    );
    session = stmts.getSession.get(sessionId);
    broadcast("session_created", session);

    // Create main agent for new session
    const mainAgentId = `${sessionId}-main`;
    stmts.insertAgent.run(
      mainAgentId,
      sessionId,
      "Main Agent",
      "main",
      null,
      "connected",
      null,
      null,
      null
    );
    broadcast("agent_created", stmts.getAgent.get(mainAgentId));
  }
  return session;
}

function getMainAgent(sessionId) {
  return stmts.getAgent.get(`${sessionId}-main`);
}

const processEvent = db.transaction((hookType, data) => {
  const sessionId = data.session_id;
  if (!sessionId) return null;

  ensureSession(sessionId, data);
  const mainAgent = getMainAgent(sessionId);
  const mainAgentId = mainAgent?.id ?? null;

  let eventType = hookType;
  let toolName = data.tool_name || null;
  let summary = null;
  let agentId = mainAgentId;

  switch (hookType) {
    case "PreToolUse": {
      summary = `Using tool: ${toolName}`;

      // If the tool is Agent, a subagent is being created
      if (toolName === "Agent") {
        const input = data.tool_input || {};
        const subId = uuidv4();
        const subName = input.description || input.subagent_type || "Subagent";
        stmts.insertAgent.run(
          subId,
          sessionId,
          subName,
          "subagent",
          input.subagent_type || null,
          "working",
          input.prompt ? input.prompt.slice(0, 500) : null,
          mainAgentId,
          input.metadata ? JSON.stringify(input.metadata) : null
        );
        broadcast("agent_created", stmts.getAgent.get(subId));
        agentId = subId;
        summary = `Subagent spawned: ${subName}`;
      }

      // Update main agent status
      if (mainAgent) {
        stmts.updateAgent.run(null, "working", null, toolName, null, null, mainAgentId);
        broadcast("agent_updated", stmts.getAgent.get(mainAgentId));
      }
      break;
    }

    case "PostToolUse": {
      summary = `Tool completed: ${toolName}`;

      if (mainAgent) {
        stmts.updateAgent.run(null, "connected", null, null, null, null, mainAgentId);
        broadcast("agent_updated", stmts.getAgent.get(mainAgentId));
      }
      break;
    }

    case "Stop": {
      summary = `Session ended: ${data.stop_reason || "completed"}`;
      const endStatus = data.stop_reason === "error" ? "error" : "completed";

      // End all active agents in this session
      const agents = stmts.listAgentsBySession.all(sessionId);
      for (const agent of agents) {
        if (agent.status === "working" || agent.status === "connected" || agent.status === "idle") {
          stmts.updateAgent.run(null, "completed", null, null, new Date().toISOString(), null, agent.id);
          broadcast("agent_updated", stmts.getAgent.get(agent.id));
        }
      }

      // End session
      stmts.updateSession.run(null, endStatus, new Date().toISOString(), null, sessionId);
      broadcast("session_updated", stmts.getSession.get(sessionId));
      break;
    }

    case "SubagentStop": {
      summary = `Subagent completed`;
      // Find the most recent working subagent for this session
      const subagents = stmts.listAgentsBySession.all(sessionId);
      const workingSub = subagents.find(
        (a) => a.type === "subagent" && a.status === "working"
      );
      if (workingSub) {
        stmts.updateAgent.run(null, "completed", null, null, new Date().toISOString(), null, workingSub.id);
        broadcast("agent_updated", stmts.getAgent.get(workingSub.id));
        agentId = workingSub.id;
      }
      break;
    }

    case "Notification": {
      summary = data.message || "Notification received";
      break;
    }

    default: {
      summary = `Event: ${hookType}`;
    }
  }

  stmts.insertEvent.run(
    sessionId,
    agentId,
    eventType,
    toolName,
    summary,
    JSON.stringify(data),
    // created_at uses default
  );

  const event = {
    session_id: sessionId,
    agent_id: agentId,
    event_type: eventType,
    tool_name: toolName,
    summary,
    created_at: new Date().toISOString(),
  };
  broadcast("new_event", event);
  return event;
});

router.post("/event", (req, res) => {
  const { hook_type, data } = req.body;
  if (!hook_type || !data) {
    return res.status(400).json({
      error: { code: "INVALID_INPUT", message: "hook_type and data are required" },
    });
  }

  const result = processEvent(hook_type, data);
  if (!result) {
    return res.status(400).json({
      error: { code: "MISSING_SESSION", message: "session_id is required in data" },
    });
  }

  res.json({ ok: true, event: result });
});

module.exports = router;
