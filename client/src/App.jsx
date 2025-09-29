import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Explore from "./pages/Explore";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ChatPage from "./pages/Chat";
import BookDetails from "./pages/BookDetails";
import Activity from "./pages/Activity";

// Admin
import AdminRoute from "./routes/AdminRoute";
import AdminLayout from "./admin/AdminLayout";
import PendingBooks from "./admin/PendingBooks";
import RejectedBooks from "./admin/RejectedBooks";

import { bootstrapAuth } from "./features/auth/authSlice";

function RoutedApp() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, status } = useSelector((s) => s.auth);
  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");

  useEffect(() => {
    if (status === "bootstrapping") {
      dispatch(bootstrapAuth());
    }
  }, [status, dispatch]);

  if (status === "bootstrapping") {
    return (
      <div className="min-h-screen grid place-items-center text-slate-400">
        Loading…
      </div>
    );
  }

  useEffect(() => {
    if (status === "authenticated" && user?.role === "admin" && !isAdminRoute) {
      navigate("/admin", { replace: true });
    }
  }, [status, user, isAdminRoute, navigate]);

  return (
    <div className={isAdminRoute ? "min-h-screen" : "min-h-screen xl:flex"}>
      {!isAdminRoute && <Navbar />}

      <main className="flex-1">
        <Routes>
          {/* Public/user routes */}
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/book/:id" element={<BookDetails />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/activity" element={<Activity />} />

          {/* Admin routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<PendingBooks />} />
            <Route path="pending" element={<PendingBooks />} />
            <Route path="rejected" element={<RejectedBooks />} />
          </Route>
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <RoutedApp />
    </BrowserRouter>
  );
}
