import { useState, useEffect } from "react";
import { ProgressBar } from "react-bootstrap";
import Card from "react-bootstrap/Card";
import ListGroup from "react-bootstrap/ListGroup";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import NavbarAside from "../navbar-aside/navbar-aside.tsx";
import { apiService } from "../../../../services/apiService";
import { useParams } from "react-router-dom";
import "./info-proyecto.css";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import Avatar from "@mui/material/Avatar";
import Stack from "@mui/material/Stack";
import { deepOrange, deepPurple } from "@mui/material/colors";
import { useAuth } from "../../../../auth/adminContext.tsx";
interface Proyecto {
  idProyecto: number;
  Nombre: string;
  descripcion: string;
  tipoProyecto: string;
  tecnologiasUsadas: string;
  prioridad: string;
  idCliente: number;
  metodologia: string;
  estado: string;
  progreso: number;
}

interface Equipo {
  equipo: string;
  miembros: { nombre: string; puesto: string; correo: string }[];
}

const colors = ["#00C49F", "#FFBB28", "#FF8042", "#0088FE"];

export const InfoProyecto = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    console.log(isAuthenticated);
    return <div>No tienes acceso a este contenido.</div>;
  }
  const params = useParams();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<Proyecto>({
    idProyecto: 0,
    Nombre: "",
    descripcion: "",
    tipoProyecto: "",
    tecnologiasUsadas: "",
    prioridad: "",
    estado: "",
    progreso: 0,
    metodologia: "",
    idCliente: 0,
  });
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const handleToggle = (isOpen: boolean) => {
    setIsOpen(isOpen);
  };

  const fetchProyecto = async () => {
    try {
      const data: Proyecto = await apiService.get(
        `https://sp-backend-production.up.railway.app/proyectos/${params.id}`
      );
      setFormData(data);
      sessionStorage.setItem("project", data.Nombre);
    } catch (error) {
      console.error("Error al obtener el proyecto:", error);
    }
  };

  const fetchEquipos = async (id: any) => {
    setEquipos([]);
    try {
      const data: Equipo[] = await apiService.get(
        `https://sp-backend-production.up.railway.app/equipo-proyecto/${id}`
      );
      setEquipos(data);
    } catch (error) {
      console.error("Error al obtener los proyectos:", error);
    }
  };
  //para obtener las iniciales de un nombre
  const getInitials = (nombre: any) => {
    const nombres = nombre.split(" ");
    const initials = nombres
      .slice(0, 2)
      .map((n: any) => n.charAt(0))
      .join("");
    return initials.toUpperCase();
  };

  useEffect(() => {
    let _id: any = params.id;
    sessionStorage.setItem("id", _id);
    fetchProyecto();
    fetchEquipos(params.id);
  }, [params.id]);

  const dataProgress = [
    { name: "Completado", value: formData.progreso },
    { name: "Restante", value: 100 - formData.progreso },
  ];

  return (
    <div className="contenido d-flex">
      <div className="navbar-aside">
        <NavbarAside onToggle={handleToggle} />
      </div>
      <div className="content card m-2 p-3 ">
        <span className="fst-italic">Proyecto</span>
        <h1>{formData.Nombre}</h1>
        <Row>
          <Col md={8}>
            <Card className="mb-4">
              <Card.Body>
                <Card.Title>Descripción del Proyecto</Card.Title>
                <Card.Text>{formData.descripcion}</Card.Text>
              </Card.Body>
            </Card>

            <Card className="mb-4">
              <Card.Body>
                <Card.Title>Progreso del Proyecto</Card.Title>
                <ProgressBar
                  now={formData.progreso}
                  label={`${formData.progreso}%`}
                />
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={dataProgress}
                      cx="50%" // Centra el gráfico horizontalmente
                      cy="50%" // Centra el gráfico verticalmente
                      labelLine={false}
                      outerRadius="80%"
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {dataProgress.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={colors[index % colors.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="mb-4">
              <Card.Body>
                <Card.Title>Tecnologías Usadas</Card.Title>
                <ListGroup variant="flush">
                  {formData.tecnologiasUsadas.split(",").map((tech, index) => (
                    <ListGroup.Item key={index}>{tech.trim()}</ListGroup.Item>
                  ))}
                </ListGroup>
              </Card.Body>
            </Card>

            <Card className="mb-4">
              <Card.Body>
                <Card.Title>Detalles del Proyecto</Card.Title>
                <p>Prioridad: {formData.prioridad}</p>
                <p>Estado: {formData.estado}</p>
                <p>Metodología: {formData.metodologia}</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Lista de equipos y miembros */}
        <Row>
          <Col md={12}>
            <Card className="mb-4">
              <Card.Body>
                <Card.Title>Equipos y Miembros</Card.Title>
                {equipos.length === 0 ? (
                  <div className="alert alert-info">
                    No hay recursos asignados
                  </div>
                ) : (
                  <div
                    className="accordion"
                    id="accordionPanelsStayOpenExample"
                  >
                    {equipos.map((equipo, index) => (
                      <div className="accordion-item" key={equipo.equipo}>
                        <h2 className="accordion-header">
                          <button
                            className="accordion-button"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target={`#collapse${index}`}
                            aria-expanded={index === 0}
                            aria-controls={`collapse${index}`}
                          >
                            {equipo.equipo}
                          </button>
                        </h2>
                        <div
                          id={`collapse${index}`}
                          className={`accordion-collapse collapse ${
                            index === 0 ? "show" : ""
                          }`}
                          data-bs-parent="#accordionPanelsStayOpenExample"
                        >
                          <div className="accordion-body">
                            <div className="row">
                              {equipo.miembros.map((miembro) => (
                                <ul
                                  style={{ listStyleType: "none", padding: 0 }}
                                  key={miembro.nombre}
                                >
                                  <li>
                                    <div className="row">
                                      <div className="col-md-8">
                                        <div className="d-flex align-items-center">
                                          <Avatar
                                            sx={{ bgcolor: deepOrange[500] }}
                                          >
                                            {getInitials(miembro.nombre)}
                                          </Avatar>
                                          <p className="text-primary fw-medium mb-0 ms-2">
                                            {miembro.nombre}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="col-md-4">
                                        <p className="fw-medium">
                                          {miembro.puesto}
                                        </p>
                                      </div>
                                    </div>
                                  </li>
                                  <hr />
                                </ul>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default InfoProyecto;
