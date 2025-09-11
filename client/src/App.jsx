// client/src/App.jsx
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

// General UI
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Explore from "./pages/Explore";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ChatPage from "./pages/Chat";

// Admin (➡️ keep inside /admin folder to match your style)
import AdminRoute from "./routes/AdminRoute";        // ⬅️ guard component
import AdminLayout from "./admin/AdminLayout";      // ⬅️ shell with <Outlet/>
import PendingBooks from "./admin/PendingBooks";
import RejectedBooks from "./admin/RejectedBooks";
import Dashboard from "./admin/Dashboard";

/**
 * Routed subtree that can use useLocation().
 * Why: useLocation() only works when already inside a Router.
 * How: App() just wraps <RoutedApp/> with <BrowserRouter/>.
 */
function RoutedApp() {
  const { pathname } = useLocation();

  // Hide general Navbar on any /admin page
  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");

  return (
    <div className={isAdminRoute ? "min-h-screen" : "min-h-screen xl:flex"}>
      {!isAdminRoute && <Navbar />}

      <main className="flex-1">
        <Routes>
          {/* Public/user routes */}
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/chat" element={<ChatPage />} />

          {/* Admin routes (protected + nested under AdminLayout) */}
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
  // If your main.jsx already has <BrowserRouter>, then return <RoutedApp /> directly.
  return (
    <BrowserRouter>
      <RoutedApp />
    </BrowserRouter>
  );
}
