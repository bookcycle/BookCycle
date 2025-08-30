import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { FaUser, FaCompass, FaHome, FaCog, FaBars, FaTimes } from "react-icons/fa";

const NAV_ITEMS = [
  { to: "/", label: "Home", icon: FaHome },
  { to: "/explore", label: "Explore", icon: FaCompass },
  { to: "/profile", label: "Profile", icon: FaUser },
  { to: "/settings", label: "Settings", icon: FaCog },
  { to: "/login", label: "Login", icon: FaCog }, 
  { to: "/signup", label: "Signup", icon: FaCog }, 
];

const baseLink =
  "flex items-center gap-3 rounded-xl px-3 py-2 text-white/90 hover:bg-white/5 transition-colors";

const activeLink =
  "bg-gradient-to-b from-[#00E676] to-[#00C853] text-[#0B1D33] font-semibold shadow-sm";

const Item = ({ to, label, Icon }) => (
  <NavLink
    to={to}
    className={({ isActive }) => `${baseLink} ${isActive ? activeLink : ""}`}
    end
    aria-label={label}
  >
    <Icon size={20} className="shrink-0" />
    <span className="hidden xl:inline">{label}</span>
  </NavLink>
);

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation(); // ✅ call the hook

  // Hide navbar on the login page
  if (location.pathname === "/login" || location.pathname === "/signup") {
    return null;
  }

  // close the mobile menu after a click
  const MobileItem = ({ to, label, Icon }) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-md ${
          isActive ? "bg-white/10 text-white" : "text-white/90 hover:text-[#FFD700]"
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
      {/* Mobile: TOP NAV + DROPDOWN  */}
      <header className="xl:hidden sticky top-0 z-40 bg-[#0B1D33] text-white">
        <div className="mx-auto max-w-screen-xl px-4 h-14 flex items-center justify-between">
          <span className="font-semibold">BookLink</span>

          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
            className="p-2 rounded-md hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30"
          >
            {open ? <FaTimes size={18} /> : <FaBars size={18} />}
          </button>
        </div>

        {/* Dropdown panel */}
        <div
          className={`overflow-hidden transition-[max-height] duration-300 ${
            open ? "max-h-96" : "max-h-0"
          }`}
        >
          <nav className="bg-[#0B1D33] border-t border-white/10 flex flex-col gap-1 py-2">
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
              <MobileItem key={to} to={to} label={label} Icon={Icon} />
            ))}
          </nav>
        </div>
      </header>

      {/* Desktop: SIDEBAR */}
      <aside className="hidden xl:flex bg-[#0B1D33] text-white min-h-screen w-64 px-6 py-10 sticky top-0 flex-col">
        <h1 className="text-white/95 font-semibold mb-12">BookLink</h1>
        <nav className="flex flex-col gap-2">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <Item key={to} to={to} label={label} Icon={Icon} />
          ))}
        </nav>
      </aside>
    </>
  );
}
