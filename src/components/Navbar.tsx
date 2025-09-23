import React from "react";
import { Search, Settings, User } from "lucide-react";
import NotificationInbox from "./NotificationInbox";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { cn } from "../lib/utils";

interface NavbarProps {
  className?: string;
}

export default function Navbar({ className }: NavbarProps) {
  return (
    <nav
      className={cn(
        "flex items-center justify-between px-6 py-4 bg-background border-b border-border",
        className
      )}
    >
      {/* Logo/Brand */}
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-bold text-foreground">Novu App</h1>
      </div>

      {/* Search Bar */}
      <div className="hidden md:flex flex-1 max-w-md mx-8">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          />
        </div>
      </div>

      {/* Right Side Navigation */}
      <div className="flex items-center space-x-4">
        {/* Search Button (Mobile) */}
        <Button variant="ghost" size="icon" className="md:hidden">
          <Search className="h-5 w-5" />
        </Button>

        {/* Notification Inbox */}
        <NotificationInbox className="flex items-center" />

        {/* Settings */}
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>

        {/* User Profile */}
        <div className="flex items-center space-x-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src="https://github.com/shadcn.png" alt="User" />
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <span className="hidden md:inline-block text-sm font-medium text-foreground">
            John Doe
          </span>
        </div>
      </div>
    </nav>
  );
}
