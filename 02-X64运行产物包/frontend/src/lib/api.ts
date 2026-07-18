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

const API_BASE = "";

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }
  return response.json();
}

export async function getMatches(group?: string): Promise<{ data: Match[] }> {
  const params = group ? `?group=${encodeURIComponent(group)}` : "";
  return apiFetch(`/api/matches${params}`);
}

export async function getMatch(id: number): Promise<{ data: Match }> {
  return apiFetch(`/api/matches/${id}`);
}

export async function updateMatchResult(
  id: number,
  homeScore: number,
  awayScore: number,
): Promise<{ data: Match }> {
  return apiFetch(`/api/matches/${id}/result`, {
    method: "POST",
    body: JSON.stringify({ homeScore, awayScore }),
  });
}

export async function getTeams(group?: string): Promise<{ data: Team[] }> {
  const params = group ? `?group=${encodeURIComponent(group)}` : "";
  return apiFetch(`/api/teams${params}`);
}

export async function getTeam(id: number): Promise<{ data: Team }> {
  return apiFetch(`/api/teams/${id}`);
}

export async function getPredictions(
  matchId?: number,
  userId?: string,
): Promise<{ data: Prediction[] }> {
  let params = "";
  if (matchId) params += `matchId=${matchId}`;
  if (userId)
    params += params
      ? `&userId=${encodeURIComponent(userId)}`
      : `userId=${encodeURIComponent(userId)}`;
  return apiFetch(`/api/predictions${params ? `?${params}` : ""}`);
}

export async function createPrediction(
  input: CreatePredictionInput,
): Promise<{ data: Prediction }> {
  return apiFetch("/api/predictions", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function getComments(
  matchId: number,
): Promise<{ data: Comment[] }> {
  return apiFetch(`/api/comments/match/${matchId}`);
}

export async function createComment(
  input: CreateCommentInput,
): Promise<{ data: Comment }> {
  return apiFetch("/api/comments", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function getFavorites(
  userId: string,
): Promise<{ data: Favorite[] }> {
  return apiFetch(`/api/favorites?userId=${encodeURIComponent(userId)}`);
}

export async function createFavorite(
  input: CreateFavoriteInput,
): Promise<{ data: Favorite }> {
  return apiFetch("/api/favorites", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function deleteFavorite(
  id: number,
): Promise<{ success: boolean }> {
  return apiFetch(`/api/favorites/${id}`, {
    method: "DELETE",
  });
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

export async function getPlayersByTeam(
  teamId: number,
): Promise<{ data: Player[] }> {
  return apiFetch(`/api/players/team/${teamId}`);
}

export async function getPlayer(id: number): Promise<{ data: Player | null }> {
  return apiFetch(`/api/players/${id}`);
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

export async function getForecast(
  matchId: number,
): Promise<{ data: MatchForecast | null }> {
  return apiFetch(`/api/forecast/${matchId}`);
}

// 球队中文名称映射
const TEAM_CN: Record<string, string> = {
  Mexico: "墨西哥",
  "South Africa": "南非",
  "South Korea": "韩国",
  "Czech Republic": "捷克",
  Canada: "加拿大",
  "Bosnia and Herzegovina": "波黑",
  Qatar: "卡塔尔",
  Switzerland: "瑞士",
  Brazil: "巴西",
  Morocco: "摩洛哥",
  Haiti: "海地",
  Scotland: "苏格兰",
  "United States": "美国",
  Paraguay: "巴拉圭",
  Australia: "澳大利亚",
  Turkey: "土耳其",
  Germany: "德国",
  Curacao: "库拉索",
  "Ivory Coast": "科特迪瓦",
  Ecuador: "厄瓜多尔",
  Netherlands: "荷兰",
  Japan: "日本",
  Sweden: "瑞典",
  Tunisia: "突尼斯",
  Belgium: "比利时",
  Egypt: "埃及",
  Iran: "伊朗",
  "New Zealand": "新西兰",
  Spain: "西班牙",
  "Cape Verde": "佛得角",
  "Saudi Arabia": "沙特阿拉伯",
  Uruguay: "乌拉圭",
  France: "法国",
  Senegal: "塞内加尔",
  Iraq: "伊拉克",
  Norway: "挪威",
  Argentina: "阿根廷",
  Algeria: "阿尔及利亚",
  Austria: "奥地利",
  Jordan: "约旦",
  Portugal: "葡萄牙",
  "DR Congo": "刚果(金)",
  Uzbekistan: "乌兹别克斯坦",
  Colombia: "哥伦比亚",
  England: "英格兰",
  Croatia: "克罗地亚",
  Ghana: "加纳",
  Panama: "巴拿马",
};

// 分组中文名称映射
const GROUP_CN: Record<string, string> = {
  "Group A": "A组",
  "Group B": "B组",
  "Group C": "C组",
  "Group D": "D组",
  "Group E": "E组",
  "Group F": "F组",
  "Group G": "G组",
  "Group H": "H组",
  "Group I": "I组",
  "Group J": "J组",
  "Group K": "K组",
  "Group L": "L组",
};

// 轮次中文名称映射
const ROUND_CN: Record<string, string> = {
  group: "小组赛",
  round_of_32: "三十二强",
  round_of_16: "十六强",
  quarter_final: "四分之一决赛",
  semi_final: "半决赛",
  final: "决赛",
};

export function teamCn(name: string): string {
  return TEAM_CN[name] ?? name;
}

export function groupCn(group: string): string {
  if (!group) return "";
  return GROUP_CN[group] ?? group;
}

export function roundCn(round: string): string {
  return ROUND_CN[round] ?? round;
}

export function positionCn(position: string): string {
  switch (position) {
    case "GK":
      return "门将";
    case "DF":
      return "后卫";
    case "MF":
      return "中场";
    case "FW":
      return "前锋";
    default:
      return position;
  }
}

export function positionColor(position: string): string {
  switch (position) {
    case "GK":
      return "bg-amber-100 text-amber-700";
    case "DF":
      return "bg-blue-100 text-blue-700";
    case "MF":
      return "bg-emerald-100 text-emerald-700";
    case "FW":
      return "bg-rose-100 text-rose-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getStatusText(status: string): string {
  switch (status) {
    case "completed":
      return "已结束";
    case "in_progress":
      return "进行中";
    case "scheduled":
      return "未开始";
    default:
      return status;
  }
}

export function getStatusClass(status: string): string {
  switch (status) {
    case "completed":
      return "bg-slate-100 text-slate-600";
    case "in_progress":
      return "bg-amber-100 text-amber-700";
    case "scheduled":
      return "bg-blue-100 text-blue-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
}
