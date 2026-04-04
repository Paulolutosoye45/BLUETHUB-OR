// context/AuthContext.tsx
import { authService, } from "@/services/auth";
import { token } from "@/utils";
import { getParsedToken } from "@/utils/decode";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { Navigate } from "react-router-dom";


interface IUser {
  createdDate: string;
  emailAddress: string;
  firstName: string;
  guardianName: string | null;
  hasAccess: boolean;
  id: string
  isActive: boolean;
  lastName:string;
  modifiedDate: string;
  profileImage: string | null;
  roleId: number;
  roleName: string;
  userName: string;
}
interface AuthContextType {
  user: IUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isLoggingOut: boolean;
  login: (tokenValue: string, userData: any) => void;
  logout: () => void;
  setUser: (user: IUser | null) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const init = async () => {
      const storedToken = token.getToken();

      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      const parsed = getParsedToken(storedToken);

      if (!parsed) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true)
        const response = await authService.getUserById(parsed.id);
        setUser(response.data.data);
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  const login = (tokenValue: string, userData: IUser) => {
    token.login(tokenValue);
    setUser({
      ...userData,
      roleName: userData.roleName ?? userData.roleName,  // ← normalize here too
    });
  };

  const logout =  () => {
    setIsLoggingOut(true);
      // Try to call logout API, but don't fail if it errors (offline support)
      try {
        token.clearAll();
        <Navigate to="/auth" />;
      } catch (error) {
        // Network error or token already invalid - still proceed with local logout
        console.warn('Logout API call failed, proceeding with local logout:', error);
      }
       finally {
      token.clearAll();
      setUser(null);
      setIsLoggingOut(false);
    }
  };

  const refreshUser = async () => {
    const storedToken = token.getToken();

    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    const parsed = getParsedToken(storedToken);

    if (!parsed) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await authService.getUserById(parsed.id);
      setUser(response.data);
    } catch (error) {
      console.error('Error refreshing user:', error);
       logout();
    }
  };


  const value: AuthContextType = {
    user,
    isAuthenticated: !!user && !!token.getToken(),
    isLoading,
    isLoggingOut,
    login,
    logout,
    setUser,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
};