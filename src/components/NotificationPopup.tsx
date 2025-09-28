import React, { useState, useEffect } from "react";
import { X, AlertTriangle, AlertCircle, Info, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { ScrollArea } from "../components/ui/scroll-area";
import { cn } from "../lib/utils";
import { PopupNotification, Task, TaskPriority } from "../types";
import { TaskService } from "../services/taskService";

interface NotificationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  notification: PopupNotification | null;
}

export default function NotificationPopup({
  isOpen,
  onClose,
  notification,
}: NotificationPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = "hidden";
      
      // Load tasks when popup opens
      if (notification?.tasks) {
        setTasks(notification.tasks);
      }
    } else {
      setIsVisible(false);
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, notification]);

  if (!isOpen || !notification) return null;

  const getPriorityIcon = (priority: TaskPriority) => {
    const icons = {
      urgent: <AlertTriangle className="w-5 h-5 text-red-500" />,
      high: <AlertCircle className="w-5 h-5 text-orange-500" />,
      normal: <Info className="w-5 h-5 text-blue-500" />,
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

  const getPriorityColor = (priority: TaskPriority) => {
    const colors = {
      urgent: "border-red-200 bg-red-50",
      high: "border-orange-200 bg-orange-50",
      normal: "border-blue-200 bg-blue-50",
    };
    return colors[priority];
  };

  const handleTaskComplete = (taskId: string) => {
    const updatedTask = TaskService.updateTask(taskId, { completed: true });
    if (updatedTask) {
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, completed: true } : task
      ));
    }
  };

  const handleAction = (action: any) => {
    if (action.url && action.url !== "#tasks") {
      window.open(action.url, "_blank");
    }
    // Don't close popup for task actions, let user interact with tasks
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const formatDeadline = (deadline: string) => {
    const date = new Date(deadline);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return `Today ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    return date.toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center transition-all duration-300",
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
    >
      {/* Backdrop with vignette effect */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        style={{
          background:
            "radial-gradient(circle at center, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.8) 100%)",
        }}
        onClick={handleBackdropClick}
      />

      {/* Modal Content - Much Larger */}
      <div
        className={cn(
          "relative bg-background border border-border rounded-lg shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] transform transition-all duration-300",
          isVisible ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
        )}
      >
        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 h-8 w-8 rounded-full hover:bg-muted z-10"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>

        {/* Header */}
        <div className={cn("flex items-center space-x-4 p-6 pb-4 border-b border-border rounded-t-lg", getPriorityColor(notification.priority))}>
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-background/80 rounded-full flex items-center justify-center border-2 border-white/50">
              {getPriorityIcon(notification.priority)}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-xl font-bold text-foreground truncate">
                {notification.title}
              </h3>
              <Badge variant={getPriorityBadgeVariant(notification.priority)}>
                {notification.priority.toUpperCase()}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {new Date(notification.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        <ScrollArea className="max-h-[60vh]">
          {/* Message Body */}
          <div className="p-6">
            <div className="bg-muted/30 rounded-lg p-4 mb-6">
              <p className="text-foreground leading-relaxed whitespace-pre-line">
                {notification.body}
              </p>
            </div>

            {/* Tasks Due Today */}
            {tasks && tasks.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Tasks Due Today ({tasks.length})
                </h4>
                
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-lg border-l-4 transition-all duration-200",
                        task.completed 
                          ? "bg-green-50 border-l-green-400 opacity-75" 
                          : "bg-card border-l-current hover:shadow-sm",
                        task.priority === 'urgent' && !task.completed && "border-l-red-400",
                        task.priority === 'high' && !task.completed && "border-l-orange-400", 
                        task.priority === 'normal' && !task.completed && "border-l-blue-400"
                      )}
                    >
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="flex-shrink-0">
                          {getPriorityIcon(task.priority)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className={cn(
                            "font-medium truncate",
                            task.completed ? "line-through text-muted-foreground" : "text-foreground"
                          )}>
                            {task.title}
                          </h5>
                          <p className="text-sm text-muted-foreground flex items-center mt-1">
                            <Clock className="w-3 h-3 mr-1" />
                            Due: {formatDeadline(task.deadline)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={getPriorityBadgeVariant(task.priority)} className="text-xs">
                            {task.priority}
                          </Badge>
                          {task.completed && (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          )}
                        </div>
                      </div>
                      
                      {!task.completed && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleTaskComplete(task.id)}
                          className="ml-3"
                        >
                          Mark Complete
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Actions Footer */}
        <div className="border-t border-border p-6">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Primary Actions */}
            {notification.actions && notification.actions.length > 0 && (
              <>
                {notification.actions.map((action, index) => (
                  <Button
                    key={index}
                    variant={action.isPrimary ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => handleAction(action)}
                  >
                    {action.label}
                  </Button>
                ))}
              </>
            )}
            
            {/* Close Button */}
            <Button variant="ghost" onClick={onClose} className="sm:w-auto">
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}