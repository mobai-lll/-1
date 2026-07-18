import assert from "node:assert/strict";
import { test } from "node:test";
import {
  teamCn,
  groupCn,
  roundCn,
  positionCn,
  positionColor,
  formatDate,
  formatTime,
  getStatusText,
  getStatusClass,
} from "../src/lib/api.ts";

test("teamCn returns Chinese name for known teams", () => {
  assert.equal(teamCn("Brazil"), "巴西");
  assert.equal(teamCn("Argentina"), "阿根廷");
  assert.equal(teamCn("United States"), "美国");
  assert.equal(teamCn("South Korea"), "韩国");
});

test("teamCn returns original name for unknown teams", () => {
  assert.equal(teamCn("Unknown Team"), "Unknown Team");
  assert.equal(teamCn(""), "");
});

test("groupCn maps group codes to Chinese names", () => {
  assert.equal(groupCn("Group A"), "A组");
  assert.equal(groupCn("Group L"), "L组");
  assert.equal(groupCn(""), "");
  assert.equal(groupCn("Unknown"), "Unknown");
});

test("roundCn maps round codes to Chinese names", () => {
  assert.equal(roundCn("group"), "小组赛");
  assert.equal(roundCn("round_of_32"), "三十二强");
  assert.equal(roundCn("round_of_16"), "十六强");
  assert.equal(roundCn("quarter_final"), "四分之一决赛");
  assert.equal(roundCn("semi_final"), "半决赛");
  assert.equal(roundCn("final"), "决赛");
  assert.equal(roundCn("unknown"), "unknown");
});

test("positionCn maps position codes to Chinese names", () => {
  assert.equal(positionCn("GK"), "门将");
  assert.equal(positionCn("DF"), "后卫");
  assert.equal(positionCn("MF"), "中场");
  assert.equal(positionCn("FW"), "前锋");
  assert.equal(positionCn("XX"), "XX");
});

test("positionColor returns Tailwind classes for positions", () => {
  assert.equal(positionColor("GK"), "bg-amber-100 text-amber-700");
  assert.equal(positionColor("DF"), "bg-blue-100 text-blue-700");
  assert.equal(positionColor("MF"), "bg-emerald-100 text-emerald-700");
  assert.equal(positionColor("FW"), "bg-rose-100 text-rose-700");
});

test("formatDate formats ISO date string to Chinese locale", () => {
  const formatted = formatDate("2026-06-11T12:00:00Z");
  assert.ok(
    formatted.includes("2026"),
    `expected year in output, got: ${formatted}`,
  );
  assert.ok(
    formatted.includes("06"),
    `expected month in output, got: ${formatted}`,
  );
  assert.ok(
    formatted.includes("11"),
    `expected day in output, got: ${formatted}`,
  );
});

test("formatTime extracts time from ISO string", () => {
  const formatted = formatTime("2026-06-11T12:00:00Z");
  assert.ok(
    formatted.includes(":"),
    `expected time separator in output, got: ${formatted}`,
  );
});

test("getStatusText maps match status to Chinese text", () => {
  assert.equal(getStatusText("scheduled"), "未开始");
  assert.equal(getStatusText("in_progress"), "进行中");
  assert.equal(getStatusText("completed"), "已结束");
  assert.equal(getStatusText("unknown"), "unknown");
});

test("getStatusClass returns Tailwind classes for each status", () => {
  assert.equal(getStatusClass("completed"), "bg-slate-100 text-slate-600");
  assert.equal(getStatusClass("in_progress"), "bg-amber-100 text-amber-700");
  assert.equal(getStatusClass("scheduled"), "bg-blue-100 text-blue-700");
});
