export type SessionStatus = "active" | "completed" | "error" | "abandoned";
export type AgentStatus = "idle" | "connected" | "working" | "completed" | "error";
export type AgentType = "main" | "subagent";

export interface Session {
  id: string;
  name: string | null;
  status: SessionStatus;
  cwd: string | null;
  model: string | null;
  started_at: string;
  ended_at: string | null;
  metadata: string | null;
  agent_count?: number;
}

export interface Agent {
  id: string;
  session_id: string;
  name: string;
  type: AgentType;
  subagent_type: string | null;
  status: AgentStatus;
  task: string | null;
  current_tool: string | null;
  started_at: string;
  ended_at: string | null;
  parent_agent_id: string | null;
  metadata: string | null;
}

export interface DashboardEvent {
  id: number;
  session_id: string;
  agent_id: string | null;
  event_type: string;
  tool_name: string | null;
  summary: string | null;
  data: string | null;
  created_at: string;
}

export interface Stats {
  total_sessions: number;
  active_sessions: number;
  active_agents: number;
  total_agents: number;
  total_events: number;
  events_today: number;
  ws_connections: number;
  agents_by_status: Record<string, number>;
  sessions_by_status: Record<string, number>;
}

export interface WSMessage {
  type:
    | "session_created"
    | "session_updated"
    | "agent_created"
    | "agent_updated"
    | "new_event";
  data: Session | Agent | DashboardEvent;
  timestamp: string;
}

export const STATUS_CONFIG: Record<
  AgentStatus,
  { label: string; color: string; bg: string; dot: string }
> = {
  idle: {
    label: "Idle",
    color: "text-gray-400",
    bg: "bg-gray-500/10 border-gray-500/20",
    dot: "bg-gray-400",
  },
  connected: {
    label: "Connected",
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
    dot: "bg-blue-400",
  },
  working: {
    label: "Working",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    dot: "bg-emerald-400",
  },
  completed: {
    label: "Completed",
    color: "text-violet-400",
    bg: "bg-violet-500/10 border-violet-500/20",
    dot: "bg-violet-400",
  },
  error: {
    label: "Error",
    color: "text-red-400",
    bg: "bg-red-500/10 border-red-500/20",
    dot: "bg-red-400",
  },
};

export const SESSION_STATUS_CONFIG: Record<
  SessionStatus,
  { label: string; color: string; bg: string }
> = {
  active: { label: "Active", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  completed: { label: "Completed", color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20" },
  error: { label: "Error", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
  abandoned: { label: "Abandoned", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
};
