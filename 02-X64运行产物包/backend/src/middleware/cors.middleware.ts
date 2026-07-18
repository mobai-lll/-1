import { Middleware, IMiddleware } from "@midwayjs/core";
import { Context } from "@midwayjs/koa";

@Middleware()
export class CorsMiddleware implements IMiddleware<Context, unknown> {
  resolve(): (context: Context, next: unknown) => Promise<void> {
    return async (ctx: Context, next: unknown) => {
      ctx.set("Access-Control-Allow-Origin", "*");
      ctx.set(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS",
      );
      ctx.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

      if (ctx.method === "OPTIONS") {
        ctx.status = 200;
        return;
      }

      await (next as () => Promise<void>)();
    };
  }
}
