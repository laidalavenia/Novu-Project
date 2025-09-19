import { Inbox } from "@novu/react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { Bell } from "lucide-react";

export function NotificationInbox() {
  const applicationIdentifier =
    process.env.REACT_APP_NOVU_APPLICATION_IDENTIFIER;
  const subscriberId = process.env.REACT_APP_NOVU_SUBSCRIBER_ID;

  if (!applicationIdentifier || !subscriberId) {
    console.error("Missing Novu configuration");
    return null;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <Inbox
          applicationIdentifier={applicationIdentifier}
          subscriberId={subscriberId}
          appearance={{
            variables: {
              colorPrimary: "hsl(var(--primary))",
              colorSecondary: "hsl(var(--secondary))",
              colorBackground: "hsl(var(--background))",
              colorForeground: "hsl(var(--foreground))",
            },
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
