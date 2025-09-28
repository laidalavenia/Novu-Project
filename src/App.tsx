import React from "react";
import { NovuProvider } from "@novu/react";
import Navbar from "./components/Navbar";
import TaskManagement from "./components/TaskManagement";
import { useAuth } from "./hooks/useAuth";
import "./App.css";

function App() {
  const applicationIdentifier =
    process.env.REACT_APP_NOVU_APPLICATION_IDENTIFIER;
  const { getSubscriberId } = useAuth();
  const subscriberId = getSubscriberId();

  // If Novu is not configured, render without NovuProvider
  if (!applicationIdentifier || !subscriberId) {
    console.warn("Novu configuration missing, running without NovuProvider");

    return (
      <div className="min-h-screen bg-background">
        <Navbar />

        {/* Main Content Area */}
        <main className="container mx-auto px-6 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Welcome to Task Management Dashboard
              </h1>
              <p className="text-muted-foreground">
                Manage your tasks and receive notifications about deadlines. Your notifications will appear in the bell icon at the top right corner.
              </p>
            </div>

            {/* Task Management Section */}
            <TaskManagement />
          </div>
        </main>
      </div>
    );
  }

  // Render with NovuProvider when properly configured
  return (
    <NovuProvider
      applicationIdentifier={applicationIdentifier}
      subscriberId={subscriberId}
    >
      <div className="min-h-screen bg-background">
        <Navbar />

        {/* Main Content Area */}
        <main className="container mx-auto px-6 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Welcome to Task Management Dashboard
              </h1>
              <p className="text-muted-foreground">
                Manage your tasks and receive notifications about deadlines. Your notifications will appear in the bell icon at the top right corner.
              </p>
            </div>

            {/* Task Management Section */}
            <TaskManagement />
          </div>
        </main>
      </div>
    </NovuProvider>
  );
}

export default App;