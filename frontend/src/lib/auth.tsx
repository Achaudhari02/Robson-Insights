import { createContext } from "react";
import React, { useState } from "react";
import {axiosInstance} from "./axios";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

  const loginFn = async (email: string, password: string) => {

    try {
      setLoading(true);
      const userCredential = await axiosInstance.post('/login/',{
        username: email,
        password: password
      })
      console.log(userCredential.data.token)
      setUser({ email }); 
      setLoading(false);
    } catch (error) {
      throw new Error("Error logging in");
    }

  };

  const registerFn = async (email: string, password: string) => {
    setLoading(true);
    setUser({ email }); 
    setLoading(false);
  };

  const logoutFn = () => {
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    loginFn,
    registerFn,
    logoutFn,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

type User = {
  email: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  loginFn: (email: string, password: string) => Promise<void>;
  registerFn: (email: string, password: string) => Promise<void>;
  logoutFn: () => void;
};

export const AuthContext = createContext<AuthContextType | null>(null);
