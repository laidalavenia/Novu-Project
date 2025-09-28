// services/taskService.ts
import { Task, TaskPriority } from "../types";

const TASKS_STORAGE_KEY = "tasks";

export class TaskService {
  static getTasks(): Task[] {
    try {
      const tasks = localStorage.getItem(TASKS_STORAGE_KEY);
      return tasks ? JSON.parse(tasks) : [];
    } catch (error) {
      console.error("Error loading tasks:", error);
      return [];
    }
  }

  static saveTasks(tasks: Task[]): void {
    try {
      localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error("Error saving tasks:", error);
    }
  }

  static createTask(taskData: Omit<Task, "id" | "createdAt">): Task {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };

    const tasks = this.getTasks();
    tasks.push(newTask);
    this.saveTasks(tasks);

    return newTask;
  }

  static updateTask(taskId: string, updates: Partial<Task>): Task | null {
    const tasks = this.getTasks();
    const taskIndex = tasks.findIndex((task) => task.id === taskId);

    if (taskIndex === -1) return null;

    tasks[taskIndex] = { ...tasks[taskIndex], ...updates };
    this.saveTasks(tasks);

    return tasks[taskIndex];
  }

  static deleteTask(taskId: string): boolean {
    const tasks = this.getTasks();
    const filteredTasks = tasks.filter((task) => task.id !== taskId);

    if (filteredTasks.length === tasks.length) return false;

    this.saveTasks(filteredTasks);
    return true;
  }

  static getTasksDueToday(): Task[] {
    const tasks = this.getTasks();
    const today = new Date().toDateString();

    return tasks.filter((task) => {
      const taskDate = new Date(task.deadline).toDateString();
      return taskDate === today && !task.completed;
    });
  }

  static getHighestPriorityToday(): TaskPriority | null {
    const todayTasks = this.getTasksDueToday();
    if (todayTasks.length === 0) return null;

    const priorities: TaskPriority[] = ["urgent", "high", "normal"];

    for (const priority of priorities) {
      if (todayTasks.some((task) => task.priority === priority)) {
        return priority;
      }
    }

    return null;
  }

  static initializeSampleTasks(): void {
    const existingTasks = this.getTasks();
    if (existingTasks.length > 0) return;

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Create tasks with different times
    const urgentDeadline = new Date(today);
    urgentDeadline.setHours(9, 0, 0, 0); // Today 09:00

    const highDeadline = new Date(today);
    highDeadline.setHours(14, 0, 0, 0); // Today 14:00

    const normalDeadline = new Date(tomorrow);
    normalDeadline.setHours(10, 0, 0, 0); // Tomorrow 10:00

    const sampleTasks: Omit<Task, "id" | "createdAt">[] = [
      {
        title: "Submit Daily Report - URGENT",
        deadline: urgentDeadline.toISOString(),
        priority: "urgent",
        completed: false,
      },
      {
        title: "Review Project Proposal - HIGH",
        deadline: highDeadline.toISOString(),
        priority: "high",
        completed: false,
      },
      {
        title: "Update Team Documentation - NORMAL",
        deadline: normalDeadline.toISOString(),
        priority: "normal",
        completed: false,
      },
      {
        title: "Prepare Weekly Presentation",
        deadline: tomorrow.toISOString(),
        priority: "high",
        completed: false,
      },
    ];

    sampleTasks.forEach((taskData) => this.createTask(taskData));
  }
}
