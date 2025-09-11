import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

export default function AdminRoute({ children }) {
  const { user } = useSelector((s) => s.auth);
  const loc = useLocation();

  // not logged in → go login
  if (!user) return <Navigate to={`/login?redirect=${encodeURIComponent(loc.pathname)}`} replace />;
  // logged in but not admin → home
  if (user.role !== "admin") return <Navigate to="/" replace />;

  return children;
}
