import { Bot, GitBranch, Clock, Wrench } from "lucide-react";
import { AgentStatusBadge } from "./StatusBadge";
import type { Agent } from "../lib/types";
import { formatDuration, formatTime } from "../lib/format";

interface AgentCardProps {
  agent: Agent;
  onClick?: () => void;
}

export function AgentCard({ agent, onClick }: AgentCardProps) {
  const isActive = agent.status === "working" || agent.status === "connected";

  return (
    <div
      onClick={onClick}
      className={`card-hover p-4 cursor-pointer animate-fade-in ${
        isActive ? "border-l-2 border-l-emerald-500/50" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${
              agent.type === "main"
                ? "bg-accent/15 text-accent"
                : "bg-violet-500/15 text-violet-400"
            }`}
          >
            {agent.type === "main" ? (
              <Bot className="w-3.5 h-3.5" />
            ) : (
              <GitBranch className="w-3.5 h-3.5" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-200 truncate">
              {agent.name}
            </p>
            {agent.subagent_type && (
              <p className="text-[11px] text-gray-500 truncate">
                {agent.subagent_type}
              </p>
            )}
          </div>
        </div>
        <AgentStatusBadge status={agent.status} />
      </div>

      {agent.task && (
        <p className="text-xs text-gray-400 mb-3 line-clamp-2 leading-relaxed">
          {agent.task}
        </p>
      )}

      <div className="flex items-center gap-4 text-[11px] text-gray-500">
        {agent.current_tool && (
          <span className="flex items-center gap-1">
            <Wrench className="w-3 h-3" />
            {agent.current_tool}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {agent.ended_at
            ? formatDuration(agent.started_at, agent.ended_at)
            : formatTime(agent.started_at)}
        </span>
      </div>
    </div>
  );
}
