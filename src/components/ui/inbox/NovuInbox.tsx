import React, { useState, useEffect } from "react";
import { Inbox, useNotifications } from "@novu/react";
import { Bell, TriangleAlert, CircleAlert, Info } from "lucide-react";
import { cn } from "../../../lib/utils";
import { useAuth } from "../../../hooks/useAuth";
import { TaskService } from "../../../services/taskService";
import { Task, TaskPriority, PopupNotification } from "../../../types";
import NotificationPopup from "../../NotificationPopup";

interface NovuInboxProps {
  className?: string;
}

export default function NovuInbox({ className }: NovuInboxProps) {
  const applicationIdentifier =
    process.env.REACT_APP_NOVU_APPLICATION_IDENTIFIER;
  const backendUrl =
    process.env.REACT_APP_NOVU_BACKEND_URL || "https://novu-api.optimasi.ai";
  const socketUrl =
    process.env.REACT_APP_NOVU_SOCKET_URL || "https://novu-ws.optimasi.ai";
  const { getSubscriberId, isLoading } = useAuth();

  const subscriberId = getSubscriberId();

  const [popupNotification, setPopupNotification] =
    useState<PopupNotification | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [hasShownInitialPopup, setHasShownInitialPopup] = useState(false);

  // Use Novu's useNotifications hook to get notifications
  let notifications: any[] = [];
  let notificationsLoading = false;
  let notificationsError = null;

  try {
    const notificationData = useNotifications();
    notifications = notificationData.notifications || [];
    notificationsLoading = notificationData.isLoading || false;

    console.log("=== NOVU DEBUG INFO ===");
    console.log("applicationIdentifier:", applicationIdentifier);
    console.log("subscriberId:", subscriberId);
    console.log("backendUrl:", backendUrl);
    console.log("socketUrl:", socketUrl);
    console.log("notifications count:", notifications.length);
    console.log("notificationsLoading:", notificationsLoading);
    console.log("========================");
  } catch (error) {
    console.error("useNotifications error:", error);
    notificationsError = error;
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
      const todayTasks = TaskService.getTasksDueToday();
      const highestPriority = TaskService.getHighestPriorityToday();

      console.log("Auto-popup conditions:", {
        todayTasksCount: todayTasks.length,
        highestPriority,
        notificationsCount: notifications.length,
      });

      if (
        todayTasks.length > 0 &&
        highestPriority &&
        notifications &&
        notifications.length > 0
      ) {
        // Match Priority dengan Tasks
        const matchingNotification = notifications.find((notif: any) => {
          const notifSubject = notif.subject?.toLowerCase() || "";
          const notifBody = notif.body?.toLowerCase() || "";

          return (
            notifSubject.includes(highestPriority) ||
            notifBody.includes(highestPriority)
          );
        });

        const selectedNotification = matchingNotification || notifications[0];

        console.log(
          "Using Novu notification for auto-popup:",
          selectedNotification
        );

        const notificationPriority =
          getNotificationPriority(selectedNotification);
        const filteredTasks = todayTasks.filter(
          (task) => task.priority === notificationPriority
        );

        const formattedNotification: PopupNotification = {
          id: selectedNotification.id,
          title: selectedNotification.subject,
          body: selectedNotification.body,
          priority: notificationPriority,
          tasks: filteredTasks,
          actions: [
            {
              label: "View Tasks",
              url: "#tasks",
              isPrimary: true,
            },
          ],
          createdAt: selectedNotification.createdAt,
        };

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
    console.log("handleNotificationClick called with:", notification);

    const todayTasks = TaskService.getTasksDueToday();
    const notificationPriority = getNotificationPriority(notification);
    const filteredTasks = todayTasks.filter(
      (task) => task.priority === notificationPriority
    );

    const formattedNotification: PopupNotification = {
      id: notification.id,
      title: notification.subject,
      body: notification.body,
      priority: notificationPriority,
      tasks: filteredTasks,
      actions: [
        {
          label: "View Tasks",
          url: "#tasks",
          isPrimary: true,
        },
      ],
      createdAt: notification.createdAt,
    };

    console.log("Opening popup with:", formattedNotification);
    setPopupNotification(formattedNotification);
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
    setPopupNotification(null);
  };

  // Error states
  if (!applicationIdentifier) {
    console.error("REACT_APP_NOVU_APPLICATION_IDENTIFIER is not defined");

    return (
      <>
        <div
          className={cn(
            "flex flex-col items-center justify-center p-4 text-muted-foreground",
            className
          )}
        >
          <Bell className="h-5 w-5 mb-2" />
          <div className="text-xs text-red-500">Missing App Identifier</div>
        </div>

        <NotificationPopup
          isOpen={isPopupOpen}
          onClose={closePopup}
          notification={popupNotification}
        />
      </>
    );
  }

  if (!subscriberId && !isLoading) {
    console.error("Subscriber ID is null/undefined");
    return (
      <>
        <div
          className={cn(
            "flex flex-col items-center justify-center p-4 text-muted-foreground",
            className
          )}
        >
          <Bell className="h-5 w-5 mb-2" />
          <div className="text-xs text-red-500">Invalid Subscriber</div>
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

  // Show error state if there's a Novu error
  if (notificationsError) {
    return (
      <>
        <div
          className={cn(
            "flex flex-col items-center justify-center p-4 text-muted-foreground",
            className
          )}
        >
          <Bell className="h-5 w-5 mb-2" />
          <div className="text-xs text-red-500">Connection Error</div>
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
          // backendUrl={backendUrl}
          // socketUrl={socketUrl}
          onNotificationClick={handleNotificationClick}
          renderNotification={(notification) => {
            const priority = getNotificationPriority(notification);

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
