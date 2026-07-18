"use client";

import { useState, useEffect } from "react";
import { getTeams, getGroups, Team, groupCn, teamCn } from "@/lib/api";
import { TeamCard, SquadList } from "@/components";

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [groups, setGroups] = useState<string[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string | undefined>(
    undefined,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  useEffect(() => {
    const loadTeams = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getTeams(selectedGroup);
        setTeams(result.data);
      } catch {
        setError("无法加载球队数据");
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

    loadTeams();
    loadGroups();
  }, [selectedGroup]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">球队一览</h1>
          <p className="mt-2 text-slate-600">查看所有参赛球队信息</p>
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
        ) : teams.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <p className="text-lg">暂无球队数据</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {teams.map((team) => (
              <TeamCard
                key={team.id}
                team={team}
                onClick={() => setSelectedTeam(team)}
              />
            ))}
          </div>
        )}

        {selectedTeam && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                    <span className="text-4xl">{selectedTeam.logo}</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                      {teamCn(selectedTeam.name)}
                    </h2>
                    <p className="text-sm text-slate-600">
                      {selectedTeam.name} · {groupCn(selectedTeam.group)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTeam(null)}
                  className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-300"
                >
                  关闭
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-4">
                <p className="mb-4 text-slate-600">
                  {selectedTeam.description}
                </p>
                <h3 className="mb-3 text-lg font-bold text-slate-900">
                  球队阵容
                </h3>
                <SquadList teamId={selectedTeam.id} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
