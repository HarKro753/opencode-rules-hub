import { type Plugin, tool } from "@opencode-ai/plugin";
import { readConfig } from "./config.js";
import { fetchRulesFromServer } from "./fetcher.js";
import { readLocalRules, writeLocalRules } from "./storage.js";
import { buildContextInjection } from "./injector.js";

export const RulesHubPlugin: Plugin = async ({ directory, client }) => {
  const config = await readConfig(directory);

  if (!config) {
    await client.app.log({
      body: {
        service: "rules-hub",
        level: "debug",
        message:
          "No .opencode/rules.json found — rules-hub plugin inactive",
      },
    });
    return {};
  }

  await client.app.log({
    body: {
      service: "rules-hub",
      level: "info",
      message: `Rules Hub active — sets: [${config.sets.join(", ")}]`,
    },
  });

  async function syncRules(): Promise<string> {
    const rules = await fetchRulesFromServer(config!);
    await writeLocalRules(directory, rules);
    return rules;
  }

  return {
    "experimental.session.compacting": async (_input, output) => {
      try {
        let rules = await readLocalRules(directory);

        if (rules === null) {
          rules = await syncRules();
        }

        output.context.push(buildContextInjection(rules));
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        await client.app.log({
          body: {
            service: "rules-hub",
            level: "error",
            message: `Failed to inject rules during compaction: ${message}`,
          },
        });
      }
    },

    tool: {
      "rules-sync": tool({
        description:
          "Force re-fetch all rule sets from the rules server and update the local cache",
        args: {},
        async execute() {
          try {
            const rules = await syncRules();
            const lineCount = rules.split("\n").length;
            return `Synced ${config!.sets.length} rule set(s) from ${config!.server} (${lineCount} lines). Local cache updated.`;
          } catch (error) {
            const message =
              error instanceof Error ? error.message : "Unknown error";
            return `Failed to sync rules: ${message}`;
          }
        },
      }),

      rules: tool({
        description:
          "Display the current locally cached rules from rules-hub",
        args: {},
        async execute() {
          const rules = await readLocalRules(directory);

          if (rules === null) {
            return "No local rules found. Run /rules-sync to fetch from server.";
          }

          return rules;
        },
      }),
    },
  };
};
