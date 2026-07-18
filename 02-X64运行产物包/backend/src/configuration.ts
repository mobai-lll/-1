import {
  CommonJSFileDetector,
  Configuration,
  IMidwayContainer,
} from "@midwayjs/core";
import * as koa from "@midwayjs/koa";
import { join } from "node:path";
import { CorsMiddleware } from "./middleware/cors.middleware";
import { RequestContextMiddleware } from "./middleware/request-context.middleware";
import { AuthMiddleware } from "./middleware/auth.middleware";

@Configuration({
  imports: [koa],
  importConfigs: [join(__dirname, "./config")],
  detector: new CommonJSFileDetector(),
})
export class MainConfiguration {
  async onReady(container: IMidwayContainer) {
    const framework = await container.getAsync(koa.Framework);
    framework.useMiddleware([
      CorsMiddleware,
      RequestContextMiddleware,
      AuthMiddleware,
    ]);
  }
}
