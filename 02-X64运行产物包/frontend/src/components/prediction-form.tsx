"use client";

import { useState } from "react";
import { Match, createPrediction, Prediction, teamCn } from "@/lib/api";

interface PredictionFormProps {
  match: Match;
  onSuccess?: (prediction: Prediction) => void;
}

export function PredictionForm({ match, onSuccess }: PredictionFormProps) {
  const [homeScore, setHomeScore] = useState("");
  const [awayScore, setAwayScore] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const canPredict =
    match.status === "scheduled" && new Date(match.startTime) > new Date();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canPredict || loading) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await createPrediction({
        matchId: match.id,
        homeScore: parseInt(homeScore),
        awayScore: parseInt(awayScore),
      });
      setSuccess(true);
      setHomeScore("");
      setAwayScore("");
      onSuccess?.(result.data);
    } catch {
      setError("预测提交失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  if (!canPredict) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
        <h3 className="mb-2 text-lg font-semibold text-slate-900">比分预测</h3>
        <p className="text-sm text-slate-500">
          {match.status === "completed"
            ? "比赛已结束，无法预测"
            : "比赛已开始，无法预测"}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <h3 className="mb-4 text-lg font-semibold text-slate-900">比分预测</h3>

      {success && (
        <div className="mb-4 rounded-lg bg-emerald-100 p-4 text-emerald-800">
          预测提交成功！
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg bg-rose-100 p-4 text-rose-800">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-slate-600">
              {teamCn(match.homeTeamName)}
            </label>
            <input
              type="number"
              min="0"
              value={homeScore}
              onChange={(e) => setHomeScore(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-center text-xl font-bold text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
              required
            />
          </div>

          <span className="text-2xl font-bold text-slate-400">:</span>

          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-slate-600">
              {teamCn(match.awayTeamName)}
            </label>
            <input
              type="number"
              min="0"
              value={awayScore}
              onChange={(e) => setAwayScore(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-center text-xl font-bold text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "提交中..." : "提交预测"}
        </button>
      </form>
    </div>
  );
}
