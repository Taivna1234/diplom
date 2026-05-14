"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  Compass,
  Users,
  ShoppingBag,
  MessageCircle,
  User,
  Sparkles,
  Moon,
  Sun,
  LogOut,
  Menu,
  X,
  BookPlus,
} from "lucide-react";
import { useState, useEffect } from "react";
import { AIAssistantModal } from "../ai/AIAssistantModal";
import { AddBookModal } from "../books/AddBookModal";
import { useAuth } from "@/context/AuthContext";

export function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const { logout, user, loading } = useAuth();
  const [showAIModal, setShowAIModal] = useState(false);
  const [showAddBookModal, setShowAddBookModal] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login")
    }
  }, [user, loading, router])

  const [darkMode, setDarkMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [query, setQuery] = useState("");

  const navItems = [
    { path: "/dashboard", label: "Нүүр", icon: Compass },
    { path: "/community", label: "Хэлэлцүүлэг", icon: Users },
    { path: "/marketplace", label: "Зар", icon: ShoppingBag },
    { path: "/messages", label: "Мессеж", icon: MessageCircle },
    { path: "/profile", label: "Профайл", icon: User },
  ];

  const isActive = (path: string) => {
    if (path === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(path);
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && query.trim()) {
      router.push(`/dashboard?search=${encodeURIComponent(query)}`);
      setMobileMenuOpen(false);
    }
  };

  const sidebarBg = darkMode
    ? "bg-slate-900/40 backdrop-blur-xl border-slate-800/50"
    : "bg-white/40 backdrop-blur-xl border-white/30";

  return (
    <div className={`min-h-screen flex ${darkMode ? "dark bg-slate-950" : ""}`}>

      {/* ── Desktop Sidebar ── */}
      <aside
        className={`hidden md:flex fixed left-0 top-0 h-full z-10 border-r flex-col transition-all duration-300 ${
          sidebarCollapsed ? "w-20" : "w-64"
        } ${sidebarBg}`}
      >
        <div className="p-6 flex-1">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="flex items-center gap-2 mb-8 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            {!sidebarCollapsed && (
              <span className={`font-semibold text-lg ${darkMode ? "text-gray-100" : "text-gray-800"}`}>
                BookIntelligence
              </span>
            )}
          </button>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    active
                      ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30"
                      : darkMode
                      ? "text-gray-300 hover:bg-slate-800/60"
                      : "text-gray-700 hover:bg-white/60"
                  } ${sidebarCollapsed ? "justify-center" : ""}`}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Desktop logout at bottom of sidebar */}
        {!sidebarCollapsed && (
          <div className="p-6 pt-0">
            <button
              onClick={() => { logout(); router.push("/login"); }}
              className={`w-full flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all text-sm ${
                darkMode
                  ? "bg-slate-800/60 text-gray-300 hover:bg-slate-700"
                  : "bg-white/60 text-gray-700 hover:bg-white"
              }`}
            >
              <LogOut className="w-4 h-4" />
              <span className="font-medium">Гарах</span>
            </button>
          </div>
        )}
      </aside>

      {/* ── Mobile overlay menu ── */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      <aside
        className={`fixed left-0 top-0 h-full z-50 w-72 flex flex-col border-r transition-transform duration-300 md:hidden ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } ${sidebarBg}`}
      >
        <div className="p-5 flex items-center justify-between border-b border-white/20 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className={`font-semibold text-lg ${darkMode ? "text-gray-100" : "text-gray-800"}`}>
              BookIntelligence
            </span>
          </div>
          <button onClick={() => setMobileMenuOpen(false)} className="p-1">
            <X className={`w-5 h-5 ${darkMode ? "text-gray-300" : "text-gray-600"}`} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  active
                    ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30"
                    : darkMode
                    ? "text-gray-300 hover:bg-slate-800/60"
                    : "text-gray-700 hover:bg-white/60"
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/20 dark:border-slate-700">
          <button
            onClick={() => { logout(); router.push("/login"); }}
            className={`w-full flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all text-sm ${
              darkMode
                ? "bg-slate-800/60 text-gray-300 hover:bg-slate-700"
                : "bg-white/60 text-gray-700 hover:bg-white"
            }`}
          >
            <LogOut className="w-4 h-4" />
            <span className="font-medium">Гарах</span>
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ml-0 ${
          sidebarCollapsed ? "md:ml-20" : "md:ml-64"
        }`}
      >
        {/* Header */}
        <header
          className={`sticky top-0 z-20 backdrop-blur-xl border-b ${
            darkMode
              ? "bg-slate-900/40 border-slate-800/50"
              : "bg-white/40 border-white/30"
          }`}
        >
          <div className="px-4 sm:px-6 md:px-8 py-3 md:py-4 flex items-center gap-3">

            {/* Hamburger — mobile only */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className={`md:hidden p-2 rounded-xl flex-shrink-0 ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Search */}
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <Search
                  className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                    darkMode ? "text-gray-500" : "text-gray-400"
                  }`}
                />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleSearch}
                  placeholder="Ном, зохиолч хайх..."
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm ${
                    darkMode
                      ? "bg-slate-800/60 border-slate-700/40 text-gray-200 placeholder-gray-500"
                      : "bg-white/60 border-white/40 text-gray-800 placeholder-gray-500"
                  }`}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setShowAddBookModal(true)}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                  darkMode
                    ? "bg-slate-800/60 text-gray-300 hover:bg-slate-700"
                    : "bg-white/60 text-gray-700 hover:bg-white"
                }`}
              >
                <BookPlus className="w-4 h-4" />
                <span className="hidden sm:inline">Ном нэмэх</span>
              </button>

              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-xl transition-all ${
                  darkMode
                    ? "bg-slate-800/60 text-gray-300 hover:bg-slate-700"
                    : "bg-white/60 text-gray-700 hover:bg-white"
                }`}
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

            </div>
          </div>
        </header>

        {/* Page content — pb for mobile bottom nav */}
        <main className="flex-1 pb-16 md:pb-0">{children}</main>
      </div>

      {/* ── Mobile bottom nav ── */}
      <nav
        className={`fixed bottom-0 left-0 right-0 z-30 flex md:hidden border-t ${
          darkMode
            ? "bg-slate-900/80 backdrop-blur-xl border-slate-800/50"
            : "bg-white/80 backdrop-blur-xl border-white/30"
        }`}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${
                active
                  ? "text-blue-600 dark:text-blue-400"
                  : darkMode
                  ? "text-gray-400"
                  : "text-gray-500"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium leading-tight">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Floating AI */}
      <button
        onClick={() => setShowAIModal(true)}
        className="fixed bottom-20 right-4 md:bottom-8 md:right-8 w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 text-white shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-300 flex items-center justify-center z-50"
      >
        <Sparkles className="w-5 h-5 md:w-7 md:h-7" />
      </button>

      <AIAssistantModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        darkMode={darkMode}
      />

      <AddBookModal
        isOpen={showAddBookModal}
        onClose={() => setShowAddBookModal(false)}
      />
    </div>
  );
}
