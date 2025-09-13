import React, { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { FaUser, FaCompass, FaHome, FaCog, FaBars, FaTimes, FaSignOutAlt } from "react-icons/fa";
import { MdChatBubble } from "react-icons/md";
import { logout as logoutAction } from "../features/auth/authSlice"; 

const NAV_ITEMS = [
  { to: "/", label: "Home", icon: FaHome },
  { to: "/explore", label: "Explore", icon: FaCompass },
  { to: "/profile", label: "Profile", icon: FaUser, authOnly: true },
  { to: "/chat", label: "Chat", icon: MdChatBubble , authOnly: true },
  { to: "/settings", label: "Settings", icon: FaCog, authOnly: true },

];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // read token from Redux; fallback to localStorage (first load)
  const { token: storeToken } = useSelector((s) => s.auth || {});
  const isAuthed = !!(storeToken || localStorage.getItem("ptb_token"));

  const handleLogout = () => {
    // keep both Redux and localStorage in sync
    try { dispatch(logoutAction?.()); } catch { }
    localStorage.removeItem("ptb_token");
    navigate("/login");
  };

  if (location.pathname === "/login" || location.pathname === "/signup" || location.pathname === "/chat") return null;

  const visibleItems = NAV_ITEMS.filter((i) => (i.authOnly ? isAuthed : true));

  const MobileItem = ({ to, label, Icon }) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-md ${isActive
          ? "bg-[#E0F2F1] text-[#004D40] font-semibold"
          : "text-gray-800 hover:text-[#00897B] hover:bg-[#F1F8F7]"
        }`
      }
      end
      onClick={() => setOpen(false)}
      aria-label={label}
    >
      <Icon size={18} />
      <span className="text-sm">{label}</span>
    </NavLink>
  );

  return (
    <>
      {/* Mobile Navbar */}
      <header className="xl:hidden sticky top-0 z-40 bg-[#FDFCF9] text-gray-800 border-b border-gray-200">
        <div className="mx-auto max-w-screen-xl px-4 h-14 flex items-center justify-between">
          <span className="font-semibold tracking-tight text-[#00897B]">BookLink</span>
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
            className="p-2 rounded-md hover:bg-[#E0F2F1] focus:outline-none focus:ring-2 focus:ring-[#00897B]/40"
          >
            {open ? <FaTimes size={18} /> : <FaBars size={18} />}
          </button>
        </div>

        <div className={`overflow-hidden transition-[max-height] duration-300 ${open ? "max-h-96" : "max-h-0"}`}>
          <nav className="bg-[#FDFCF9] border-t border-gray-200 flex flex-col gap-1 py-2">
            {visibleItems.map(({ to, label, icon: Icon }) => (
              <MobileItem key={to} to={to} label={label} Icon={Icon} />
            ))}

            {isAuthed ? (
              <button
                onClick={() => { handleLogout(); setOpen(false); }}
                className="flex items-center gap-3 px-4 py-3 rounded-md text-gray-800 hover:text-[#00897B] hover:bg-[#F1F8F7]"
              >
                <FaSignOutAlt size={18} />
                <span className="text-sm">Logout</span>
              </button>
            ) : (
              <MobileItem to="/login" label="Login" Icon={FaCog} />
            )}
          </nav>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden xl:flex bg-[#FDFCF9] text-gray-800 min-h-screen w-64 px-6 py-10 sticky top-0 flex-col border-r border-gray-200">
        <h1 className="text-[#00897B] text-2xl font-bold mb-6 text-center w-full">BookLink</h1>
        <nav className="flex flex-col gap-2">
          {visibleItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2 ${isActive
                  ? "bg-gradient-to-b from-[#00897B] to-[#004D40] text-white font-semibold shadow-sm"
                  : "text-gray-800 hover:bg-[#E0F2F1]"
                }`
              }
              end
              aria-label={label}
            >
              <Icon size={20} className="shrink-0" />
              <span className="hidden xl:inline">{label}</span>
            </NavLink>
          ))}

          {isAuthed ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 rounded-xl px-3 py-2 text-gray-800 hover:bg-[#E0F2F1] transition-colors"
            >
              <FaSignOutAlt size={20} />
              <span className="hidden xl:inline">Logout</span>
            </button>
          ) : (
            <NavLink to="/login" className="flex items-center gap-3 rounded-xl px-3 py-2 text-gray-800 hover:bg-[#E0F2F1]">
              <FaCog size={20} />
              <span className="hidden xl:inline">Login</span>
            </NavLink>
          )}
        </nav>
      </aside>
    </>
  );
}