import {
  Body,
  Controller,
  Get,
  httpError,
  Inject,
  Param,
  Post,
  Query,
} from "@midwayjs/core";
import { MatchService } from "../service/match.service";

@Controller("/api")
export class MatchController {
  @Inject()
  matchService: MatchService;

  @Get("/matches")
  async listMatches(@Query("group") group?: string) {
    let matches;
    if (group) {
      matches = this.matchService.getByGroup(group);
    } else {
      matches = this.matchService.list();
    }
    return { data: matches };
  }

  @Get("/matches/:id")
  async getMatch(@Param("id") id: string) {
    const match = this.matchService.getById(parseInt(id));
    if (!match) {
      throw new httpError.NotFoundError("比赛不存在");
    }
    return { data: match };
  }

  @Post("/matches/:id/result")
  async updateResult(
    @Param("id") id: string,
    @Body() body: { homeScore: number; awayScore: number },
  ) {
    const match = this.matchService.updateResult(
      parseInt(id),
      body.homeScore,
      body.awayScore,
    );
    if (!match) {
      throw new httpError.NotFoundError("比赛不存在");
    }
    return { data: match };
  }
}
