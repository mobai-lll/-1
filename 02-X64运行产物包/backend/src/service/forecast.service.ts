import { Inject, Provide } from "@midwayjs/core";
import { DatabaseSync } from "node:sqlite";
import { MatchForecast, ScorePrediction } from "../interface";
import { DatabaseService } from "./database.service";

type MatchRow = {
  id: number;
  home_team_id: number;
  away_team_id: number;
  status: string;
  home_score: number | null;
  away_score: number | null;
};

type TeamRow = {
  id: number;
  name: string;
  logo: string;
};

type TeamStats = {
  teamId: number;
  name: string;
  logo: string;
  played: number;
  goalsFor: number;
  goalsAgainst: number;
  wins: number;
  draws: number;
  losses: number;
  avgGoalsFor: number;
  avgGoalsAgainst: number;
};

@Provide()
export class ForecastService {
  @Inject()
  databaseService: DatabaseService;

  private get database(): DatabaseSync {
    return this.databaseService.getDatabase();
  }

  forecast(matchId: number): MatchForecast | null {
    const match = this.database
      .prepare("SELECT * FROM matches WHERE id = ?")
      .get(matchId) as MatchRow | undefined;

    if (!match) return null;

    const homeTeam = this.database
      .prepare("SELECT id, name, logo FROM teams WHERE id = ?")
      .get(match.home_team_id) as TeamRow | undefined;

    const awayTeam = this.database
      .prepare("SELECT id, name, logo FROM teams WHERE id = ?")
      .get(match.away_team_id) as TeamRow | undefined;

    if (!homeTeam || !awayTeam) return null;

    const homeStats = this.getTeamStats(match.home_team_id);
    const awayStats = this.getTeamStats(match.away_team_id);

    const homeExpected = this.calculateExpectedGoals(
      homeStats,
      awayStats,
      true,
    );
    const awayExpected = this.calculateExpectedGoals(
      awayStats,
      homeStats,
      false,
    );

    const scorePredictions = this.generateScorePredictions(
      homeExpected,
      awayExpected,
      homeStats,
      awayStats,
    );

    const { homeWinProb, drawProb, awayWinProb } =
      this.calculateOutcomeProbabilities(homeExpected, awayExpected);

    const analysis = this.generateAnalysis(
      homeStats,
      awayStats,
      homeExpected,
      awayExpected,
    );

    return {
      matchId: match.id,
      homeTeamName: homeTeam.name,
      awayTeamName: awayTeam.name,
      homeWinProbability: Math.round(homeWinProb * 100),
      drawProbability: Math.round(drawProb * 100),
      awayWinProbability: Math.round(awayWinProb * 100),
      topScorePredictions: scorePredictions,
      analysis,
    };
  }

  private getTeamStats(teamId: number): TeamStats {
    const matches = this.database
      .prepare(
        `
        SELECT * FROM matches
        WHERE (home_team_id = ? OR away_team_id = ?) AND status = 'completed'
      `,
      )
      .all(teamId, teamId) as MatchRow[];

    let goalsFor = 0;
    let goalsAgainst = 0;
    let wins = 0;
    let draws = 0;
    let losses = 0;

    for (const m of matches) {
      const isHome = m.home_team_id === teamId;
      const scored = isHome ? (m.home_score ?? 0) : (m.away_score ?? 0);
      const conceded = isHome ? (m.away_score ?? 0) : (m.home_score ?? 0);

      goalsFor += scored;
      goalsAgainst += conceded;

      if (scored > conceded) wins++;
      else if (scored === conceded) draws++;
      else losses++;
    }

    const played = matches.length;

    const team = this.database
      .prepare("SELECT id, name, logo FROM teams WHERE id = ?")
      .get(teamId) as TeamRow;

    return {
      teamId,
      name: team.name,
      logo: team.logo,
      played,
      goalsFor,
      goalsAgainst,
      wins,
      draws,
      losses,
      avgGoalsFor: played > 0 ? goalsFor / played : 1.0,
      avgGoalsAgainst: played > 0 ? goalsAgainst / played : 1.0,
    };
  }

  private calculateExpectedGoals(
    home: TeamStats,
    away: TeamStats,
    isHome: boolean,
  ): number {
    const homeAdvantage = isHome ? 1.15 : 0.85;
    const attackStrength = home.avgGoalsFor > 0 ? home.avgGoalsFor : 1.0;
    const defenseWeakness =
      away.avgGoalsAgainst > 0 ? away.avgGoalsAgainst : 1.0;

    const leagueAvg = 1.35;
    const expected =
      ((attackStrength * defenseWeakness) / leagueAvg) * homeAdvantage;
    return Math.max(0.2, Math.min(expected, 4.0));
  }

  private poissonPmf(k: number, lambda: number): number {
    const factorial = (n: number): number =>
      n <= 1 ? 1 : n * factorial(n - 1);
    return (Math.exp(-lambda) * Math.pow(lambda, k)) / factorial(k);
  }

  private generateScorePredictions(
    homeExpected: number,
    awayExpected: number,
    home: TeamStats,
    away: TeamStats,
  ): ScorePrediction[] {
    const maxGoals = 5;
    const predictions: ScorePrediction[] = [];

    for (let h = 0; h <= maxGoals; h++) {
      for (let a = 0; a <= maxGoals; a++) {
        const prob =
          this.poissonPmf(h, homeExpected) * this.poissonPmf(a, awayExpected);
        predictions.push({
          homeScore: h,
          awayScore: a,
          probability: prob,
          reasoning: "",
        });
      }
    }

    predictions.sort((a, b) => b.probability - a.probability);
    const top = predictions.slice(0, 5);
    const totalProb = top.reduce((sum, p) => sum + p.probability, 0);

    return top.map((p) => ({
      ...p,
      probability: Math.round((p.probability / totalProb) * 100),
      reasoning: this.generateReasoning(
        p.homeScore,
        p.awayScore,
        home,
        away,
        homeExpected,
        awayExpected,
      ),
    }));
  }

  private calculateOutcomeProbabilities(
    homeExpected: number,
    awayExpected: number,
  ) {
    const maxGoals = 5;
    let homeWinProb = 0;
    let drawProb = 0;
    let awayWinProb = 0;

    for (let h = 0; h <= maxGoals; h++) {
      for (let a = 0; a <= maxGoals; a++) {
        const prob =
          this.poissonPmf(h, homeExpected) * this.poissonPmf(a, awayExpected);
        if (h > a) homeWinProb += prob;
        else if (h === a) drawProb += prob;
        else awayWinProb += prob;
      }
    }

    const total = homeWinProb + drawProb + awayWinProb;
    return {
      homeWinProb: homeWinProb / total,
      drawProb: drawProb / total,
      awayWinProb: awayWinProb / total,
    };
  }

  private generateReasoning(
    homeScore: number,
    awayScore: number,
    home: TeamStats,
    away: TeamStats,
    homeExpected: number,
    awayExpected: number,
  ): string {
    const reasons: string[] = [];

    reasons.push(
      `${home.name} 场均进球 ${home.avgGoalsFor.toFixed(1)}，预期进球 ${homeExpected.toFixed(2)}`,
    );
    reasons.push(
      `${away.name} 场均失球 ${away.avgGoalsAgainst.toFixed(1)}，预期失球 ${awayExpected.toFixed(2)}`,
    );

    if (homeScore > awayScore) {
      reasons.push(
        `${home.name} 近 ${home.played} 场胜率 ${home.played > 0 ? Math.round((home.wins / home.played) * 100) : 0}%`,
      );
    } else if (homeScore < awayScore) {
      reasons.push(
        `${away.name} 近 ${away.played} 场胜率 ${away.played > 0 ? Math.round((away.wins / away.played) * 100) : 0}%`,
      );
    } else {
      reasons.push(`两队攻防实力接近，平局概率较高`);
    }

    if (home.goalsFor > away.goalsFor) {
      reasons.push(
        `${home.name} 总进球 ${home.goalsFor} 高于 ${away.name} 的 ${away.goalsFor}`,
      );
    } else if (away.goalsFor > home.goalsFor) {
      reasons.push(
        `${away.name} 总进球 ${away.goalsFor} 高于 ${home.name} 的 ${home.goalsFor}`,
      );
    }

    return reasons.join("；");
  }

  private generateAnalysis(
    home: TeamStats,
    away: TeamStats,
    homeExpected: number,
    awayExpected: number,
  ): string {
    const parts: string[] = [];

    parts.push(
      `${home.name} 已赛 ${home.played} 场（${home.wins}胜${home.draws}平${home.losses}负）`,
    );
    parts.push(
      `场均进球 ${home.avgGoalsFor.toFixed(1)}，场均失球 ${home.avgGoalsAgainst.toFixed(1)}`,
    );

    parts.push(
      `${away.name} 已赛 ${away.played} 场（${away.wins}胜${away.draws}平${away.losses}负）`,
    );
    parts.push(
      `场均进球 ${away.avgGoalsFor.toFixed(1)}，场均失球 ${away.avgGoalsAgainst.toFixed(1)}`,
    );

    if (homeExpected > awayExpected) {
      parts.push(
        `${home.name} 预期进球 ${homeExpected.toFixed(2)} 高于 ${away.name} 的 ${awayExpected.toFixed(2)}`,
      );
      parts.push(`综合攻防数据，${home.name} 在本场比赛中占据一定优势`);
    } else if (awayExpected > homeExpected) {
      parts.push(
        `${away.name} 预期进球 ${awayExpected.toFixed(2)} 高于 ${home.name} 的 ${homeExpected.toFixed(2)}`,
      );
      parts.push(`综合攻防数据，${away.name} 有望在客场取得好成绩`);
    } else {
      parts.push(
        `两队预期进球接近（${homeExpected.toFixed(2)} vs ${awayExpected.toFixed(2)}），比赛可能较为胶着`,
      );
    }

    if (home.played < 3) {
      parts.push(`注：${home.name} 样本量较小，预测仅供参考`);
    }
    if (away.played < 3) {
      parts.push(`注：${away.name} 样本量较小，预测仅供参考`);
    }

    return parts.join("。") + "。";
  }
}
