"use client";

import {
  Match,
  formatDate,
  formatTime,
  getStatusText,
  getStatusClass,
  teamCn,
  groupCn,
  roundCn,
} from "@/lib/api";

interface MatchCardProps {
  match: Match;
  onClick?: () => void;
}

export function MatchCard({ match, onClick }: MatchCardProps) {
  return (
    <article
      className="group cursor-pointer rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
      onClick={onClick}
    >
      <div className="mb-4 flex items-center justify-between">
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          {match.group ? groupCn(match.group) : roundCn(match.round)}
        </span>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(match.status)}`}
        >
          {getStatusText(match.status)}
        </span>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col items-center">
          <span className="text-4xl">{match.homeTeamLogo}</span>
          <span className="mt-2 text-sm font-medium text-slate-900">
            {teamCn(match.homeTeamName)}
          </span>
          <span className="text-xs text-slate-500">{match.homeTeamName}</span>
        </div>

        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2">
            {match.status === "completed" ? (
              <>
                <span className="text-3xl font-bold text-slate-900">
                  {match.homeScore}
                </span>
                <span className="text-xl text-slate-400">:</span>
                <span className="text-3xl font-bold text-slate-900">
                  {match.awayScore}
                </span>
              </>
            ) : (
              <>
                <span className="text-3xl font-bold text-slate-300">?</span>
                <span className="text-xl text-slate-400">:</span>
                <span className="text-3xl font-bold text-slate-300">?</span>
              </>
            )}
          </div>
          <span className="mt-2 text-xs text-slate-500">
            {formatDate(match.startTime)} {formatTime(match.startTime)}
          </span>
        </div>

        <div className="flex flex-col items-center">
          <span className="text-4xl">{match.awayTeamLogo}</span>
          <span className="mt-2 text-sm font-medium text-slate-900">
            {teamCn(match.awayTeamName)}
          </span>
          <span className="text-xs text-slate-500">{match.awayTeamName}</span>
        </div>
      </div>
    </article>
  );
}
