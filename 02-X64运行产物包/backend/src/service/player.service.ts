import { Inject, Provide } from "@midwayjs/core";
import { DatabaseSync } from "node:sqlite";
import { Player } from "../interface";
import { DatabaseService } from "./database.service";

type PlayerRow = {
  id: number;
  team_id: number;
  name: string;
  position: string;
  number: number;
  age: number;
  goals: number;
  assists: number;
  appearances: number;
  yellow_cards: number;
  red_cards: number;
};

@Provide()
export class PlayerService {
  @Inject()
  databaseService: DatabaseService;

  private get database(): DatabaseSync {
    return this.databaseService.getDatabase();
  }

  getByTeamId(teamId: number): Player[] {
    const rows = this.database
      .prepare(
        "SELECT * FROM players WHERE team_id = ? ORDER BY position, number",
      )
      .all(teamId) as PlayerRow[];
    return rows.map(mapPlayer);
  }

  getById(id: number): Player | null {
    const row = this.database
      .prepare("SELECT * FROM players WHERE id = ?")
      .get(id) as PlayerRow | undefined;
    return row ? mapPlayer(row) : null;
  }

  getTopScorers(limit: number = 10): Player[] {
    const rows = this.database
      .prepare(
        "SELECT * FROM players WHERE goals > 0 ORDER BY goals DESC, assists DESC LIMIT ?",
      )
      .all(limit) as PlayerRow[];
    return rows.map(mapPlayer);
  }

  getTopAssists(limit: number = 10): Player[] {
    const rows = this.database
      .prepare(
        "SELECT * FROM players WHERE assists > 0 ORDER BY assists DESC, goals DESC LIMIT ?",
      )
      .all(limit) as PlayerRow[];
    return rows.map(mapPlayer);
  }
}

function mapPlayer(row: PlayerRow): Player {
  return {
    id: row.id,
    teamId: row.team_id,
    name: row.name,
    position: row.position as "GK" | "DF" | "MF" | "FW",
    number: row.number,
    age: row.age,
    goals: row.goals,
    assists: row.assists,
    appearances: row.appearances,
    yellowCards: row.yellow_cards,
    redCards: row.red_cards,
  };
}
