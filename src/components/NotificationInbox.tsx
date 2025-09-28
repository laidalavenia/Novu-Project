import React, { useState, useEffect } from "react";
import NotificationPopup from "./NotificationPopup";
import { Inbox, useNotifications } from "@novu/react";
import { Bell, TriangleAlert, CircleAlert, Info } from "lucide-react";
import { cn } from "../lib/utils";
import { useAuth } from "../hooks/useAuth";
import { TaskService } from "../services/taskService";
import { Task, TaskPriority, PopupNotification } from "../types";

interface NotificationInboxProps {
  className?: string;
}

export default function NotificationInbox({
  className,
}: NotificationInboxProps) {
  const applicationIdentifier =
    process.env.REACT_APP_NOVU_APPLICATION_IDENTIFIER;
  const { getSubscriberId, isLoading } = useAuth();

  const subscriberId = getSubscriberId();

  const [popupNotification, setPopupNotification] =
    useState<PopupNotification | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [hasShownInitialPopup, setHasShownInitialPopup] = useState(false);

  // Use Novu's useNotifications hook to get notifications (only works inside NovuProvider)
  let notifications: any[] = [];
  let notificationsLoading = false;

  try {
    const notificationData = useNotifications();
    notifications = notificationData.notifications || [];
    notificationsLoading = notificationData.isLoading || false;
  } catch (error) {
    // If useNotifications fails (not inside NovuProvider), we'll use fallback
    console.log("useNotifications not available, using fallback");
  }

  // Initialize sample tasks on component mount
  useEffect(() => {
    TaskService.initializeSampleTasks();
  }, []);

  // Auto-show popup with task-based notification
  useEffect(() => {
    if (
      !isLoading &&
      !notificationsLoading &&
      subscriberId &&
      !hasShownInitialPopup
    ) {
      // Get tasks due today
      const todayTasks = TaskService.getTasksDueToday();
      const highestPriority = TaskService.getHighestPriorityToday();

      if (
        todayTasks.length > 0 &&
        highestPriority &&
        notifications &&
        notifications.length > 0
      ) {
        // Opsi 3: Match Priority dengan Tasks
        // Cari notification yang priority-nya cocok dengan highest priority task
        const matchingNotification = notifications.find((notif: any) => {
          // Coba ekstrak priority dari notification, bisa dari subject atau body
          const notifSubject = notif.subject?.toLowerCase() || "";
          const notifBody = notif.body?.toLowerCase() || "";

          return (
            notifSubject.includes(highestPriority) ||
            notifBody.includes(highestPriority)
          );
        });

        const selectedNotification = matchingNotification || notifications[0];

        console.log("Auto-popup logic:");
        console.log("- Highest priority task:", highestPriority);
        console.log("- Selected notification:", selectedNotification);
        console.log("- Notification subject:", selectedNotification.subject);
        console.log("- Notification body:", selectedNotification.body);
        console.log("- FirstName:", selectedNotification.to?.firstName);

        // Extract the 3 specific fields from matched Novu notification
        const novuBody = selectedNotification.body;
        const novuSubject = selectedNotification.subject;
        const novuFirstName = selectedNotification.to?.firstName;

        // Filter tasks based on the notification priority (not all tasks)
        const notificationPriority =
          getNotificationPriority(selectedNotification);
        const filteredTasks = todayTasks.filter(
          (task) => task.priority === notificationPriority
        );

        // Create formatted notification using matched Novu data
        const formattedNotification: PopupNotification = {
          id: selectedNotification.id,
          title: novuSubject,
          body: novuBody,
          priority: notificationPriority,
          tasks: filteredTasks, // Tasks sesuai priority notification
          actions: [
            {
              label: "View Tasks",
              url: "#tasks",
              isPrimary: true,
            },
          ],
          createdAt: selectedNotification.createdAt,
        };

        console.log("Auto-popup extracted data:");
        console.log("- Subject:", novuSubject);
        console.log("- Body:", novuBody);
        console.log("- FirstName:", novuFirstName);
        console.log("- Notification Priority:", notificationPriority);
        console.log("- Filtered Tasks Count:", filteredTasks.length);

        // Show popup after delay
        setTimeout(() => {
          setPopupNotification(formattedNotification);
          setIsPopupOpen(true);
          setHasShownInitialPopup(true);
        }, 1000);
      } else if (todayTasks.length > 0 && highestPriority) {
        // Fallback when no Novu notifications but have tasks
        console.log("No Novu notifications found, using fallback");

        const formattedNotification: PopupNotification = {
          id: `task-notification-${Date.now()}`,
          title: `${getPriorityLabel(highestPriority)} Tasks Due Today`,
          body: `You have ${highestPriority} priority tasks due today`,
          priority: highestPriority,
          tasks: todayTasks.filter((task) => task.priority === highestPriority),
          actions: [
            {
              label: "View Tasks",
              url: "#tasks",
              isPrimary: true,
            },
          ],
          createdAt: new Date().toISOString(),
        };

        // Show popup after delay
        setTimeout(() => {
          setPopupNotification(formattedNotification);
          setIsPopupOpen(true);
          setHasShownInitialPopup(true);
        }, 1000);
      } else {
        console.log("No tasks due today");
        setHasShownInitialPopup(true);
      }
    }
  }, [
    isLoading,
    notificationsLoading,
    subscriberId,
    hasShownInitialPopup,
    notifications,
  ]);

  // Helper function to extract priority from notification
  const getNotificationPriority = (notification: any): TaskPriority => {
    const subject = notification.subject?.toLowerCase() || "";
    const body = notification.body?.toLowerCase() || "";

    if (subject.includes("urgent") || body.includes("urgent")) return "urgent";
    if (subject.includes("high") || body.includes("high")) return "high";
    if (subject.includes("normal") || body.includes("normal")) return "normal";

    // Fallback to highest priority task if can't determine from notification
    return TaskService.getHighestPriorityToday() || "normal";
  };

  const getPriorityLabel = (priority: TaskPriority): string => {
    const labels = {
      urgent: "Urgent",
      high: "High Priority",
      normal: "Normal",
    };
    return labels[priority];
  };

  const handleNotificationClick = (notification: any) => {
    console.log("Clicked notification:", notification);
    console.log("Clicked notification body:", notification.body);
    console.log("Clicked notification subject:", notification.subject);
    console.log("Clicked notification firstname:", notification.to?.firstName);

    // Get current tasks due today for context
    const todayTasks = TaskService.getTasksDueToday();

    // Extract priority from clicked notification
    const notificationPriority = getNotificationPriority(notification);

    // Filter tasks based on notification priority (not all tasks)
    const filteredTasks = todayTasks.filter(
      (task) => task.priority === notificationPriority
    );

    // Extract the 3 specific fields from clicked Novu notification - SIMPLE
    const novuBody = notification.body;
    const novuSubject = notification.subject;
    const novuFirstName = notification.to?.firstName;

    const formattedNotification: PopupNotification = {
      id: notification.id,
      title: novuSubject,
      body: novuBody,
      priority: notificationPriority, // Use notification priority
      tasks: filteredTasks, // Only tasks matching notification priority
      actions: [
        {
          label: "View Tasks",
          url: "#tasks",
          isPrimary: true,
        },
      ],
      createdAt: notification.createdAt,
    };

    console.log("Clicked notification extracted data:");
    console.log("- Subject:", novuSubject);
    console.log("- Body:", novuBody);
    console.log("- FirstName:", novuFirstName);
    console.log("- Notification Priority:", notificationPriority);
    console.log("- Filtered Tasks Count:", filteredTasks.length);
    console.log(
      "- Filtered Tasks:",
      filteredTasks.map((t) => `${t.title} (${t.priority})`)
    );

    setPopupNotification(formattedNotification);
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
    setPopupNotification(null);
  };

  if (!applicationIdentifier) {
    console.error("REACT_APP_NOVU_APPLICATION_IDENTIFIER is not defined");

    return (
      <>
        <div
          className={cn(
            "flex items-center justify-center p-2 text-muted-foreground",
            className
          )}
        >
          <Bell className="h-5 w-5" />
        </div>

        <NotificationPopup
          isOpen={isPopupOpen}
          onClose={closePopup}
          notification={popupNotification}
        />
      </>
    );
  }

  if (isLoading || notificationsLoading) {
    return (
      <>
        <div className={cn("flex items-center justify-center p-2", className)}>
          <Bell className="h-5 w-5 animate-pulse text-muted-foreground" />
        </div>

        <NotificationPopup
          isOpen={isPopupOpen}
          onClose={closePopup}
          notification={popupNotification}
        />
      </>
    );
  }

  return (
    <>
      <div className={cn("relative", className)}>
        <Inbox
          applicationIdentifier={applicationIdentifier}
          subscriberId={subscriberId}
          onNotificationClick={handleNotificationClick}
          renderNotification={(notification) => {
            const priority = getNotificationPriority(notification);
            const priorityClass = `novu-notification-priority-${priority}`;

            return (
              <div
                className="cursor-pointer p-3 hover:bg-gray-50 border-b"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log("Custom notification clicked:", notification);
                  handleNotificationClick(notification);
                }}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {priority === "urgent" && (
                      <TriangleAlert className="w-5 h-5 text-red-500" />
                    )}
                    {priority === "high" && (
                      <CircleAlert className="w-5 h-5 text-orange-500" />
                    )}
                    {priority === "normal" && (
                      <Info className="w-5 h-5 text-blue-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {notification.subject}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {notification.to?.firstName &&
                        `Halo ${notification.to.firstName},`}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {notification.body?.substring(0, 100)}...
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                  )}
                </div>
              </div>
            );
          }}
          appearance={{
            variables: {
              colorPrimary: "hsl(var(--primary))",
              colorPrimaryForeground: "hsl(var(--primary-foreground))",
              colorSecondary: "hsl(var(--secondary))",
              colorSecondaryForeground: "hsl(var(--secondary-foreground))",
              colorBackground: "hsl(var(--background))",
              colorForeground: "hsl(var(--foreground))",
              colorNeutral: "hsl(var(--border))",
              colorShadow: "hsl(var(--ring))",
              fontSize: "14px",
            },
            elements: {
              bellIcon: {
                color: "hsl(var(--foreground))",
                width: "20px",
                height: "20px",
              },
              popoverContent: {
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "calc(var(--radius) - 2px)",
                boxShadow:
                  "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
              },
              notification: {
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "calc(var(--radius) - 2px)",
                cursor: "pointer",
                transition: "all 0.2s ease-in-out",
              },
            },
          }}
          placement="bottom-end"
          placementOffset={{
            mainAxis: 8,
            crossAxis: -8,
          }}
        />
      </div>

      <NotificationPopup
        isOpen={isPopupOpen}
        onClose={closePopup}
        notification={popupNotification}
      />
    </>
  );
}
