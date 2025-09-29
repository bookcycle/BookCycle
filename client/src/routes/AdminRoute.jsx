import React, { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import { api } from "../lib/api";
import { setCredentials } from "../features/auth/authSlice";

function parseMe(res) {
    const d = res?.data ?? res;

    if (d?.user) return d.user;

    if (d && typeof d === "object" && (d._id || d.id || d.email)) return d;

    if (d?.data?.user) return d.data.user;

    if (d?.data && (d.data._id || d.data.id || d.data.email)) return d.data;

    return null;
}

export default function AdminRoute({ children }) {
    const dispatch = useDispatch();
    const { user, token } = useSelector((s) => s.auth);
    const loc = useLocation();

    const savedToken = token || localStorage.getItem("ptb_token");

    const needsHydrate = useMemo(
        () => Boolean(savedToken && (!user || !user.role)),
        [savedToken, user]
    );

    const [checking, setChecking] = useState(needsHydrate);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        let cancelled = false;

        async function hydrate() {
            if (!needsHydrate) return;

            setChecking(true);
            setFailed(false);

            try {
                const res = await api.get("/auth/me", {
                    headers: {
                        Authorization: `Bearer ${savedToken}`,
                    },
                });

                const me = parseMe(res);
                if (!cancelled && me) {
                    dispatch(setCredentials({ user: me, token: savedToken }));
                }
                if (!cancelled) setChecking(false);
            } catch (err) {
                if (!cancelled) {
                    setChecking(false);
                    setFailed(true);
                    localStorage.removeItem("ptb_token");
                }
            }
        }

        hydrate();
        return () => {
            cancelled = true;
        };
    }, [dispatch, needsHydrate, savedToken]);

    // Build full redirect back target (path + query + hash)
    const back = encodeURIComponent(
        `${loc.pathname}${loc.search || ""}${loc.hash || ""}`
    );


    if (!savedToken && !user) {
        return <Navigate to={`/login?redirect=${back}`} replace />;
    }


    if (checking) {
        return (
            <div className="min-h-[50vh] grid place-items-center text-slate-500 text-sm">
                Verifying your session…
            </div>
        );
    }


    if (!user) {
        return <Navigate to={`/login?redirect=${back}`} replace />;
    }


    if (user.role !== "admin") {
        return (
            <div className="min-h-[50vh] grid place-items-center">
                <div className="p-6 rounded-xl border border-slate-200 bg-white shadow">
                    <div className="text-lg font-semibold text-slate-800">403 — Forbidden</div>
                    <p className="mt-1 text-sm text-slate-600">
                        You’re signed in but don’t have admin permissions.
                    </p>
                </div>
            </div>
        );
    }

    return children;
}
