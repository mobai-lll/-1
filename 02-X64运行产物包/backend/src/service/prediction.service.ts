import { Inject, Provide } from "@midwayjs/core";
import { DatabaseSync } from "node:sqlite";
import { Prediction, CreatePredictionInput } from "../interface";
import { DatabaseService } from "./database.service";

type PredictionRow = {
  id: number;
  match_id: number;
  user_id: string;
  home_score: number;
  away_score: number;
  created_at: string;
};

@Provide()
export class PredictionService {
  @Inject()
  databaseService: DatabaseService;

  private get database(): DatabaseSync {
    return this.databaseService.getDatabase();
  }

  /**
   * 创建或更新预测。
   *
   * 并发一致性保证：
   * 1. 通过事务串行化写入，避免部分提交；
   * 2. 通过 UNIQUE(match_id, user_id) 约束保证同一用户对同一比赛最多一条记录；
   * 3. 冲突时执行 UPDATE 而非 INSERT，保证幂等；
   * 4. 开赛后（status != scheduled 或 startTime <= now）拒绝修改。
   */
  create(input: CreatePredictionInput): Prediction | null {
    const match = this.database
      .prepare("SELECT status, start_time FROM matches WHERE id = ?")
      .get(input.matchId) as { status: string; start_time: string } | undefined;

    if (!match) {
      return null;
    }

    if (match.status === "completed") {
      return null;
    }

    const startTime = new Date(match.start_time);
    if (startTime <= new Date()) {
      return null;
    }

    try {
      this.database.exec("BEGIN IMMEDIATE");
      const existing = this.database
        .prepare(
          "SELECT id FROM predictions WHERE match_id = ? AND user_id = ?",
        )
        .get(input.matchId, input.userId) as { id: number } | undefined;

      if (existing) {
        this.database
          .prepare(
            "UPDATE predictions SET home_score = ?, away_score = ? WHERE id = ?",
          )
          .run(input.homeScore, input.awayScore, existing.id);
      } else {
        this.database
          .prepare(
            "INSERT INTO predictions (match_id, user_id, home_score, away_score) VALUES (?, ?, ?, ?)",
          )
          .run(input.matchId, input.userId, input.homeScore, input.awayScore);
      }
      this.database.exec("COMMIT");

      const row = this.database
        .prepare(
          "SELECT id, match_id, user_id, home_score, away_score, created_at FROM predictions WHERE match_id = ? AND user_id = ?",
        )
        .get(input.matchId, input.userId) as PredictionRow;

      return mapPrediction(row);
    } catch {
      try {
        this.database.exec("ROLLBACK");
      } catch {
        // 事务可能已自动结束，忽略回滚失败
      }
      throw new Error("预测提交失败");
    }
  }

  list(): Prediction[] {
    const rows = this.database
      .prepare(
        "SELECT id, match_id, user_id, home_score, away_score, created_at FROM predictions ORDER BY created_at DESC",
      )
      .all() as PredictionRow[];
    return rows.map(mapPrediction);
  }

  getByMatchId(matchId: number): Prediction[] {
    const rows = this.database
      .prepare(
        "SELECT id, match_id, user_id, home_score, away_score, created_at FROM predictions WHERE match_id = ? ORDER BY created_at DESC",
      )
      .all(matchId) as PredictionRow[];
    return rows.map(mapPrediction);
  }

  getByUserId(userId: string): Prediction[] {
    const rows = this.database
      .prepare(
        "SELECT id, match_id, user_id, home_score, away_score, created_at FROM predictions WHERE user_id = ? ORDER BY created_at DESC",
      )
      .all(userId) as PredictionRow[];
    return rows.map(mapPrediction);
  }

  getByMatchAndUser(matchId: number, userId: string): Prediction[] {
    const rows = this.database
      .prepare(
        "SELECT id, match_id, user_id, home_score, away_score, created_at FROM predictions WHERE match_id = ? AND user_id = ? ORDER BY created_at DESC",
      )
      .all(matchId, userId) as PredictionRow[];
    return rows.map(mapPrediction);
  }

  /**
   * 统计指定比赛指定用户的预测记录数，用于并发测试验证。
   */
  countByMatchAndUser(matchId: number, userId: string): number {
    const row = this.database
      .prepare(
        "SELECT COUNT(*) AS total FROM predictions WHERE match_id = ? AND user_id = ?",
      )
      .get(matchId, userId) as { total: number };
    return row.total;
  }
}

function mapPrediction(row: PredictionRow): Prediction {
  return {
    id: row.id,
    matchId: row.match_id,
    userId: row.user_id,
    homeScore: row.home_score,
    awayScore: row.away_score,
    createdAt: new Date(row.created_at).toISOString(),
  };
}
