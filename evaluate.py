"""Evaluate a set of routes: simulate arrivals, wait times, lateness, metrics.

Both the baseline and the optimizer are scored by this SAME function, so
the comparison on the dashboard is fair.
"""
from typing import Dict, List

from .geo import km_to_min
from .models import Metrics, Order, Route, Stop


def effective_window(o: Order):
    """A delayed order cannot be delivered before tw_start + delay."""
    start = o.tw_start + o.delay
    end = max(o.tw_end + o.delay, start)
    return start, end


def build_route(agent_id: str, order_ids: List[str], orders: Dict[str, Order],
                idx: Dict[str, int], dist: List[List[float]]) -> Route:
    """Simulate a vehicle driving depot -> orders (in given order) -> depot."""
    t = 0.0
    km = 0.0
    prev = 0  # depot is node 0
    stops: List[Stop] = []
    load = 0
    for oid in order_ids:
        o = orders[oid]
        node = idx[oid]
        leg = dist[prev][node]
        km += leg
        t += km_to_min(leg)
        start, end = effective_window(o)
        wait = max(0.0, start - t)
        t += wait
        late = max(0.0, t - end)
        stops.append(Stop(order_id=oid, arrival=round(t, 1), wait=round(wait, 1), late=round(late, 1)))
        t += o.service_time
        prev = node
        load += o.demand
    if order_ids:
        leg = dist[prev][0]
        km += leg
        t += km_to_min(leg)
    return Route(agent_id=agent_id, stops=stops, distance_km=round(km, 2),
                 duration_min=round(t, 1), load=load)


def compute_metrics(routes: List[Route], unassigned: List[str], orders: Dict[str, Order],
                    active_agent_ids: List[str]) -> Metrics:
    late_cnt = 0
    late_min = 0.0
    prio_late = 0
    for r in routes:
        for s in r.stops:
            if s.late > 0.5:
                late_cnt += 1
                late_min += s.late
                if orders[s.order_id].priority >= 2:
                    prio_late += 1
    counts = [len(r.stops) for r in routes if r.agent_id in active_agent_ids]
    gap = (max(counts) - min(counts)) if counts else 0
    return Metrics(
        total_distance_km=round(sum(r.distance_km for r in routes), 2),
        total_duration_min=round(sum(r.duration_min for r in routes), 1),
        late_deliveries=late_cnt,
        total_late_minutes=round(late_min, 1),
        unassigned=len(unassigned),
        balance_gap=gap,
        priority_late=prio_late,
    )
