import React, { useState, useEffect } from "react";
import { X, Bell } from "lucide-react";
import { Button } from "../components/ui/button";
// import { Button } from "@/components/ui/button";
// import { cn } from "@/lib/utils";
import { cn } from "../lib/utils";

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

interface NotificationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  notification: NotificationData | null;
}

export default function NotificationPopup({
  isOpen,
  onClose,
  notification,
}: NotificationPopupProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = "hidden";
    } else {
      setIsVisible(false);
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !notification) return null;

  const handleAction = (action: any) => {
    if (action.url) {
      window.open(action.url, "_blank");
    }
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
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

      {/* Modal Content */}
      <div
        className={cn(
          "relative bg-background border border-border rounded-lg shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300",
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
        <div className="flex items-center space-x-3 p-6 pb-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Bell className="w-5 h-5 text-primary" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-foreground truncate">
              {notification.title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {new Date(notification.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 pb-6">
          <p className="text-muted-foreground leading-relaxed">
            {notification.body}
          </p>
        </div>

        {/* Actions */}
        {notification.actions && notification.actions.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-2 p-6 pt-0">
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
          </div>
        )}

        {/* Footer */}
        <div className="px-6 pb-4">
          <div className="flex justify-end">
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
