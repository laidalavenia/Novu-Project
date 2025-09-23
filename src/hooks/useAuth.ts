import { useState, useEffect } from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulasi auth check - ganti dengan logic auth Anda yang sebenarnya
    const initAuth = () => {
      // Contoh: ambil dari localStorage, API call, atau service auth lainnya
      const savedUser = localStorage.getItem("user");

      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          setUser(userData);
        } catch (error) {
          console.error("Error parsing user data:", error);
          // Fallback ke demo user
          createDemoUser();
        }
      } else {
        // Jika belum ada user, buat demo user untuk testing
        createDemoUser();
      }

      setIsLoading(false);
    };

    const createDemoUser = () => {
      const demoUser: User = {
        id: "demo-user-123",
        name: "Demo User",
        email: "demo@example.com",
        avatar: "https://github.com/shadcn.png",
      };

      setUser(demoUser);
      localStorage.setItem("user", JSON.stringify(demoUser));
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Implementasi login logic di sini
      // Contoh simulasi:
      const userData: User = {
        id: `user-${Date.now()}`,
        name: email.split("@")[0],
        email: email,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      };

      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));

      return { success: true, user: userData };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "Login failed" };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  const getSubscriberId = (): string => {
    // Gunakan dari environment variable jika ada
    const envSubscriberId = process.env.REACT_APP_NOVU_SUBSCRIBER_ID;
    if (envSubscriberId) {
      return envSubscriberId;
    }

    // Gunakan user ID dari login
    if (user?.id) {
      return user.id;
    }

    // Fallback jika belum ada user
    let fallbackId = localStorage.getItem("novu-subscriber-id");
    if (!fallbackId) {
      fallbackId = `anonymous-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      localStorage.setItem("novu-subscriber-id", fallbackId);
    }

    return fallbackId;
  };

  // const getSubscriberId = (): string => {
  //   if (user?.id) {
  //     return user.id;
  //   }

  //   // Fallback jika belum ada user
  //   let fallbackId = localStorage.getItem("novu-subscriber-id");
  //   if (!fallbackId) {
  //     fallbackId = `anonymous-${Date.now()}-${Math.random()
  //       .toString(36)
  //       .substr(2, 9)}`;
  //     localStorage.setItem("novu-subscriber-id", fallbackId);
  //   }

  //   return fallbackId;
  // };

  return {
    user,
    isLoading,
    login,
    logout,
    getSubscriberId,
    isAuthenticated: !!user,
  };
}
