"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { 
  CloudCheck, 
  Loader2, 
  Edit2, 
  Check, 
  X, 
  Folder,
  Save,
  UploadCloud,
  AlertCircle
} from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { Poppins } from "next/font/google";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { Id } from "@/convex/_generated/dataModel";
import { useProject, useRenameProject } from "../hooks/use-projects";

const font = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const Navbar = ({ projectId }: { projectId: Id<"projects"> }) => {
  const project = useProject(projectId);
  const renameProject = useRenameProject();

  const [isRenaming, setIsRenaming] = useState(false);
  const [name, setName] = useState("");
  const [isHoveringProject, setIsHoveringProject] = useState(false);

  const handleStartRename = () => {
    if (!project) return;
    setName(project.name);
    setIsRenaming(true);
  };

  const handleSubmit = () => {
    if (!project) return;
    setIsRenaming(false);

    const trimmedName = name.trim();
    if (!trimmedName || trimmedName === project.name) return;

    renameProject({ id: projectId, name: trimmedName });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    } else if (e.key === "Escape") {
      setIsRenaming(false);
      setName(project?.name || "");
    }
  };

  const getStatusIcon = () => {
    if (!project) return null;
    
    switch (project.importStatus) {
      case "importing":
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2">
                <Loader2 className="size-4 text-blue-500 animate-spin" />
                <span className="text-xs text-blue-500">Importing</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>Importing from GitHub...</TooltipContent>
          </Tooltip>
        );
      case "failed":
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2">
                <AlertCircle className="size-4 text-destructive" />
                <span className="text-xs text-destructive">Import Failed</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>Failed to import project</TooltipContent>
          </Tooltip>
        );
      default:
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2">
                <CloudCheck className="size-4 text-green-500" />
                <span className="text-xs text-muted-foreground">
                  Saved{" "}
                  {project.updatedAt
                    ? formatDistanceToNow(project.updatedAt, { addSuffix: true })
                    : "just now"}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              Auto-save enabled • Last saved{" "}
              {project.updatedAt
                ? formatDistanceToNow(project.updatedAt, { addSuffix: true })
                : "just now"}
            </TooltipContent>
          </Tooltip>
        );
    }
  };

  return (
    <nav className="flex justify-between items-center px-4 py-3 bg-gradient-to-r from-background via-background to-background/95 backdrop-blur-sm border-b border-border/50 shadow-sm">
      {/* Left Section - Navigation */}
      <div className="flex items-center gap-4">
        {/* Logo & Home */}
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="gap-2 px-3 h-8 rounded-lg hover:bg-accent/30"
          >
            <Link href="/">
              <div className="relative">
                <Image 
                  src="/logo.svg" 
                  alt="Kyra" 
                  width={80} 
                  height={80}
                  className="drop-shadow-sm"
                />
                <motion.div
                  className="absolute inset-0 bg-primary/10 rounded-full blur"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
            </Link>
          </Button>
        </motion.div>

        <Separator orientation="vertical" className="h-6" />

        {/* Project Breadcrumb */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Folder className="size-4 text-primary" />
            <Breadcrumb>
              <BreadcrumbList className="flex items-center gap-1">
                <BreadcrumbItem>
                  {isRenaming ? (
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="relative"
                    >
                      <div className="flex items-center gap-2">
                        <Input
                          autoFocus
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          onBlur={handleSubmit}
                          onKeyDown={handleKeyDown}
                          className="h-7 w-64 text-sm bg-background border-border/50 focus:border-primary"
                          placeholder="Project name"
                        />
                        <div className="flex items-center gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="size-6"
                            onClick={handleSubmit}
                          >
                            <Check className="size-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="size-6"
                            onClick={() => {
                              setIsRenaming(false);
                              setName(project?.name || "");
                            }}
                          >
                            <X className="size-3.5" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <div
                      onMouseEnter={() => setIsHoveringProject(true)}
                      onMouseLeave={() => setIsHoveringProject(false)}
                      className="relative group"
                    >
                      <BreadcrumbPage
                        onClick={handleStartRename}
                        className={cn(
                          "text-sm font-semibold cursor-pointer transition-all",
                          "px-3 py-1 rounded-lg",
                          "hover:bg-accent/30 hover:text-primary",
                          "flex items-center gap-2"
                        )}
                      >
                        {project?.name ?? (
                          <div className="flex items-center gap-2">
                            <div className="size-2 rounded-full bg-muted animate-pulse" />
                            <span className="text-muted-foreground">Loading...</span>
                          </div>
                        )}
                        <AnimatePresence>
                          {isHoveringProject && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                            >
                              <Edit2 className="size-3.5 text-muted-foreground" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </BreadcrumbPage>
                    </div>
                  )}
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Project Status */}
          <div className="flex items-center gap-2">
            {getStatusIcon()}
          </div>
        </div>
      </div>

      {/* Right Section - Actions & User */}
      <div className="flex items-center gap-3">
        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 rounded-lg hover:bg-accent/30"
              >
                <Save className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Save project (⌘S)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 rounded-lg hover:bg-accent/30"
              >
                <UploadCloud className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Deploy to cloud</TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="h-6" />
        </div>

        {/* User Area */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-xs text-muted-foreground">Active</span>
            <div className="flex items-center gap-1.5">
              <div className="size-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-medium">
                {project?.name ? `${project.name.slice(0, 12)}...` : "Project"}
              </span>
            </div>
          </div>
          
          <div className="relative">
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: "size-8 border-2 border-primary/20",
                }
              }}
            />
            <motion.div
              className="absolute inset-0 rounded-full bg-primary/10 blur-md"
              animate={{ opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </div>
      </div>
    </nav>
  );
};