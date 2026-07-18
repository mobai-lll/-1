const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:7001";

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

export interface Team {
  id: number;
  name: string;
  country: string;
  logo: string;
  group: string;
  description: string;
  createdAt: string;
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

async function apiFetch<T>(path: string): Promise<T> {
  const response = await fetch(`${BACKEND_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) {
    throw new Error(
      `API request failed with status ${response.status}: ${path}`,
    );
  }
  return response.json() as Promise<T>;
}

export async function getMatches(group?: string): Promise<{ data: Match[] }> {
  const params = group ? `?group=${encodeURIComponent(group)}` : "";
  return apiFetch(`/api/matches${params}`);
}

export async function getTeam(id: number): Promise<{ data: Team }> {
  return apiFetch(`/api/teams/${id}`);
}

export async function getTeams(group?: string): Promise<{ data: Team[] }> {
  const params = group ? `?group=${encodeURIComponent(group)}` : "";
  return apiFetch(`/api/teams${params}`);
}

export async function getStandings(
  group?: string,
): Promise<{ data: StandingsEntry[] }> {
  const params = group ? `?group=${encodeURIComponent(group)}` : "";
  return apiFetch(`/api/standings${params}`);
}

export async function getGroups(): Promise<{ data: string[] }> {
  return apiFetch("/api/standings/groups");
}

export async function getTopScorers(
  limit?: number,
): Promise<{ data: Player[] }> {
  const params = limit ? `?limit=${limit}` : "";
  return apiFetch(`/api/players/scorers${params}`);
}

export async function getTopAssists(
  limit?: number,
): Promise<{ data: Player[] }> {
  const params = limit ? `?limit=${limit}` : "";
  return apiFetch(`/api/players/assists${params}`);
}

export function statusText(status: string): string {
  switch (status) {
    case "scheduled":
      return "未开始";
    case "in_progress":
      return "进行中";
    case "completed":
      return "已结束";
    default:
      return status;
  }
}

export function roundText(round: string): string {
  switch (round) {
    case "group":
      return "小组赛";
    case "round_of_32":
      return "三十二强";
    case "round_of_16":
      return "十六强";
    case "quarter_final":
      return "四分之一决赛";
    case "semi_final":
      return "半决赛";
    case "final":
      return "决赛";
    default:
      return round;
  }
}
