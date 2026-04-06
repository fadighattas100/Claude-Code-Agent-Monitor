import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { Logger } from "./logger.js";
import { errorResult, jsonResult } from "./tool-result.js";

type GenericInput = Record<string, unknown>;

export type ToolHandler = (args: GenericInput) => Promise<unknown>;

export interface ToolRegistrar {
  (
    name: string,
    description: string,
    inputSchema: Record<string, z.ZodTypeAny>,
    handler: ToolHandler
  ): void;
}

export interface ToolEntry {
  name: string;
  description: string;
  handler: ToolHandler;
}

export function createToolRegistrar(server: McpServer, logger: Logger): ToolRegistrar {
  return (name, description, inputSchema, handler) => {
    server.registerTool(name, { description, inputSchema }, async (args) => {
      try {
        logger.debug("Tool invocation started", { tool: name });
        const result = await handler(args as GenericInput);
        logger.debug("Tool invocation completed", { tool: name });
        return jsonResult(name, result);
      } catch (error) {
        logger.error("Tool invocation failed", {
          tool: name,
          error: error instanceof Error ? error.message : "Unknown error",
        });
        return errorResult(error);
      }
    });
  };
}

/** Registrar that also collects tool entries for REPL mode */
export function createDualRegistrar(
  server: McpServer,
  logger: Logger,
  collector: ToolEntry[]
): ToolRegistrar {
  const mcpRegistrar = createToolRegistrar(server, logger);
  return (name, description, inputSchema, handler) => {
    mcpRegistrar(name, description, inputSchema, handler);
    collector.push({ name, description, handler });
  };
}

/** Registrar that only collects (no MCP server, for pure REPL mode) */
export function createCollectorRegistrar(collector: ToolEntry[]): ToolRegistrar {
  return (name, description, _inputSchema, handler) => {
    collector.push({ name, description, handler });
  };
}
