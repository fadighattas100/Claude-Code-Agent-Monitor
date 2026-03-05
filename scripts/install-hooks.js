#!/usr/bin/env node

/**
 * Installs Claude Code hooks that forward events to the Agent Dashboard.
 * Modifies ~/.claude/settings.json to add hook entries.
 */

const fs = require("fs");
const path = require("path");
const os = require("os");

const SETTINGS_PATH = path.join(os.homedir(), ".claude", "settings.json");
const HOOK_HANDLER = path.resolve(__dirname, "hook-handler.js").replace(/\\/g, "/");

const HOOKS_TO_INSTALL = {
  PreToolUse: {
    command: `node "${HOOK_HANDLER}" PreToolUse`,
    timeout: 5000,
  },
  PostToolUse: {
    command: `node "${HOOK_HANDLER}" PostToolUse`,
    timeout: 5000,
  },
  Stop: {
    command: `node "${HOOK_HANDLER}" Stop`,
    timeout: 5000,
  },
  SubagentStop: {
    command: `node "${HOOK_HANDLER}" SubagentStop`,
    timeout: 5000,
  },
  Notification: {
    command: `node "${HOOK_HANDLER}" Notification`,
    timeout: 5000,
  },
};

function main() {
  // Read existing settings
  let settings = {};
  if (fs.existsSync(SETTINGS_PATH)) {
    try {
      const raw = fs.readFileSync(SETTINGS_PATH, "utf8");
      settings = JSON.parse(raw);
    } catch (err) {
      console.error(`Failed to parse ${SETTINGS_PATH}:`, err.message);
      process.exit(1);
    }
  }

  // Ensure hooks section exists
  if (!settings.hooks) {
    settings.hooks = {};
  }

  let installed = 0;
  let skipped = 0;

  for (const [hookType, hookConfig] of Object.entries(HOOKS_TO_INSTALL)) {
    if (!settings.hooks[hookType]) {
      settings.hooks[hookType] = [];
    }

    // Check if our hook is already installed
    const alreadyInstalled = settings.hooks[hookType].some(
      (h) => h.command && h.command.includes("hook-handler.js")
    );

    if (alreadyInstalled) {
      // Update existing hook
      settings.hooks[hookType] = settings.hooks[hookType].map((h) =>
        h.command && h.command.includes("hook-handler.js") ? hookConfig : h
      );
      skipped++;
    } else {
      settings.hooks[hookType].push(hookConfig);
      installed++;
    }
  }

  // Write settings back
  const dir = path.dirname(SETTINGS_PATH);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2) + "\n", "utf8");

  console.log(`Hook handler: ${HOOK_HANDLER}`);
  console.log(`Settings file: ${SETTINGS_PATH}`);
  console.log(`Installed: ${installed} new hooks`);
  console.log(`Updated: ${skipped} existing hooks`);
  console.log("");
  console.log("Claude Code hooks are now configured.");
  console.log("Start the dashboard server (npm run dev) then open a Claude Code session.");
}

main();
