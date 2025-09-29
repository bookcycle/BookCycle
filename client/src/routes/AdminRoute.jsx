import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import { api } from "../lib/api";
import { setCredentials } from "../features/auth/authSlice";

export default function AdminRoute({ children }) {
    const dispatch = useDispatch();
    const { user, token } = useSelector((s) => s.auth);
    const loc = useLocation();

    // token can live in Redux (fresh login) or localStorage (after refresh)
    const savedToken = token || localStorage.getItem("ptb_token");

    // if we have a token but no user yet, hydrate once
    const [checking, setChecking] = useState(Boolean(savedToken && !user));

    useEffect(() => {
        let cancelled = false;

        async function hydrate() {
            if (!savedToken || user) return;
            try {
                const data = await api.get("/auth/me");
                const me = data?.user;
                if (!cancelled && me) {
                    dispatch(setCredentials({ user: me, token: savedToken }));
                }
            } catch (_err) {
                if (!cancelled) {
                    // bad/expired token → drop it so we can redirect to login cleanly
                    localStorage.removeItem("ptb_token");
                }
            } finally {
                if (!cancelled) setChecking(false);
            }
        }

        hydrate();
        return () => { cancelled = true; };
    }, [dispatch, savedToken, user]);


    if (!savedToken && !user) {
        return <Navigate to={`/login?redirect=${encodeURIComponent(loc.pathname)}`} replace />;
    }

    if (checking) {
        return <div className="p-4 text-sm text-gray-600">Signing you in…</div>;
    }


    if (user && user.role !== "admin") {
        return <Navigate to="/" replace />;
    }


    return children;
}
