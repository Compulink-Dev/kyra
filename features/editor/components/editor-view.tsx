import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Save, 
  RotateCw, 
  FileText, 
  FileImage, 
  FileCode, 
  FileArchive,
  Zap,
  FolderIcon,
  Download,
  Eye
} from "lucide-react";

import { useFile, useUpdateFile } from "@/features/projects/hooks/use-files";
import { CodeEditor } from "./code-editor";
import { useEditor } from "../hooks/use-editor";
import { TopNavigation } from "./top-navigation";
import { FileBreadcrumbs } from "./file-breadcrumbs";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";

const DEBOUNCE_MS = 1500;

const getFileIcon = (fileName: string) => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  const iconProps = { className: "size-4" };
  
  switch (extension) {
    case 'js':
    case 'jsx':
    case 'ts':
    case 'tsx':
      return <FileCode {...iconProps} />;
    case 'json':
    case 'yml':
    case 'yaml':
      return <FileText {...iconProps} />;
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'svg':
      return <FileImage {...iconProps} />;
    case 'zip':
    case 'tar':
    case 'gz':
      return <FileArchive {...iconProps} />;
    default:
      return <FileText {...iconProps} />;
  }
};

export const EditorView = ({ projectId }: { projectId: Id<"projects"> }) => {
  const { activeTabId } = useEditor(projectId);
  const activeFile = useFile(activeTabId);
  const updateFile = useUpdateFile();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const isActiveFileBinary = activeFile && activeFile.storageId;
  const isActiveFileText = activeFile && !activeFile.storageId;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [activeTabId]);

  const handleContentChange = (content: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setIsSaving(true);
    
    timeoutRef.current = setTimeout(() => {
      updateFile({ id: activeFile!._id, content });
      setIsSaving(false);
      setLastSaved(new Date());
    }, DEBOUNCE_MS);
  };

  const handleSaveNow = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      updateFile({ id: activeFile!._id, content: activeFile!.content || "" });
      setIsSaving(false);
      setLastSaved(new Date());
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-background to-muted/5">
      {/* Enhanced Top Navigation */}
      <div className="px-4 py-2 border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <TopNavigation projectId={projectId} />
          <div className="flex items-center gap-2">
            {activeFile && (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2">
                      {getFileIcon(activeFile.name)}
                      <span className="text-sm font-medium truncate max-w-[200px]">
                        {activeFile.name}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    {activeFile.name} • {activeFile.type}
                  </TooltipContent>
                </Tooltip>
                
                <div className="h-4 w-px bg-border mx-2" />
                
                <div className="flex items-center gap-2">
                  {isSaving ? (
                    <div className="flex items-center gap-2">
                      <div className="size-2 animate-pulse rounded-full bg-blue-500" />
                      <span className="text-xs text-muted-foreground">Saving...</span>
                    </div>
                  ) : lastSaved ? (
                    <div className="flex items-center gap-2">
                      <div className="size-2 rounded-full bg-green-500" />
                      <span className="text-xs text-muted-foreground">
                        Saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ) : null}
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-6"
                        onClick={handleSaveNow}
                        disabled={!isSaving}
                      >
                        <Save className="size-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Save now (⌘S)</TooltipContent>
                  </Tooltip>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* File Breadcrumbs */}
      {activeTabId && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 py-2 border-b border-border/30 bg-gradient-to-r from-accent/5 to-transparent"
        >
          <FileBreadcrumbs projectId={projectId} />
        </motion.div>
      )}

      {/* Main Editor Area */}
      <div className="flex-1 min-h-0 relative">
        <AnimatePresence mode="wait">
          {!activeFile ? (
            <motion.div
              key="empty-state"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="size-full flex flex-col items-center justify-center p-8"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 blur-3xl rounded-full" />
                <Image
                  src="/logo-alt.svg"
                  alt="Kyra"
                  width={80}
                  height={80}
                  className="relative z-10 opacity-50"
                />
              </div>
              <div className="mt-8 text-center max-w-sm">
                <h3 className="text-lg font-semibold mb-2">No file selected</h3>
                <p className="text-sm text-muted-foreground">
                  Select a file from the sidebar or create a new one to start editing
                </p>
                <div className="mt-6 flex items-center justify-center gap-4">
                  <Button variant="outline" size="sm" className="gap-2">
                    <FileText className="size-4" />
                    New File
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <FolderIcon className="size-4" />
                    New Folder
                  </Button>
                </div>
              </div>
            </motion.div>
          ) : isActiveFileText ? (
            <motion.div
              key="editor"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
            >
              <CodeEditor
                key={activeFile._id}
                fileName={activeFile.name}
                initialValue={activeFile.content}
                onChange={handleContentChange}
              />
            </motion.div>
          ) : isActiveFileBinary ? (
            <motion.div
              key="binary-preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center p-8"
            >
              <div className="max-w-md text-center">
                <div className="size-20 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center mx-auto mb-6">
                  <FileImage className="size-10 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Binary File Preview</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  This file contains binary data and cannot be edited in the text editor.
                  Download it to view the complete contents.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <Button variant="outline" className="gap-2">
                    <Download className="size-4" />
                    Download File
                  </Button>
                  <Button variant="ghost" className="gap-2">
                    <Eye className="size-4" />
                    Quick View
                  </Button>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* Editor Status Bar */}
      {activeFile && (
        <div className="h-8 border-t border-border/50 bg-background/50 backdrop-blur-sm flex items-center justify-between px-4 text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="size-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-muted-foreground">Auto-save enabled</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 cursor-help">
                  <Zap className="size-3 text-yellow-500" />
                  <span className="text-muted-foreground">AI Assistant</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                AI-powered code suggestions available
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">UTF-8</span>
              <Badge variant="outline" className="font-normal px-2 py-0">
                {activeFile.type === 'file' ? 'Text' : 'Binary'}
              </Badge>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="text-muted-foreground">Ln 1, Col 1 • Spaces: 2</div>
          </div>
        </div>
      )}
    </div>
  );
};