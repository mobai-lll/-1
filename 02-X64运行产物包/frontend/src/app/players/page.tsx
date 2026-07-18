"use client";

import { useState, useEffect } from "react";
import {
  Player,
  getTopScorers,
  getTopAssists,
  getTeams,
  Team,
  teamCn,
} from "@/lib/api";

export default function PlayersPage() {
  const [scorers, setScorers] = useState<Player[]>([]);
  const [assisters, setAssisters] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [scorersResult, assistersResult, teamsResult] = await Promise.all(
          [getTopScorers(10), getTopAssists(10), getTeams()],
        );
        setScorers(scorersResult.data);
        setAssisters(assistersResult.data);
        setTeams(teamsResult.data);
      } catch {
        setError("无法加载球员数据");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const teamMap = new Map(teams.map((t) => [t.id, t]));

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">球员数据</h1>
          <p className="mt-2 text-slate-600">查看射手榜和助攻榜</p>
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
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* 射手榜 */}
            <div>
              <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-slate-900">
                <span>⚽</span> 射手榜
              </h2>
              <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                {scorers.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">暂无数据</div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="w-12 px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                          排名
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                          球员
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                          球队
                        </th>
                        <th className="w-16 px-4 py-3 text-center text-xs font-semibold uppercase text-slate-500">
                          进球
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {scorers.map((player, idx) => {
                        const team = teamMap.get(player.teamId);
                        return (
                          <tr key={player.id}>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                                  idx === 0
                                    ? "bg-yellow-400 text-yellow-900"
                                    : idx === 1
                                      ? "bg-slate-300 text-slate-700"
                                      : idx === 2
                                        ? "bg-amber-600 text-amber-100"
                                        : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {idx + 1}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <p className="font-medium text-slate-900">
                                {player.name}
                              </p>
                              <p className="text-xs text-slate-500">
                                {player.appearances}场出场
                              </p>
                            </td>
                            <td className="px-4 py-3">
                              {team && (
                                <div className="flex items-center gap-2">
                                  <span className="text-xl">{team.logo}</span>
                                  <span className="text-sm text-slate-600">
                                    {teamCn(team.name)}
                                  </span>
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="text-lg font-bold text-emerald-600">
                                {player.goals}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* 助攻榜 */}
            <div>
              <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-slate-900">
                <span>🎯</span> 助攻榜
              </h2>
              <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                {assisters.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">暂无数据</div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="w-12 px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                          排名
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                          球员
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                          球队
                        </th>
                        <th className="w-16 px-4 py-3 text-center text-xs font-semibold uppercase text-slate-500">
                          助攻
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {assisters.map((player, idx) => {
                        const team = teamMap.get(player.teamId);
                        return (
                          <tr key={player.id}>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                                  idx === 0
                                    ? "bg-yellow-400 text-yellow-900"
                                    : idx === 1
                                      ? "bg-slate-300 text-slate-700"
                                      : idx === 2
                                        ? "bg-amber-600 text-amber-100"
                                        : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {idx + 1}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <p className="font-medium text-slate-900">
                                {player.name}
                              </p>
                              <p className="text-xs text-slate-500">
                                {player.appearances}场出场
                              </p>
                            </td>
                            <td className="px-4 py-3">
                              {team && (
                                <div className="flex items-center gap-2">
                                  <span className="text-xl">{team.logo}</span>
                                  <span className="text-sm text-slate-600">
                                    {teamCn(team.name)}
                                  </span>
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="text-lg font-bold text-blue-600">
                                {player.assists}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
