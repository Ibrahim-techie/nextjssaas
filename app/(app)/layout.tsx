"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Crop, Library, Menu, Upload } from "lucide-react";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import { ThemedUserButton } from "@/components/ThemedClerk";

const navigation = [
  { href: "/home", label: "Library", icon: Library },
  { href: "/video-upload", label: "Upload video", icon: Upload },
  { href: "/social-share", label: "Social image", icon: Crop },
];

export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const activePage = navigation.find((item) => item.href === pathname)?.label;
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="drawer lg:drawer-open">
      <input
        id="app-sidebar"
        type="checkbox"
        className="drawer-toggle"
        checked={sidebarOpen}
        onChange={(event) => setSidebarOpen(event.target.checked)}
      />

      <div className="drawer-content flex min-h-screen flex-col bg-base-200">
        <header className="sticky top-0 z-30 border-b border-line bg-base-200">
          <div className="mx-auto flex h-14 w-full max-w-[1440px] items-center gap-2 px-4 sm:px-6 lg:px-8">
            <label
              htmlFor="app-sidebar"
              aria-label="Open navigation"
              className="-ml-2 grid size-9 cursor-pointer place-items-center rounded-lg text-fg-2 transition-colors hover:bg-base-300 hover:text-base-content lg:hidden"
            >
              <Menu className="size-4" strokeWidth={1.5} />
            </label>
            <p className="flex-1 truncate text-sm text-fg-2">
              {activePage ?? "Frameflow"}
            </p>
            <ThemeToggle />
            <div className="grid size-9 place-items-center">
              <ThemedUserButton />
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>

      <div className="drawer-side z-40">
        <label
          htmlFor="app-sidebar"
          aria-label="Close navigation"
          className="drawer-overlay"
        />
        <aside className="flex min-h-full w-64 flex-col border-r border-line bg-base-100 px-3">
          <div className="flex h-14 items-center px-2">
            <Logo href="/home" onClick={closeSidebar} />
          </div>

          <nav aria-label="Main navigation" className="mt-4 flex flex-col gap-0.5">
            {navigation.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeSidebar}
                  aria-current={active ? "page" : undefined}
                  className={`flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-sm transition-colors ${
                    active
                      ? "bg-base-300 font-medium text-base-content"
                      : "text-fg-2 hover:bg-base-300/60 hover:text-base-content"
                  }`}
                >
                  <Icon
                    className={`size-4 shrink-0 ${active ? "text-base-content" : "text-fg-3"}`}
                    strokeWidth={1.5}
                  />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <p className="mt-auto px-2.5 py-4 text-xs leading-4 text-fg-3">
            Videos up to 100 MB, images up to 10 MB
          </p>
        </aside>
      </div>
    </div>
  );
}
