import { Inject, Provide } from "@midwayjs/core";
import { DatabaseSync } from "node:sqlite";
import { Comment, CreateCommentInput } from "../interface";
import { DatabaseService } from "./database.service";

type CommentRow = {
  id: number;
  match_id: number;
  user_id: string;
  user_name: string;
  content: string;
  created_at: string;
};

@Provide()
export class CommentService {
  @Inject()
  databaseService: DatabaseService;

  private get database(): DatabaseSync {
    return this.databaseService.getDatabase();
  }

  create(input: CreateCommentInput): Comment {
    const result = this.database
      .prepare(
        "INSERT INTO comments (match_id, user_id, user_name, content) VALUES (?, ?, ?, ?)",
      )
      .run(input.matchId, input.userId, input.userName, input.content.trim());

    const row = this.database
      .prepare(
        "SELECT id, match_id, user_id, user_name, content, created_at FROM comments WHERE id = ?",
      )
      .get(result.lastInsertRowid) as CommentRow;

    return mapComment(row);
  }

  getByMatchId(matchId: number): Comment[] {
    const rows = this.database
      .prepare(
        "SELECT id, match_id, user_id, user_name, content, created_at FROM comments WHERE match_id = ? ORDER BY created_at DESC",
      )
      .all(matchId) as CommentRow[];
    return rows.map(mapComment);
  }
}

function mapComment(row: CommentRow): Comment {
  return {
    id: row.id,
    matchId: row.match_id,
    userId: row.user_id,
    userName: row.user_name,
    content: row.content,
    createdAt: new Date(row.created_at).toISOString(),
  };
}
