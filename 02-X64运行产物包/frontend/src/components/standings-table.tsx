import { StandingsEntry, teamCn } from "@/lib/api";

interface StandingsTableProps {
  standings: StandingsEntry[];
}

export function StandingsTable({ standings }: StandingsTableProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <table className="w-full">
        <thead className="bg-slate-50">
          <tr>
            <th className="w-12 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              排名
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              球队
            </th>
            <th className="w-12 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
              赛
            </th>
            <th className="w-12 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
              胜
            </th>
            <th className="w-12 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
              平
            </th>
            <th className="w-12 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
              负
            </th>
            <th className="w-20 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
              净胜球
            </th>
            <th className="w-12 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
              积分
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {standings.map((entry, index) => (
            <tr
              key={entry.teamId}
              className={
                index < 2 ? "bg-blue-50" : index === 2 ? "bg-amber-50" : ""
              }
            >
              <td className="px-4 py-4">
                <span
                  className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                    index === 0
                      ? "bg-yellow-400 text-yellow-900"
                      : index === 1
                        ? "bg-slate-300 text-slate-700"
                        : index === 2
                          ? "bg-amber-600 text-amber-100"
                          : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {index + 1}
                </span>
              </td>
              <td className="px-4 py-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{entry.teamLogo}</span>
                  <div>
                    <div className="font-medium text-slate-900">
                      {teamCn(entry.teamName)}
                    </div>
                    <div className="text-xs text-slate-500">
                      {entry.teamName}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-4 text-center text-slate-900">
                {entry.played}
              </td>
              <td className="px-4 py-4 text-center font-medium text-emerald-600">
                {entry.won}
              </td>
              <td className="px-4 py-4 text-center text-slate-900">
                {entry.drawn}
              </td>
              <td className="px-4 py-4 text-center font-medium text-rose-600">
                {entry.lost}
              </td>
              <td className="px-4 py-4 text-center font-medium text-slate-900">
                {entry.goalDifference > 0
                  ? `+${entry.goalDifference}`
                  : entry.goalDifference}
              </td>
              <td className="px-4 py-4 text-center font-bold text-slate-900">
                {entry.points}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
