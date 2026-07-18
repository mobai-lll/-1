import { Inject, Provide } from "@midwayjs/core";
import { DatabaseSync } from "node:sqlite";
import { Team } from "../interface";
import { DatabaseService } from "./database.service";

type TeamRow = {
  id: number;
  name: string;
  country: string;
  logo: string;
  group_name: string;
  description: string;
  created_at: string;
};

@Provide()
export class TeamService {
  @Inject()
  databaseService: DatabaseService;

  private get database(): DatabaseSync {
    return this.databaseService.getDatabase();
  }

  list(): Team[] {
    const rows = this.database
      .prepare(
        "SELECT id, name, country, logo, group_name, description, created_at FROM teams ORDER BY name",
      )
      .all() as TeamRow[];
    return rows.map(mapTeam);
  }

  getById(id: number): Team | null {
    const row = this.database
      .prepare(
        "SELECT id, name, country, logo, group_name, description, created_at FROM teams WHERE id = ?",
      )
      .get(id) as TeamRow | undefined;
    return row ? mapTeam(row) : null;
  }

  getByGroup(group: string): Team[] {
    const rows = this.database
      .prepare(
        "SELECT id, name, country, logo, group_name, description, created_at FROM teams WHERE group_name = ? ORDER BY name",
      )
      .all(group) as TeamRow[];
    return rows.map(mapTeam);
  }
}

function mapTeam(row: TeamRow): Team {
  return {
    id: row.id,
    name: row.name,
    country: row.country,
    logo: row.logo,
    group: row.group_name,
    description: row.description,
    createdAt: new Date(row.created_at).toISOString(),
  };
}
