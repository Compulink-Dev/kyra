import { useState } from "react";
import {
  ChevronRight,
  FilePlus,
  FolderPlus,
  Minimize2,
  Maximize2,
  Search,
  Filter,
  Grid,
  List
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { useProject } from "../../hooks/use-projects";
import { Id } from "@/convex/_generated/dataModel";
import {
  useCreateFile,
  useCreateFolder,
  useFolderContents,
} from "../../hooks/use-files";
import { CreateInput } from "./create-input";
import { LoadingRow } from "./loading-row";
import { Tree } from "./tree";

export const FileExplorer = ({ 
  projectId, 
  collapsed = false 
}: { 
  projectId: Id<"projects">;
  collapsed?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [collapseKey, setCollapseKey] = useState(0);
  const [creating, setCreating] = useState<"file" | "folder" | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const project = useProject(projectId);
  const rootFiles = useFolderContents({
    projectId,
    enabled: isOpen,
  });

  const createFile = useCreateFile();
  const createFolder = useCreateFolder();
  
  const handleCreate = (name: string) => {
    setCreating(null);

    if (creating === "file") {
      createFile({
        projectId,
        name,
        content: "",
        parentId: undefined,
      });
    } else {
      createFolder({
        projectId,
        name,
        parentId: undefined,
      });
    }
  };

  const filteredFiles = rootFiles?.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (collapsed) {
    return (
      <div className="h-full flex flex-col items-center py-4 space-y-2 bg-sidebar/95 backdrop-blur-sm">
        <Button
          variant="ghost"
          size="icon"
          className="size-10"
          onClick={() => setIsOpen(!isOpen)}
        >
          <ChevronRight className={cn(
            "size-4 transition-transform",
            isOpen && "rotate-90"
          )} />
        </Button>
        <Separator className="w-8" />
        <Button
          variant="ghost"
          size="icon"
          className="size-10"
          onClick={() => setCreating("file")}
        >
          <FilePlus className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-10"
          onClick={() => setCreating("folder")}
        >
          <FolderPlus className="size-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-sidebar to-sidebar/80 backdrop-blur-sm">
      {/* Explorer Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm">EXPLORER</h3>
            <Badge variant="secondary" className="font-normal">
              {filteredFiles?.length || 0}
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="size-6"
              onClick={() => setViewMode(viewMode === "list" ? "grid" : "list")}
            >
              {viewMode === "list" ? (
                <Grid className="size-3.5" />
              ) : (
                <List className="size-3.5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-6"
              onClick={(e) => {
                e.stopPropagation();
                setCollapseKey(prev => prev + 1);
              }}
            >
              <Minimize2 className="size-3.5" />
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-sm bg-background/50 border-border/50"
          />
        </div>
      </div>

      {/* Project Header */}
      <div className="px-4 py-2 border-b border-border/30 bg-gradient-to-r from-accent/10 to-transparent">
        <div
          role="button"
          onClick={() => setIsOpen(value => !value)}
          className="group flex items-center gap-2 cursor-pointer"
        >
          <ChevronRight
            className={cn(
              "size-4 transition-transform duration-200 text-muted-foreground",
              isOpen && "rotate-90"
            )}
          />
          <div className="flex items-center gap-2 flex-1">
            <div className="size-6 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
              <FolderIcon className="size-3.5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-sm truncate">
                {project?.name ?? "Loading..."}
              </p>
              <p className="text-xs text-muted-foreground">
                {filteredFiles?.length || 0} items
              </p>
            </div>
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="size-6"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(true);
                setCreating("file");
              }}
            >
              <FilePlus className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-6"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(true);
                setCreating("folder");
              }}
            >
              <FolderPlus className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* File List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                {creating && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <CreateInput
                      type={creating}
                      level={0}
                      onSubmit={handleCreate}
                      onCancel={() => setCreating(null)}
                    />
                  </motion.div>
                )}
                
                {searchQuery && (
                  <div className="px-2 py-1.5 mb-2">
                    <p className="text-xs text-muted-foreground">
                      Search results for {searchQuery}
                    </p>
                  </div>
                )}
                
                {rootFiles === undefined ? (
                  <LoadingRow level={0} />
                ) : filteredFiles && filteredFiles.length > 0 ? (
                  filteredFiles.map((item, index) => (
                    <motion.div
                      key={`${item._id}-${collapseKey}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Tree
                        item={item}
                        level={0}
                        projectId={projectId}
                        viewMode={viewMode}
                      />
                    </motion.div>
                  ))
                ) : (
                  <div className="py-8 text-center">
                    <div className="size-12 rounded-xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
                      <FilePlus className="size-5 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {searchQuery ? "No files match your search" : "No files yet"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Create a new file to get started
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>

      {/* Status Bar */}
      <div className="h-6 border-t border-border/30 flex items-center justify-between px-3">
        <div className="flex items-center gap-2">
          <div className="size-1.5 rounded-full bg-green-500" />
          <span className="text-xs text-muted-foreground">Connected</span>
        </div>
        <div className="text-xs text-muted-foreground">
          {filteredFiles?.length || 0} files
        </div>
      </div>
    </div>
  );
};

// Add missing icon imports
import { 
  FolderIcon,
  Download,
  Eye,
  FolderPlus as FolderPlusIcon 
} from "lucide-react";