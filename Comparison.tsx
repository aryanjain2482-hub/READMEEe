import type { AppState } from "../types";

interface Row { label: string; base: number; opt: number; unit?: string; hint?: string }

export default function Comparison({ state }: { state: AppState }) {
  const b = state.baseline?.metrics;
  const o = state.optimized?.metrics;
  const imp = state.improvement;
  if (!b || !o) return null;

  const rows: Row[] = [
    { label: "Total distance", base: b.total_distance_km, opt: o.total_distance_km, unit: "km" },
    { label: "Late deliveries", base: b.late_deliveries, opt: o.late_deliveries },
    { label: "Total minutes late", base: b.total_late_minutes, opt: o.total_late_minutes, unit: "min" },
    { label: "Urgent/high orders late", base: b.priority_late, opt: o.priority_late },
    { label: "Workload gap (stops)", base: b.balance_gap, opt: o.balance_gap, hint: "max − min stops per agent" },
    { label: "Unassigned orders", base: b.unassigned, opt: o.unassigned },
  ];

  return (
    <section className="toon-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="toon-title">Baseline vs RouteWise</h2>
        <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500">
          {state.solver === "ortools" ? "OR-Tools" : "Heuristic"} · {state.optimized?.solve_ms} ms
        </span>
      </div>

      {imp && (
        <div className="mb-3 grid grid-cols-2 gap-1 text-center">
          <div className="burst pop-in flex aspect-square flex-col items-center justify-center p-3">
            <div className="font-display text-3xl leading-none">
              {imp.distance_pct >= 0 ? "-" : "+"}{Math.abs(imp.distance_pct)}%
            </div>
            <div className="mt-1 text-[10px] font-extrabold uppercase leading-tight">distance<br />travelled</div>
          </div>
          <div className="burst pop-in flex aspect-square flex-col items-center justify-center p-3" style={{ background: "#7dd3fc" }}>
            <div className="font-display text-3xl leading-none">
              {imp.late_deliveries_saved >= 0 ? "-" : "+"}{Math.abs(imp.late_deliveries_saved)}
            </div>
            <div className="mt-1 text-[10px] font-extrabold uppercase leading-tight">late<br />deliveries</div>
          </div>
        </div>
      )}

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[11px] uppercase text-slate-400">
            <th className="pb-1 font-medium">Metric</th>
            <th className="pb-1 text-right font-medium">Baseline</th>
            <th className="pb-1 text-right font-medium">RouteWise</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const better = r.opt < r.base;
            const worse = r.opt > r.base;
            return (
              <tr key={r.label} className="border-t border-slate-100" title={r.hint}>
                <td className="py-1.5 text-slate-600">{r.label}</td>
                <td className="py-1.5 text-right tabular-nums text-slate-500">
                  {r.base}{r.unit ? ` ${r.unit}` : ""}
                </td>
                <td className={`py-1.5 text-right font-semibold tabular-nums ${
                  better ? "text-emerald-600" : worse ? "text-red-600" : "text-slate-700"}`}>
                  {r.opt}{r.unit ? ` ${r.unit}` : ""}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="mt-2 text-[11px] leading-snug text-slate-400">
        Baseline = orders handed out round-robin in arrival order, ignoring deadlines and location.
        Both plans are scored by the same simulator. Distances via {state.matrix_source === "osrm" ? "OSRM road network" : "straight-line × 1.3 estimate"}.
      </p>
    </section>
  );
}
