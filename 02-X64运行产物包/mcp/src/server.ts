// @ts-nocheck
// MCP SDK 的 server.tool() 链式注册会导致 TypeScript 类型实例化深度超限
// 运行时行为不受影响，类型保证由 API 层 (api.ts) 提供
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  getMatches,
  getTeam,
  getTeams,
  getStandings,
  getGroups,
  getTopScorers,
  getTopAssists,
  statusText,
  roundText,
} from "./api.js";

const server = new McpServer({
  name: "football-match-platform",
  version: "1.0.0",
});

server.tool(
  "list_matches",
  "查询 2026 世界杯比赛列表，支持按小组筛选。返回比赛的球队、时间、状态和比分。",
  {
    group: z
      .string()
      .optional()
      .describe("小组赛分组，如 'Group A'、'Group B' 等。不传则返回所有比赛。"),
    status: z
      .enum(["scheduled", "in_progress", "completed"])
      .optional()
      .describe(
        "按比赛状态筛选：scheduled(未开始)、in_progress(进行中)、completed(已结束)",
      ),
    limit: z.number().optional().describe("返回结果数量限制，默认不限制"),
  },
  async ({ group, status, limit }) => {
    try {
      const result = await getMatches(group);
      let matches = result.data;

      if (status) {
        matches = matches.filter((m) => m.status === status);
      }

      if (limit && limit > 0) {
        matches = matches.slice(0, limit);
      }

      if (matches.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: "没有找到符合条件的比赛。",
            },
          ],
        };
      }

      const summary = matches
        .map((m, i) => {
          const score =
            m.status === "completed" ? `${m.homeScore} - ${m.awayScore}` : "vs";
          const roundInfo = m.group ? m.group : roundText(m.round);
          return `${i + 1}. [${roundInfo}] ${m.homeTeamName} ${score} ${m.awayTeamName} | ${statusText(m.status)} | ${new Date(m.startTime).toLocaleString("zh-CN")} | ID: ${m.id}`;
        })
        .join("\n");

      return {
        content: [
          {
            type: "text",
            text: `共找到 ${matches.length} 场比赛：\n\n${summary}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `查询比赛列表失败：${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  },
);

server.tool(
  "get_team",
  "查询球队详细信息，包括球队名称、国家、所在小组、球队描述等。",
  {
    teamId: z.number().describe("球队 ID"),
  },
  async ({ teamId }) => {
    try {
      const result = await getTeam(teamId);
      const team = result.data;

      return {
        content: [
          {
            type: "text",
            text:
              `球队名称：${team.name}\n` +
              `国家/地区：${team.country}\n` +
              `所在小组：${team.group}\n` +
              `球队徽标：${team.logo}\n` +
              `球队简介：${team.description}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `查询球队信息失败：${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  },
);

server.tool(
  "list_teams",
  "查询参赛球队列表，支持按小组筛选。返回球队 ID、名称、国家和小组。",
  {
    group: z
      .string()
      .optional()
      .describe("小组赛分组，如 'Group A'、'Group B' 等。不传则返回所有球队。"),
  },
  async ({ group }) => {
    try {
      const result = await getTeams(group);
      const teams = result.data;

      if (teams.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: "没有找到符合条件的球队。",
            },
          ],
        };
      }

      const summary = teams
        .map(
          (t, i) =>
            `${i + 1}. ${t.name} (${t.country}) - ${t.group} | ID: ${t.id}`,
        )
        .join("\n");

      return {
        content: [
          {
            type: "text",
            text: `共找到 ${teams.length} 支球队：\n\n${summary}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `查询球队列表失败：${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  },
);

server.tool(
  "get_standings",
  "查询 2026 世界杯积分榜，支持按小组筛选。返回球队排名、积分、胜平负、净胜球等。",
  {
    group: z
      .string()
      .optional()
      .describe(
        "小组赛分组，如 'Group A'、'Group B' 等。不传则返回所有小组积分榜。",
      ),
  },
  async ({ group }) => {
    try {
      const result = await getStandings(group);
      const standings = result.data;

      if (standings.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: "没有找到积分榜数据。",
            },
          ],
        };
      }

      const groupsMap = new Map<string, typeof standings>();
      for (const entry of standings) {
        const g = entry.group || "其他";
        if (!groupsMap.has(g)) {
          groupsMap.set(g, []);
        }
        groupsMap.get(g)!.push(entry);
      }

      let output = "";
      for (const [groupName, entries] of groupsMap) {
        output += `【${groupName} 积分榜】\n`;
        output +=
          "排名  球队                赛  胜  平  负  进球  失球  净胜  积分\n";
        output +=
          "----------------------------------------------------------------\n";
        entries.forEach((e, i) => {
          const gd =
            e.goalDifference > 0
              ? `+${e.goalDifference}`
              : String(e.goalDifference);
          output += `${String(i + 1).padEnd(4)} ${e.teamName.padEnd(18)} ${String(e.played).padEnd(3)} ${String(e.won).padEnd(3)} ${String(e.drawn).padEnd(3)} ${String(e.lost).padEnd(3)} ${String(e.goalsFor).padEnd(5)} ${String(e.goalsAgainst).padEnd(5)} ${gd.padEnd(5)} ${e.points}\n`;
        });
        output += "\n";
      }

      return {
        content: [
          {
            type: "text",
            text: output,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `查询积分榜失败：${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  },
);

server.tool(
  "get_top_scorers",
  "查询 2026 世界杯射手榜，返回球员名称、球队、进球数等。",
  {
    limit: z.number().optional().describe("返回前 N 名射手，默认返回全部"),
  },
  async ({ limit }) => {
    try {
      const result = await getTopScorers(limit);
      const scorers = result.data;

      if (scorers.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: "暂无射手榜数据。",
            },
          ],
        };
      }

      const summary = scorers
        .map(
          (p, i) =>
            `${i + 1}. ${p.name} - ${p.goals} 球 (${p.appearances} 场出场, ${p.assists} 次助攻)`,
        )
        .join("\n");

      return {
        content: [
          {
            type: "text",
            text: `射手榜 TOP ${scorers.length}：\n\n${summary}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `查询射手榜失败：${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  },
);

server.tool(
  "get_top_assists",
  "查询 2026 世界杯助攻榜，返回球员名称、球队、助攻数等。",
  {
    limit: z.number().optional().describe("返回前 N 名助攻球员，默认返回全部"),
  },
  async ({ limit }) => {
    try {
      const result = await getTopAssists(limit);
      const assisters = result.data;

      if (assisters.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: "暂无助攻榜数据。",
            },
          ],
        };
      }

      const summary = assisters
        .map(
          (p, i) =>
            `${i + 1}. ${p.name} - ${p.assists} 次助攻 (${p.appearances} 场出场, ${p.goals} 球)`,
        )
        .join("\n");

      return {
        content: [
          {
            type: "text",
            text: `助攻榜 TOP ${assisters.length}：\n\n${summary}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `查询助攻榜失败：${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  },
);

server.tool("list_groups", "查询所有小组赛分组列表。", {}, async () => {
  try {
    const result = await getGroups();
    const groups = result.data;

    if (groups.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: "没有找到分组数据。",
          },
        ],
      };
    }

    return {
      content: [
        {
          type: "text",
          text: `2026 世界杯共 ${groups.length} 个小组：\n\n${groups.join("、")}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `查询分组失败：${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Football Match Platform MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
