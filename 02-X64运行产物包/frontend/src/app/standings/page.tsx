import Link from "next/link";
import { StandingsEntry } from "@/lib/api";
import { StandingsTable } from "@/components";

export const dynamic = "force-dynamic";

const BACKEND_URL = process.env.BACKEND_INTERNAL_URL ?? "http://localhost:7001";

const GROUP_CN: Record<string, string> = {
  "Group A": "A组",
  "Group B": "B组",
  "Group C": "C组",
  "Group D": "D组",
  "Group E": "E组",
  "Group F": "F组",
  "Group G": "G组",
  "Group H": "H组",
  "Group I": "I组",
  "Group J": "J组",
  "Group K": "K组",
  "Group L": "L组",
};

function localGroupCn(group: string): string {
  if (!group) return "";
  return GROUP_CN[group] ?? group;
}

function groupBy<T>(items: T[], key: (item: T) => string): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const k = key(item);
    if (!map.has(k)) {
      map.set(k, []);
    }
    map.get(k)!.push(item);
  }
  return map;
}

async function fetchStandings(
  group?: string,
): Promise<StandingsEntry[] | null> {
  const params = group ? `?group=${encodeURIComponent(group)}` : "";
  const res = await fetch(`${BACKEND_URL}/api/standings${params}`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  const json = await res.json();
  return json.data;
}

async function fetchGroups(): Promise<string[] | null> {
  const res = await fetch(`${BACKEND_URL}/api/standings/groups`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  const json = await res.json();
  return json.data;
}

export default async function StandingsPage({
  searchParams,
}: {
  searchParams: Promise<{ group?: string }>;
}) {
  const params = await searchParams;
  const selectedGroup = params.group;

  const [standings, groups] = await Promise.all([
    fetchStandings(selectedGroup),
    fetchGroups(),
  ]);

  const hasError = standings === null;
  const groupList = groups ?? [];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">积分榜</h1>
          <p className="mt-2 text-slate-600">查看各小组排名情况（SSR 渲染）</p>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          <Link
            href="/standings"
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              selectedGroup === undefined
                ? "bg-blue-600 text-white"
                : "bg-white text-slate-700 hover:bg-slate-100"
            }`}
          >
            全部
          </Link>
          {groupList.map((group) => (
            <Link
              key={group}
              href={`/standings?group=${encodeURIComponent(group)}`}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                selectedGroup === group
                  ? "bg-blue-600 text-white"
                  : "bg-white text-slate-700 hover:bg-slate-100"
              }`}
            >
              {localGroupCn(group)}
            </Link>
          ))}
        </div>

        {hasError ? (
          <div className="rounded-lg bg-rose-100 p-4 text-rose-800">
            无法加载积分榜数据
          </div>
        ) : standings.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <p className="text-lg">暂无积分榜数据</p>
          </div>
        ) : selectedGroup ? (
          <StandingsTable standings={standings} />
        ) : (
          <div className="space-y-8">
            {(() => {
              const grouped = groupBy(standings, (s) => s.group);
              const orderedGroups = Array.from(grouped.entries()).sort(([a], [b]) =>
                a.localeCompare(b),
              );
              return orderedGroups.map(([group, groupStandings]) => (
                <div key={group}>
                  <h2 className="mb-3 text-xl font-bold text-slate-800">
                    {localGroupCn(group)}
                  </h2>
                  <StandingsTable standings={groupStandings} />
                </div>
              ));
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
