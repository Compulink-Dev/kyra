import { useState } from "react";
import { ChevronRight, FileText, Folder, MoreVertical } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { cn } from "@/lib/utils";

import {
  useCreateFile,
  useCreateFolder,
  useFolderContents,
  useRenameFile,
  useDeleteFile,
} from "@/features/projects/hooks/use-files";
import { useEditor } from "@/features/editor/hooks/use-editor";

import { CreateInput } from "./create-input";
import { RenameInput } from "./rename-input";
import { TreeItemWrapper } from "./tree-item-wrapper";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { LoadingRow } from "./loading-row";

export const Tree = ({
  item,
  level = 0,
  projectId,
  viewMode = "list",
}: {
  item: Doc<"files">;
  level?: number;
  projectId: Id<"projects">;
  viewMode?: "list" | "grid";
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [creating, setCreating] = useState<"file" | "folder" | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const renameFile = useRenameFile();
  const deleteFile = useDeleteFile();
  const createFile = useCreateFile();
  const createFolder = useCreateFolder();

  const { openFile, closeTab, activeTabId } = useEditor(projectId);

  const folderContents = useFolderContents({
    projectId,
    parentId: item._id,
    enabled: item.type === "folder" && isOpen,
  });

  const handleRename = (newName: string) => {
    setIsRenaming(false);
    if (newName === item.name) return;
    renameFile({ id: item._id, newName });
  };

  const handleCreate = (name: string) => {
    setCreating(null);
    if (creating === "file") {
      createFile({
        projectId,
        name,
        content: "",
        parentId: item._id,
      });
    } else {
      createFolder({
        projectId,
        name,
        parentId: item._id,
      });
    }
  };

  const startCreating = (type: "file" | "folder") => {
    setIsOpen(true);
    setCreating(type);
  };

  if (item.type === "file") {
    const fileName = item.name;
    const isActive = activeTabId === item._id;

    if (isRenaming) {
      return (
        <RenameInput
          type="file"
          defaultValue={fileName}
          level={level}
          onSubmit={handleRename}
          onCancel={() => setIsRenaming(false)}
        />
      );
    }

    return (
      <motion.div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <TreeItemWrapper
          item={item}
          level={level}
          isActive={isActive}
          isHovered={isHovered}
          onClick={() => openFile(item._id, { pinned: false })}
          onDoubleClick={() => openFile(item._id, { pinned: true })}
          onRename={() => setIsRenaming(true)}
          onDelete={() => {
            closeTab(item._id);
            deleteFile({ id: item._id });
          }}
        >
          <div className="flex items-center gap-2">
            <div className={cn(
              "size-5 rounded flex items-center justify-center",
              isActive ? "bg-primary/20" : "bg-accent/20"
            )}>
              <FileText className={cn(
                "size-3.5",
                isActive ? "text-primary" : "text-muted-foreground"
              )} />
            </div>
            <span className="text-sm truncate">{fileName}</span>
          </div>
        </TreeItemWrapper>
      </motion.div>
    );
  }

  const folderName = item.name;

  if (isRenaming) {
    return (
      <RenameInput
        type="folder"
        defaultValue={folderName}
        isOpen={isOpen}
        level={level}
        onSubmit={handleRename}
        onCancel={() => setIsRenaming(false)}
      />
    );
  }

  return (
    <div>
      <motion.div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <TreeItemWrapper
          item={item}
          level={level}
          isHovered={isHovered}
          onClick={() => setIsOpen(value => !value)}
          onRename={() => setIsRenaming(true)}
          onDelete={() => deleteFile({ id: item._id })}
          onCreateFile={() => startCreating("file")}
          onCreateFolder={() => startCreating("folder")}
        >
          <div className="flex items-center gap-2">
            <div className={cn(
              "size-5 rounded flex items-center justify-center transition-transform",
              isOpen && "rotate-90",
              isHovered ? "bg-accent/30" : "bg-accent/10"
            )}>
              <ChevronRight className="size-3.5 text-muted-foreground" />
            </div>
            <div className="size-5 rounded flex items-center justify-center bg-blue-500/10">
              <Folder className="size-3.5 text-blue-500" />
            </div>
            <span className="text-sm font-medium truncate">{folderName}</span>
            {folderContents && (
              <span className="text-xs text-muted-foreground ml-auto">
                {folderContents.length}
              </span>
            )}
          </div>
        </TreeItemWrapper>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden ml-6 border-l border-border/30"
          >
            {creating && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <CreateInput
                  type={creating}
                  level={level + 1}
                  onSubmit={handleCreate}
                  onCancel={() => setCreating(null)}
                />
              </motion.div>
            )}
            
            {folderContents === undefined ? (
              <LoadingRow level={level + 1} />
            ) : (
              folderContents.map((subItem) => (
                <Tree
                  key={subItem._id}
                  item={subItem}
                  level={level + 1}
                  projectId={projectId}
                  viewMode={viewMode}
                />
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};