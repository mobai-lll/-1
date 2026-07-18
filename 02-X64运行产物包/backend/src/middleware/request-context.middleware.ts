import { Middleware, IMiddleware } from "@midwayjs/core";
import { Context } from "@midwayjs/koa";
import { randomUUID } from "node:crypto";

/**
 * 请求上下文中间件：为每个请求生成唯一 requestId，
 * 写入响应头 X-Request-Id，并通过结构化日志记录请求和响应信息，
 * 便于问题追踪和并发场景排查。
 */
@Middleware()
export class RequestContextMiddleware implements IMiddleware<Context, unknown> {
  resolve(): (context: Context, next: unknown) => Promise<void> {
    return async (ctx: Context, next: unknown) => {
      const requestId = (ctx.headers["x-request-id"] as string) || randomUUID();
      const startedAt = Date.now();

      // 先设置响应头，确保无论后续逻辑是否报错，requestId 都能返回
      ctx.state.requestId = requestId;
      ctx.set("X-Request-Id", requestId);

      // 结构化日志（容错：logger 不可用时降级到 console）
      const log = (event: string, extra: Record<string, unknown>) => {
        const line = JSON.stringify({
          requestId,
          method: ctx.method,
          path: ctx.path,
          event,
          ...extra,
        });
        try {
          if (ctx.logger && typeof ctx.logger.info === "function") {
            ctx.logger.info(line);
          } else {
            console.log(line);
          }
        } catch {
          // 日志失败不影响请求
        }
      };

      log("request.start", {
        userAgent: ctx.headers["user-agent"] || "",
      });

      try {
        await (next as () => Promise<void>)();
      } finally {
        log("request.end", {
          status: ctx.status,
          durationMs: Date.now() - startedAt,
        });
      }
    };
  }

  static getName(): string {
    return "requestContext";
  }
}
