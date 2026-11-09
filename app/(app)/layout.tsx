"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import {
  ArrowUpRight,
  Clapperboard,
  Images,
  LayoutDashboard,
  Menu,
  Sparkles,
  Upload,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

const navigation = [
  { href: "/home", label: "Overview", icon: LayoutDashboard },
  { href: "/video-upload", label: "Upload video", icon: Upload },
  { href: "/social-share", label: "Social creator", icon: Images },
];

export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useUser();
  const activePage = navigation.find((item) => item.href === pathname)?.label;

  return (
    <div className="drawer lg:drawer-open">
      <input
        id="app-sidebar"
        type="checkbox"
        className="drawer-toggle"
        checked={sidebarOpen}
        onChange={(event) => setSidebarOpen(event.target.checked)}
      />
      <div className="drawer-content flex min-h-screen flex-col bg-base-200/50">
        <header className="sticky top-0 z-30 border-b border-base-300/70 bg-base-100/90 backdrop-blur-xl">
          <div className="navbar mx-auto h-16 max-w-[1600px] px-4 sm:px-6 lg:px-8">
            <div className="flex-none lg:hidden">
              <label
                htmlFor="app-sidebar"
                aria-label="Open navigation menu"
                className="btn btn-square btn-ghost rounded-xl"
              >
                <Menu className="h-5 w-5" />
              </label>
            </div>
            <div className="flex-1 px-2">
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-base-content/40">
                  Workspace
                </span>
                <span className="text-sm font-semibold">
                  {activePage ?? "Media tools"}
                </span>
              </div>
            </div>
            <div className="flex flex-none items-center gap-3">
              <ThemeToggle />
              <div className="hidden text-right sm:block">
                <p className="max-w-48 truncate text-sm font-medium">
                  {user?.fullName ?? "Your account"}
                </p>
                <p className="text-xs text-base-content/45">Personal workspace</p>
              </div>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "h-9 w-9",
                    userButtonTrigger: "rounded-full ring-2 ring-primary/10",
                  },
                }}
              />
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          {children}
        </main>
      </div>

      <div className="drawer-side z-40">
        <label
          htmlFor="app-sidebar"
          aria-label="Close navigation menu"
          className="drawer-overlay"
        />
        <aside className="flex min-h-full w-[17rem] flex-col border-r border-base-300/70 bg-base-100 px-4 py-5">
          <Link
            href="/home"
            onClick={() => setSidebarOpen(false)}
            className="mb-9 flex items-center gap-3 px-2"
          >
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary text-primary-content shadow-lg shadow-primary/20">
              <Clapperboard className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-base font-bold tracking-tight">
                Frameflow
              </span>
              <span className="block text-xs text-base-content/45">
                Creator workspace
              </span>
            </span>
          </Link>

          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-base-content/40">
            Workspace
          </p>
          <nav aria-label="Main navigation" className="space-y-1">
            {navigation.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                    active
                      ? "bg-primary text-primary-content shadow-md shadow-primary/15"
                      : "text-base-content/65 hover:bg-base-200 hover:text-base-content"
                  }`}
                >
                  <Icon className="h-[18px] w-[18px]" />
                  {item.label}
                  {active && (
                    <ArrowUpRight className="ml-auto h-4 w-4 opacity-70" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto rounded-2xl border border-primary/10 bg-primary/5 p-4">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
              <Sparkles className="h-4 w-4" />
            </span>
            <p className="mt-3 text-sm font-semibold">
              Create more with your media
            </p>
            <p className="mt-1 text-xs leading-5 text-base-content/55">
              Turn a single upload into optimized videos and social-ready images.
            </p>
            <Link
              href="/social-share"
              onClick={() => setSidebarOpen(false)}
              className="btn btn-sm btn-primary mt-4 w-full rounded-lg"
            >
              Open social creator
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
