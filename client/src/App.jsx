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
import BookDetails from "./pages/BookDetails"; // ✅ details page

// Admin
import AdminRoute from "./routes/AdminRoute";
import AdminLayout from "./admin/AdminLayout";
import PendingBooks from "./admin/PendingBooks";
import RejectedBooks from "./admin/RejectedBooks";
import Dashboard from "./admin/Dashboard";

function RoutedApp() {
  const { pathname } = useLocation();
  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");

  return (
    <div className={isAdminRoute ? "min-h-screen" : "min-h-screen xl:flex"}>
      {/* Hide global navbar on admin pages */}
      {!isAdminRoute && <Navbar />}

      <main className="flex-1">
        <Routes>
          {/* Public/user routes */}
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/book/:id" element={<BookDetails />} /> {/* ✅ NEW */}
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/chat" element={<ChatPage />} />

          {/* Admin routes (protected + nested) */}
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

          {/* Optional: 404 */}
          {/* <Route path="*" element={<div className="p-6">Not Found</div>} /> */}
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
