import { Inject, Provide } from "@midwayjs/core";
import { DatabaseSync } from "node:sqlite";
import { Match } from "../interface";
import { DatabaseService } from "./database.service";

type MatchRow = {
  id: number;
  home_team_id: number;
  away_team_id: number;
  group_name: string;
  round: string;
  status: string;
  start_time: string;
  home_score: number | null;
  away_score: number | null;
  created_at: string;
};

@Provide()
export class MatchService {
  @Inject()
  databaseService: DatabaseService;

  private get database(): DatabaseSync {
    return this.databaseService.getDatabase();
  }

  list(): Match[] {
    const rows = this.database
      .prepare(
        `
        SELECT m.id, m.home_team_id, m.away_team_id, m.group_name, m.round, m.status, m.start_time, m.home_score, m.away_score, m.created_at,
               ht.name as home_team_name, ht.logo as home_team_logo,
               at.name as away_team_name, at.logo as away_team_logo
        FROM matches m
        JOIN teams ht ON m.home_team_id = ht.id
        JOIN teams at ON m.away_team_id = at.id
        ORDER BY m.start_time
      `,
      )
      .all() as (MatchRow & {
      home_team_name: string;
      home_team_logo: string;
      away_team_name: string;
      away_team_logo: string;
    })[];
    return rows.map(mapMatch);
  }

  getById(id: number): Match | null {
    const row = this.database
      .prepare(
        `
        SELECT m.id, m.home_team_id, m.away_team_id, m.group_name, m.round, m.status, m.start_time, m.home_score, m.away_score, m.created_at,
               ht.name as home_team_name, ht.logo as home_team_logo,
               at.name as away_team_name, at.logo as away_team_logo
        FROM matches m
        JOIN teams ht ON m.home_team_id = ht.id
        JOIN teams at ON m.away_team_id = at.id
        WHERE m.id = ?
      `,
      )
      .get(id) as
      | (MatchRow & {
          home_team_name: string;
          home_team_logo: string;
          away_team_name: string;
          away_team_logo: string;
        })
      | undefined;
    return row ? mapMatch(row) : null;
  }

  getByGroup(group: string): Match[] {
    const rows = this.database
      .prepare(
        `
        SELECT m.id, m.home_team_id, m.away_team_id, m.group_name, m.round, m.status, m.start_time, m.home_score, m.away_score, m.created_at,
               ht.name as home_team_name, ht.logo as home_team_logo,
               at.name as away_team_name, at.logo as away_team_logo
        FROM matches m
        JOIN teams ht ON m.home_team_id = ht.id
        JOIN teams at ON m.away_team_id = at.id
        WHERE m.group_name = ?
        ORDER BY m.start_time
      `,
      )
      .all(group) as (MatchRow & {
      home_team_name: string;
      home_team_logo: string;
      away_team_name: string;
      away_team_logo: string;
    })[];
    return rows.map(mapMatch);
  }

  updateResult(id: number, homeScore: number, awayScore: number): Match | null {
    const result = this.database
      .prepare(
        "UPDATE matches SET home_score = ?, away_score = ?, status = 'completed' WHERE id = ?",
      )
      .run(homeScore, awayScore, id);
    if (result.changes === 0) {
      return null;
    }
    return this.getById(id);
  }
}

function mapMatch(
  row: MatchRow & {
    home_team_name: string;
    home_team_logo: string;
    away_team_name: string;
    away_team_logo: string;
  },
): Match {
  return {
    id: row.id,
    homeTeamId: row.home_team_id,
    awayTeamId: row.away_team_id,
    homeTeamName: row.home_team_name,
    awayTeamName: row.away_team_name,
    homeTeamLogo: row.home_team_logo,
    awayTeamLogo: row.away_team_logo,
    group: row.group_name,
    round: row.round,
    status: row.status as "scheduled" | "in_progress" | "completed",
    startTime: new Date(row.start_time).toISOString(),
    homeScore: row.home_score,
    awayScore: row.away_score,
    createdAt: new Date(row.created_at).toISOString(),
  };
}
