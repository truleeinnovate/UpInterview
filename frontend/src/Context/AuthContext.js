import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock effect to simulate fetching user data
  useEffect(() => {
    // In a real app, you would check for a token and fetch user data
    const mockUserData = {
      id: "1",
      name: "Admin User",
      email: "admin@example.com",
      role: "super_admin",
      // role: "support_team",
      avatar: "https://i.pravatar.cc/150?img=68",
    };

    // Simulate API call
    setTimeout(() => {
      setUser(mockUserData);
      setLoading(false);
    }, 500);
  }, []);

  // Login function
  const login = async (email, password) => {
    // In a real app, you would make an API call to verify credentials
    setLoading(true);

    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockUserData = {
          id: "1",
          name: "Admin User",
          email: email,
          role: email.includes("admin") ? "super_admin" : "support_team",
          avatar: "https://i.pravatar.cc/150?img=68",
        };

        setUser(mockUserData);
        setLoading(false);
        resolve(mockUserData);
      }, 800);
    });
  };

  // Logout function
  const logout = () => {
    // In a real app, you would clear tokens
    setUser(null);
  };

  // Check if user has a specific role
  const hasRole = (role) => {
    if (!user) return false;

    if (role === "super_admin") {
      return user.role === "super_admin";
    }

    if (role === "support_team") {
      return user.role === "support_team" || user.role === "super_admin";
    }

    return false;
  };

  const value = {
    user,
    loading,
    login,
    logout,
    hasRole,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
