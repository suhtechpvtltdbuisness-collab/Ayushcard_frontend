import React, { useEffect, useRef } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { isTokenValid, msUntilExpiry, clearTokens } from "../../utils/auth";

/**
 * ProtectedRoute
 * ──────────────
 * Wraps any route that requires a valid, non-expired JWT.
 *
 * Behaviour:
 *  1. On first render – if the token is missing or already expired → redirect
 *     immediately to /login.
 *  2. While the user is on the page – a timer fires ~30 s before expiry
 *     (same buffer used by isTokenValid) and performs a hard logout.
 *  3. A "storage" event listener catches the case where another tab logs out,
 *     ensuring this tab also redirects.
 *
 * Usage (in App.jsx):
 *   <Route element={<ProtectedRoute />}>
 *     ... admin child routes ...
 *   </Route>
 */
import { Outlet } from "react-router-dom";

const ProtectedRoute = () => {
    const navigate = useNavigate();
    const logoutTimerRef = useRef(null);

    // ── Helper: clear tokens and go to /login ────────────────────────────────
    const logout = (reason = "") => {
        if (reason) console.warn("[ProtectedRoute] Auto-logout:", reason);
        clearTokens();
        navigate("/login", { replace: true });
    };

    // ── Schedule a proactive logout timer ────────────────────────────────────
    const scheduleLogout = () => {
        if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);

        const ms = msUntilExpiry();
        if (ms === 0) {
            logout("token already expired");
            return;
        }
        if (ms === Infinity) return; // no-expiry token — skip scheduling

        // Fire 1 second after actual expiry (isTokenValid uses 30 s buffer,
        // so the timer fires when the token is still technically ~29 s old —
        // good enough to guarantee a redirect before any API call fails).
        logoutTimerRef.current = setTimeout(() => {
            logout("token lifetime reached");
        }, ms);
    };

    useEffect(() => {
        // ── 1. Immediate check on mount ─────────────────────────────────────────
        if (!isTokenValid()) {
            logout("no valid token on mount");
            return;
        }

        // ── 2. Schedule proactive logout timer ──────────────────────────────────
        scheduleLogout();

        // ── 3. Cross-tab logout: if another tab removes the token ────────────────
        const handleStorage = (e) => {
            if (e.key === "token" && !e.newValue) {
                logout("token removed in another tab");
            }
        };
        window.addEventListener("storage", handleStorage);

        // ── 4. Listen for the forceLogout event fired by service.js ─────────────
        const handleForceLogout = () => logout("server forced logout (401 / refresh failed)");
        window.addEventListener("auth:logout", handleForceLogout);

        return () => {
            if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
            window.removeEventListener("storage", handleStorage);
            window.removeEventListener("auth:logout", handleForceLogout);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Not authenticated — redirect instantly
    if (!isTokenValid()) {
        return <Navigate to="/login" replace />;
    }

    // Authenticated — render child routes
    return <Outlet />;
};

export default ProtectedRoute;
