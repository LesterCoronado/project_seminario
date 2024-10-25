import React, { useState, useEffect } from "react";
import './navbar-aside.css';

interface NavbarProps {
  onToggle: (isOpen: boolean) => void; // Función para notificar el cambio
}

const NavbarAside: React.FC<NavbarProps> = ({ onToggle }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    onToggle(isOpen); // Notificar al componente padre cada vez que se minimiza o expande
  }, [isOpen, onToggle]);

  return (
    <nav className="navbar-menu" style={{ width: isOpen ? 60 : 150 }}>
      <div className="burger" onClick={toggleMenu}>
        <i className="bi bi-list navegacion"></i>
      </div>
      <ul className="navbar__list">
        <div className="navbar__li-box">
          <i className="bi bi-speedometer2" style={{ display: isOpen ? "inline-block" : "none" }}></i>
          <li
            className="bi bi-speedometer2"
            style={{ display: isOpen ? "none" : "inline-block" }}
          >
            Cronograma
          </li>
        </div>
        {/* Agrega más elementos estáticos si es necesario */}
      </ul>
    </nav>
  );
};

export default NavbarAside
