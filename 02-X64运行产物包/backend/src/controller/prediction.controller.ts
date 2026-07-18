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
import { PredictionService } from "../service/prediction.service";
import { Context } from "@midwayjs/koa";

interface CreatePredictionBody {
  matchId: number;
  homeScore: number;
  awayScore: number;
}

@Controller("/api")
export class PredictionController {
  @Inject()
  predictionService: PredictionService;

  @Inject()
  ctx: Context;

  @Get("/predictions")
  async listPredictions(
    @Query("matchId") matchId?: string,
    @Query("userId") userId?: string,
  ) {
    let predictions;
    if (matchId && userId) {
      predictions = this.predictionService.getByMatchAndUser(
        parseInt(matchId),
        userId,
      );
    } else if (matchId) {
      predictions = this.predictionService.getByMatchId(parseInt(matchId));
    } else if (userId) {
      predictions = this.predictionService.getByUserId(userId);
    } else {
      predictions = this.predictionService.list();
    }
    return { data: predictions };
  }

  @Post("/predictions")
  async createPrediction(@Body() body: CreatePredictionBody) {
    if (
      typeof body?.matchId !== "number" ||
      typeof body?.homeScore !== "number" ||
      typeof body?.awayScore !== "number" ||
      body.homeScore < 0 ||
      body.awayScore < 0
    ) {
      throw new httpError.BadRequestError(
        "无效的预测数据，需要 matchId、homeScore、awayScore 为非负数",
      );
    }
    const userId = this.ctx.state.userId || "default-user";
    const prediction = this.predictionService.create({
      matchId: body.matchId,
      userId,
      homeScore: body.homeScore,
      awayScore: body.awayScore,
    });
    if (!prediction) {
      throw new httpError.BadRequestError(
        "预测提交失败，比赛可能已开始或不存在",
      );
    }
    return { data: prediction };
  }

  @Get("/predictions/match/:matchId")
  async getPredictionsByMatch(@Param("matchId") matchId: string) {
    const predictions = this.predictionService.getByMatchId(parseInt(matchId));
    return { data: predictions };
  }
}
