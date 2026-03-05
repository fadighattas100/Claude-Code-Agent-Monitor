import type { WSMessage } from "./types";

type Handler = (msg: WSMessage) => void;

const handlers = new Set<Handler>();

export const eventBus = {
  subscribe(handler: Handler): () => void {
    handlers.add(handler);
    return () => handlers.delete(handler);
  },

  publish(msg: WSMessage): void {
    handlers.forEach((handler) => handler(msg));
  },
};
