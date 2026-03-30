"use client";

import { useState, useEffect } from "react";
import { Plus, LogOut, CheckSquare, LayoutGrid, List, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TaskCard } from "./task-card";
import { TaskModal, type Task, type TaskStatus } from "./task-modal";
import { taskService } from "@/lib/api";

interface TaskDashboardProps {
  userEmail: string;
  onLogout: () => void;
}

export function TaskDashboard({ userEmail, onLogout }: TaskDashboardProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  // O tipo de todos já é PENDENTE, CONCLUIDA, etc...
  const [filterStatus, setFilterStatus] = useState<TaskStatus | "all">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const userName = userEmail.split("@")[0];

  useEffect(() => {
    async function fetchTasks() {
      try {
        setIsLoading(true);
        const data = await taskService.getTasks();
        setTasks(data); // Agora "data" já vem com os strings corretos do DB
      } catch (error) {
        console.error("Erro ao buscar tarefas", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchTasks();
  }, []);

  const handleSaveTask = async (taskData: Omit<Task, "id"> & { id?: string }) => {
    try {
      // Criação do objeto estrito, repassando o deadline
      // Como você já corrigiu a tipagem TaskStatus, "status" já vai chegar 100% certo!
      const payloadApi: any = {
        title: taskData.title,
        description: taskData.description,
        status: taskData.status,
        deadline: taskData.deadline
      };

      if (taskData.id) {
        // EDIÇÃO
        await taskService.updateTask(taskData.id, payloadApi);
        setTasks((prev) => prev.map((t) => (t.id === taskData.id ? { ...t, ...taskData } as Task : t)));
      } else {
        // CRIAÇÃO
        const newTaskInfo = await taskService.createTask(payloadApi);
        const newTaskForScreen: Task = {
          id: newTaskInfo.id || Date.now().toString(),
          title: newTaskInfo.title || taskData.title,
          description: newTaskInfo.description || taskData.description,
          status: newTaskInfo.status || taskData.status,
          deadline: newTaskInfo.deadline || taskData.deadline,
          attachments: newTaskInfo.attachments || []
        };

        setTasks((prev) => [newTaskForScreen, ...prev]);
      }
      setIsModalOpen(false);
    } catch (error: any) {
      if (error.response) {
        alert(`Erro 400 da API:\n${JSON.stringify(error.response.data)}`);
      }
      console.error("Erro ao salvar a tarefa", error);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await taskService.deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (error) {
      console.error("Erro ao deletar", error);
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const handleUploadAttachment = async (taskId: string, file: File) => {
    try {
      const updatedTask = await taskService.uploadAttachment(taskId, file);
      console.log("Resposta do upload:", updatedTask);

      // Recarrega as tarefas para pegar o novo attachmentName do banco
      const data = await taskService.getTasks();
      setTasks(data);
    } catch (error: any) {
      console.error("Erro ao fazer upload do anexo", error);
      alert("Erro ao enviar o arquivo para o backend: " + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteAttachment = async (taskId: string, attachmentId: string) => {
    try {
      await taskService.removeAttachment(attachmentId);
      // Atualiza localmente
      setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, attachments: t.attachments?.filter(a => a.id !== attachmentId) || [] } : t));
    } catch (error) {
      console.error("Erro ao remover o anexo", error);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "all" || task.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const statusCounts = {
    all: tasks.length,
    "PENDENTE": tasks.filter((t) => t.status === "PENDENTE").length,
    "EM_ANDAMENTO": tasks.filter((t) => t.status === "EM_ANDAMENTO").length,
    "CONCLUIDA": tasks.filter((t) => t.status === "CONCLUIDA").length,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Pode manter sua header sem problemas... */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
                <CheckSquare className="h-5 w-5 text-primary" />
              </div>
              <span className="font-semibold text-foreground hidden sm:block">Task Studio</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground hidden md:block">
                Olá, <span className="font-medium text-foreground">{userName}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={onLogout} className="text-muted-foreground hover:text-foreground hover:bg-secondary">
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Minhas Tarefas</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Gerencie e acompanhe o progresso das suas atividades
            </p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Nova Tarefa
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar tarefas..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 bg-input border-border text-foreground placeholder:text-muted-foreground" />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Atualização para os novos Tipos */}
            {(["all", "PENDENTE", "EM_ANDAMENTO", "CONCLUIDA"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${filterStatus === status ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}
              >
                {status === "all" && `Todas (${statusCounts.all})`}
                {status === "PENDENTE" && `Pendentes (${statusCounts["PENDENTE"]})`}
                {status === "EM_ANDAMENTO" && `Em Andamento (${statusCounts["EM_ANDAMENTO"]})`}
                {status === "CONCLUIDA" && `Concluídas (${statusCounts["CONCLUIDA"]})`}
              </button>
            ))}

            <div className="h-6 w-px bg-border mx-2 hidden lg:block" />

            <div className="flex items-center rounded-lg border border-border bg-input p-1">
              <button onClick={() => setViewMode("grid")} className={`p-1.5 rounded-md transition-colors ${viewMode === "grid" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button onClick={() => setViewMode("list")} className={`p-1.5 rounded-md transition-colors ${viewMode === "list" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {filteredTasks.length > 0 ? (
          <div className={viewMode === "grid" ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3" : "flex flex-col gap-3"}>
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
                onUploadAttachment={handleUploadAttachment}
                onDeleteAttachment={handleDeleteAttachment}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="p-4 rounded-full bg-secondary mb-4">
              <CheckSquare className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">Nenhuma tarefa encontrada</h3>
            <p className="text-muted-foreground text-sm max-w-sm">
              {searchQuery || filterStatus !== "all" ? "Tente ajustar os filtros ou a busca" : "Comece criando sua primeira tarefa clicando no botão acima"}
            </p>
          </div>
        )}
      </main>

      <TaskModal isOpen={isModalOpen} onClose={handleCloseModal} onSave={handleSaveTask} task={editingTask} />
    </div>
  );
}