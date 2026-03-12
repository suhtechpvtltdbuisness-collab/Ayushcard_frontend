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

const ProtectedRoute = ({ allowedRole }) => {
    const navigate = useNavigate();
    const logoutTimerRef = useRef(null);

    // ── Helper: get current role ───────────────────────────────────────────
    const getUserRole = () => {
        const storedRole = localStorage.getItem("userRole");
        if (storedRole) return storedRole.charAt(0).toUpperCase() + storedRole.slice(1).toLowerCase();
        
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (user.role) return user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase();
        
        return null;
    };

    const userRole = getUserRole();

    // ── Helper: clear tokens and go to /login ────────────────────────────────
    const logout = (reason = "") => {
        if (reason) console.warn("[ProtectedRoute] Logout:", reason);
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

        logoutTimerRef.current = setTimeout(() => {
            logout("token lifetime reached");
        }, ms);
    };

    useEffect(() => {
        if (!isTokenValid()) {
            logout("no valid token on mount");
            return;
        }

        // Role check
        if (allowedRole && userRole !== allowedRole) {
            console.error(`[ProtectedRoute] Access denied. Required: ${allowedRole}, Found: ${userRole}`);
            // Don't log out, just redirect to their correct dashboard or login
            if (userRole === "Admin") navigate("/admin", { replace: true });
            else if (userRole === "Employee") navigate("/employee", { replace: true });
            else navigate("/login", { replace: true });
            return;
        }

        scheduleLogout();

        const handleStorage = (e) => {
            if (e.key === "token" && !e.newValue) {
                logout("token removed in another tab");
            }
        };
        window.addEventListener("storage", handleStorage);

        const handleForceLogout = () => logout("server forced logout");
        window.addEventListener("auth:logout", handleForceLogout);

        return () => {
            if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
            window.removeEventListener("storage", handleStorage);
            window.removeEventListener("auth:logout", handleForceLogout);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allowedRole, userRole]);

    // Initial basic check
    if (!isTokenValid()) {
        return <Navigate to="/login" replace />;
    }

    // Role check for initial render
    if (allowedRole && userRole !== allowedRole) {
        return <Navigate to={userRole === "Admin" ? "/admin" : (userRole === "Employee" ? "/employee" : "/login")} replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
