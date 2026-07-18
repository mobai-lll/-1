"use client";

import { useState, useEffect } from "react";
import type { MatchForecast as ForecastData } from "@/lib/api";
import { getForecast, teamCn } from "@/lib/api";

interface MatchForecastProps {
  matchId: number;
  homeTeamName: string;
  awayTeamName: string;
}

export function MatchForecast({
  matchId,
  homeTeamName,
  awayTeamName,
}: MatchForecastProps) {
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getForecast(matchId);
        setForecast(result.data);
      } catch {
        setError("无法加载比赛预测数据");
        setForecast(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [matchId]);

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <div className="h-6 w-6 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
        <p className="text-sm text-rose-800">{error}</p>
      </div>
    );
  }

  if (!forecast) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
        <p className="text-sm text-slate-500">暂无预测数据</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
      <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
        <span>🎯</span> 比赛预测
      </h3>

      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex-1 text-center">
          <p className="text-sm font-medium text-slate-700">
            {teamCn(homeTeamName)} 胜
          </p>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full bg-blue-500"
              style={{ width: `${forecast.homeWinProbability}%` }}
            />
          </div>
          <p className="mt-1 text-lg font-bold text-blue-600">
            {forecast.homeWinProbability}%
          </p>
        </div>
        <div className="flex-1 text-center">
          <p className="text-sm font-medium text-slate-700">平局</p>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full bg-slate-400"
              style={{ width: `${forecast.drawProbability}%` }}
            />
          </div>
          <p className="mt-1 text-lg font-bold text-slate-600">
            {forecast.drawProbability}%
          </p>
        </div>
        <div className="flex-1 text-center">
          <p className="text-sm font-medium text-slate-700">
            {teamCn(awayTeamName)} 胜
          </p>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full bg-rose-500"
              style={{ width: `${forecast.awayWinProbability}%` }}
            />
          </div>
          <p className="mt-1 text-lg font-bold text-rose-600">
            {forecast.awayWinProbability}%
          </p>
        </div>
      </div>

      <div className="mb-3">
        <h4 className="mb-2 text-sm font-semibold text-slate-700">
          最可能比分
        </h4>
        <div className="space-y-2">
          {forecast.topScorePredictions.map((pred, idx) => (
            <div key={idx} className="rounded-lg bg-white p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-700">
                    {idx + 1}
                  </span>
                  <span className="text-lg font-bold text-slate-900">
                    {pred.homeScore} : {pred.awayScore}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full bg-blue-500"
                      style={{ width: `${pred.probability}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-blue-600">
                    {pred.probability}%
                  </span>
                </div>
              </div>
              <p className="mt-2 text-xs text-slate-500">{pred.reasoning}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <button
          onClick={() => setShowAnalysis(!showAnalysis)}
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          {showAnalysis ? "收起分析" : "展开详细分析"}
        </button>
        {showAnalysis && (
          <p className="mt-2 rounded-lg bg-white p-3 text-sm text-slate-600">
            {forecast.analysis}
          </p>
        )}
      </div>
    </div>
  );
}
