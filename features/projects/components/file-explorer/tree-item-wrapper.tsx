import { 
  FileText, 
  Folder, 
  Copy, 
  Trash2, 
  Edit, 
  FilePlus, 
  FolderPlus,
  Download,
  Share2,
  MoreVertical,
  ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  ContextMenu,
  ContextMenuItem,
  ContextMenuContent,
  ContextMenuTrigger,
  ContextMenuShortcut,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from "@/components/ui/context-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { getItemPadding } from "./constants";
import { Doc } from "@/convex/_generated/dataModel";

export const TreeItemWrapper = ({
  item,
  children,
  level,
  isActive,
  isHovered,
  onClick,
  onDoubleClick,
  onRename,
  onDelete,
  onCreateFile,
  onCreateFolder,
  onCopyPath,
  onDownload,
  onShare,
}: {
  item: Doc<"files">;
  children: React.ReactNode;
  level: number;
  isActive?: boolean;
  isHovered?: boolean;
  onClick?: () => void;
  onDoubleClick?: () => void;
  onRename?: () => void;
  onDelete?: () => void;
  onCreateFile?: () => void;
  onCreateFolder?: () => void;
  onCopyPath?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
}) => {
  const paddingLeft = getItemPadding(level, item.type === "file");

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <motion.button
          onClick={onClick}
          onDoubleClick={onDoubleClick}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onRename?.();
            }
          }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className={cn(
            "group relative flex items-center justify-between w-full h-10",
            "rounded-lg px-3 py-2",
            "outline-none transition-all duration-200",
            "hover:bg-gradient-to-r hover:from-accent/30 hover:to-accent/10",
            isActive && "bg-gradient-to-r from-primary/20 to-primary/10",
            isActive && "ring-1 ring-primary/20"
          )}
          style={{ paddingLeft: `calc(${paddingLeft}px + 0.5rem)` }}
        >
          {/* Background highlight effect */}
          <div className={cn(
            "absolute inset-0 rounded-lg transition-opacity",
            isActive && "bg-gradient-to-r from-primary/10 to-primary/5",
            !isActive && isHovered && "bg-accent/5"
          )} />

          {/* Left content */}
          <div className="relative z-10 flex items-center gap-3 flex-1 min-w-0">
            {children}
          </div>

          {/* Right actions - appear on hover */}
          <div className="relative z-10 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {/* Quick action dropdown for mobile/compact view */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="size-7 rounded flex items-center justify-center hover:bg-accent/30"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="size-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {item.type === "folder" && (
                  <>
                    <DropdownMenuItem 
                      onClick={onCreateFile}
                      className="gap-2"
                    >
                      <FilePlus className="size-4" />
                      New File
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={onCreateFolder}
                      className="gap-2"
                    >
                      <FolderPlus className="size-4" />
                      New Folder
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={onRename} className="gap-2">
                  <Edit className="size-4" />
                  Rename
                  <span className="ml-auto text-xs text-muted-foreground">Enter</span>
                </DropdownMenuItem>
                {onDownload && (
                  <DropdownMenuItem onClick={onDownload} className="gap-2">
                    <Download className="size-4" />
                    Download
                  </DropdownMenuItem>
                )}
                {onCopyPath && (
                  <DropdownMenuItem onClick={onCopyPath} className="gap-2">
                    <Copy className="size-4" />
                    Copy Path
                  </DropdownMenuItem>
                )}
                {onShare && (
                  <DropdownMenuItem onClick={onShare} className="gap-2">
                    <Share2 className="size-4" />
                    Share
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={onDelete}
                  className="gap-2 text-destructive focus:text-destructive"
                >
                  <Trash2 className="size-4" />
                  Delete
                  <span className="ml-auto text-xs text-muted-foreground">⌘⌫</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Status indicator */}
            {isActive && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="size-2 rounded-full bg-primary"
              />
            )}
          </div>

          {/* File type indicator */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r bg-transparent group-hover:bg-primary/30 transition-colors" />
        </motion.button>
      </ContextMenuTrigger>

      {/* Enhanced Context Menu */}
      <ContextMenuContent
        className="w-56 rounded-xl border bg-background/95 backdrop-blur-sm shadow-xl"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        {/* Header with file info */}
        <div className="px-2 py-1.5 border-b border-border/50">
          <div className="flex items-center gap-2">
            <div className={cn(
              "size-8 rounded-lg flex items-center justify-center",
              item.type === "file" 
                ? "bg-blue-500/10 text-blue-500" 
                : "bg-purple-500/10 text-purple-500"
            )}>
              {item.type === "file" ? (
                <FileText className="size-4" />
              ) : (
                <Folder className="size-4" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{item.name}</p>
              <p className="text-xs text-muted-foreground">
                {item.type === "file" ? "File" : "Folder"}
              </p>
            </div>
          </div>
        </div>

        {/* Main Actions */}
        <div className="py-1">
          {item.type === "folder" && (
            <>
              <ContextMenuItem 
                onClick={onCreateFile}
                className="gap-2 text-sm px-3 py-2"
              >
                <FilePlus className="size-4" />
                New File
                <ContextMenuShortcut>⌘N</ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuItem 
                onClick={onCreateFolder}
                className="gap-2 text-sm px-3 py-2"
              >
                <FolderPlus className="size-4" />
                New Folder
                <ContextMenuShortcut>⌘⇧N</ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuSeparator />
            </>
          )}

          <ContextMenuItem 
            onClick={onRename}
            className="gap-2 text-sm px-3 py-2"
          >
            <Edit className="size-4" />
            Rename
            <ContextMenuShortcut>Enter</ContextMenuShortcut>
          </ContextMenuItem>

          {onDownload && (
            <ContextMenuItem 
              onClick={onDownload}
              className="gap-2 text-sm px-3 py-2"
            >
              <Download className="size-4" />
              Download
              <ContextMenuShortcut>⌘D</ContextMenuShortcut>
            </ContextMenuItem>
          )}

          {onCopyPath && (
            <ContextMenuItem 
              onClick={onCopyPath}
              className="gap-2 text-sm px-3 py-2"
            >
              <Copy className="size-4" />
              Copy Path
              <ContextMenuShortcut>⌘⇧C</ContextMenuShortcut>
            </ContextMenuItem>
          )}

          {onShare && (
            <ContextMenuItem 
              onClick={onShare}
              className="gap-2 text-sm px-3 py-2"
            >
              <Share2 className="size-4" />
              Share
              <ContextMenuShortcut>⌘⇧S</ContextMenuShortcut>
            </ContextMenuItem>
          )}

          {/* Additional Actions Submenu */}
          <ContextMenuSub>
            <ContextMenuSubTrigger className="gap-2 text-sm px-3 py-2">
              <MoreVertical className="size-4" />
              More Actions
              <ChevronRight className="size-3 ml-auto" />
            </ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-48">
              <ContextMenuItem className="gap-2 text-sm">
                <Copy className="size-4" />
                Duplicate
              </ContextMenuItem>
              <ContextMenuItem className="gap-2 text-sm">
                <Copy className="size-4" />
                Copy to...
              </ContextMenuItem>
              <ContextMenuItem className="gap-2 text-sm">
                <FileText className="size-4" />
                Properties
              </ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
        </div>

        <ContextMenuSeparator />

        {/* Dangerous Actions Section */}
        <div className="py-1">
          <ContextMenuItem 
            onClick={onDelete}
            className="gap-2 text-sm px-3 py-2 text-destructive focus:text-destructive focus:bg-destructive/10"
          >
            <Trash2 className="size-4" />
            Delete Permanently
            <ContextMenuShortcut>⌘⌫</ContextMenuShortcut>
          </ContextMenuItem>
        </div>

        {/* Footer with additional info */}
        <div className="px-3 py-2 border-t border-border/50">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Last modified</span>
            <span>
              {new Date(item._creationTime).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
              })}
            </span>
          </div>
        </div>
      </ContextMenuContent>
    </ContextMenu>
  );
};

// Create a compact version for grid view
export const TreeItemCompact = ({
  item,
  isActive,
  onClick,
  onDoubleClick,
}: {
  item: Doc<"files">;
  isActive?: boolean;
  onClick?: () => void;
  onDoubleClick?: () => void;
}) => {
  return (
    <motion.button
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "group relative flex flex-col items-center justify-center",
        "w-20 h-20 rounded-xl p-3",
        "outline-none transition-all duration-200",
        "hover:bg-gradient-to-br hover:from-accent/20 hover:to-accent/10",
        isActive && "bg-gradient-to-br from-primary/20 to-primary/10",
        isActive && "ring-1 ring-primary/20"
      )}
    >
      {/* Background effect */}
      <div className={cn(
        "absolute inset-0 rounded-xl transition-opacity",
        isActive && "bg-gradient-to-br from-primary/10 to-primary/5",
        "group-hover:bg-accent/5"
      )} />

      {/* Icon */}
      <div className={cn(
        "relative z-10 size-10 rounded-lg flex items-center justify-center mb-2",
        item.type === "file" 
          ? "bg-blue-500/10 text-blue-500" 
          : "bg-purple-500/10 text-purple-500",
        "group-hover:scale-110 transition-transform"
      )}>
        {item.type === "file" ? (
          <FileText className="size-5" />
        ) : (
          <Folder className="size-5" />
        )}
      </div>

      {/* Name */}
      <div className="relative z-10 text-center">
        <p className="text-xs font-medium truncate max-w-[64px]">
          {item.name.split('.').slice(0, -1).join('.') || item.name}
        </p>
        {item.type === "file" && (
          <p className="text-[10px] text-muted-foreground mt-0.5">
            .{item.name.split('.').pop()}
          </p>
        )}
      </div>

      {/* Active indicator */}
      {isActive && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-2 right-2 size-2 rounded-full bg-primary ring-2 ring-background"
        />
      )}
    </motion.button>
  );
};