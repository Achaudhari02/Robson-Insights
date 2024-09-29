import React, { useState, useEffect, createContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { axiosInstance } from "./axios";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
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
    setLoading(true);
    const userCredential = await axiosInstance.post("/login/", {
      username: email,
      password: password,
    });
    const userData = { email: userCredential.data.email, token: userCredential.data.token, firstName: userCredential.data.firstName, lastName: userCredential.data.lastName };
    await AsyncStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    setLoading(false);
  };

  const registerFn = async (registerData: RegisterData) => {
    setLoading(true);
    const userCredential = await axiosInstance.post(`/register/${registerData.token}/`, {
      email: registerData.email,
      username: registerData.email, 
      password: registerData.password,
      first_name: registerData.firstName,
      last_name: registerData.lastName,
    });
    const userData = { email: userCredential.data.email, token: userCredential.data.token, firstName: userCredential.data.firstName, lastName: userCredential.data.lastName };
    await AsyncStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    setLoading(false);
  };

  const logoutFn = async () => {
    console.log("user gang", user);
    await axiosInstance.post(
      "/logout/",
      {},
      {
        headers: {
          Authorization: `Token ${user?.token}`,
        },
      }
    );
    await AsyncStorage.removeItem("user");
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
  firstName: string;
  lastName: string;
};

type RegisterData = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  token: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  loginFn: (email: string, password: string) => Promise<void>;
  registerFn: (registerData: RegisterData) => Promise<void>;
  logoutFn: () => void;
};

export const AuthContext = createContext<AuthContextType | null>(null);
