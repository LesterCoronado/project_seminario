import React, { createContext, useContext, useEffect, useState } from "react";
import {jwtDecode} from "jwt-decode"; // Corrige la importación
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

// Valor predeterminado para el contexto
export const AuthAdminContext = createContext({
  isAuthenticated: false, // Estado inicial
});

// Provider de autenticación
export const AuthAdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token: any = Cookies.get("token");
    const isExpired = token ? isTokenExpired(token) : true;

    if (!isExpired) {
      const decodedToken: any = jwtDecode(token); // Decodifica el token
      console.log("decodedTokenJWT:", decodedToken.idRol);
      if (decodedToken.idRol == 1) { // Verifica si es ADMIN
        setIsAuthenticated(true); // Si el rol es 1 (ADMIN), autenticar
      } else {
        setIsAuthenticated(false); // No autenticar si no es ADMIN
        
      }
    } else {
      setIsAuthenticated(false); // Token expirado o inválido
      navigate("/login"); // Redirigir al login si el token ha expirado
    }
  }, [navigate]);

  const isTokenExpired = (token: string) => {
    if (!token) return true; // Si no hay token, se considera expirado

    try {
      const decoded: any = jwtDecode(token); // Decodifica el token
      const currentTime = Date.now() / 1000; // Tiempo actual en segundos

      // Verificar si decoded.exp está definido
      if (decoded.exp === undefined) {
        console.warn("El token no contiene la propiedad exp.");
        return true; // Asumimos que el token es inválido si no hay exp
      }

      return decoded.exp < currentTime; // Compara la fecha de expiración
    } catch (error) {
      console.error("Error al decodificar el token:", error);
      return true; // Si hay un error, asumimos que el token es inválido
    }
  };

  return (
    <AuthAdminContext.Provider value={{ isAuthenticated }}>
      {children}
    </AuthAdminContext.Provider>
  );
};

// Hook para usar el contexto
export const useAuth = () => {
  return useContext(AuthAdminContext);
};
