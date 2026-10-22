import { useEffect, useState } from "react";
import type { AppState } from "../types";
import { RootyMood, rootySvg } from "../mascots";

function say(state: AppState): { text: string; mood: RootyMood } {
  const last = state.log[0];
  const unassigned = state.optimized?.unassigned.length ?? 0;
  const saved = state.improvement?.late_deliveries_saved ?? 0;
  const moved = last?.orders_moved ?? 0;

  if (unassigned > 0) {
    return {
      text: `Oops! ${unassigned} parcel${unassigned > 1 ? "s" : ""} won't fit anywhere. Put an agent back on duty or cancel something!`,
      mood: "oops",
    };
  }
  const tail = saved > 0 ? ` ${saved} late deliver${saved > 1 ? "ies" : "y"} avoided vs the baseline!` : "";
  switch (last?.type) {
    case "add":
      return { text: `New parcel! I re-planned and ${moved} order${moved === 1 ? "" : "s"} switched agents. Beep boop!${tail}`, mood: "happy" };
    case "cancel":
      return { text: `Order cancelled. Routes tidied up in ${last.reoptimize_ms} ms!${tail}`, mood: "happy" };
    case "restore":
      return { text: `Welcome back, parcel! Squeezed it into the plan.${tail}`, mood: "happy" };
    case "delay":
      return { text: `Delay? No worries, new plan ready in ${last.reoptimize_ms} ms!${tail}`, mood: "think" };
    case "reassign":
      return { text: "Boss decision! That parcel is now locked to your chosen agent. Pick Auto to unlock it.", mood: "think" };
    case "agent":
      return { text: `Someone is resting, so the others jump in and share the work!${tail}`, mood: "think" };
    case "manual":
      return { text: `Fresh plan, hot off the press!${tail}`, mood: "happy" };
    default:
      return {
        text: "Hi, I'm Rooty! 🤖 Try adding an order, delaying one, or sending an agent home, and watch the routes redraw live.",
        mood: "happy",
      };
  }
}

export default function Rooty({ state }: { state: AppState }) {
  const { text, mood } = say(state);
  const [tick, setTick] = useState(0);
  // re-trigger the pop animation whenever a new event arrives
  useEffect(() => { setTick((t) => t + 1); }, [state.log[0]?.id]);

  return (
    <div className="flex items-start gap-3">
      <div className="bob shrink-0" dangerouslySetInnerHTML={{ __html: rootySvg(mood, 64) }} />
      <div key={tick} className="bubble pop-in flex-1 px-3 py-2 text-sm font-bold leading-snug">
        {text}
      </div>
    </div>
  );
}
