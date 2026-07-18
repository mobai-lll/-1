import { Controller, Get, Inject, Query } from "@midwayjs/core";
import { StandingsService } from "../service/standings.service";

@Controller("/api")
export class StandingsController {
  @Inject()
  standingsService: StandingsService;

  @Get("/standings")
  async getStandings(@Query("group") group?: string) {
    const standings = this.standingsService.getStandings(group);
    return { data: standings };
  }

  @Get("/standings/groups")
  async getGroups() {
    const groups = this.standingsService.getGroups();
    return { data: groups };
  }
}
