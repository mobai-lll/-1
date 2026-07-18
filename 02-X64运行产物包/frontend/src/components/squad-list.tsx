"use client";

import { useState, useEffect } from "react";
import { Player, getPlayersByTeam, positionCn } from "@/lib/api";
import { PlayerCard } from "./player-card";

interface SquadListProps {
  teamId: number;
}

export function SquadList({ teamId }: SquadListProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getPlayersByTeam(teamId);
        setPlayers(result.data);
      } catch {
        setError("无法加载球员名单");
        setPlayers([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [teamId]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-6 w-6 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center">
        <p className="text-sm text-rose-800">{error}</p>
      </div>
    );
  }

  if (players.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center">
        <p className="text-slate-500">暂无球员名单数据</p>
      </div>
    );
  }

  const positions = ["GK", "DF", "MF", "FW"] as const;

  return (
    <div className="space-y-6">
      {positions.map((pos) => {
        const posPlayers = players.filter((p) => p.position === pos);
        if (posPlayers.length === 0) return null;
        return (
          <div key={pos}>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <span className="inline-block h-3 w-3 rounded-full bg-slate-400" />
              {positionCn(pos)}（{posPlayers.length}人）
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {posPlayers.map((player) => (
                <PlayerCard key={player.id} player={player} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
