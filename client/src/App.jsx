import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Explore from "./pages/Explore";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ChatPage from "./pages/Chat";
import BookDetails from "./pages/BookDetails"; 

// Admin
import AdminRoute from "./routes/AdminRoute";
import AdminLayout from "./admin/AdminLayout";
import PendingBooks from "./admin/PendingBooks";
import RejectedBooks from "./admin/RejectedBooks";
import Dashboard from "./admin/Dashboard";

function RoutedApp() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);

  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");

  // 🚀 auto redirect if role is admin
  useEffect(() => {
    if (user?.role === "admin" && !isAdminRoute) {
      navigate("/admin", { replace: true });
    }
  }, [user, isAdminRoute, navigate]);

  return (
    <div className={isAdminRoute ? "min-h-screen" : "min-h-screen xl:flex"}>
      {/* Hide global navbar on admin pages */}
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


          {/* Admin routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<Dashboard />} />
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
