import React, { createContext, useContext, useState } from "react";

interface AuthState {
  token: string | null;
  username: string | null;
  nome_completo: string | null;
}

interface AuthContextType {
  auth: AuthState;
  setAuth: (auth: AuthState) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro do AuthProvider");
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [auth, setAuth] = useState<AuthState>({
    token: null,
    username: null,
    nome_completo: null,
  });
  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
