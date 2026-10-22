import { useState } from "react";
import type { NewOrderInput } from "../api";
import { clock } from "../types";

interface Props {
  busy: boolean;
  picked: { lat: number; lng: number } | null;
  pickMode: boolean;
  onStartPick: () => void;
  onSubmit: (o: NewOrderInput) => void;
}

export default function AddOrderForm({ busy, picked, pickMode, onStartPick, onSubmit }: Props) {
  const [name, setName] = useState("");
  const [demand, setDemand] = useState(1);
  const [priority, setPriority] = useState(1);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(120);

  const field = "w-full rounded-lg border-2 border-slate-900 bg-white px-2 py-1 text-sm font-semibold";

  return (
    <section className="toon-card p-4">
      <h2 className="mb-3 toon-title">New order (live)</h2>
      <div className="space-y-2">
        <input className={field} placeholder="Customer / area name" value={name}
          onChange={(e) => setName(e.target.value)} />
        <div className="grid grid-cols-2 gap-2">
          <label className="text-xs text-slate-500">Packages
            <input type="number" min={1} max={10} className={field} value={demand}
              onChange={(e) => setDemand(Math.max(1, Number(e.target.value) || 1))} />
          </label>
          <label className="text-xs text-slate-500">Priority
            <select className={field} value={priority} onChange={(e) => setPriority(Number(e.target.value))}>
              <option value={1}>Normal</option>
              <option value={2}>High</option>
              <option value={3}>Urgent</option>
            </select>
          </label>
          <label className="text-xs text-slate-500">Earliest (min after 09:00)
            <input type="number" min={0} className={field} value={start}
              onChange={(e) => setStart(Math.max(0, Number(e.target.value) || 0))} />
          </label>
          <label className="text-xs text-slate-500">Deadline (min after 09:00)
            <input type="number" min={0} className={field} value={end}
              onChange={(e) => setEnd(Math.max(0, Number(e.target.value) || 0))} />
          </label>
        </div>
        <p className="text-[11px] text-slate-400">Window: {clock(start)} – {clock(Math.max(start, end))}</p>

        <button onClick={onStartPick} disabled={busy}
          className={`toon-btn w-full px-3 py-1.5 text-sm ${
            pickMode ? "bg-amber-200" : "bg-white"}`}>
          {picked ? `📍 ${picked.lat.toFixed(4)}, ${picked.lng.toFixed(4)} (change)` : "📍 Pick location on map"}
        </button>

        <button
          disabled={busy || !picked}
          onClick={() => picked && onSubmit({ name, lat: picked.lat, lng: picked.lng, demand, priority, tw_start: start, tw_end: Math.max(start, end) })}
          className="toon-btn w-full bg-sky-400 px-3 py-2 text-sm text-slate-900">
          🚀 Add order &amp; re-optimize
        </button>
      </div>
    </section>
  );
}
