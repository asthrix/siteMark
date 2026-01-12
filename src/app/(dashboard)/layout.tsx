"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { CommandMenu } from "@/components/layout/command-menu";
import { AddBookmarkDialog } from "@/components/bookmark/add-bookmark-dialog";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">{children}</main>

      {/* Global Dialogs */}
      <CommandMenu />
      <AddBookmarkDialog />
    </div>
  );
}
