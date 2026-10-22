"""Run:  cd backend && USE_OSRM=0 pytest -q"""
import os
import sys

os.environ.setdefault("USE_OSRM", "0")  # tests must not need internet
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.engine import Engine  # noqa: E402


def served_ids(sol):
    return [s.order_id for r in sol.routes for s in r.stops]


def test_initial_plan_beats_baseline():
    e = Engine()
    o, b = e.optimized.metrics, e.baseline.metrics
    assert o.total_distance_km < b.total_distance_km
    assert o.late_deliveries <= b.late_deliveries
    assert o.priority_late <= b.priority_late


def test_every_order_served_exactly_once():
    e = Engine()
    ids = served_ids(e.optimized) + e.optimized.unassigned
    assert sorted(ids) == sorted(o.id for o in e.scenario.orders)


def test_capacity_respected():
    e = Engine()
    caps = {a.id: a.capacity for a in e.scenario.agents}
    for r in e.optimized.routes:
        assert r.load <= caps[r.agent_id]


def test_add_order_reoptimizes():
    e = Engine()
    n = len(e.scenario.orders)
    e.add_order("Test", 22.74, 75.89, 1, 3, 0, 60)
    assert len(e.scenario.orders) == n + 1
    assert f"O{n + 1}" in served_ids(e.optimized)
    assert e.log[0]["type"] == "add"


def test_cancel_removes_order_from_routes():
    e = Engine()
    e.cancel_order("O3")
    assert "O3" not in served_ids(e.optimized)
    assert "O3" not in e.optimized.unassigned


def test_delay_moves_time_window():
    e = Engine()
    e.delay_order("O1", 60)
    o = next(x for x in e.scenario.orders if x.id == "O1")
    assert o.delay == 60 and o.status == "delayed"
    for r in e.optimized.routes:
        for s in r.stops:
            if s.order_id == "O1":
                assert s.arrival >= o.tw_start + 60


def test_reassign_locks_order_to_agent():
    e = Engine()
    e.reassign_order("O16", "A3")
    owner = next(r.agent_id for r in e.optimized.routes if "O16" in [s.order_id for s in r.stops])
    assert owner == "A3"
    e.reassign_order("O16", "A1")
    owner = next(r.agent_id for r in e.optimized.routes if "O16" in [s.order_id for s in r.stops])
    assert owner == "A1"


def test_agent_off_duty_gets_no_route():
    e = Engine()
    e.set_agent_available("A2", False)
    assert "A2" not in [r.agent_id for r in e.optimized.routes]
    assert len(e.optimized.routes) == 2


def test_reset_restores_sample():
    e = Engine()
    e.cancel_order("O1")
    e.reset()
    assert all(o.status == "pending" for o in e.scenario.orders)
    assert len(e.log) == 1
