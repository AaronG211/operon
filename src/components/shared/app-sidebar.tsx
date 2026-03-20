"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRestaurant } from "@/hooks/use-restaurant";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  FileText,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Upload,
  Zap,
  Calendar,
  Plus,
  Store,
  Trash2,
  Loader2,
} from "lucide-react";

const navGroups = [
  {
    label: "GENERAL",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/report", label: "Health Report", icon: FileText },
      { href: "/weekly-summary", label: "Weekly Summary", icon: Calendar },
    ],
  },
  {
    label: "TOOLS",
    items: [
      { href: "/chat", label: "AI Chat", icon: MessageSquare },
      { href: "/data", label: "Upload Data", icon: Upload },
    ],
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const { current, restaurants, loading, switchRestaurant, deleteRestaurant } =
    useRestaurant();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null);
    });
  }, [supabase.auth]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const initials = userEmail
    ? userEmail.slice(0, 2).toUpperCase()
    : "U";

  return (
    <aside className="flex h-screen w-60 flex-col bg-sidebar text-sidebar-foreground">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
          <Zap className="h-4 w-4 text-sidebar-primary-foreground" />
        </div>
        <span className="text-base font-bold text-sidebar-accent-foreground">
          Operon
        </span>
      </div>

      {/* Restaurant Switcher */}
      <div className="px-4 pb-2 pt-2">
        <label className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">
          <Store className="h-3 w-3" />
          Restaurant
        </label>
        {loading ? (
          <div className="h-9 animate-pulse rounded-md bg-sidebar-accent" />
        ) : restaurants.length > 0 ? (
          <div className="flex items-center gap-1 overflow-hidden">
            <Select
              value={current?.id ?? ""}
              onValueChange={(v) => {
                if (v === "__add_new__") {
                  router.push("/onboarding");
                } else if (v) {
                  switchRestaurant(v);
                }
              }}
            >
              <SelectTrigger className="min-w-0 flex-1 border-sidebar-border bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/80 [&>svg]:text-sidebar-foreground/50">
                <span className="truncate text-sm">
                  {current?.name ?? "Select restaurant"}
                </span>
              </SelectTrigger>
              <SelectContent>
                {restaurants.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    <span className="truncate">{r.name}</span>
                  </SelectItem>
                ))}
                <SelectItem value="__add_new__">
                  <span className="flex items-center gap-2 text-primary">
                    <Plus className="h-3 w-3" />
                    Add Restaurant
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
            {current && (
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 shrink-0 text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-red-400"
                onClick={() => setDeleteDialogOpen(true)}
                title="Delete restaurant"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ) : (
          <Link href="/onboarding">
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2 border-sidebar-border bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/80"
            >
              <Plus className="h-3 w-3" />
              Add Restaurant
            </Button>
          </Link>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete &ldquo;{current?.name}&rdquo;?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this restaurant and all its data
              including menu items, reviews, daily sales, reports,
              recommendations, and chat history. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleting}
              onClick={async (e) => {
                e.preventDefault();
                if (!current) return;
                setDeleting(true);
                await deleteRestaurant(current.id);
                setDeleting(false);
                setDeleteDialogOpen(false);
                router.push("/dashboard");
              }}
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Divider */}
      <div className="mx-4 my-2 border-t border-sidebar-border" />

      {/* Navigation */}
      <nav className="flex-1 space-y-4 px-3 py-1 overflow-y-auto">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                      isActive
                        ? "border-l-[3px] border-sidebar-primary bg-sidebar-accent text-sidebar-accent-foreground"
                        : "border-l-[3px] border-transparent text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Section */}
      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sidebar-primary text-xs font-semibold text-sidebar-primary-foreground">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-sidebar-accent-foreground">
              {userEmail ?? "User"}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            onClick={handleLogout}
            title="Sign Out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
