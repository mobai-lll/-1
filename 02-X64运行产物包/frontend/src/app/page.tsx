"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  getMatches,
  getTeams,
  getGroups,
  getTopScorers,
  getTopAssists,
  Match,
  Team,
  Player,
  formatDate,
  formatTime,
  getStatusText,
  teamCn,
  groupCn,
  roundCn,
  positionCn,
} from "@/lib/api";

interface CountdownProps {
  targetDate: Date;
  label: string;
}

function TimeBlock({ value, unit }: { value: number; unit: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm">
        <span className="text-3xl font-bold text-white">{value.toString().padStart(2, "0")}</span>
      </div>
      <span className="mt-2 text-sm text-white/70">{unit}</span>
    </div>
  );
}

function Countdown({ targetDate, label }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className="animate-fade-in-up">
      <p className="mb-4 text-sm font-medium text-white/80">{label}</p>
      <div className="flex gap-3">
        <TimeBlock value={timeLeft.days} unit="天" />
        <span className="mt-6 text-2xl font-bold text-white/50">:</span>
        <TimeBlock value={timeLeft.hours} unit="时" />
        <span className="mt-6 text-2xl font-bold text-white/50">:</span>
        <TimeBlock value={timeLeft.minutes} unit="分" />
        <span className="mt-6 text-2xl font-bold text-white/50">:</span>
        <TimeBlock value={timeLeft.seconds} unit="秒" />
      </div>
    </div>
  );
}

interface HeroMatchProps {
  match: Match;
}

function HeroMatch({ match }: HeroMatchProps) {
  const isCompleted = match.status === "completed";
  const isUpcoming = match.status === "scheduled";

  return (
    <div className="animate-fade-in-up delay-200 rounded-2xl bg-white/10 backdrop-blur-md p-6">
      <div className="mb-4 flex items-center justify-between">
        <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white">
          {match.group ? groupCn(match.group) : roundCn(match.round)}
        </span>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${
          isCompleted ? "bg-slate-200 text-slate-700" : 
          isUpcoming ? "bg-blue-500 text-white" : "bg-amber-500 text-white"
        }`}>
          {getStatusText(match.status)}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/20">
            <span className="text-4xl">{match.homeTeamLogo}</span>
          </div>
          <div>
            <p className="text-xl font-bold text-white">{teamCn(match.homeTeamName)}</p>
            <p className="text-sm text-white/60">{match.homeTeamName}</p>
          </div>
        </div>
        <div className="flex flex-col items-center">
          {isCompleted ? (
            <>
              <div className="flex items-center gap-2">
                <span className="text-5xl font-bold text-white">{match.homeScore}</span>
                <span className="text-3xl text-white/50">:</span>
                <span className="text-5xl font-bold text-white">{match.awayScore}</span>
              </div>
            </>
          ) : (
            <>
              <span className="text-2xl font-medium text-white/70">VS</span>
              <p className="mt-2 text-sm text-white/60">
                {formatDate(match.startTime)} {formatTime(match.startTime)}
              </p>
            </>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xl font-bold text-white">{teamCn(match.awayTeamName)}</p>
            <p className="text-sm text-white/60">{match.awayTeamName}</p>
          </div>
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/20">
            <span className="text-4xl">{match.awayTeamLogo}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  trend?: "up" | "down";
}

function StatCard({ label, value, icon, trend }: StatCardProps) {
  return (
    <div className="group flex flex-col gap-3 rounded-xl bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600">
        <span className="text-2xl">{icon}</span>
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <div className="mt-1 flex items-center gap-2">
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          {trend && (
            <span className={`text-xs font-medium ${trend === "up" ? "text-emerald-500" : "text-rose-500"}`}>
              {trend === "up" ? "↑" : "↓"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

interface MatchCardProps {
  match: Match;
}

function MatchCard({ match }: MatchCardProps) {
  const isCompleted = match.status === "completed";

  return (
    <div className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{match.homeTeamLogo}</span>
        <div>
          <p className="font-medium text-slate-900">{teamCn(match.homeTeamName)}</p>
          <p className="text-xs text-slate-500">{match.homeTeamName}</p>
        </div>
      </div>
      <div className="flex flex-col items-center">
        {isCompleted ? (
          <div className="flex items-center gap-1">
            <span className="text-xl font-bold text-slate-900">{match.homeScore}</span>
            <span className="text-slate-400">:</span>
            <span className="text-xl font-bold text-slate-900">{match.awayScore}</span>
          </div>
        ) : (
          <div className="text-center">
            <span className="text-sm font-medium text-blue-600">{formatDate(match.startTime)}</span>
            <span className="text-xs text-slate-500">{formatTime(match.startTime)}</span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="font-medium text-slate-900">{teamCn(match.awayTeamName)}</p>
          <p className="text-xs text-slate-500">{match.awayTeamName}</p>
        </div>
        <span className="text-2xl">{match.awayTeamLogo}</span>
      </div>
    </div>
  );
}

interface ScorerCardProps {
  player: Player;
  teamName: string;
  rank: number;
}

function ScorerCard({ player, teamName, rank }: ScorerCardProps) {
  const rankColors = ["bg-amber-500", "bg-slate-400", "bg-amber-600"];

  return (
    <div className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm">
      <div className={`flex h-8 w-8 items-center justify-center rounded-full ${rankColors[rank - 1] || "bg-blue-500"} text-white`}>
        {rank}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-slate-900 truncate">{player.name}</p>
        <p className="text-xs text-slate-500">{teamCn(teamName)}</p>
      </div>
      <div className="flex items-center gap-4 text-sm">
        <span className="text-slate-500">{positionCn(player.position)}</span>
        <div className="flex items-center gap-2">
          <span className="font-bold text-rose-500">{player.goals}⚽</span>
          <span className="text-slate-400">|</span>
          <span className="font-medium text-blue-500">{player.assists}🅰️</span>
        </div>
      </div>
    </div>
  );
}

interface StandingsCardProps {
  group: string;
  teams: { teamName: string; teamLogo: string; points: number; goalDifference: number; played: number }[];
}

function StandingsCard({ group, teams }: StandingsCardProps) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900">{groupCn(group)}</h3>
        <Link href="/standings" className="text-sm font-medium text-blue-600 hover:text-blue-700">
          查看全部 →
        </Link>
      </div>
      <div className="space-y-2">
        {teams.slice(0, 4).map((team, index) => (
          <div key={team.teamName} className="flex items-center gap-3">
            <span className={`w-5 text-center text-sm font-medium ${
              index < 2 ? "text-blue-600" : "text-slate-500"
            }`}>
              {index + 1}
            </span>
            <span className="text-xl">{team.teamLogo}</span>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-900 truncate">{teamCn(team.teamName)}</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-slate-500">{team.played}场</span>
              <span className="text-slate-500">{team.goalDifference > 0 ? "+" : ""}{team.goalDifference}</span>
              <span className="font-bold text-blue-600">{team.points}分</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [groups, setGroups] = useState<string[]>([]);
  const [scorers, setScorers] = useState<Player[]>([]);
  const [assists, setAssists] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [matchesResult, teamsResult, groupsResult, scorersResult, assistsResult] = await Promise.all([
          getMatches(),
          getTeams(),
          getGroups(),
          getTopScorers(10),
          getTopAssists(5),
        ]);
        setMatches(matchesResult.data);
        setTeams(teamsResult.data);
        setGroups(groupsResult.data);
        setScorers(scorersResult.data);
        setAssists(assistsResult.data);
      } catch {
        setError("无法加载数据");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const completedMatches = matches.filter((m) => m.status === "completed");
  const upcomingMatches = matches
    .filter((m) => m.status === "scheduled")
    .sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    )
    .slice(0, 6);

  const heroMatch = completedMatches.length > 0 
    ? completedMatches[completedMatches.length - 1] 
    : upcomingMatches[0];

  const nextMatch = upcomingMatches.find(m => m.status === "scheduled");

  const groupedStandings = groups.map(group => {
    const groupMatches = matches.filter(m => m.group === group && m.status === "completed");
    const groupTeams = teams.filter(t => t.group === group);
    const teamStats = groupTeams.map(team => {
      const teamMatches = groupMatches.filter(m => m.homeTeamId === team.id || m.awayTeamId === team.id);
      let won = 0, drawn = 0, lost = 0, goalsFor = 0, goalsAgainst = 0;
      teamMatches.forEach(m => {
        const isHome = m.homeTeamId === team.id;
        const teamScore = isHome ? m.homeScore! : m.awayScore!;
        const oppScore = isHome ? m.awayScore! : m.homeScore!;
        goalsFor += teamScore;
        goalsAgainst += oppScore;
        if (teamScore > oppScore) won++;
        else if (teamScore < oppScore) lost++;
        else drawn++;
      });
      return {
        teamName: team.name,
        teamLogo: team.logo,
        played: teamMatches.length,
        won,
        drawn,
        lost,
        goalsFor,
        goalsAgainst,
        goalDifference: goalsFor - goalsAgainst,
        points: won * 3 + drawn,
      };
    });
    return {
      group,
      teams: teamStats.sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference),
    };
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-amber-700" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')]" />
        
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:py-20">
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-4 flex items-center gap-2 rounded-full bg-white/10 px-4 py-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
              <span className="text-sm font-medium text-white">2026 美加墨世界杯</span>
            </div>
            <h1 className="animate-fade-in-up text-4xl font-bold text-white sm:text-6xl">
              FIFA World Cup
            </h1>
            <p className="mt-4 text-lg text-white/70 sm:text-xl">
              实时追踪世界杯精彩赛事
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              {heroMatch && <HeroMatch match={heroMatch} />}
            </div>
            <div className="flex flex-col justify-center">
              {nextMatch && (
                <Countdown 
                  targetDate={new Date(nextMatch.startTime)} 
                  label={`下一场比赛：${teamCn(nextMatch.homeTeamName)} vs ${teamCn(nextMatch.awayTeamName)}`} 
                />
              )}
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-blue-50 to-transparent" />
      </section>

      <div className="mx-auto max-w-7xl px-4 -mt-8 pb-16">
        {error && (
          <div className="mb-8 rounded-lg bg-rose-100 p-4 text-rose-800">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          </div>
        ) : (
          <>
            <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <StatCard label="参赛球队" value={teams.length} icon="🏆" />
              <StatCard label="比赛场次" value={matches.length} icon="⚽" />
              <StatCard label="已结束" value={completedMatches.length} icon="✅" />
              <StatCard label="小组数量" value={groups.length} icon="📊" />
            </div>

            <div className="mb-10">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900">最近比赛</h2>
                <Link href="/matches" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                  查看全部 →
                </Link>
              </div>
              {completedMatches.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
                  <p className="text-lg">暂无已结束的比赛</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {completedMatches.slice(-5).reverse().map((match) => (
                    <MatchCard key={match.id} match={match} />
                  ))}
                </div>
              )}
            </div>

            <div className="mb-10">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900">即将开始</h2>
              </div>
              {upcomingMatches.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
                  <p className="text-lg">暂无即将开始的比赛</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {upcomingMatches.map((match) => (
                    <MatchCard key={match.id} match={match} />
                  ))}
                </div>
              )}
            </div>

            <div className="mb-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-slate-900">射手榜</h2>
                  <Link href="/players" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                    查看全部 →
                  </Link>
                </div>
                <div className="space-y-3">
                  {scorers.slice(0, 5).map((player, index) => {
                    const team = teams.find(t => t.id === player.teamId);
                    return (
                      <ScorerCard 
                        key={player.id} 
                        player={player} 
                        teamName={team?.name || ""}
                        rank={index + 1}
                      />
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-slate-900">助攻榜</h2>
                  <Link href="/players" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                    查看全部 →
                  </Link>
                </div>
                <div className="space-y-3">
                  {assists.slice(0, 5).map((player, index) => {
                    const team = teams.find(t => t.id === player.teamId);
                    return (
                      <ScorerCard 
                        key={player.id} 
                        player={player} 
                        teamName={team?.name || ""}
                        rank={index + 1}
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900">积分榜</h2>
                <Link href="/standings" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                  查看全部 →
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {groupedStandings.slice(0, 6).map(({ group, teams }) => (
                  <StandingsCard key={group} group={group} teams={teams} />
                ))}
              </div>
            </div>

            <div className="mt-10">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900">快速导航</h2>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
                <Link
                  href="/matches"
                  className="group flex flex-col items-center rounded-xl bg-white p-6 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                    <span className="text-2xl">📅</span>
                  </div>
                  <p className="font-semibold text-slate-900">赛程安排</p>
                  <p className="mt-1 text-sm text-slate-500">查看所有比赛</p>
                </Link>
                <Link
                  href="/teams"
                  className="group flex flex-col items-center rounded-xl bg-white p-6 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
                    <span className="text-2xl">👥</span>
                  </div>
                  <p className="font-semibold text-slate-900">球队一览</p>
                  <p className="mt-1 text-sm text-slate-500">了解参赛球队</p>
                </Link>
                <Link
                  href="/players"
                  className="group flex flex-col items-center rounded-xl bg-white p-6 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
                    <span className="text-2xl">⚽</span>
                  </div>
                  <p className="font-semibold text-slate-900">球员数据</p>
                  <p className="mt-1 text-sm text-slate-500">射手榜助攻榜</p>
                </Link>
                <Link
                  href="/standings"
                  className="group flex flex-col items-center rounded-xl bg-white p-6 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
                    <span className="text-2xl">📊</span>
                  </div>
                  <p className="font-semibold text-slate-900">积分榜</p>
                  <p className="mt-1 text-sm text-slate-500">查看排名情况</p>
                </Link>
                <Link
                  href="/knockout"
                  className="group flex flex-col items-center rounded-xl bg-white p-6 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-rose-100">
                    <span className="text-2xl">🏆</span>
                  </div>
                  <p className="font-semibold text-slate-900">淘汰赛</p>
                  <p className="mt-1 text-sm text-slate-500">淘汰赛对阵</p>
                </Link>
              </div>
            </div>

            <footer className="mt-16 text-center text-sm text-slate-500">
              Next.js · Midway.js · SQLite · OpenAPI
            </footer>
          </>
        )}
      </div>
    </div>
  );
}