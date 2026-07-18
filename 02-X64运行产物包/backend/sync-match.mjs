import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";

const DB_PATH =
  process.env.DATABASE_PATH ??
  resolve(process.cwd(), "data/course-demo.sqlite");

function getDb() {
  const absolutePath = resolve(process.cwd(), DB_PATH);
  mkdirSync(dirname(absolutePath), { recursive: true });
  return new DatabaseSync(absolutePath);
}

function listMatches(status) {
  const db = getDb();
  const where = status ? `WHERE m.status = ?` : "";
  const sql = `
    SELECT m.id, m.home_team_id, m.away_team_id,
           ht.name AS home_team_name, at.name AS away_team_name,
           m.group_name, m.round, m.status, m.start_time,
           m.home_score, m.away_score
    FROM matches m
    JOIN teams ht ON m.home_team_id = ht.id
    JOIN teams at ON m.away_team_id = at.id
    ${where}
    ORDER BY m.start_time ASC
  `;
  const stmt = db.prepare(sql);
  return status ? stmt.all(status) : stmt.all();
}

function getMatchById(id) {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT m.id, m.home_team_id, m.away_team_id,
           ht.name AS home_team_name, at.name AS away_team_name,
           m.group_name, m.round, m.status, m.start_time,
           m.home_score, m.away_score
    FROM matches m
    JOIN teams ht ON m.home_team_id = ht.id
    JOIN teams at ON m.away_team_id = at.id
    WHERE m.id = ?
  `);
  const row = stmt.get(id);
  return row ?? null;
}

function updateMatchScore(id, homeScore, awayScore) {
  const db = getDb();
  const stmt = db.prepare(`
    UPDATE matches
    SET home_score = ?, away_score = ?, status = 'completed'
    WHERE id = ?
  `);
  const result = stmt.run(homeScore, awayScore, id);
  return (result.changes ?? 0) > 0;
}

function checkOverdue() {
  const db = getDb();
  const now = new Date().toISOString();
  const stmt = db.prepare(`
    SELECT m.id, m.home_team_id, m.away_team_id,
           ht.name AS home_team_name, at.name AS away_team_name,
           m.group_name, m.round, m.status, m.start_time,
           m.home_score, m.away_score
    FROM matches m
    JOIN teams ht ON m.home_team_id = ht.id
    JOIN teams at ON m.away_team_id = at.id
    WHERE m.status = 'scheduled' AND m.start_time < ?
    ORDER BY m.start_time ASC
  `);
  return stmt.all(now);
}

function formatMatch(m) {
  const score =
    m.status === "completed" && m.home_score !== null
      ? `${m.home_score}-${m.away_score}`
      : "vs";
  const roundInfo = m.group_name || m.round;
  return `ID ${String(m.id).padStart(3)} | ${m.start_time} | ${m.home_team_name} ${score} ${m.away_team_name} | ${roundInfo} | ${m.status}`;
}

function printHelp() {
  console.log(`
用法: node sync-match.mjs <command> [options]

命令:
  list [status]                 列出比赛，status 可选: scheduled / completed / in_progress
  get <id>                      查看指定比赛详情
  update <id> <home> <away>     更新比赛比分（同时将状态改为 completed）
  check                         检查已过开赛时间但仍为 scheduled 的比赛
  help                          显示此帮助

环境变量:
  DATABASE_PATH                 数据库文件路径（默认: ./data/course-demo.sqlite）

示例:
  node sync-match.mjs check
  node sync-match.mjs update 99 1 2
  node sync-match.mjs get 100
  node sync-match.mjs list scheduled
`);
}

async function main() {
  const args = process.argv.slice(2);
  const cmd = args[0] ?? "help";

  switch (cmd) {
    case "list": {
      const status = args[1];
      const matches = listMatches(status);
      console.log(`\n共 ${matches.length} 场比赛${status ? `（${status}）` : ""}：\n`);
      for (const m of matches) {
        console.log(formatMatch(m));
      }
      console.log();
      break;
    }

    case "get": {
      const id = parseInt(args[1] ?? "0", 10);
      if (!id) {
        console.error("错误: 请提供有效的比赛 ID");
        process.exit(1);
      }
      const match = getMatchById(id);
      if (!match) {
        console.error(`错误: 未找到 ID 为 ${id} 的比赛`);
        process.exit(1);
      }
      console.log("\n比赛详情：");
      console.log(formatMatch(match));
      console.log();
      break;
    }

    case "update": {
      const id = parseInt(args[1] ?? "0", 10);
      const home = parseInt(args[2] ?? "-1", 10);
      const away = parseInt(args[3] ?? "-1", 10);
      if (!id || home < 0 || away < 0) {
        console.error("错误: 用法: update <id> <homeScore> <awayScore>");
        process.exit(1);
      }
      const before = getMatchById(id);
      if (!before) {
        console.error(`错误: 未找到 ID 为 ${id} 的比赛`);
        process.exit(1);
      }
      console.log(`更新前: ${formatMatch(before)}`);
      const success = updateMatchScore(id, home, away);
      if (!success) {
        console.error("错误: 更新失败");
        process.exit(1);
      }
      const after = getMatchById(id);
      console.log(`更新后: ${formatMatch(after)}`);
      console.log("\n更新成功！");
      break;
    }

    case "check": {
      const overdue = checkOverdue();
      if (overdue.length === 0) {
        console.log("\n所有 scheduled 比赛的开赛时间均在未来，无需更新。\n");
      } else {
        console.log(`\n发现 ${overdue.length} 场已过开赛时间但仍为 scheduled 的比赛：\n`);
        for (const m of overdue) {
          console.log(formatMatch(m));
        }
        console.log(
          "\n请确认这些比赛的真实结果后，使用 update 命令更新比分。",
        );
        console.log("例: node sync-match.mjs update <id> <homeScore> <awayScore>\n");
      }
      break;
    }

    case "help":
    default:
      printHelp();
      break;
  }
}

main().catch((err) => {
  console.error("错误:", err);
  process.exit(1);
});
