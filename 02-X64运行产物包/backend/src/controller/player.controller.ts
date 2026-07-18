import { Controller, Get, Inject, Param, Query } from "@midwayjs/core";
import { PlayerService } from "../service/player.service";

@Controller("/api")
export class PlayerController {
  @Inject()
  playerService: PlayerService;

  @Get("/players/team/:teamId")
  async getByTeam(@Param("teamId") teamId: string) {
    const players = this.playerService.getByTeamId(parseInt(teamId));
    return { data: players };
  }

  @Get("/players/:id")
  async getById(@Param("id") id: string) {
    const player = this.playerService.getById(parseInt(id));
    if (!player) {
      return { data: null };
    }
    return { data: player };
  }

  @Get("/players/scorers")
  async getTopScorers(@Query("limit") limit?: string) {
    const players = this.playerService.getTopScorers(
      limit ? parseInt(limit) : 10,
    );
    return { data: players };
  }

  @Get("/players/assists")
  async getTopAssists(@Query("limit") limit?: string) {
    const players = this.playerService.getTopAssists(
      limit ? parseInt(limit) : 10,
    );
    return { data: players };
  }
}
