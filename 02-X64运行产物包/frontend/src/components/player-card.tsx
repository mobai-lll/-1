"use client";

import { Player, positionCn, positionColor } from "@/lib/api";

interface PlayerCardProps {
  player: Player;
  onClick?: () => void;
}

export function PlayerCard({ player, onClick }: PlayerCardProps) {
  return (
    <article
      className="group cursor-pointer rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-700">
          {player.number}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-sm font-semibold text-slate-900">
              {player.name}
            </h3>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${positionColor(player.position)}`}
            >
              {positionCn(player.position)}
            </span>
            <span className="text-xs text-slate-500">{player.age}岁</span>
          </div>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-4 gap-1 border-t border-slate-100 pt-3 text-center">
        <div>
          <p className="text-xs text-slate-500">出场</p>
          <p className="text-sm font-semibold text-slate-900">
            {player.appearances}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500">进球</p>
          <p className="text-sm font-semibold text-emerald-600">
            {player.goals}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500">助攻</p>
          <p className="text-sm font-semibold text-blue-600">
            {player.assists}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500">黄牌</p>
          <p className="text-sm font-semibold text-amber-600">
            {player.yellowCards}
          </p>
        </div>
      </div>
    </article>
  );
}
