import { Body, Controller, Get, Inject, Param, Post } from "@midwayjs/core";
import { CommentService } from "../service/comment.service";
import { Context } from "@midwayjs/koa";

interface CreateCommentBody {
  matchId: number;
  userName: string;
  content: string;
}

@Controller("/api")
export class CommentController {
  @Inject()
  commentService: CommentService;

  @Inject()
  ctx: Context;

  @Get("/comments/match/:matchId")
  async getCommentsByMatch(@Param("matchId") matchId: string) {
    const comments = this.commentService.getByMatchId(parseInt(matchId));
    return { data: comments };
  }

  @Post("/comments")
  async createComment(@Body() body: CreateCommentBody) {
    const userId = this.ctx.state.userId || "default-user";
    const comment = this.commentService.create({
      matchId: body.matchId,
      userId,
      userName: body.userName,
      content: body.content,
    });
    return { data: comment };
  }
}
