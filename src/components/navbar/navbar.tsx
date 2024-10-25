import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar, Nav, NavDropdown, Container, Button } from "react-bootstrap";
import { apiService } from "../../services/apiService";
import CrearProyecto from "../proyectos/listado-proyectos/crear-proyecto";
import "./navbar.css";
import Cookies from "js-cookie"; // para manejar las cookies
import { jwtDecode } from "jwt-decode";
import { notificationService } from "../../services/notificaciones";

// Tipos y constantes
interface Proyecto {
  idProyecto: number;
  Nombre: string;
  descripcion: string;
  tipoProyecto: string;
  metodologia: string;
  tecnologiasUsadas: string;
  prioridad: string;
  cliente: { nombre: string };
  estado: string;
  progreso: number;
}

const ROLES = {
  ADMIN: 1,
  EMPLOYEE: 2,
};

const NavbarComponent = () => {
  const [showInsertar, setShowInsertar] = useState(false);
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEmployee, setIsEmployee] = useState(false);
  const navigate = useNavigate(); // Crea una instancia del hook useNavigate

  // Función para obtener los proyectos usando el servicio apiService
  const fetchProyectos = async () => {
    try {
      const data: Proyecto[] = await apiService.get(
        "http://localhost:4000/proyectos"
      );
      setProyectos(data);
    } catch (error) {
      console.error("Error al obtener los proyectos:", error);
    }
  };

  // Función para manejar el token
  const handleTokenAuth = (token: string) => {
    try {
      const decoded: any = jwtDecode(token); // Decodifica el token
      setIsAuthenticated(true);

      if (decoded.idRol === ROLES.ADMIN) {
        setIsAdmin(true);
      } else if (decoded.idRol === ROLES.EMPLOYEE) {
        setIsEmployee(true);
      }

      fetchProyectos(); // Actualizar la lista de proyectos después del login
    } catch (error) {
      console.error("Error al decodificar el token:", error);
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      handleTokenAuth(token);
    } else {
      setIsAuthenticated(false);
    }

    // Suscribirse a las notificaciones
    const loginSubscription = notificationService.getLogin().subscribe(() => {
      const newToken = Cookies.get("token");
      if (newToken) {
        handleTokenAuth(newToken); // Actualiza el estado si llega un nuevo login
      } else {
        setIsAuthenticated(false); // Si no hay token, desautenticado
      }
    });

    const notificationSubscription = notificationService
      .getNotification()
      .subscribe(() => {
        fetchProyectos();
      });

    // Limpiar suscripciones al desmontar
    return () => {
      loginSubscription.unsubscribe();
      notificationSubscription.unsubscribe();
    };
  }, []); // No se necesita `isAuthenticated` como dependencia aquí

  const handleLogout = () => {
    Cookies.remove("token"); // Eliminar la cookie de sesión
    navigate("/login"); // Redirigir al login
    setIsAuthenticated(false);
    setIsAdmin(false);
    setIsEmployee(false);
    setProyectos([]);
  };

  const login = () => {
    navigate("/login");
  };

  return (
    <>
      <Navbar bg="light" expand="lg">
        <Container fluid>
          <Navbar.Brand>   
            <img
            src="https://blocks.primereact.org/demo/images/blocks/logos/hyper.svg"
            alt="hyper"
            className="mb-3 logo"
          />TestZen</Navbar.Brand>
          <Navbar.Toggle aria-controls="navbarSupportedContent" />
          <Navbar.Collapse id="navbarSupportedContent">
            <Nav className="ms-auto">
              {isAdmin && (
                <Nav.Link as={Link} to="/inicio">
                  Inicio
                </Nav.Link>
              )}
              {isEmployee && (
                <>
                  <Nav.Link as={Link} to="/tareas-pendientes">
                    Tareas
                  </Nav.Link>
                  <Nav.Link as={Link} to="/manejo-errores" >
                    Manejo Errores
                  </Nav.Link>
                </>
              )}
              {isAdmin && (
                <>
                  <NavDropdown title="Proyectos" id="navbarScrollingDropdown">
                    <NavDropdown.Item as={Link} to="/proyectos">
                      Gestionar Proyectos
                    </NavDropdown.Item>
                    <NavDropdown.Divider />
                    {proyectos.map((proyecto) => (
                      <NavDropdown.Item
                        key={proyecto.idProyecto}
                        as={Link}
                        to={`/proyecto/${proyecto.idProyecto}`}
                      >
                        {proyecto.Nombre}
                      </NavDropdown.Item>
                    ))}
                  </NavDropdown>
                  <Nav.Link as={Link} to="/equipos">
                    Equipos
                  </Nav.Link>
                  <Nav.Link as={Link} to="/clientes">
                    Clientes
                  </Nav.Link>
                  <Nav.Link as={Link} to="/usuarios">
                    Usuarios
                  </Nav.Link>
                </>
              )}
            </Nav>
            {isAuthenticated ? (
              <Button variant="dark" className="ms-3" onClick={handleLogout}>
                <i className="bi bi-box-arrow-right"></i> Log Out
              </Button>
            ) : (
              <Button variant="outline-dark" className="ms-3" onClick={login}>
                <i className="bi bi-box-arrow-in-right"></i> Log In
              </Button>
            )}
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
};

export default NavbarComponent;
