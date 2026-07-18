import assert from "node:assert/strict";
import { test } from "node:test";
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
} from "../src/api";

test("MCP: statusText maps status codes correctly", () => {
  assert.equal(statusText("scheduled"), "未开始");
  assert.equal(statusText("in_progress"), "进行中");
  assert.equal(statusText("completed"), "已结束");
  assert.equal(statusText("unknown"), "unknown");
});

test("MCP: roundText maps round codes correctly", () => {
  assert.equal(roundText("group"), "小组赛");
  assert.equal(roundText("round_of_32"), "三十二强");
  assert.equal(roundText("round_of_16"), "十六强");
  assert.equal(roundText("quarter_final"), "四分之一决赛");
  assert.equal(roundText("semi_final"), "半决赛");
  assert.equal(roundText("final"), "决赛");
});

test("AC-01: MCP list_matches - 查询比赛列表返回数据", async () => {
  const result = await getMatches();
  assert.ok(Array.isArray(result.data), "matches should be an array");
  assert.ok(result.data.length > 0, "should have matches");
  const match = result.data[0];
  assert.ok(typeof match.id === "number", "match should have numeric id");
  assert.ok(match.homeTeamName, "match should have homeTeamName");
  assert.ok(match.awayTeamName, "match should have awayTeamName");
  assert.ok(match.startTime, "match should have startTime");
  assert.ok(match.status, "match should have status");
});

test("MCP: list_matches - 按小组筛选比赛", async () => {
  const groups = await getGroups();
  if (groups.data.length === 0) return;
  const firstGroup = groups.data[0];
  const result = await getMatches(firstGroup);
  assert.ok(Array.isArray(result.data), "matches should be an array");
  assert.ok(result.data.length > 0, `group ${firstGroup} should have matches`);
  for (const match of result.data) {
    assert.equal(
      match.group,
      firstGroup,
      "all matches should be in requested group",
    );
  }
});

test("AC-02: MCP get_team - 查询球队详情", async () => {
  const teams = await getTeams();
  if (teams.data.length === 0) return;
  const firstTeam = teams.data[0];
  const result = await getTeam(firstTeam.id);
  const team = result.data;
  assert.equal(team.id, firstTeam.id, "team id should match");
  assert.ok(team.name, "team should have name");
  assert.ok(team.country, "team should have country");
  assert.ok(team.group, "team should have group");
  assert.ok(team.description, "team should have description");
});

test("MCP: list_teams - 查询球队列表", async () => {
  const result = await getTeams();
  assert.ok(Array.isArray(result.data), "teams should be an array");
  assert.ok(result.data.length > 0, "should have teams");
  assert.equal(result.data.length, 48, "2026 World Cup should have 48 teams");
});

test("MCP: list_teams - 按小组筛选球队", async () => {
  const groups = await getGroups();
  if (groups.data.length === 0) return;
  const firstGroup = groups.data[0];
  const result = await getTeams(firstGroup);
  assert.ok(Array.isArray(result.data), "teams should be an array");
  assert.ok(result.data.length > 0, `group ${firstGroup} should have teams`);
  for (const team of result.data) {
    assert.equal(
      team.group,
      firstGroup,
      "all teams should be in requested group",
    );
  }
});

test("AC-03: MCP get_standings - 查询积分榜", async () => {
  const result = await getStandings();
  assert.ok(Array.isArray(result.data), "standings should be an array");
  assert.ok(result.data.length > 0, "should have standings entries");
  const entry = result.data[0];
  assert.ok(entry.teamName, "entry should have teamName");
  assert.ok(typeof entry.points === "number", "entry should have points");
  assert.ok(typeof entry.played === "number", "entry should have played");
  assert.ok(typeof entry.won === "number", "entry should have won");
  assert.ok(typeof entry.drawn === "number", "entry should have drawn");
  assert.ok(typeof entry.lost === "number", "entry should have lost");
  assert.ok(typeof entry.goalsFor === "number", "entry should have goalsFor");
  assert.ok(
    typeof entry.goalsAgainst === "number",
    "entry should have goalsAgainst",
  );
  assert.ok(
    typeof entry.goalDifference === "number",
    "entry should have goalDifference",
  );
});

test("MCP: get_standings - 按小组筛选积分榜", async () => {
  const groups = await getGroups();
  if (groups.data.length === 0) return;
  const firstGroup = groups.data[0];
  const result = await getStandings(firstGroup);
  assert.ok(Array.isArray(result.data), "standings should be an array");
  assert.ok(
    result.data.length > 0,
    `group ${firstGroup} should have standings`,
  );
  for (const entry of result.data) {
    assert.equal(
      entry.group,
      firstGroup,
      "all entries should be in requested group",
    );
  }
});

test("AC-04: MCP get_top_scorers - 查询射手榜", async () => {
  const result = await getTopScorers();
  assert.ok(Array.isArray(result.data), "scorers should be an array");
  if (result.data.length > 0) {
    const player = result.data[0];
    assert.ok(player.name, "player should have name");
    assert.ok(typeof player.goals === "number", "player should have goals");
    assert.ok(
      typeof player.appearances === "number",
      "player should have appearances",
    );
  }
});

test("MCP: get_top_scorers - limit 参数限制结果数量", async () => {
  const result = await getTopScorers(5);
  assert.ok(result.data.length <= 5, "should return at most 5 players");
});

test("MCP: get_top_assists - 查询助攻榜", async () => {
  const result = await getTopAssists();
  assert.ok(Array.isArray(result.data), "assisters should be an array");
  if (result.data.length > 0) {
    const player = result.data[0];
    assert.ok(player.name, "player should have name");
    assert.ok(typeof player.assists === "number", "player should have assists");
  }
});

test("MCP: list_groups - 查询所有分组", async () => {
  const result = await getGroups();
  assert.ok(Array.isArray(result.data), "groups should be an array");
  assert.equal(result.data.length, 12, "2026 World Cup should have 12 groups");
});

test("AC-05: MCP - 后端不可用时返回错误信息", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = () => Promise.reject(new Error("Connection refused"));
  try {
    await assert.rejects(
      getMatches(),
      /Connection refused/,
      "should reject with network error",
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("AC-05: MCP - API 返回 404 时抛出错误", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = () => Promise.resolve(new Response(null, { status: 404 }));
  try {
    await assert.rejects(
      getTeam(999999),
      /status 404/,
      "should reject with 404 error",
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});
