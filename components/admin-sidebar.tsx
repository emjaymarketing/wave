"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, Shield, Calendar, Columns3 } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Clients", href: "/admin/clients", icon: Users },
  { name: "Admins", href: "/admin/admins", icon: Shield },
  { name: "Calendar", href: "/admin/calendar", icon: Calendar },
  { name: "Board", href: "/admin/kanban", icon: Columns3 },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col w-64 border-r bg-muted/10 min-h-screen">
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <nav className="mt-5 flex-1 px-2 space-y-1">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <item.icon
                  className={cn(
                    "mr-3 flex-shrink-0 h-5 w-5",
                    isActive
                      ? "text-primary-foreground"
                      : "text-muted-foreground group-hover:text-foreground",
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
