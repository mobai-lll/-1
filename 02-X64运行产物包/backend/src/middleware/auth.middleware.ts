import { Middleware, IMiddleware } from "@midwayjs/core";
import { Context } from "@midwayjs/koa";

@Middleware()
export class AuthMiddleware implements IMiddleware<Context, unknown> {
  resolve(): (context: Context, next: unknown) => Promise<void> {
    return async (ctx: Context, next: unknown) => {
      const authHeader = ctx.headers.authorization;

      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.substring(7);
        ctx.state.userId = token;
      } else {
        ctx.state.userId = "default-user";
      }

      await (next as () => Promise<void>)();
    };
  }

  static getName(): string {
    return "auth";
  }
}
