"use client";

import { useState, useEffect } from "react";
import { getMatches, Match, formatDate, teamCn, roundCn } from "@/lib/api";

export default function KnockoutPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMatches = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getMatches();
        const knockoutMatches = result.data.filter((m) => !m.group);
        setMatches(knockoutMatches);
      } catch {
        setError("无法加载淘汰赛数据");
      } finally {
        setLoading(false);
      }
    };
    loadMatches();
  }, []);

  const groupedMatches = matches.reduce(
    (acc, match) => {
      const round = match.round || "淘汰赛";
      if (!acc[round]) {
        acc[round] = [];
      }
      acc[round].push(match);
      return acc;
    },
    {} as Record<string, Match[]>,
  );

  const rounds = [
    "round_of_32",
    "round_of_16",
    "quarter_final",
    "semi_final",
    "final",
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">淘汰赛</h1>
          <p className="mt-2 text-slate-600">查看淘汰赛对阵情况</p>
        </div>

        {error && (
          <div className="rounded-lg bg-rose-100 p-4 text-rose-800">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          </div>
        ) : Object.keys(groupedMatches).length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <p className="text-lg">暂无淘汰赛数据</p>
          </div>
        ) : (
          <div className="space-y-8">
            {rounds.map((round) => {
              const roundMatches = groupedMatches[round] || [];
              if (roundMatches.length === 0) return null;

              return (
                <div key={round}>
                  <h2 className="mb-4 text-xl font-bold text-slate-900">
                    {roundCn(round)}
                  </h2>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {roundMatches.map((match) => (
                      <div
                        key={match.id}
                        className="rounded-xl border border-slate-200 bg-white p-5"
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <span className="text-xs text-slate-500">
                            {formatDate(match.startTime)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex flex-col items-center">
                            <span className="text-4xl">
                              {match.homeTeamLogo}
                            </span>
                            <span className="mt-2 text-sm font-medium text-slate-900">
                              {teamCn(match.homeTeamName)}
                            </span>
                            <span className="text-xs text-slate-500">
                              {match.homeTeamName}
                            </span>
                          </div>
                          <div className="flex flex-col items-center">
                            <div className="flex items-center gap-2">
                              {match.status === "completed" ? (
                                <>
                                  <span className="text-2xl font-bold text-slate-900">
                                    {match.homeScore}
                                  </span>
                                  <span className="text-lg text-slate-400">
                                    :
                                  </span>
                                  <span className="text-2xl font-bold text-slate-900">
                                    {match.awayScore}
                                  </span>
                                </>
                              ) : (
                                <>
                                  <span className="text-2xl font-bold text-slate-300">
                                    ?
                                  </span>
                                  <span className="text-lg text-slate-400">
                                    :
                                  </span>
                                  <span className="text-2xl font-bold text-slate-300">
                                    ?
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-4xl">
                              {match.awayTeamLogo}
                            </span>
                            <span className="mt-2 text-sm font-medium text-slate-900">
                              {teamCn(match.awayTeamName)}
                            </span>
                            <span className="text-xs text-slate-500">
                              {match.awayTeamName}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
