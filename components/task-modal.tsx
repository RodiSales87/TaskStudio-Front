"use client";

import { useState, useEffect } from "react";
import { X, Upload, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type TaskStatus = "PENDENTE" | "EM_ANDAMENTO" | "CONCLUIDA";

export interface Attachment {
  id: string;
  filename: string;
  url: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  deadline: string;
  status: TaskStatus;
  attachments?: Attachment[];
}

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, "id"> & { id?: string }) => void;
  task?: Task | null;
}

export function TaskModal({ isOpen, onClose, onSave, task }: TaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setdeadline] = useState("");
  const [status, setStatus] = useState<TaskStatus>("PENDENTE");

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);

      // Extrai apenas a parte "YYYY-MM-DD" cortando pelo 'T'
      const formattedDateForInput = task.deadline && task.deadline.includes('T')
        ? task.deadline.split('T')[0]
        : task.deadline;

      setdeadline(formattedDateForInput);
      setStatus(task.status);
    } else {
      // Form de nova tarefa limpo
      setTitle("");
      setDescription("");
      setdeadline("");
      setStatus("PENDENTE");
    }

  }, [task, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: task?.id,
      title,
      description,
      deadline,
      status,
      attachments: task?.attachments,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-lg mx-4 bg-card border border-border rounded-xl shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-card-foreground">
            {task ? "Editar Tarefa" : "Nova Tarefa"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium text-foreground">
              Título
            </label>
            <Input
              id="title"
              placeholder="Digite o título da tarefa"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-input border-border text-foreground placeholder:text-muted-foreground"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium text-foreground">
              Descrição
            </label>
            <Textarea
              id="description"
              placeholder="Descreva os detalhes da tarefa"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-input border-border text-foreground placeholder:text-muted-foreground min-h-[100px] resize-none"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="deadline" className="text-sm font-medium text-foreground">
                Data Limite
              </label>
              <Input
                id="deadline"
                type="date"
                value={deadline}
                onChange={(e) => setdeadline(e.target.value)}
                className="bg-input border-border text-foreground"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-medium text-foreground">
                Status
              </label>
              <Select value={status} onValueChange={(value: TaskStatus) => setStatus(value)}>
                <SelectTrigger className="bg-input border-border text-foreground">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="PENDENTE">Pendente</SelectItem>
                  <SelectItem value="EM_ANDAMENTO">Em Andamento</SelectItem>
                  <SelectItem value="CONCLUIDA">Concluída</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-border text-foreground hover:bg-secondary"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {task ? "Salvar Alterações" : "Criar Tarefa"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
