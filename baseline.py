"""Baseline solver: the 'no brain' way a dispatcher might do it by hand.

Orders are handed out round-robin in the order they arrived and visited in
that same order. It ignores priorities, deadlines and geography. We score it
with the same evaluator as the smart solver so the comparison is fair.
"""
from typing import Dict, List

from .evaluate import build_route, compute_metrics
from .models import Agent, Order, Solution


def solve_baseline(agents: List[Agent], orders: List[Order],
                   dist: List[List[float]], idx: Dict[str, int]) -> Solution:
    active_agents = [a for a in agents if a.available]
    omap = {o.id: o for o in orders}
    assign: Dict[str, List[str]] = {a.id: [] for a in active_agents}
    load: Dict[str, int] = {a.id: 0 for a in active_agents}
    unassigned: List[str] = []

    if not active_agents:
        unassigned = [o.id for o in orders]
    else:
        turn = 0
        for o in orders:
            placed = False
            for k in range(len(active_agents)):
                a = active_agents[(turn + k) % len(active_agents)]
                if load[a.id] + o.demand <= a.capacity:
                    assign[a.id].append(o.id)
                    load[a.id] += o.demand
                    turn = (turn + k + 1) % len(active_agents)
                    placed = True
                    break
            if not placed:
                unassigned.append(o.id)

    routes = [build_route(a.id, assign[a.id], omap, idx, dist) for a in active_agents]
    metrics = compute_metrics(routes, unassigned, omap, [a.id for a in active_agents])
    return Solution(method="baseline", routes=routes, unassigned=unassigned, metrics=metrics)
