"use client";

import { useRef } from "react";
import { Calendar, Paperclip, Pencil, Trash2, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { Task, TaskStatus } from "./task-modal";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onUploadAttachment?: (taskId: string, file: File) => void;
  onDeleteAttachment?: (taskId: string, attachmentId: string) => void;
}

const statusConfig: Record<TaskStatus, { label: string; className: string }> = {

  "PENDENTE": {
    label: "Pendente",
    className: "bg-warning/10 text-warning border border-warning/20",
  },
  "EM_ANDAMENTO": {
    label: "Em Andamento",
    className: "bg-info/10 text-info border border-info/20",
  },
  "CONCLUIDA": {
    label: "Concluída",
    className: "bg-success/10 text-success border border-success/20",
  },
};

export function TaskCard({ task, onEdit, onDelete, onUploadAttachment, onDeleteAttachment }: TaskCardProps) {
  const status = statusConfig[task.status];
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatDate = (dateString: string) => {
    if (!dateString) return "Sem data";

    const safeDateString = dateString.includes('T') ? dateString : `${dateString}T00:00:00`;

    const date = new Date(safeDateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "UTC"
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUploadAttachment) {
      onUploadAttachment(task.id, file);
    }
  };

  const hasAttachment = task.attachments && task.attachments.length > 0;
  const currentAttachment = hasAttachment ? task.attachments![0] : null;

  const isImage = currentAttachment?.filename?.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) != null;
  const fileUrl = currentAttachment ? `http://localhost:3001${currentAttachment.url}` : "#";

  return (
    <Card className="group bg-card border-border hover:border-primary/30 transition-all duration-200 overflow-hidden flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold text-card-foreground line-clamp-1 flex-1">
            {task.title}
          </h3>
          <span className={`px-2.5 py-1 text-xs font-medium rounded-full shrink-0 ${status.className}`}>
            {status.label}
          </span>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4 flex flex-col flex-1">
        {task.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {task.description}
          </p>
        )}

        <div className="mt-auto pt-2">
          {hasAttachment && currentAttachment ? (
            <div className="relative group/attachment mb-3">
              {isImage ? (
                <div className="relative rounded-lg overflow-hidden border border-border bg-secondary/50">
                  <a href={fileUrl} target="_blank" rel="noreferrer noopener" className="block relative">
                    <img
                      src={fileUrl}
                      alt={currentAttachment.filename}
                      className="w-full h-32 object-cover hover:opacity-80 transition-opacity"
                    />
                  </a>
                  <div className="absolute inset-0 bg-background/60 opacity-0 group-hover/attachment:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDeleteAttachment?.(task.id, currentAttachment.id); }}
                      className="p-1.5 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 pointer-events-auto"
                      title="Remover anexo"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-2 rounded-lg border border-border bg-secondary/30 relative">
                  <a href={fileUrl} target="_blank" rel="noreferrer noopener" className="flex items-center gap-3 flex-1 overflow-hidden hover:opacity-80">
                    <div className="p-2 rounded-md bg-primary/10 shrink-0">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm text-foreground truncate flex-1" title={currentAttachment.filename}>
                      {currentAttachment.filename}
                    </span>
                  </a>
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDeleteAttachment?.(task.id, currentAttachment.id); }}
                    className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
                    title="Remover anexo"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="mb-3">
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
              />
              <button
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                className="w-full flex items-center justify-center gap-2 p-2 rounded-lg border border-dashed border-border text-muted-foreground hover:border-primary/50 hover:text-foreground hover:bg-secondary/30 transition-colors"
                title="Adicionar anexo"
              >
                <Paperclip className="h-4 w-4" />
                <span className="text-xs">Adicionar anexo</span>
              </button>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>{formatDate(task.deadline)}</span>
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => { e.stopPropagation(); onEdit(task); }}
                className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary"
              >
                <Pencil className="h-3.5 w-3.5" />
                <span className="sr-only">Editar tarefa</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span className="sr-only">Excluir tarefa</span>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
