import React, { useState, useEffect } from "react";
import "./navbar-aside.css";
import { NavLink } from "react-router-dom";
import { LayoutDashboard } from "lucide-react";
import { ChartBarBig } from "lucide-react";
import { CodeXml } from "lucide-react";
import { Bug } from "lucide-react";
import { ClipboardList } from "lucide-react";
import { useAuth } from "../../../../auth/adminContext";

let idProyecto: any;
let nombreProyecto: any;

interface NavbarProps {
  onToggle: (isOpen: boolean) => void; // Función para notificar el cambio
}

const NavbarAside: React.FC<NavbarProps> = ({ onToggle }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    console.log(isAuthenticated)
    return <div>No tienes acceso a este contenido.</div>;
  }
  nombreProyecto = sessionStorage.getItem("project");
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    idProyecto = sessionStorage.getItem("id");
    onToggle(isOpen); // Notificar al componente padre cada vez que se minimiza o expande
  }, [isOpen, onToggle]);

  return (
    <nav className="navbar-menu" style={{ width: isOpen ? 60 : 150 }}>
      <ul className="navbar-nav me-auto bm-3 mb-lg-0">
        <li className="nav-item mt-3">
          <p className="text-center"><span></span>{nombreProyecto}</p>
          <hr className="divider" />

          <NavLink
            to={`/proyecto/${idProyecto}`}
            className={({ isActive }) =>
              isActive ? "active" : "nav-link text-center"
            }
            aria-current="page"
          >
            <LayoutDashboard />
            <span className="d-block mt-1">Dashboard</span>
          </NavLink>

          <NavLink
            to={`/cronograma/${idProyecto}`}
            className={({ isActive }) =>
              isActive ? "active" : "nav-link text-center"
            }
            aria-current="page"
          >
            <ChartBarBig />
            <span className="d-block mt-1">Cronograma</span>
          </NavLink>

          <NavLink
            to={`/pruebas/${idProyecto}`}
            className={({ isActive }) =>
              isActive ? "active" : "nav-link text-center"
            }
            aria-current="page"
          >
            <CodeXml />
            <span className="d-block mt-1">Pruebas</span>
          </NavLink>
          <NavLink
            to={`/errores/${idProyecto}`}
            className={({ isActive }) =>
              isActive ? "active" : "nav-link text-center"
            }
            aria-current="page"
          >
            <Bug />
            <span className="d-block mt-1">Errores</span>
          </NavLink>
          <NavLink
            to={`/informes/${idProyecto}`}
            className={({ isActive }) =>
              isActive ? "active" : "nav-link text-center"
            }
            aria-current="page"
          >
            <ClipboardList />
            <span className="d-block mt-1">Informes</span>
          </NavLink>

         
        </li>
      </ul>
    </nav>
  );
};

export default NavbarAside;
