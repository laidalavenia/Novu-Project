import React, { useState, useEffect } from "react";
import NotificationPopup from "./NotificationPopup";
import { Inbox, useNotifications } from "@novu/react";
import { Bell } from "lucide-react";
import { cn } from "../lib/utils";
import { useAuth } from "../hooks/useAuth";

interface NotificationInboxProps {
  className?: string;
}

interface PopupNotification {
  id: string;
  title: string;
  body: string;
  actions: Array<{
    label: string;
    url: string;
    isPrimary: boolean;
  }>;
  createdAt: string;
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

  // Auto-show popup with REAL first notification from Novu
  useEffect(() => {
    if (
      !isLoading &&
      !notificationsLoading &&
      subscriberId &&
      !hasShownInitialPopup &&
      notifications &&
      notifications.length > 0
    ) {
      // Get the REAL first notification from Novu (not sample)
      const firstNotification = notifications[0] as any;

      // Debug: Log the REAL notification structure
      console.log("REAL First notification from Novu:", firstNotification);
      console.log("Available properties:", Object.keys(firstNotification));

      // Format the REAL notification data
      const formattedNotification = {
        id: firstNotification?.id || Date.now().toString(),
        title:
          firstNotification?.subject ||
          firstNotification?.title ||
          firstNotification?.payload?.title ||
          "New Notification",
        body:
          firstNotification?.body ||
          firstNotification?.content ||
          firstNotification?.payload?.body ||
          firstNotification?.payload?.content ||
          "You have a new notification",
        actions:
          firstNotification?.payload?.cta ||
          firstNotification?.cta ||
          firstNotification?.actions
            ? [
                {
                  label:
                    firstNotification?.payload?.cta?.label ||
                    firstNotification?.cta?.label ||
                    "View",
                  url:
                    firstNotification?.payload?.cta?.url ||
                    firstNotification?.cta?.url ||
                    "#",
                  isPrimary: true,
                },
              ]
            : [],
        createdAt:
          firstNotification?.createdAt ||
          firstNotification?.created_at ||
          new Date().toISOString(),
      };

      console.log("Formatted REAL notification:", formattedNotification);

      // Show popup with real notification 
      setTimeout(() => {
        setPopupNotification(formattedNotification);
        setIsPopupOpen(true);
        setHasShownInitialPopup(true);
      }, 1000);
    } else if (
      !isLoading &&
      !notificationsLoading &&
      subscriberId &&
      !hasShownInitialPopup &&
      (!notifications || notifications.length === 0)
    ) {
      // If no real notifications found, log it
      console.log("No real notifications found in Novu");
      setHasShownInitialPopup(true);
    }
  }, [
    isLoading,
    notificationsLoading,
    subscriberId,
    hasShownInitialPopup,
    notifications,
  ]);

  const handleNotificationClick = (notification: any) => {
    console.log("Clicked notification:", notification);

    const formattedNotification = {
      id: notification?.id || Date.now().toString(),
      title:
        notification?.subject ||
        notification?.title ||
        notification?.payload?.title ||
        "New Notification",
      body:
        notification?.body ||
        notification?.content ||
        notification?.payload?.body ||
        notification?.payload?.content ||
        "You have a new notification",
      actions:
        notification?.payload?.cta || notification?.cta || notification?.actions
          ? [
              {
                label:
                  notification?.payload?.cta?.label ||
                  notification?.cta?.label ||
                  "View",
                url:
                  notification?.payload?.cta?.url ||
                  notification?.cta?.url ||
                  "#",
                isPrimary: true,
              },
            ]
          : [],
      createdAt:
        notification?.createdAt ||
        notification?.created_at ||
        new Date().toISOString(),
    };

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
