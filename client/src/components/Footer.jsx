import React from "react";
import { FaFacebook, FaTwitter, FaGithub, FaLinkedin } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-[#E8E4DC] bg-[#FDFCF9]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-semibold text-emerald-700">
              BookCycle
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Exchange and give away books in your community.  
              Building a culture of shared knowledge & sustainability.
            </p>
            <div className="mt-3 flex gap-3 text-slate-500">
              <a href="#" className="hover:text-emerald-700">
                <FaFacebook />
              </a>
              <a href="#" className="hover:text-emerald-700">
                <FaTwitter />
              </a>
              <a href="#" className="hover:text-emerald-700">
                <FaGithub />
              </a>
              <a href="#" className="hover:text-emerald-700">
                <FaLinkedin />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-slate-800">Quick Links</h4>
            <ul className="mt-2 space-y-2 text-sm text-slate-600">
              <li><a href="/explore" className="hover:text-emerald-700">Explore Library</a></li>
              <li><a href="/profile" className="hover:text-emerald-700">My Profile</a></li>
              <li><a href="/upload" className="hover:text-emerald-700">List a Book</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-slate-800">Support</h4>
            <ul className="mt-2 space-y-2 text-sm text-slate-600">
              <li><a href="/faq" className="hover:text-emerald-700">FAQ</a></li>
              <li><a href="/contact" className="hover:text-emerald-700">Contact</a></li>
              <li><a href="/guidelines" className="hover:text-emerald-700">Community Guidelines</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold text-slate-800">Stay Updated</h4>
            <p className="mt-2 text-sm text-slate-600">
              Get updates on new books, features & events.
            </p>
            <form className="mt-3 flex">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full rounded-l-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
              <button
                type="submit"
                className="rounded-r-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom note */}
        <div className="mt-8 border-t border-[#E8E4DC] pt-4 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} BookCycle. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
