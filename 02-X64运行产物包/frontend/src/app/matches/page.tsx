"use client";

import { useState, useEffect } from "react";
import {
  getMatches,
  getGroups,
  Match,
  teamCn,
  groupCn,
  roundCn,
  formatDate,
  formatTime,
} from "@/lib/api";
import { MatchCard, MatchForecast } from "@/components";
import { PredictionForm } from "@/components/prediction-form";
import { CommentSection } from "@/components/comment-section";

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [groups, setGroups] = useState<string[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string | undefined>(
    undefined,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  useEffect(() => {
    const loadMatches = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getMatches(selectedGroup);
        setMatches(result.data);
      } catch {
        setError("无法加载比赛数据");
      } finally {
        setLoading(false);
      }
    };

    const loadGroups = async () => {
      try {
        const result = await getGroups();
        setGroups(result.data);
      } catch {
        console.error("无法加载分组信息");
      }
    };

    loadMatches();
    loadGroups();
  }, [selectedGroup]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">赛程安排</h1>
            <p className="mt-2 text-slate-600">
              查看所有比赛安排和实时比分，点击比赛卡片进行比分预测和评论
            </p>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedGroup(undefined)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              selectedGroup === undefined
                ? "bg-blue-600 text-white"
                : "bg-white text-slate-700 hover:bg-slate-100"
            }`}
          >
            全部
          </button>
          {groups.map((group) => (
            <button
              key={group}
              onClick={() => setSelectedGroup(group)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                selectedGroup === group
                  ? "bg-blue-600 text-white"
                  : "bg-white text-slate-700 hover:bg-slate-100"
              }`}
            >
              {groupCn(group)}
            </button>
          ))}
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
        ) : matches.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <p className="text-lg">暂无比赛数据</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="mb-3 flex items-center gap-2 text-sm text-slate-500">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  →
                </span>
                <span>点击比赛卡片查看详情、比分预测和评论</span>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {matches.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    onClick={() => setSelectedMatch(match)}
                  />
                ))}
              </div>
            </div>

            <div className="lg:col-span-1">
              {selectedMatch ? (
                <div className="space-y-6">
                  {/* 比赛详情 */}
                  <div className="rounded-xl border border-slate-200 bg-white p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                        {selectedMatch.group
                          ? groupCn(selectedMatch.group)
                          : roundCn(selectedMatch.round)}
                      </span>
                      <span className="text-xs text-slate-500">
                        {formatDate(selectedMatch.startTime)}{" "}
                        {formatTime(selectedMatch.startTime)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex flex-col items-center">
                        <span className="text-5xl">
                          {selectedMatch.homeTeamLogo}
                        </span>
                        <span className="mt-2 text-sm font-bold text-slate-900">
                          {teamCn(selectedMatch.homeTeamName)}
                        </span>
                        <span className="text-xs text-slate-500">
                          {selectedMatch.homeTeamName}
                        </span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="flex items-center gap-2">
                          {selectedMatch.status === "completed" ? (
                            <>
                              <span className="text-4xl font-bold text-slate-900">
                                {selectedMatch.homeScore}
                              </span>
                              <span className="text-2xl text-slate-400">:</span>
                              <span className="text-4xl font-bold text-slate-900">
                                {selectedMatch.awayScore}
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="text-4xl font-bold text-slate-300">
                                ?
                              </span>
                              <span className="text-2xl text-slate-400">:</span>
                              <span className="text-4xl font-bold text-slate-300">
                                ?
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-5xl">
                          {selectedMatch.awayTeamLogo}
                        </span>
                        <span className="mt-2 text-sm font-bold text-slate-900">
                          {teamCn(selectedMatch.awayTeamName)}
                        </span>
                        <span className="text-xs text-slate-500">
                          {selectedMatch.awayTeamName}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* AI 比赛预测（仅未开赛比赛显示） */}
                  {selectedMatch.status === "scheduled" && (
                    <MatchForecast
                      matchId={selectedMatch.id}
                      homeTeamName={selectedMatch.homeTeamName}
                      awayTeamName={selectedMatch.awayTeamName}
                    />
                  )}

                  {/* 比分预测 */}
                  <PredictionForm match={selectedMatch} />

                  {/* 评论互动 */}
                  <CommentSection matchId={selectedMatch.id} />
                </div>
              ) : (
                <div className="sticky top-8 rounded-xl border border-dashed border-blue-300 bg-blue-50 p-8 text-center">
                  <div className="mb-3 text-4xl">👆</div>
                  <p className="text-lg font-semibold text-slate-700">
                    点击左侧比赛卡片
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    查看比赛详情、提交比分预测、参与评论互动
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
