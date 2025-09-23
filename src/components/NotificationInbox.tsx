import React, { useState } from "react";
import NotificationPopup from "./NotificationPopup"; 
import { Inbox } from "@novu/react";
import { Bell } from "lucide-react";
import { cn } from "../lib/utils";
import { useAuth } from "../hooks/useAuth";

interface NotificationData {
  id: string;
  title: string;
  body: string;
  actions?: Array<{
    label: string;
    url?: string;
    isPrimary?: boolean;
  }>;
  createdAt: string;
}

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
    useState<NotificationData | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const handleNotificationClick = (notification: any) => {
    const formattedNotification = {
      id: notification.id || Date.now().toString(),
      title: notification.subject || notification.title || "New Notification",
      body:
        notification.body ||
        notification.content ||
        "You have a new notification",
      actions: notification.cta?.action
        ? [
            {
              label: notification.cta.action.label || "View",
              url: notification.cta.action.url,
              isPrimary: true,
            },
          ]
        : [],
      createdAt: notification.createdAt || new Date().toISOString(),
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
      <div
        className={cn(
          "flex items-center justify-center p-2 text-muted-foreground",
          className
        )}
      >
        <Bell className="h-5 w-5" />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center p-2", className)}>
        <Bell className="h-5 w-5 animate-pulse text-muted-foreground" />
      </div>
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
