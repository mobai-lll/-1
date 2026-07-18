import { Controller, Get, Inject, Param } from "@midwayjs/core";
import { ForecastService } from "../service/forecast.service";

@Controller("/api")
export class ForecastController {
  @Inject()
  forecastService: ForecastService;

  @Get("/forecast/:matchId")
  async getForecast(@Param("matchId") matchId: string) {
    const forecast = this.forecastService.forecast(parseInt(matchId));
    if (!forecast) {
      return { data: null };
    }
    return { data: forecast };
  }
}
