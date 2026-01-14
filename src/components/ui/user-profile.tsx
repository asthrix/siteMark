"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Settings, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

// ============================================================================
// USER PROFILE - Redesigned
// ============================================================================

interface UserData {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
}

export function UserProfile() {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (authUser) {
        setUser({
          id: authUser.id,
          email: authUser.email || "",
          name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || null,
          avatarUrl: authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture || null,
        });
      }
      setIsLoading(false);
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
          <div className="space-y-1.5">
            <div className="h-3 w-20 bg-muted animate-pulse rounded" />
            <div className="h-2.5 w-28 bg-muted animate-pulse rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-between gap-2 p-2">
        <Button variant="default" size="sm" asChild className="flex-1">
          <Link href="/login">Sign In</Link>
        </Button>
      </div>
    );
  }

  const initials = user.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user.email[0].toUpperCase();

  const firstName = user.name?.split(" ")[0] || "User";

  return (
    <div className="flex items-center gap-2">
      {/* Theme Toggle - Only light/dark */}

      {/* User Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex-1 flex items-center justify-between gap-2 h-10 px-2 rounded-lg hover:bg-muted/50"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar className="h-7 w-7 ring-2 ring-background">
                {user.avatarUrl && (
                  <AvatarImage src={user.avatarUrl} alt={user.name || user.email} />
                )}
                <AvatarFallback className="bg-primary text-primary-foreground text-[10px] font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium truncate max-w-[100px]">
                {firstName}
              </span>
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="right" className="w-52">
          {/* User Info Header */}
          <div className="px-3 py-2.5">
            <p className="text-sm font-medium">{user.name || "User"}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
          <DropdownMenuSeparator />
          
          {/* Settings */}
          <DropdownMenuItem asChild>
            <Link href="/settings" className="cursor-pointer gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          {/* Logout */}
          <DropdownMenuItem
            onClick={handleLogout}
            className="text-destructive focus:text-destructive cursor-pointer gap-2"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
