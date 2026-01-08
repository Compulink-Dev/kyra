"use client";

import { useState, useEffect } from "react";
import { Allotment } from "allotment";
import { FaGithub } from "react-icons/fa";
import { 
  RefreshCw, 
  ExternalLink, 
  Smartphone, 
  Tablet, 
  Monitor 
} from "lucide-react";
import { 
  Code2, 
  Eye, 
  Settings,
  PanelLeft,
  PanelLeftClose,
  Upload,
  Download,
  Share2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { cn } from "@/lib/utils";
import { EditorView } from "@/features/editor/components/editor-view";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

import { FileExplorer } from "./file-explorer";
import { Id } from "@/convex/_generated/dataModel";

const MIN_SIDEBAR_WIDTH = 260;
const MAX_SIDEBAR_WIDTH = 500;
const DEFAULT_SIDEBAR_WIDTH = 320;
const DEFAULT_MAIN_SIZE = 1000;

interface TabItem {
  id: "editor" | "preview";
  label: string;
  icon: React.ReactNode;
  badge?: string;
}

const tabs: TabItem[] = [
  {
    id: "editor",
    label: "Editor",
    icon: <Code2 className="size-3.5" />,
    badge: "Live",
  },
  {
    id: "preview",
    label: "Preview",
    icon: <Eye className="size-3.5" />,
  },
];

export const ProjectIdView = ({ projectId }: { projectId: Id<"projects"> }) => {
  const [activeView, setActiveView] = useState<"editor" | "preview">("editor");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_SIDEBAR_WIDTH);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + B to toggle sidebar
      if ((e.metaKey || e.ctrlKey) && e.key === "b") {
        e.preventDefault();
        setSidebarCollapsed((prev) => !prev);
      }
      // Cmd/Ctrl + E to switch to editor
      if ((e.metaKey || e.ctrlKey) && e.key === "e") {
        e.preventDefault();
        setActiveView("editor");
      }
      // Cmd/Ctrl + P to switch to preview
      if ((e.metaKey || e.ctrlKey) && e.key === "p") {
        e.preventDefault();
        setActiveView("preview");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
    if (!sidebarCollapsed) {
      setSidebarWidth(MIN_SIDEBAR_WIDTH);
    } else {
      setSidebarWidth(DEFAULT_SIDEBAR_WIDTH);
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Modern Header Bar */}
      <div className="h-12 px-4 flex items-center justify-between border-b bg-gradient-to-r from-background to-background/95 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Tabs
            value={activeView}
            onValueChange={(value) => setActiveView(value as "editor" | "preview")}
            className="h-full"
          >
            <TabsList className="h-8 bg-muted/50 p-1 gap-1">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className={cn(
                    "h-full px-3 gap-2 text-sm font-medium transition-all",
                    "data-[state=active]:bg-background data-[state=active]:shadow-sm",
                    "data-[state=active]:border data-[state=active]:border-border/50"
                  )}
                >
                  <div className="flex items-center gap-2">
                    {tab.icon}
                    <span>{tab.label}</span>
                    {tab.badge && (
                      <Badge 
                        variant="outline" 
                        className="h-4 px-1 text-[10px] font-normal border-primary/20 text-primary"
                      >
                        {tab.badge}
                      </Badge>
                    )}
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <Separator orientation="vertical" className="h-6" />

          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 hover:bg-accent"
                  onClick={handleSidebarToggle}
                >
                  {sidebarCollapsed ? (
                    <PanelLeft className="size-4" />
                  ) : (
                    <PanelLeftClose className="size-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-2 border-border/50 hover:border-border"
              >
                <FaGithub className="size-3.5" />
                <span className="text-sm">Export</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Export to GitHub</TooltipContent>
          </Tooltip>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 hover:bg-accent"
              >
                <Settings className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem className="gap-2">
                <Upload className="size-4" />
                Import Files
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2">
                <Download className="size-4" />
                Download Project
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2">
                <Share2 className="size-4" />
                Share Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {activeView === "editor" ? (
            <motion.div
              key="editor"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0"
            >
              <Allotment 
                defaultSizes={[sidebarCollapsed ? MIN_SIDEBAR_WIDTH : sidebarWidth, DEFAULT_MAIN_SIZE]}
                onChange={(sizes) => {
                  if (sizes[0] > MIN_SIDEBAR_WIDTH) {
                    setSidebarCollapsed(false);
                  }
                }}
              >
                <Allotment.Pane
                  snap
                  minSize={MIN_SIDEBAR_WIDTH}
                  maxSize={MAX_SIDEBAR_WIDTH}
                  preferredSize={sidebarCollapsed ? MIN_SIDEBAR_WIDTH : sidebarWidth}
                  className="relative"
                >
                  {/* Sidebar with gradient edge */}
                  <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-border/50 to-transparent z-10" />
                  <div className={cn(
                    "h-full overflow-hidden transition-all duration-300",
                    sidebarCollapsed 
                      ? "w-16 bg-sidebar/80 backdrop-blur-sm" 
                      : "w-full bg-sidebar/95 backdrop-blur-sm"
                  )}>
                    <FileExplorer 
                      projectId={projectId} 
                      collapsed={sidebarCollapsed}
                    />
                  </div>
                </Allotment.Pane>
                <Allotment.Pane>
                  {/* Editor with subtle background gradient */}
                  <div className="h-full bg-gradient-to-br from-background via-background to-primary/5">
                    <EditorView projectId={projectId} />
                  </div>
                </Allotment.Pane>
              </Allotment>
            </motion.div>
          ) : (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0"
            >
              {/* Modern Preview View */}
              <div className="h-full flex flex-col">
                {/* Preview Header */}
                <div className="h-12 px-4 flex items-center justify-between border-b bg-gradient-to-r from-background to-background/95">
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm font-semibold">Live Preview</h3>
                    <Badge variant="secondary" className="font-normal">
                      Responsive
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 gap-2"
                    >
                      <RefreshCw className="size-3.5" />
                      Refresh
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 gap-2"
                    >
                      <ExternalLink className="size-3.5" />
                      Open in New Tab
                    </Button>
                  </div>
                </div>

                {/* Preview Container */}
                <div className="flex-1 relative overflow-hidden bg-muted/20">
                  {/* Device Frame */}
                  <div className="absolute inset-4 md:inset-8 lg:inset-12 xl:inset-16 border-2 border-border/30 rounded-xl bg-background overflow-hidden shadow-2xl">
                    {/* Device Toolbar */}
                    <div className="h-8 border-b border-border/30 bg-muted/30 flex items-center justify-between px-3">
                      <div className="flex items-center gap-2">
                        <div className="size-2 rounded-full bg-red-400" />
                        <div className="size-2 rounded-full bg-yellow-400" />
                        <div className="size-2 rounded-full bg-green-400" />
                      </div>
                      <div className="text-xs text-muted-foreground">
                        kyra.dev
                      </div>
                      <div className="size-4" />
                    </div>

                    {/* Preview Content */}
                    <div className="h-[calc(100%-2rem)] overflow-auto p-4">
                      <div className="flex items-center justify-center h-full text-center">
                        <div className="space-y-4">
                          <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto">
                            <Eye className="size-6 text-primary" />
                          </div>
                          <h3 className="text-lg font-semibold">Live Preview</h3>
                          <p className="text-sm text-muted-foreground max-w-sm">
                            Your project preview will appear here. Switch to the editor tab to make changes.
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setActiveView("editor")}
                            className="mt-4"
                          >
                            <Code2 className="size-3.5 mr-2" />
                            Switch to Editor
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Preview Controls */}
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
                    <div className="flex items-center gap-2 bg-background/80 backdrop-blur-sm border border-border/50 rounded-full px-3 py-2 shadow-lg">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="size-8 rounded-full"
                      >
                        <Smartphone className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="size-8 rounded-full"
                      >
                        <Tablet className="size-4" />
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        className="size-8 rounded-full"
                      >
                        <Monitor className="size-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Status Bar */}
      <div className="h-8 border-t border-border/50 bg-sidebar/50 flex items-center justify-between px-3 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="size-2 rounded-full bg-green-500" />
            <span className="text-muted-foreground">Connected</span>
          </div>
          <Separator orientation="vertical" className="h-4" />
          <span className="text-muted-foreground">UTF-8</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-muted-foreground">Ln 1, Col 1</span>
          <Separator orientation="vertical" className="h-4" />
          <span className="text-muted-foreground">Spaces: 2</span>
        </div>
      </div>
    </div>
  );
};

