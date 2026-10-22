import { useCallback, useEffect, useState } from "react";
import { api, NewOrderInput } from "./api";
import { AGENT_COLORS, AppState } from "./types";
import { MASCOT_KINDS, mascotSvg, rootySvg } from "./mascots";
import { sfx } from "./sfx";
import MapView from "./components/MapView";
import Comparison from "./components/Comparison";
import AgentsPanel from "./components/AgentsPanel";
import OrdersPanel from "./components/OrdersPanel";
import AddOrderForm from "./components/AddOrderForm";
import EventLog from "./components/EventLog";
import Rooty from "./components/Rooty";

export default function App() {
  const [state, setState] = useState<AppState | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pickMode, setPickMode] = useState(false);
  const [picked, setPicked] = useState<{ lat: number; lng: number } | null>(null);
  const [muted, setMuted] = useState(sfx.isMuted());

  /** Run an API call; play `sound` on success (or a warning buzz if parcels don't fit). */
  const run = useCallback(async (fn: () => Promise<AppState>, sound?: () => void) => {
    setBusy(true);
    setError(null);
    try {
      const next = await fn();
      setState(next);
      if (next.optimized && next.optimized.unassigned.length > 0) sfx.buzz();
      else if (sound) sound();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => { run(api.state); }, [run]);

  if (!state) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-center">
        {error ? (
          <div className="toon-card max-w-md p-6">
            <div className="mx-auto w-fit" dangerouslySetInnerHTML={{ __html: rootySvg("oops", 80) }} />
            <p className="font-display text-2xl tracking-wide text-red-600">Oops! I can't find the backend</p>
            <p className="mt-2 text-sm font-semibold text-slate-600">{error}</p>
            <p className="mt-3 rounded-lg border-2 border-slate-900 bg-slate-100 p-2 text-left font-mono text-xs">
              cd backend<br />uvicorn app.main:app --reload --port 8000
            </p>
            <button onClick={() => run(api.state)} className="toon-btn mt-4 bg-sky-400 px-4 py-2 text-sm">
              Try again
            </button>
          </div>
        ) : (
          <div className="toon-card p-6">
            <div className="bob mx-auto w-fit" dangerouslySetInnerHTML={{ __html: rootySvg("think", 80) }} />
            <p className="font-display mt-2 text-2xl tracking-wide">Warming up the delivery squad…</p>
          </div>
        )}
      </div>
    );
  }

  const activeOrders = state.scenario.orders.filter((o) => o.status !== "cancelled").length;
  const onDuty = state.scenario.agents.filter((a) => a.available).length;

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between gap-3 border-b-4 border-slate-900 bg-gradient-to-r from-yellow-300 via-amber-300 to-sky-300 px-4 py-2.5">
        <div className="flex items-center gap-3">
          <div className="hidden items-end sm:flex">
            {state.scenario.agents.map((a, i) => (
              <span key={a.id} className="rw-mascot -ml-1 first:ml-0"
                dangerouslySetInnerHTML={{
                  __html: mascotSvg(MASCOT_KINDS[i % MASCOT_KINDS.length], AGENT_COLORS[i % AGENT_COLORS.length], 40),
                }} />
            ))}
          </div>
          <div>
            <h1 className="font-display text-3xl leading-none tracking-wider" style={{ textShadow: "2px 2px 0 #fff" }}>
              Route<span className="text-blue-600">Wise</span>
            </h1>
            <p className="text-xs font-extrabold text-slate-800">
              {onDuty} agents on duty · {activeOrders} parcels to deliver
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {busy && <span className="animate-pulse text-xs font-extrabold">Thinking…</span>}
          <button
            onClick={() => { const v = !muted; sfx.setMuted(v); setMuted(v); if (!v) sfx.click(); }}
            className="toon-btn bg-white px-2.5 py-1.5 text-sm"
            title={muted ? "Turn sound on" : "Turn sound off"}
          >
            {muted ? "🔇" : "🔊"}
          </button>
          <button disabled={busy}
            onClick={() => { sfx.whoosh(); run(api.optimize, sfx.tada); }}
            className="toon-btn bg-sky-400 px-3 py-1.5 text-sm">
            ⚡ Re-optimize
          </button>
          <button disabled={busy}
            onClick={() => { setPicked(null); setPickMode(false); sfx.whoosh(); run(api.reset, sfx.pop); }}
            className="toon-btn bg-white px-3 py-1.5 text-sm">
            ↺ Reset demo
          </button>
        </div>
      </header>

      {error && (
        <div className="border-b-2 border-slate-900 bg-red-200 px-4 py-2 text-sm font-bold text-red-800">⚠ {error}</div>
      )}

      <main className="flex min-h-0 flex-1 flex-col gap-3 p-3 lg:flex-row">
        <div className="toon-card h-[55vh] min-h-[320px] flex-1 overflow-hidden p-1 lg:h-auto">
          <MapView
            state={state}
            pickMode={pickMode}
            picked={picked}
            onPick={(lat, lng) => { setPicked({ lat, lng }); setPickMode(false); sfx.click(); }}
          />
        </div>

        <aside className="w-full space-y-3 overflow-y-auto pb-3 pl-1 pr-2 lg:w-[430px]">
          <Rooty state={state} />
          <Comparison state={state} />
          <AddOrderForm
            busy={busy}
            picked={picked}
            pickMode={pickMode}
            onStartPick={() => { sfx.click(); setPickMode((v) => !v); }}
            onSubmit={(o: NewOrderInput) => { run(() => api.addOrder(o), sfx.pop); setPicked(null); }}
          />
          <AgentsPanel
            state={state}
            busy={busy}
            onToggle={(id, v) => run(() => api.agentAvailability(id, v), v ? sfx.pop : sfx.boing)}
          />
          <OrdersPanel
            state={state}
            busy={busy}
            onCancel={(id) => run(() => api.cancel(id), sfx.boing)}
            onRestore={(id) => run(() => api.restore(id), sfx.pop)}
            onDelay={(id, m) => run(() => api.delay(id, m), sfx.click)}
            onReassign={(id, a) => run(() => api.reassign(id, a), sfx.click)}
          />
          <EventLog log={state.log} />
        </aside>
      </main>
    </div>
  );
}
