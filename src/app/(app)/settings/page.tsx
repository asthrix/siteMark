"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Settings, Upload, Download, Palette, Bell, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ImportDialog } from "@/components/import-export/import-dialog";
import { ExportDialog } from "@/components/import-export/export-dialog";
import { staggerContainer, staggerItem } from "@/lib/animations";

// ============================================================================
// SETTINGS PAGE
// ============================================================================
export default function SettingsPage() {
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="flex h-16 items-center gap-4 px-6">
          <Settings className="h-5 w-5 text-primary" />
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
            <p className="text-sm text-muted-foreground">
              Manage your preferences and data
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="flex-1 p-6 max-w-3xl mx-auto w-full space-y-6"
      >
        {/* Import/Export */}
        <motion.div variants={staggerItem}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Data Management
              </CardTitle>
              <CardDescription>
                Import bookmarks from other browsers or export your data.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  className="flex-1 justify-start gap-2"
                  onClick={() => setImportDialogOpen(true)}
                >
                  <Upload className="h-4 w-4" />
                  Import Bookmarks
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 justify-start gap-2"
                  onClick={() => setExportDialogOpen(true)}
                >
                  <Download className="h-4 w-4" />
                  Export Bookmarks
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Import supports Chrome/Firefox HTML exports and JSON files.
                Export to JSON, HTML, or CSV.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Appearance */}
        <motion.div variants={staggerItem}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Appearance
              </CardTitle>
              <CardDescription>
                Customize how SiteMark looks.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Dark Mode</Label>
                  <p className="text-xs text-muted-foreground">
                    Use dark theme
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Reduce Motion</Label>
                  <p className="text-xs text-muted-foreground">
                    Minimize animations
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Notifications */}
        <motion.div variants={staggerItem}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>
                Control notification preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Bookmark Added</Label>
                  <p className="text-xs text-muted-foreground">
                    Show notification when bookmarks are added
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Import Complete</Label>
                  <p className="text-xs text-muted-foreground">
                    Notify when import finishes
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Privacy */}
        <motion.div variants={staggerItem}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy & Security
              </CardTitle>
              <CardDescription>
                Manage your data and privacy settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Analytics</Label>
                  <p className="text-xs text-muted-foreground">
                    Help improve SiteMark with anonymous analytics
                  </p>
                </div>
                <Switch />
              </div>
              <Separator />
              <div className="pt-2">
                <Button variant="destructive" size="sm">
                  Delete All Data
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  This will permanently delete all your bookmarks, collections, and tags.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Dialogs */}
      <ImportDialog open={importDialogOpen} onOpenChange={setImportDialogOpen} />
      <ExportDialog open={exportDialogOpen} onOpenChange={setExportDialogOpen} />
    </div>
  );
}
