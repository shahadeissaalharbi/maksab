from expire_checkouts import expire_stale_checkouts


class FakeCursor:
    def __init__(self, stale_ids, items_by_checkout):
        self.stale_ids = stale_ids
        self.items_by_checkout = items_by_checkout
        self.calls = []
        self._last = None

    def execute(self, sql, params=None):
        text = " ".join(sql.split())
        self.calls.append((text, params))
        if text.startswith("SELECT id FROM checkouts"):
            self._last = [(i,) for i in self.stale_ids]
        elif text.startswith("SELECT oi.product_id"):
            self._last = self.items_by_checkout.get(params[0], [])
        else:
            self._last = []

    def fetchall(self):
        return self._last

    def updates(self, table):
        return [
            (sql, params) for sql, params in self.calls
            if sql.startswith(f"UPDATE {table}")
        ]


def test_nothing_stale_changes_nothing():
    cur = FakeCursor([], {})
    assert expire_stale_checkouts(cur, 60) == []
    assert cur.updates("products") == []
    assert cur.updates("orders") == []
    assert cur.updates("checkouts") == []


def test_stale_checkout_is_cancelled_and_stock_restored():
    cur = FakeCursor([7], {7: [(4, 1), (9, 3)]})

    assert expire_stale_checkouts(cur, 60) == [7]

    restored = [params for _, params in cur.updates("products")]
    assert restored == [(1, 1, 4), (3, 3, 9)]
    assert cur.updates("orders")[0][1] == (7,)
    assert cur.updates("checkouts")[0][1] == (7,)
    assert "'cancelled'" in cur.updates("checkouts")[0][0]


def test_dry_run_only_lists():
    cur = FakeCursor([7, 8], {7: [(4, 1)]})

    assert expire_stale_checkouts(cur, 60, dry_run=True) == [7, 8]
    assert cur.updates("products") == []
    assert cur.updates("orders") == []
    assert cur.updates("checkouts") == []


def test_age_is_passed_to_query():
    cur = FakeCursor([], {})
    expire_stale_checkouts(cur, 90)
    assert cur.calls[0][1] == (90,)