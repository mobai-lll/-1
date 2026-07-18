import assert from "node:assert/strict";
import { test } from "node:test";

const BACKEND_URL = process.env.BACKEND_INTERNAL_URL ?? "http://localhost:7001";

async function apiFetch(path, options = {}) {
  const response = await fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  return {
    status: response.status,
    body: response.ok ? await response.json() : null,
  };
}

test("四态覆盖：成功状态 - GET /api/teams returns 200 with data array", async () => {
  const { status, body } = await apiFetch("/api/teams");
  assert.equal(status, 200);
  assert.ok(Array.isArray(body.data), "data should be an array");
  assert.ok(body.data.length > 0, "should have at least one team");
  assert.ok(body.data[0].name, "team should have name field");
  assert.ok(body.data[0].group, "team should have group field");
});

test("四态覆盖：成功状态 - GET /api/matches returns 200 with data array", async () => {
  const { status, body } = await apiFetch("/api/matches");
  assert.equal(status, 200);
  assert.ok(Array.isArray(body.data), "data should be an array");
  assert.ok(body.data.length > 0, "should have matches");
});

test("四态覆盖：空结果状态 - GET /api/matches?group=NonExistent returns empty array", async () => {
  const { status, body } = await apiFetch("/api/matches?group=NonExistent");
  assert.equal(status, 200);
  assert.ok(Array.isArray(body.data), "data should be an array");
  assert.equal(
    body.data.length,
    0,
    "should return empty array for non-existent group",
  );
});

test("四态覆盖：空结果状态 - GET /api/teams?group=NonExistent returns empty array", async () => {
  const { status, body } = await apiFetch("/api/teams?group=NonExistent");
  assert.equal(status, 200);
  assert.ok(Array.isArray(body.data), "data should be an array");
  assert.equal(
    body.data.length,
    0,
    "should return empty array for non-existent group",
  );
});

test("四态覆盖：错误状态 - GET /api/matches/999999 returns 404", async () => {
  const { status } = await apiFetch("/api/matches/999999");
  assert.equal(status, 404, "non-existent match should return 404");
});

test("四态覆盖：错误状态 - GET /api/teams/999999 returns 404", async () => {
  const { status } = await apiFetch("/api/teams/999999");
  assert.equal(status, 404, "non-existent team should return 404");
});

test("四态覆盖：错误状态 - POST /api/predictions with invalid body returns 400", async () => {
  const { status } = await apiFetch("/api/predictions", {
    method: "POST",
    body: JSON.stringify({ invalid: true }),
  });
  assert.ok(
    status === 400 || status === 422,
    `invalid prediction should return 400 or 422, got ${status}`,
  );
});

test("四态覆盖：成功状态 - GET /api/standings returns 200 with standings data", async () => {
  const { status, body } = await apiFetch("/api/standings");
  assert.equal(status, 200);
  assert.ok(Array.isArray(body.data), "data should be an array");
  if (body.data.length > 0) {
    const entry = body.data[0];
    assert.ok(entry.teamName, "entry should have teamName");
    assert.ok(
      typeof entry.points === "number",
      "entry should have points as number",
    );
    assert.ok(
      typeof entry.played === "number",
      "entry should have played as number",
    );
  }
});

test("四态覆盖：成功状态 - GET /api/standings/groups returns group list", async () => {
  const { status, body } = await apiFetch("/api/standings/groups");
  assert.equal(status, 200);
  assert.ok(Array.isArray(body.data), "data should be an array");
  assert.ok(body.data.length > 0, "should have groups");
});

test("四态覆盖：成功状态 - GET /api/comments/match/:id returns array", async () => {
  const matchesRes = await apiFetch("/api/matches");
  const firstMatch = matchesRes.body.data[0];
  const { status, body } = await apiFetch(
    `/api/comments/match/${firstMatch.id}`,
  );
  assert.equal(status, 200);
  assert.ok(Array.isArray(body.data), "comments should be an array");
});

test("四态覆盖：预测并发 - 同一用户对同一比赛只能有一条记录", async () => {
  const matchesRes = await apiFetch("/api/matches");
  const scheduledMatches = matchesRes.body.data.filter(
    (m) => m.status === "scheduled" && new Date(m.startTime) > new Date(),
  );
  if (scheduledMatches.length === 0) {
    // 没有可预测的比赛，跳过此测试
    return;
  }
  const match = scheduledMatches[0];
  const userId = `test-concurrent-${Date.now()}`;

  // 并发提交5次相同预测
  const promises = Array.from({ length: 5 }, () =>
    apiFetch("/api/predictions", {
      method: "POST",
      body: JSON.stringify({
        matchId: match.id,
        homeScore: 2,
        awayScore: 1,
      }),
      headers: { Authorization: `Bearer ${userId}` },
    }),
  );
  await Promise.all(promises);

  // 验证数据库中只有一条记录（并发不产生重复）
  const { status, body } = await apiFetch(
    `/api/predictions?matchId=${match.id}&userId=${encodeURIComponent(userId)}`,
  );
  assert.equal(status, 200);
  assert.equal(
    body.data.length,
    1,
    `concurrent submissions should result in exactly 1 record, got ${body.data.length}`,
  );
});
