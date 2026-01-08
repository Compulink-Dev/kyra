"use client";

import { Sparkles, Github, Search, Clock, FolderOpen, Moon, Sun, Settings } from "lucide-react";
import {
  adjectives,
  animals,
  colors,
  uniqueNamesGenerator,
} from "unique-names-generator";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { ProjectsList } from "./projects-list";
import { useCreateProject } from "../hooks/use-projects";
import { ProjectsCommandDialog } from "./projects-command-dialog";
import Image from "next/image";

export const ProjectsView = () => {
  const createProject = useCreateProject();
  const [commandDialogOpen, setCommandDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Handle mounting without useEffect
  if (typeof window !== "undefined" && !mounted) {
    setMounted(true);
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandDialogOpen(true);
      }
      // Add theme toggle shortcut (Ctrl/Cmd + T)
      if ((e.metaKey || e.ctrlKey) && e.key === "t") {
        e.preventDefault();
        setTheme(theme === "dark" ? "light" : "dark");
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [theme, setTheme]);

  const handleCreateProject = () => {
    setIsCreating(true);
    const projectName = uniqueNamesGenerator({
      dictionaries: [adjectives, animals, colors],
      separator: "-",
      length: 3,
    });

    createProject({
      name: projectName,
    });

    setTimeout(() => setIsCreating(false), 1000);
  };

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="size-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <>
      <ProjectsCommandDialog
        open={commandDialogOpen}
        onOpenChange={setCommandDialogOpen}
      />
      <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/20 flex flex-col items-center justify-center p-4">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/5 rounded-full blur-3xl" />
        </div>

        <div className="relative w-full max-w-2xl mx-auto flex flex-col gap-4 items-center z-10">
          {/* Theme switcher and settings dropdown */}
          <div className="absolute top-0 right-0 flex items-center gap-2 p-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8 rounded-full"
                >
                  <Settings className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">Theme</p>
                  <p className="text-xs text-muted-foreground">
                    Choose your preferred theme
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setTheme("light")}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Sun className="size-4" />
                    <span>Light</span>
                  </div>
                  {theme === "light" && (
                    <div className="size-2 rounded-full bg-primary" />
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setTheme("dark")}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Moon className="size-4" />
                    <span>Dark</span>
                  </div>
                  {theme === "dark" && (
                    <div className="size-2 rounded-full bg-primary" />
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setTheme("system")}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Settings className="size-4" />
                    <span>System</span>
                  </div>
                  {theme === "system" && (
                    <div className="size-2 rounded-full bg-primary" />
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <div className="px-2 py-1.5 text-xs text-muted-foreground">
                  Press <Kbd className="inline-flex">⌘T</Kbd> to toggle theme
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Quick theme toggle button */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className="size-8 rounded-full"
              title={`Switch to ${isDark ? "light" : "dark"} mode`}
            >
              {isDark ? (
                <Sun className="size-4" />
              ) : (
                <Moon className="size-4" />
              )}
            </Button>
          </div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-4 w-full"
          >
            <div className="flex flex-col items-center gap-4 group/logo">
              <motion.div
                whileHover={{ rotate: 15, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="relative"
              >
                {/* Logo based on theme */}
                <Image
                  src={isDark ? "/logo.svg" : "/black.svg"}
                  alt="Kyra"
                  width={100}
                  height={100}
                  className="size-24 md:size-32 transition-all duration-300 group-hover/logo:drop-shadow-lg"
                  priority
                />
                {/* Animated glow effect */}
                <motion.div
                  className="absolute inset-0 bg-primary/10 rounded-full blur-xl -z-10"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </motion.div>
            </div>
            
            <p className="text-muted-foreground text-center max-w-md text-sm md:text-base">
              Build, collaborate, and deploy your projects with Kyra AI
            </p>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full"
          >
            <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Sparkles className="size-5 text-primary" />
                  </div>
                  <Kbd className="bg-muted">⌘J</Kbd>
                </div>
                <h4 className="font-semibold mb-2">New Project</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Start a new project
                </p>
                <Button
                  onClick={handleCreateProject}
                  disabled={isCreating}
                  className="w-full group-hover:scale-[1.02] transition-transform"
                  size="sm"
                >
                  {isCreating ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="mr-2"
                      >
                        <Sparkles className="size-4" />
                      </motion.div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-4 mr-2" />
                      Create Project
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Github className="size-5 text-blue-500" />
                  </div>
                  <Kbd className="bg-muted">⌘I</Kbd>
                </div>
                <h4 className="font-semibold mb-2">GitHub Import</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Bring existing projects
                </p>
                <Button
                  variant="outline"
                  className="w-full group-hover:scale-[1.02] transition-transform"
                  size="sm"
                >
                  <Github className="size-4 mr-2" />
                  Import Project
                </Button>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <Search className="size-5 text-purple-500" />
                  </div>
                  <Kbd className="bg-muted">⌘K</Kbd>
                </div>
                <h4 className="font-semibold mb-2">Search</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Find any project
                </p>
                <Button
                  variant="outline"
                  onClick={() => setCommandDialogOpen(true)}
                  className="w-full group-hover:scale-[1.02] transition-transform"
                  size="sm"
                >
                  <Search className="size-4 mr-2" />
                  Quick Search
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Projects List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full"
          >
            <ProjectsList onViewAll={() => setCommandDialogOpen(true)} />
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-4 text-sm text-muted-foreground"
          >
            <div className="flex items-center gap-2">
              <Clock className="size-4" />
              <span>Auto-save enabled</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-2">
              <FolderOpen className="size-4" />
              <span>Unlimited projects</span>
            </div>
          </motion.div>

          {/* Theme hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xs text-muted-foreground mt-4"
          >
            <div className="flex items-center gap-2">
              <span>Current theme: {theme}</span>
              <div className="size-1 rounded-full bg-current" />
              <span>
                Press <Kbd className="inline-flex">⌘T</Kbd> to toggle
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};