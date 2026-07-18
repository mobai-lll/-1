import assert from "node:assert/strict";
import { test } from "node:test";

/**
 * 比分预测并发一致性测试
 *
 * 验证 AC-01：同一用户对同一比赛并发提交，最终仅保留 1 条记录
 * 验证 AC-04：重复提交不同比分，记录被更新且记录数仍为 1
 *
 * 运行方式：
 *   先启动后端：npm run dev --workspace backend
 *   再运行测试：node --test --import tsx backend/test/prediction-concurrency.test.mts
 *   或：node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --test backend/test/prediction-concurrency.test.mts
 *
 * 测试通过 HTTP API 调用，模拟多客户端并发场景。
 */

const API_BASE = process.env.API_BASE || "http://127.0.0.1:7001";

async function fetchJson(
  path: string,
  options: RequestInit = {},
): Promise<{ status: number; data: unknown }> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  const data = await response.json().catch(() => null);
  return { status: response.status, data };
}

async function findScheduledMatch(): Promise<{
  id: number;
  homeTeamName: string;
  awayTeamName: string;
} | null> {
  const result = await fetchJson("/api/matches");
  const matches = (
    result.data as {
      data: Array<{
        id: number;
        status: string;
        startTime: string;
        homeTeamName: string;
        awayTeamName: string;
      }>;
    }
  ).data;
  const scheduled = matches.find(
    (m) => m.status === "scheduled" && new Date(m.startTime) > new Date(),
  );
  return scheduled
    ? {
        id: scheduled.id,
        homeTeamName: scheduled.homeTeamName,
        awayTeamName: scheduled.awayTeamName,
      }
    : null;
}

test("AC-01: 同一用户并发提交 5 次预测，最终仅保留 1 条记录", async () => {
  const match = await findScheduledMatch();
  if (!match) {
    console.log("[SKIP] 未找到未开赛比赛，跳过并发测试");
    return;
  }

  const userId = `concurrent-test-${Date.now()}`;
  const body = JSON.stringify({
    matchId: match.id,
    homeScore: 2,
    awayScore: 1,
  });

  // 并发发起 5 个请求
  const requests = Array.from({ length: 5 }, () =>
    fetchJson("/api/predictions", {
      method: "POST",
      body,
      headers: { Authorization: `Bearer ${userId}` },
    }),
  );
  const results = await Promise.all(requests);

  // 所有请求应返回 200
  for (const r of results) {
    assert.equal(r.status, 200, `并发请求应成功，实际 ${r.status}`);
  }

  // 查询数据库中该用户对该比赛的记录数
  const queryResult = await fetchJson(
    `/api/predictions?matchId=${match.id}&userId=${userId}`,
  );
  const predictions = (queryResult.data as { data: unknown[] }).data;
  assert.equal(
    predictions.length,
    1,
    `并发提交后应仅保留 1 条记录，实际 ${predictions.length}`,
  );

  console.log(`[PASS] AC-01: 并发 5 次提交后，记录数 = ${predictions.length}`);
});

test("AC-04: 重复提交不同比分，记录被更新且记录数仍为 1", async () => {
  const match = await findScheduledMatch();
  if (!match) {
    console.log("[SKIP] 未找到未开赛比赛，跳过更新测试");
    return;
  }

  const userId = `update-test-${Date.now()}`;

  // 第一次提交
  const r1 = await fetchJson("/api/predictions", {
    method: "POST",
    body: JSON.stringify({ matchId: match.id, homeScore: 1, awayScore: 0 }),
    headers: { Authorization: `Bearer ${userId}` },
  });
  assert.equal(r1.status, 200, "首次提交应成功");

  // 第二次提交不同比分
  const r2 = await fetchJson("/api/predictions", {
    method: "POST",
    body: JSON.stringify({ matchId: match.id, homeScore: 3, awayScore: 2 }),
    headers: { Authorization: `Bearer ${userId}` },
  });
  assert.equal(r2.status, 200, "更新提交应成功");

  // 查询记录
  const queryResult = await fetchJson(
    `/api/predictions?matchId=${match.id}&userId=${userId}`,
  );
  const predictions = (
    queryResult.data as {
      data: Array<{ homeScore: number; awayScore: number }>;
    }
  ).data;
  assert.equal(
    predictions.length,
    1,
    `记录数应为 1，实际 ${predictions.length}`,
  );
  assert.equal(predictions[0].homeScore, 3, "主队比分应更新为 3");
  assert.equal(predictions[0].awayScore, 2, "客队比分应更新为 2");

  console.log("[PASS] AC-04: 重复提交后记录更新为最新比分，记录数仍为 1");
});

test("AC-03: 对已完赛比赛提交预测，返回 400", async () => {
  const result = await fetchJson("/api/matches");
  const matches = (
    result.data as { data: Array<{ id: number; status: string }> }
  ).data;
  const completed = matches.find((m) => m.status === "completed");
  if (!completed) {
    console.log("[SKIP] 未找到已完赛比赛");
    return;
  }

  const r = await fetchJson("/api/predictions", {
    method: "POST",
    body: JSON.stringify({ matchId: completed.id, homeScore: 1, awayScore: 0 }),
    headers: { Authorization: `Bearer blocked-test-${Date.now()}` },
  });
  assert.equal(r.status, 400, `已完赛比赛应返回 400，实际 ${r.status}`);

  console.log("[PASS] AC-03: 对已完赛比赛提交预测被拒绝");
});

test("AC-05: 响应头包含 X-Request-Id", async () => {
  const response = await fetch(`${API_BASE}/api/health`);
  const requestId = response.headers.get("x-request-id");
  assert.ok(requestId, "响应头应包含 X-Request-Id");
  assert.ok(requestId!.length > 0, "X-Request-Id 应非空");

  console.log(`[PASS] AC-05: X-Request-Id = ${requestId}`);
});
