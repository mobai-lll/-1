import { Inject, Provide } from "@midwayjs/core";
import { DatabaseSync } from "node:sqlite";
import { Favorite, CreateFavoriteInput } from "../interface";
import { DatabaseService } from "./database.service";

type FavoriteRow = {
  id: number;
  match_id: number;
  user_id: string;
  type: string;
  created_at: string;
};

@Provide()
export class FavoriteService {
  @Inject()
  databaseService: DatabaseService;

  private get database(): DatabaseSync {
    return this.databaseService.getDatabase();
  }

  create(input: CreateFavoriteInput): Favorite | null {
    try {
      const result = this.database
        .prepare(
          "INSERT INTO favorites (match_id, user_id, type) VALUES (?, ?, ?)",
        )
        .run(input.matchId, input.userId, input.type);

      const row = this.database
        .prepare(
          "SELECT id, match_id, user_id, type, created_at FROM favorites WHERE id = ?",
        )
        .get(result.lastInsertRowid) as FavoriteRow;

      return mapFavorite(row);
    } catch {
      return null;
    }
  }

  delete(id: number): boolean {
    const result = this.database
      .prepare("DELETE FROM favorites WHERE id = ?")
      .run(id);
    return result.changes > 0;
  }

  getByUserId(userId: string): Favorite[] {
    const rows = this.database
      .prepare(
        "SELECT id, match_id, user_id, type, created_at FROM favorites WHERE user_id = ? ORDER BY created_at DESC",
      )
      .all(userId) as FavoriteRow[];
    return rows.map(mapFavorite);
  }

  getByMatchIdAndUserId(
    matchId: number,
    userId: string,
    type: string,
  ): Favorite | null {
    const row = this.database
      .prepare(
        "SELECT id, match_id, user_id, type, created_at FROM favorites WHERE match_id = ? AND user_id = ? AND type = ?",
      )
      .get(matchId, userId, type) as FavoriteRow | undefined;
    return row ? mapFavorite(row) : null;
  }
}

function mapFavorite(row: FavoriteRow): Favorite {
  return {
    id: row.id,
    matchId: row.match_id,
    userId: row.user_id,
    type: row.type as "match" | "team",
    createdAt: new Date(row.created_at).toISOString(),
  };
}
