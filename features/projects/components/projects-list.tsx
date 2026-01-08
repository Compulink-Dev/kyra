import Link from "next/link";
import { FaGithub } from "react-icons/fa";
import { formatDistanceToNow } from "date-fns";
import {
  AlertCircle,
  ArrowRight,
  FolderOpen,
  Globe,
  Loader2,
  MoreVertical,
  Search,
} from "lucide-react";

import { Kbd } from "@/components/ui/kbd";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { Doc } from "@/convex/_generated/dataModel";
import { useProjectsPartial } from "../hooks/use-projects";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const formatTimestamp = (timestamp: number) => {
  return formatDistanceToNow(new Date(timestamp), {
    addSuffix: true,
  });
};

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

interface ProjectsListProps {
  onViewAll: () => void;
}

const ContinueCard = ({ data }: { data: Doc<"projects"> }) => {
  const initials = data.name
    .split(" ")
    .map(word => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-card to-card/50 shadow-sm"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <Button
        variant="ghost"
        asChild
        className="w-full h-auto p-6 flex flex-col items-start gap-4 hover:bg-transparent"
      >
        <Link href={`/projects/${data._id}`} className="group relative">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <Avatar className="size-10 border-2 border-background shadow-sm">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-2">
                  {getProjectIcon(data)}
                  <span className="font-semibold truncate">{data.name}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  Last edited {formatTimestamp(data.updatedAt)}
                </span>
              </div>
            </div>
            <ArrowRight className="size-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </Button>
    </div>
  );
};

const ProjectItem = ({ data }: { data: Doc<"projects"> }) => {
  const initials = data.name
    .split(" ")
    .map(word => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className="group relative"
    >
      <Link
        href={`/projects/${data._id}`}
        className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-accent/50 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative">
            <Avatar className="size-8">
              <AvatarFallback className="bg-muted">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1">
              {getProjectIcon(data)}
            </div>
          </div>
          <div className="min-w-0">
            <p className="font-medium truncate">{data.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatTimestamp(data.updatedAt)}
            </p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Star</DropdownMenuItem>
            <DropdownMenuItem>Rename</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Link>
    </div>
  );
};

export const ProjectsList = ({ onViewAll }: ProjectsListProps) => {
  const projects = useProjectsPartial(6);

  if (projects === undefined) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  const [mostRecent, ...rest] = projects;

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Your Projects</CardTitle>
            <CardDescription>
              Recent projects and workspaces
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onViewAll}
            className="gap-2 "
          >
            <Search className="size-4" />
            View All
            <Kbd className="bg-muted">⌘K</Kbd>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {mostRecent ? (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Continue Working
            </p>
            <ContinueCard data={mostRecent} />
          </div>
        ) : null}
        
        {rest.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Recent Projects
            </p>
            <div className="space-y-1">
              {rest.map((project, index) => (
                <div
                  key={project._id}
       
                >
                  <ProjectItem data={project} />
                </div>
              ))}
            </div>
          </div>
        )}

        {projects.length === 0 && (
          <div className="text-center py-8">
            <FolderOpen className="size-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No projects yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first project to get started
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};