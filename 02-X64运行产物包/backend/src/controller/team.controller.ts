import {
  Controller,
  Get,
  httpError,
  Inject,
  Param,
  Query,
} from "@midwayjs/core";
import { TeamService } from "../service/team.service";

@Controller("/api")
export class TeamController {
  @Inject()
  teamService: TeamService;

  @Get("/teams")
  async listTeams(@Query("group") group?: string) {
    let teams;
    if (group) {
      teams = this.teamService.getByGroup(group);
    } else {
      teams = this.teamService.list();
    }
    return { data: teams };
  }

  @Get("/teams/:id")
  async getTeam(@Param("id") id: string) {
    const team = this.teamService.getById(parseInt(id));
    if (!team) {
      throw new httpError.NotFoundError("球队不存在");
    }
    return { data: team };
  }
}
