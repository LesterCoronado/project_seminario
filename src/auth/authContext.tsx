// src/context/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

// Valor predeterminado para el contexto
export const AuthContext = createContext({
  isAuthenticated: false, // Estado inicial
});

// Provider de autenticación
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get("token");
    const isExpired = token ? isTokenExpired(token) : true;

    if (!isExpired) {
      setIsAuthenticated(true);
    } else {
      navigate("/login"); // Redirige al login si el token ha expirado
    }
  }, [navigate]);

  const isTokenExpired = (token: string) => {
    if (!token) return true; // Si no hay token, se considera expirado

    try {
      const decoded = jwtDecode(token); // Decodifica el token
      const currentTime = Date.now() / 1000; // Tiempo actual en segundos

      // Verificar si decoded.exp está definido
      if (decoded.exp === undefined) {
        
        return true; // Asumimos que el token es inválido si no hay exp
      }

      return decoded.exp < currentTime; // Compara la fecha de expiración
    } catch (error) {
      
      return true; // Si hay un error, asumimos que el token es inválido
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para usar el contexto
export const useAuth = () => {
  return useContext(AuthContext);
};
