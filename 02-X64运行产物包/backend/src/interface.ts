export interface Course {
  id: number;
  title: string;
  description: string;
  createdAt: string;
}

export interface CreateCourseInput {
  title: string;
  description: string;
}

export interface Team {
  id: number;
  name: string;
  country: string;
  logo: string;
  group: string;
  description: string;
  createdAt: string;
}

export interface Match {
  id: number;
  homeTeamId: number;
  awayTeamId: number;
  homeTeamName: string;
  awayTeamName: string;
  homeTeamLogo: string;
  awayTeamLogo: string;
  group: string;
  round: string;
  status: "scheduled" | "in_progress" | "completed";
  startTime: string;
  homeScore: number | null;
  awayScore: number | null;
  createdAt: string;
}

export interface Prediction {
  id: number;
  matchId: number;
  userId: string;
  homeScore: number;
  awayScore: number;
  createdAt: string;
}

export interface CreatePredictionInput {
  matchId: number;
  userId: string;
  homeScore: number;
  awayScore: number;
}

export interface Comment {
  id: number;
  matchId: number;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
}

export interface CreateCommentInput {
  matchId: number;
  userId: string;
  userName: string;
  content: string;
}

export interface Favorite {
  id: number;
  matchId: number;
  userId: string;
  type: "match" | "team";
  createdAt: string;
}

export interface CreateFavoriteInput {
  matchId: number;
  userId: string;
  type: "match" | "team";
}

export interface StandingsEntry {
  teamId: number;
  teamName: string;
  teamLogo: string;
  group: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export interface KnockoutMatch {
  id: number;
  round: string;
  homeTeamId: number | null;
  awayTeamId: number | null;
  homeTeamName: string;
  awayTeamName: string;
  homeScore: number | null;
  awayScore: number | null;
  winnerId: number | null;
  nextMatchId: number | null;
}

export interface Player {
  id: number;
  teamId: number;
  name: string;
  position: "GK" | "DF" | "MF" | "FW";
  number: number;
  age: number;
  goals: number;
  assists: number;
  appearances: number;
  yellowCards: number;
  redCards: number;
}

export interface ScorePrediction {
  homeScore: number;
  awayScore: number;
  probability: number;
  reasoning: string;
}

export interface MatchForecast {
  matchId: number;
  homeTeamName: string;
  awayTeamName: string;
  homeWinProbability: number;
  drawProbability: number;
  awayWinProbability: number;
  topScorePredictions: ScorePrediction[];
  analysis: string;
}
