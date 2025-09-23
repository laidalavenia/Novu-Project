import React from "react";
import { NovuProvider } from "@novu/react";
import Navbar from "./components/Navbar";
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
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Welcome to Novu Dashboard
              </h1>
              <p className="text-muted-foreground">
                Your notifications will appear in the bell icon at the top right
                corner.
              </p>
            </div>

            {/* Content Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-card-foreground mb-2">
                  Card 1
                </h3>
                <p className="text-muted-foreground">
                  This is a sample card content. Your notifications will be
                  displayed via Novu Inbox.
                </p>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-card-foreground mb-2">
                  Card 2
                </h3>
                <p className="text-muted-foreground">
                  Click the bell icon in the navbar to see your notifications.
                </p>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-card-foreground mb-2">
                  Card 3
                </h3>
                <p className="text-muted-foreground">
                  Novu Inbox is now integrated with your React app and shadcn/ui
                  theme.
                </p>
              </div>
            </div>
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
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Welcome to Novu Dashboard
              </h1>
              <p className="text-muted-foreground">
                Your notifications will appear in the bell icon at the top right
                corner.
              </p>
            </div>

            {/* Content Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-card-foreground mb-2">
                  Card 1
                </h3>
                <p className="text-muted-foreground">
                  This is a sample card content. Your notifications will be
                  displayed via Novu Inbox.
                </p>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-card-foreground mb-2">
                  Card 2
                </h3>
                <p className="text-muted-foreground">
                  Click the bell icon in the navbar to see your notifications.
                </p>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-card-foreground mb-2">
                  Card 3
                </h3>
                <p className="text-muted-foreground">
                  Novu Inbox is now integrated with your React app and shadcn/ui
                  theme.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </NovuProvider>
  );
}

export default App;
