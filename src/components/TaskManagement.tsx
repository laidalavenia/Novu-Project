import React, { useState, useEffect } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  AlertTriangle,
  AlertCircle,
  Info,
  Clock,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { cn } from "../lib/utils";
import { Task, TaskPriority } from "../types";
import { TaskService } from "../services/taskService";

interface TaskFormData {
  title: string;
  deadline: string;
  priority: TaskPriority;
}

export default function TaskManagement() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState<TaskFormData>({
    title: "",
    deadline: "",
    priority: "normal",
  });

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = () => {
    const allTasks = TaskService.getTasks();
    setTasks(allTasks);
  };

  const getPriorityIcon = (priority: TaskPriority) => {
    const icons = {
      urgent: <AlertTriangle className="w-4 h-4 text-red-500" />,
      high: <AlertCircle className="w-4 h-4 text-orange-500" />,
      normal: <Info className="w-4 h-4 text-blue-500" />,
    };
    return icons[priority];
  };

  const getPriorityBadgeVariant = (priority: TaskPriority) => {
    const variants = {
      urgent: "destructive",
      high: "secondary",
      normal: "default",
    } as const;
    return variants[priority];
  };

  const formatDeadline = (deadline: string) => {
    const date = new Date(deadline);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isTomorrow =
      new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString() ===
      date.toDateString();

    if (isToday) {
      return `Today ${date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    }
    if (isTomorrow) {
      return `Tomorrow ${date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    }
    return date.toLocaleDateString([], {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.deadline) return;

    if (editingTask) {
      // Update existing task
      TaskService.updateTask(editingTask.id, {
        title: formData.title.trim(),
        deadline: formData.deadline,
        priority: formData.priority,
      });
    } else {
      // Create new task
      TaskService.createTask({
        title: formData.title.trim(),
        deadline: formData.deadline,
        priority: formData.priority,
        completed: false,
      });
    }

    resetForm();
    loadTasks();
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      deadline: task.deadline,
      priority: task.priority,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (taskId: string) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      TaskService.deleteTask(taskId);
      loadTasks();
    }
  };

  const handleToggleComplete = (task: Task) => {
    TaskService.updateTask(task.id, { completed: !task.completed });
    loadTasks();
  };

  const resetForm = () => {
    setFormData({ title: "", deadline: "", priority: "normal" });
    setEditingTask(null);
    setIsDialogOpen(false);
  };

  const todayTasks = tasks.filter((task) => {
    const taskDate = new Date(task.deadline).toDateString();
    const today = new Date().toDateString();
    return taskDate === today;
  });

  const upcomingTasks = tasks.filter((task) => {
    const taskDate = new Date(task.deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return taskDate > today;
  });

  const overdueTasks = tasks.filter((task) => {
    const taskDate = new Date(task.deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return taskDate < today && !task.completed;
  });

  const TaskCard = ({ task }: { task: Task }) => (
    <div
      className={cn(
        "p-4 rounded-lg border transition-all duration-200 hover:shadow-md",
        task.completed
          ? "bg-green-50 border-green-200 opacity-75"
          : "bg-card border-border",
        task.priority === "urgent" &&
          !task.completed &&
          "border-l-4 border-l-red-400",
        task.priority === "high" &&
          !task.completed &&
          "border-l-4 border-l-orange-400",
        task.priority === "normal" &&
          !task.completed &&
          "border-l-4 border-l-blue-400"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            {getPriorityIcon(task.priority)}
            <h4
              className={cn(
                "font-medium truncate",
                task.completed
                  ? "line-through text-muted-foreground"
                  : "text-foreground"
              )}
            >
              {task.title}
            </h4>
            <Badge
              variant={getPriorityBadgeVariant(task.priority)}
              className="text-xs"
            >
              {task.priority}
            </Badge>
            {task.completed && (
              <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
            )}
          </div>

          <p className="text-sm text-muted-foreground flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            {formatDeadline(task.deadline)}
          </p>
        </div>

        <div className="flex items-center space-x-1 ml-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleToggleComplete(task)}
            className="h-8 w-8 p-0"
          >
            <CheckCircle2
              className={cn(
                "w-4 h-4",
                task.completed ? "text-green-500" : "text-muted-foreground"
              )}
            />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(task)}
            className="h-8 w-8 p-0"
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(task.id)}
            className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Task Management
          </h2>
          <p className="text-muted-foreground">
            Manage your daily tasks and priorities
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingTask ? "Edit Task" : "Add New Task"}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Task Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Enter task title..."
                  required
                />
              </div>

              <div>
                <Label htmlFor="deadline">Deadline</Label>
                <Input
                  id="deadline"
                  type="datetime-local"
                  value={formData.deadline}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      deadline: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: TaskPriority) =>
                    setFormData((prev) => ({ ...prev, priority: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingTask ? "Update" : "Create"} Task
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Task Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{todayTasks.length}</p>
                <p className="text-sm text-muted-foreground">Due Today</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{overdueTasks.length}</p>
                <p className="text-sm text-muted-foreground">Overdue</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{upcomingTasks.length}</p>
                <p className="text-sm text-muted-foreground">Upcoming</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">
                  {tasks.filter((t) => t.completed).length}
                </p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Task Sections */}
      <div className="space-y-6">
        {/* Overdue Tasks */}
        {overdueTasks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Overdue Tasks ({overdueTasks.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {overdueTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Today's Tasks */}
        {todayTasks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Due Today ({todayTasks.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {todayTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upcoming Tasks */}
        {upcomingTasks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Upcoming Tasks ({upcomingTasks.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* No Tasks Message */}
        {tasks.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No tasks yet
              </h3>
              <p className="text-muted-foreground mb-4">
                Create your first task to get started with task management.
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Task
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
