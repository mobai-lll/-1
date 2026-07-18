import {
  Body,
  Controller,
  Get,
  httpError,
  Inject,
  Post,
  Query,
} from "@midwayjs/core";
import { FavoriteService } from "../service/favorite.service";
import { Context } from "@midwayjs/koa";

interface CreateFavoriteBody {
  matchId: number;
  type: "match" | "team";
}

interface DeleteFavoriteBody {
  id: number;
}

@Controller("/api")
export class FavoriteController {
  @Inject()
  favoriteService: FavoriteService;

  @Inject()
  ctx: Context;

  @Get("/favorites")
  async getFavorites(@Query("userId") userId?: string) {
    if (!userId) {
      throw new httpError.BadRequestError("userId 参数不能为空");
    }
    const favorites = this.favoriteService.getByUserId(userId);
    return { data: favorites };
  }

  @Post("/favorites")
  async createFavorite(@Body() body: CreateFavoriteBody) {
    const userId = this.ctx.state.userId || "default-user";
    const favorite = this.favoriteService.create({
      matchId: body.matchId,
      userId,
      type: body.type,
    });
    if (!favorite) {
      throw new httpError.BadRequestError("收藏已存在");
    }
    return { data: favorite };
  }

  @Post("/favorites/delete")
  async deleteFavorite(@Body() body: DeleteFavoriteBody) {
    const success = this.favoriteService.delete(body.id);
    if (!success) {
      throw new httpError.NotFoundError("收藏不存在");
    }
    return { success };
  }
}
