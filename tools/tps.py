"""Weighted, regularised 2D thin-plate spline (TPS).

f(p) = a0 + a1*u + a2*v + sum_i w_i * U(|p - c_i|),  U(r) = r^2 log r
Solved per output dimension with smoothing: (K + lam * diag(1/weight)) w + P a = y, P^T w = 0.
Inputs are normalised (centre + scale) for conditioning; lam is in normalised units.
"""
import numpy as np


def _U(r2):
    with np.errstate(divide="ignore", invalid="ignore"):
        out = 0.5 * r2 * np.log(r2)
    return np.nan_to_num(out)


class TPS:
    def __init__(self, src, dst, weights=None, lam=0.0):
        src = np.asarray(src, float)
        dst = np.asarray(dst, float)
        n = len(src)
        w = np.ones(n) if weights is None else np.asarray(weights, float)
        self.mu = src.mean(axis=0)
        self.sc = src.std(axis=0).mean()
        c = (src - self.mu) / self.sc
        K = _U(((c[:, None, :] - c[None, :, :]) ** 2).sum(-1))
        P = np.column_stack([np.ones(n), c])
        L = np.zeros((n + 3, n + 3))
        L[:n, :n] = K + np.diag(lam / w)
        L[:n, n:] = P
        L[n:, :n] = P.T
        rhs = np.zeros((n + 3, dst.shape[1]))
        rhs[:n] = dst
        sol = np.linalg.solve(L, rhs)
        self.c, self.w, self.a, self.lam = c, sol[:n], sol[n:], lam

    def __call__(self, p, chunk=200_000):
        p = np.atleast_2d(np.asarray(p, float))
        out = np.empty((len(p), self.w.shape[1]))
        for s in range(0, len(p), chunk):
            q = (p[s:s + chunk] - self.mu) / self.sc
            K = _U(((q[:, None, :] - self.c[None, :, :]) ** 2).sum(-1))
            out[s:s + chunk] = K @ self.w + np.column_stack([np.ones(len(q)), q]) @ self.a
        return out

    def to_json(self):
        return {"mu": self.mu.tolist(), "sc": float(self.sc), "c": self.c.tolist(), "w": self.w.tolist(), "a": self.a.tolist(), "lam": self.lam}

    @classmethod
    def from_json(cls, d):
        t = cls.__new__(cls)
        t.mu, t.sc = np.array(d["mu"]), d["sc"]
        t.c, t.w, t.a, t.lam = np.array(d["c"]), np.array(d["w"]), np.array(d["a"]), d["lam"]
        return t
