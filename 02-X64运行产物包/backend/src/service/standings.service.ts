import { Inject, Provide } from "@midwayjs/core";
import { DatabaseSync } from "node:sqlite";
import { StandingsEntry } from "../interface";
import { DatabaseService } from "./database.service";

@Provide()
export class StandingsService {
  @Inject()
  databaseService: DatabaseService;

  private get database(): DatabaseSync {
    return this.databaseService.getDatabase();
  }

  getStandings(group?: string): StandingsEntry[] {
    let rows;
    if (group) {
      rows = this.database
        .prepare(
          `
          SELECT 
            t.id as team_id,
            t.name as team_name,
            t.logo as team_logo,
            t.group_name as group_name,
            COUNT(m.id) as played,
            SUM(CASE WHEN m.home_team_id = t.id AND m.home_score > m.away_score THEN 1 WHEN m.away_team_id = t.id AND m.away_score > m.home_score THEN 1 ELSE 0 END) as won,
            SUM(CASE WHEN m.home_score = m.away_score THEN 1 ELSE 0 END) as drawn,
            SUM(CASE WHEN m.home_team_id = t.id AND m.home_score < m.away_score THEN 1 WHEN m.away_team_id = t.id AND m.away_score < m.home_score THEN 1 ELSE 0 END) as lost,
            SUM(CASE WHEN m.home_team_id = t.id THEN m.home_score ELSE 0 END) + SUM(CASE WHEN m.away_team_id = t.id THEN m.away_score ELSE 0 END) as goals_for,
            SUM(CASE WHEN m.home_team_id = t.id THEN m.away_score ELSE 0 END) + SUM(CASE WHEN m.away_team_id = t.id THEN m.home_score ELSE 0 END) as goals_against
          FROM teams t
          LEFT JOIN matches m ON (m.home_team_id = t.id OR m.away_team_id = t.id) AND m.status = 'completed'
          WHERE t.group_name = ?
          GROUP BY t.id, t.name, t.logo, t.group_name
          ORDER BY group_name, 
            (won * 3 + drawn) DESC,
            (goals_for - goals_against) DESC,
            goals_for DESC
        `,
        )
        .all(group) as {
        team_id: number;
        team_name: string;
        team_logo: string;
        group_name: string;
        played: number;
        won: number;
        drawn: number;
        lost: number;
        goals_for: number;
        goals_against: number;
      }[];
    } else {
      rows = this.database
        .prepare(
          `
          SELECT 
            t.id as team_id,
            t.name as team_name,
            t.logo as team_logo,
            t.group_name as group_name,
            COUNT(m.id) as played,
            SUM(CASE WHEN m.home_team_id = t.id AND m.home_score > m.away_score THEN 1 WHEN m.away_team_id = t.id AND m.away_score > m.home_score THEN 1 ELSE 0 END) as won,
            SUM(CASE WHEN m.home_score = m.away_score THEN 1 ELSE 0 END) as drawn,
            SUM(CASE WHEN m.home_team_id = t.id AND m.home_score < m.away_score THEN 1 WHEN m.away_team_id = t.id AND m.away_score < m.home_score THEN 1 ELSE 0 END) as lost,
            SUM(CASE WHEN m.home_team_id = t.id THEN m.home_score ELSE 0 END) + SUM(CASE WHEN m.away_team_id = t.id THEN m.away_score ELSE 0 END) as goals_for,
            SUM(CASE WHEN m.home_team_id = t.id THEN m.away_score ELSE 0 END) + SUM(CASE WHEN m.away_team_id = t.id THEN m.home_score ELSE 0 END) as goals_against
          FROM teams t
          LEFT JOIN matches m ON (m.home_team_id = t.id OR m.away_team_id = t.id) AND m.status = 'completed'
          GROUP BY t.id, t.name, t.logo, t.group_name
          ORDER BY group_name,
            (won * 3 + drawn) DESC,
            (goals_for - goals_against) DESC,
            goals_for DESC
        `,
        )
        .all() as {
        team_id: number;
        team_name: string;
        team_logo: string;
        group_name: string;
        played: number;
        won: number;
        drawn: number;
        lost: number;
        goals_for: number;
        goals_against: number;
      }[];
    }

    return rows.map((row) => ({
      teamId: row.team_id,
      teamName: row.team_name,
      teamLogo: row.team_logo,
      group: row.group_name,
      played: row.played,
      won: row.won,
      drawn: row.drawn,
      lost: row.lost,
      goalsFor: row.goals_for,
      goalsAgainst: row.goals_against,
      goalDifference: row.goals_for - row.goals_against,
      points: row.won * 3 + row.drawn,
    }));
  }

  getGroups(): string[] {
    const rows = this.database
      .prepare(
        "SELECT DISTINCT group_name FROM teams WHERE group_name != '' ORDER BY group_name",
      )
      .all() as { group_name: string }[];
    return rows.map((row) => row.group_name);
  }
}
