import React, { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  FaUser,
  FaCompass,
  FaHome,
  FaCog,
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaClock,
  FaSignInAlt,
} from "react-icons/fa";
import { MdChatBubble } from "react-icons/md";
import { GiCycle } from "react-icons/gi";
import { logout as logoutAction } from "../features/auth/authSlice";

const NAV_ITEMS = [
  { to: "/", label: "Home", icon: FaHome },
  { to: "/explore", label: "Explore", icon: FaCompass },
  { to: "/profile", label: "Profile", icon: FaUser, authOnly: true },
  { to: "/chat", label: "Chat", icon: MdChatBubble, authOnly: true },
  { to: "/activity", label: "Activity", icon: FaClock, authOnly: true },
  { to: "/settings", label: "Settings", icon: FaCog, authOnly: true },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { token: storeToken } = useSelector((s) => s.auth || {});
  const isAuthed = !!(storeToken || localStorage.getItem("ptb_token"));

  const handleLogout = () => {
    try {
      dispatch(logoutAction?.());
    } catch {}
    localStorage.removeItem("ptb_token");
    navigate("/login");
  };

  // shrink + icons-only on /chat and /explore (and any nested routes)
  const isCompact =
    location.pathname.startsWith("/chat") ||
    location.pathname.startsWith("/explore");

  // Hide entirely on auth pages + dynamic book route
  if (
    location.pathname === "/login" ||
    location.pathname === "/signup" ||
    location.pathname.startsWith("/book/")
  )
    return null;

  const visibleItems = NAV_ITEMS.filter((i) => (i.authOnly ? isAuthed : true));

  const sidebarWidthClass = isCompact ? "w-20" : "w-64";
  const sidebarPadX = isCompact ? "px-3" : "px-6";
  const itemPadX = isCompact ? "px-2" : "px-3";
  const itemGap = isCompact ? "gap-0 justify-center" : "gap-3";
  const logoTextHidden = isCompact ? "hidden" : "inline";

  const MobileItem = ({ to, label, Icon, compact }) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-md ${
          isActive
            ? "bg-[#E0F2F1] text-[#004D40] font-semibold"
            : "text-gray-800 hover:text-[#00897B] hover:bg-[#F1F8F7]"
        }`
      }
      end
      onClick={() => setOpen(false)}
      aria-label={label}
      title={label}
    >
      <Icon size={18} />
      {!compact && <span className="text-sm">{label}</span>}
    </NavLink>
  );

  return (
    <>
      {/* Mobile Navbar (we don't shrink height; compact just hides labels) */}
      <header className="xl:hidden sticky top-0 z-40 bg-[#FDFCF9] text-gray-800 border-b border-gray-200">
        <div className="mx-auto max-w-screen-xl px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#00897B]">
            <GiCycle size={20} aria-hidden="true" />
            <span className="font-semibold tracking-tight">BookCycle</span>
          </div>

        <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
            className="p-2 rounded-md hover:bg-[#E0F2F1] focus:outline-none focus:ring-2 focus:ring-[#00897B]/40"
          >
            {open ? <FaTimes size={18} /> : <FaBars size={18} />}
          </button>
        </div>

        <div
          className={`overflow-hidden transition-[max-height] duration-300 ${
            open ? "max-h-96" : "max-h-0"
          }`}
        >
          <nav className="bg[#FDFCF9] border-t border-gray-200 flex flex-col gap-1 py-2">
            {visibleItems.map(({ to, label, icon: Icon }) => (
              <MobileItem
                key={to}
                to={to}
                label={label}
                Icon={Icon}
                compact={isCompact}
              />
            ))}

            {isAuthed ? (
              <button
                onClick={() => {
                  handleLogout();
                  setOpen(false);
                }}
                className="flex items-center gap-3 px-4 py-3 rounded-md text-gray-800 hover:text-[#00897B] hover:bg-[#F1F8F7]"
                aria-label="Logout"
                title="Logout"
              >
                <FaSignOutAlt size={18} />
                {!isCompact && <span className="text-sm">Logout</span>}
              </button>
            ) : (
              /* CHANGED ICON HERE */
              <MobileItem
                to="/login"
                label="Login"
                Icon={FaSignInAlt}
                compact={isCompact}
              />
            )}
          </nav>
        </div>
      </header>

      {/* Desktop Sidebar (shrinks width on compact pages) */}
      <aside
        className={[
          "hidden xl:flex bg-[#FDFCF9] text-gray-800 min-h-screen",
          sidebarWidthClass,
          sidebarPadX,
          "py-10 sticky top-0 flex-col border-r border-gray-200",
          "transition-[width] duration-300 ease-in-out",
        ].join(" ")}
      >
        <div className="mb-6 flex items-center justify-center gap-2 text-[#00897B] w-full">
          <GiCycle size={24} aria-hidden="true" />
          <span className={`text-2xl font-bold ${logoTextHidden}`}>BookCycle</span>
        </div>

        <nav className="flex flex-col gap-2">
          {visibleItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                [
                  "flex items-center rounded-xl py-2",
                  itemPadX,
                  itemGap,
                  isActive
                    ? "bg-gradient-to-b from-[#00897B] to-[#004D40] text-white font-semibold shadow-sm"
                    : "text-gray-800 hover:bg-[#E0F2F1]",
                ].join(" ")
              }
              end
              aria-label={label}
              title={label}
            >
              <Icon size={20} className="shrink-0" />
              {/* hide labels when compact */}
              {!isCompact && <span className="hidden xl:inline">{label}</span>}
            </NavLink>
          ))}

          {isAuthed ? (
            <button
              onClick={handleLogout}
              className={["flex items-center rounded-xl py-2 transition-colors", itemPadX, itemGap, "text-gray-800 hover:bg-[#E0F2F1]"].join(" ")}
              aria-label="Logout"
              title="Logout"
            >
              <FaSignOutAlt size={20} />
              {!isCompact && <span className="hidden xl:inline">Logout</span>}
            </button>
          ) : (
            <NavLink
              to="/login"
              className={["flex items-center rounded-xl py-2", itemPadX, itemGap, "text-gray-800 hover:bg-[#E0F2F1]"].join(" ")}
              aria-label="Login"
              title="Login"
            >
              {/* CHANGED ICON HERE */}
              <FaSignInAlt size={20} />
              {!isCompact && <span className="hidden xl:inline">Login</span>}
            </NavLink>
          )}
        </nav>
      </aside>
    </>
  );
}
