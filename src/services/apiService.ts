import axios from "axios";
import Cookies from "js-cookie";


// Función para obtener el token desde las cookies
const getToken = () => {
  return Cookies.get("token"); // Cambia 'token' por el nombre que le hayas dado a tu cookie
};

export const apiService = {
  login: async (baseURL: string, body: object) => {
    try {
      // Usar axios.post para enviar el body en la petición
      const response = await axios.post(baseURL, body);
      return response.data;
    } catch (error) {
      
      throw error;
    }
  },
  logout: async () => {

    try {
      // Eliminar la cookie de token
      Cookies.remove("token");
    } catch (error) {
      
      throw error;
    }
  },

  get: async (baseURL: string) => {
    const token = getToken(); // Obtener el token de las cookies

    try {
      const response = await axios.get(baseURL, {
        headers: {
          Authorization: `Bearer ${token}`, // Añade el token en el header
        },
      });
      return response.data;
    } catch (error) {
      
      throw error;
    }
  },
  post: async (baseURL: string, data: any) => {
    const token = getToken(); // Obtener el token de las cookies
    try {
      const response = await axios.post(baseURL, data, {
        headers: {
          Authorization: `Bearer ${token}`, // Añade el token en el header
        },
      });
      return response.data;
    } catch (error) {
      
      throw error;
    }
  },
  update: async (baseURL: string, data: any) => {
    const token = getToken(); // Obtener el token de las cookies
    try {
      const response = await axios.put(baseURL, data, {
        headers: {
          Authorization: `Bearer ${token}`, // Añade el token en el header
        },
      });
      return response.data;
    } catch (error) {
      
      throw error;
    }
  },
  delete: async (baseURL: string) => {
    const token = getToken(); // Obtener el token de las cookies
    try {
      const response = await axios.delete(baseURL,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Añade el token en el header
          },
        }
        );
      return response.data;
    } catch (error) {
      
      throw error;
    }
  },
  resetpwd: async ( baseURL: string, data: any, token: string,) => {
    // Obtener el token de las cookies
    try {
      const response = await axios.post(baseURL, data, {
        headers: {
          Authorization: `Bearer ${token}`, // Añade el token en el header
        },
      });
      return response.data;
    } catch (error) {
      
      throw error;
    }
  },
  forgotPwd: async (baseURL: string, data: any) => {
    try {
      const response = await axios.post(baseURL, data);
      return response.data;
    } catch (error) {
      
      throw error;
    }
  },

  
};
