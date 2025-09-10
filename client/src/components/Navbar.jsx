import React, { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  FaUser,
  FaCompass,
  FaHome,
  FaCog,
  FaBars,
  FaTimes,
  FaSignInAlt,
  FaUserPlus,
  FaSignOutAlt,
} from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../features/auth/authSlice";

const NAV_ITEMS = [
  { to: "/", label: "Home", icon: FaHome },
  { to: "/explore", label: "Explore", icon: FaCompass },
  { to: "/profile", label: "Profile", icon: FaUser },
  { to: "/settings", label: "Settings", icon: FaCog },
];

const baseLink =
  "flex items-center gap-3 rounded-xl px-3 py-2 text-gray-800 hover:bg-[#E0F2F1] transition-colors";
const activeLink =
  "bg-gradient-to-b from-[#00897B] to-[#004D40] text-white font-semibold shadow-sm";

function Item({ to, label, Icon }) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) => `${baseLink} ${isActive ? activeLink : ""}`}
      aria-label={label}
    >
      <Icon size={20} className="shrink-0" />
      <span className="hidden xl:inline">{label}</span>
    </NavLink>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);

  const hideOnAuth =
    location.pathname.startsWith("/login") ||
    location.pathname.startsWith("/signup");
  if (hideOnAuth) return null;

  function handleLogout() {
    dispatch(logout());
    navigate("/login");
  }

  function MobileItem({ to, label, Icon, onClick }) {
    return (
      <NavLink
        to={to}
        end={to === "/"}
        className={({ isActive }) =>
          `flex items-center gap-3 px-4 py-3 rounded-md ${
            isActive
              ? "bg-[#E0F2F1] text-[#004D40] font-semibold"
              : "text-gray-800 hover:text-[#00897B] hover:bg-[#F1F8F7]"
          }`
        }
        onClick={() => {
          setOpen(false);
          onClick?.();
        }}
        aria-label={label}
      >
        <Icon size={18} />
        <span className="text-sm">{label}</span>
      </NavLink>
    );
  }

  return (
    <>
      {/* Mobile Navbar */}
      <header className="xl:hidden sticky top-0 z-40 bg-[#FDFCF9] text-gray-800 border-b border-gray-200">
        <div className="mx-auto max-w-screen-xl px-4 h-14 flex items-center justify-between">
          <span className="font-semibold tracking-tight text-[#00897B]">
            BookLink
          </span>

          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
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
          <nav className="bg-[#FDFCF9] border-t border-gray-200 flex flex-col gap-1 py-2">
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
              <MobileItem key={to} to={to} label={label} Icon={Icon} />
            ))}

            {!user && (
              <>
                <MobileItem to="/login" label="Login" Icon={FaSignInAlt} />
                <MobileItem to="/signup" label="Signup" Icon={FaUserPlus} />
              </>
            )}

            {user && (
              <button
                onClick={() => {
                  setOpen(false);
                  handleLogout();
                }}
                className="flex items-center gap-3 px-4 py-3 text-left text-gray-800 hover:text-[#D32F2F] hover:bg-red-50 rounded-md"
              >
                <FaSignOutAlt size={18} />
                <span className="text-sm">Logout</span>
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden xl:flex bg-[#FDFCF9] text-gray-800 min-h-screen w-64 px-6 py-10 sticky top-0 flex-col border-r border-gray-200">
        <h1 className="text-[#00897B] font-semibold mb-12 tracking-tight">
          BookLink
        </h1>
        <nav className="flex flex-col gap-2">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <Item key={to} to={to} label={label} Icon={Icon} />
          ))}

          {!user && (
            <>
              <Item to="/login" label="Login" Icon={FaSignInAlt} />
              <Item to="/signup" label="Signup" Icon={FaUserPlus} />
            </>
          )}

          {user && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 rounded-xl px-3 py-2 text-gray-800 hover:bg-red-50 hover:text-[#D32F2F] transition-colors"
            >
              <FaSignOutAlt size={20} />
              <span className="hidden xl:inline">Logout</span>
            </button>
          )}
        </nav>
      </aside>
    </>
  );
}
