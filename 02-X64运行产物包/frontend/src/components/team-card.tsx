"use client";

import { Team, teamCn, groupCn } from "@/lib/api";

interface TeamCardProps {
  team: Team;
  onClick?: () => void;
}

export function TeamCard({ team, onClick }: TeamCardProps) {
  return (
    <article
      className="group cursor-pointer rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
      onClick={onClick}
    >
      <div className="flex flex-col items-center">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
          <span className="text-5xl">{team.logo}</span>
        </div>
        <h3 className="mb-1 text-lg font-semibold text-slate-900">
          {teamCn(team.name)}
        </h3>
        <p className="mb-3 text-sm text-slate-500">{team.name}</p>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          {groupCn(team.group)}
        </span>
      </div>
    </article>
  );
}
