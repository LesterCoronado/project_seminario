import { Route, Routes, BrowserRouter } from "react-router-dom";
import Proyectos from "./components/proyectos/listado-proyectos/listado-proyectos";
import Equipos from "./components/equipo/lista-equipos";
import Navbar from "./components/navbar/navbar";
import InfoProyecto from "./components/proyectos/gestion-proyecto/info-proyecto/info-proyecto";
import Cronograma from "./components/proyectos/gestion-proyecto/cronograma/cronograma";
import Login from "./components/login/login";
import Pruebas from "./components/pruebas/listar-pruebas/listar-pruebas";
import Errores from "./components/errores/listar-errores/listar-errores";
import Informes from "./components/informes/informes";
import Clientes from "./components/clientes/listar-clientes";
import Inicio from "./components/inicio/inicio";
import Usuarios from "./components/usuarios/listar-usuarios";
import ResetPassword from "./components/soporte/reset-password";
import { AuthProvider } from "./auth/authContext.tsx";
import { AuthAdminProvider } from "./auth/adminContext.tsx";
import TareasPendientes from "./components/empleados/tareas-pendientes.tsx";
import ErroresAsignados from "./components/empleados/errores-asignados.tsx";
function App() {
  return (
    <>
      <Routes>
        <Route
          path="/proyectos"
          element={
            <AuthAdminProvider>
              <Proyectos />
            </AuthAdminProvider>
          }
        />
        <Route
          path="/equipos"
          element={
            <AuthAdminProvider>
              <Equipos />
            </AuthAdminProvider>
          }
        />
        <Route
          path="/proyecto/:id"
          element={
            <AuthAdminProvider>
              <InfoProyecto />
            </AuthAdminProvider>
          }
        />
        <Route
          path="/cronograma/:id"
          element={
            <AuthAdminProvider>
              <Cronograma />
            </AuthAdminProvider>
          }
        />
        <Route
          path="/pruebas/:id"
          element={
            <AuthAdminProvider>
              <Pruebas />
            </AuthAdminProvider>
          }
        />
        <Route
          path="/errores/:id"
          element={
            <AuthAdminProvider>
              <Errores />
            </AuthAdminProvider>
          }
        />

        <Route
          path="/informes/:id"
          element={
            <AuthAdminProvider>
              <Informes />
            </AuthAdminProvider>
          }
        />
        <Route
          path="/clientes"
          element={
            <AuthAdminProvider>
              <Clientes />
            </AuthAdminProvider>
          }
        />
        <Route
          path="/inicio"
          element={
            <AuthAdminProvider>
              <Inicio />
            </AuthAdminProvider>
          }
        />
        <Route path="/usuarios" element={
          <AuthAdminProvider>
            <Usuarios />
          </AuthAdminProvider>
        } />

        <Route
          path="/tareas-pendientes"
          element={
            <AuthProvider>
              <TareasPendientes />
            </AuthProvider>
          }
        />
        <Route
          path="/manejo-errores"
          element={
            <AuthProvider>
              <ErroresAsignados />
            </AuthProvider>
          }
        />

        <Route
          path="*"
          element={
            <AuthProvider>
              <Inicio />
            </AuthProvider>
          }
        />

        <Route path="/login" element={<Login />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Routes>
    </>
  );
}

export default App;
