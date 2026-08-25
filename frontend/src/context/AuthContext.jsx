import { createContext, useContext, useMemo, useState } from "react";
import api from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user,setUser] = useState(() => {
    const raw = localStorage.getItem("dc_user");
    return raw ? JSON.parse(raw) : null;
  });

  const login = async (email,password) => {
    const {data} = await api.post("/auth/login",{email,password});
    localStorage.setItem("dc_token",data.token);
    localStorage.setItem("dc_user",JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("dc_token");
    localStorage.removeItem("dc_user");
    setUser(null);
  };

  const value = useMemo(() => ({user,login,logout}), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
