import type { LogEntry } from "../types";

const ICON: Record<string, string> = {
  init: "🚀", add: "➕", cancel: "❌", restore: "↩️", delay: "⏱️",
  reassign: "🔀", agent: "🧑‍🔧", manual: "🔄",
};

export default function EventLog({ log }: { log: LogEntry[] }) {
  return (
    <section className="toon-card p-4">
      <h2 className="mb-3 toon-title">Re-optimization log</h2>
      <ul className="max-h-64 space-y-2 overflow-y-auto pr-1">
        {log.map((e) => (
          <li key={e.id} className="rounded-lg bg-slate-50 p-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>{e.time}</span>
              <span>{e.reoptimize_ms} ms</span>
            </div>
            <div className="font-medium text-slate-700">{ICON[e.type] ?? "•"} {e.description}</div>
            <div className="mt-0.5 text-slate-500">
              {e.before ? `${e.orders_moved} order(s) moved agent · ` : ""}
              {e.after.total_distance_km} km · {e.after.late_deliveries} late
              {e.before && e.before.total_distance_km !== e.after.total_distance_km && (
                <span> (was {e.before.total_distance_km} km, {e.before.late_deliveries} late)</span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
