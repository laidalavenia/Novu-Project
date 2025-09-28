export type TaskPriority = 'urgent' | 'high' | 'normal';

export interface Task {
  id: string;
  title: string;
  deadline: string; // ISO date string
  priority: TaskPriority;
  completed: boolean;
  createdAt: string;
}

export interface NovuPayload {
  firstName: string;
  lastName: string;
  priority: TaskPriority;
  message: {
    urgent: string;
    high: string;
    normal: string;
  };
}

export interface PopupNotification {
  id: string;
  title: string;
  body: string;
  priority: TaskPriority;
  tasks: Task[];
  actions: Array<{
    label: string;
    url: string;
    isPrimary: boolean;
  }>;
  createdAt: string;
}