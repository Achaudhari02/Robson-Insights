import React, { useState, useEffect, createContext } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import {axiosInstance} from "./axios";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.log("Error loading user from storage", error);
      }
    };

    loadUser();
  }, []);
  
  const loginFn = async (email: string, password: string) => {

    try {
      setLoading(true);
      const userCredential = await axiosInstance.post('/login/',{
        username: email,
        password: password
      })
      const userData = { email, token: userCredential.data.token };
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setLoading(false);
    } catch (error) {
      throw new Error("Error logging in");
    }

  };

  const registerFn = async (email: string, password: string) => {
    setLoading(true);
    setUser({ email, token: "fake" }); 
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
  token: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  loginFn: (email: string, password: string) => Promise<void>;
  registerFn: (email: string, password: string) => Promise<void>;
  logoutFn: () => void;
};

export const AuthContext = createContext<AuthContextType | null>(null);
