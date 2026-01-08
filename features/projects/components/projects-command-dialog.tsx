import { useRouter } from "next/navigation";
import { FaGithub } from "react-icons/fa";
import { AlertCircle, Globe, Loader2, ChevronRight, Settings, Github, Sparkles, Search } from "lucide-react";
import type { ComponentProps } from "react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

import { useProjects } from "../hooks/use-projects";
import { Doc } from "@/convex/_generated/dataModel";
import { Kbd } from "@/components/ui/kbd";

type ProjectsCommandDialogProps = ComponentProps<typeof CommandDialog>;

const getProjectIcon = (project: Doc<"projects">) => {
  if (project.importStatus === "completed") {
    return <FaGithub className="size-4 text-muted-foreground" />;
  }

  if (project.importStatus === "failed") {
    return <AlertCircle className="size-4 text-destructive" />;
  }

  if (project.importStatus === "importing") {
    return (
      <Loader2 className="size-4 text-muted-foreground animate-spin" />
    );
  }

  return <Globe className="size-4 text-muted-foreground" />;
};

export const ProjectsCommandDialog = ({
  open,
  onOpenChange,
}: ProjectsCommandDialogProps) => {
  const router = useRouter();
  const projects = useProjects();

  const handleSelect = (projectId: string) => {
    router.push(`/projects/${projectId}`);
    onOpenChange?.(false);
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      className="rounded-lg border shadow-xl"
    >
      <div className="flex items-center border-b px-3">
        <Search className="size-4 text-muted-foreground mr-2" />
        <CommandInput 
          placeholder="Search projects, commands..." 
          className="border-0 focus:ring-0"
        />
      </div>
      <CommandList className="max-h-[400px]">
        <CommandEmpty className="py-6 text-center text-muted-foreground">
          No projects found. Try creating a new one.
        </CommandEmpty>
        
        <CommandGroup heading="Recent Projects">
          {projects?.slice(0, 5).map((project) => (
            <CommandItem
              key={project._id}
              value={`${project.name}-${project._id}`}
              onSelect={() => handleSelect(project._id)}
              className="flex items-center justify-between gap-2 py-3"
            >
              <div className="flex items-center gap-3">
                {getProjectIcon(project)}
                <span className="truncate">{project.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <ChevronRight className="size-4 text-muted-foreground" />
              </div>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Quick Actions">
          <CommandItem 
            onSelect={() => {
              // TODO: Call create project function here
              onOpenChange?.(false);
            }}
            className="py-3"
          >
            <Sparkles className="size-4 mr-3" />
            <span>Create New Project</span>
          </CommandItem>
          <CommandItem onSelect={() => {}} className="py-3">
            <Github className="size-4 mr-3" />
            <span>Import from GitHub</span>
          </CommandItem>
          <CommandItem onSelect={() => router.push('/settings')} className="py-3">
            <Settings className="size-4 mr-3" />
            <span>Open Settings</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
      
      <div className="border-t px-3 py-2 text-xs text-muted-foreground flex items-center justify-between">
        <span>Press Esc to close</span>
        <div className="flex items-center gap-2">
          <Kbd className="">↑↓</Kbd>
          <span>to navigate</span>
          <Kbd className="">↵</Kbd>
          <span>to select</span>
        </div>
      </div>
    </CommandDialog>
  );
};