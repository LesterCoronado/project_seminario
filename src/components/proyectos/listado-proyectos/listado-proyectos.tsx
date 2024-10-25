import { useState, useEffect } from "react";
import { apiService } from "../../../services/apiService";
import { Button, Dropdown } from "react-bootstrap";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { FaStar, FaRegStar } from "react-icons/fa"; // Importa los iconos de estrella
import { Modal } from "react-bootstrap";
import CrearProyecto from "./crear-proyecto";
import { notificationService } from "../../../services/notificaciones";
import { filter } from "rxjs/operators";
import { Show_Alerta } from "../../../alertas/alertas";
import "./listado-proyectos.css";
import Avatar from "@mui/material/Avatar";
import Stack from "@mui/material/Stack";
import { deepOrange, deepPurple } from "@mui/material/colors";
import AsignarRecurso from "./asignar-recurso";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";
import { useAuth } from "../../../auth/adminContext.tsx";

let IdProyecto: number;
// Definir una interfaz para los proyectos
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

// Definir una interfaz para los miembros de un equipo
interface Equipo {
  equipo: string;
  miembros: { nombre: string; puesto: string; correo: string }[];
}

function Proyectos() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    console.log(isAuthenticated)
    return <div>No tienes acceso a este contenido.</div>;
  }
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [animatedProgress, setAnimatedProgress] = useState<{
    [key: number]: number;
  }>({});

  const [showInsertar, setShowInsertar] = useState(false);
  const [showEditar, setShowEditar] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showEquipos, setShowEquipos] = useState(false);
  const [showAsignarRecurso, setShowAsignarRecurso] = useState(false);
  const [projectIdToDelete, setProjectIdToDelete] = useState<number | null>(
    null
  );
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10); // Número de filas por página

  const handleCloseInsertar = () => setShowInsertar(false);
  const handleShowInsertar = () => setShowInsertar(true);

  const handleCloseEquipos = () => setShowEquipos(false);
  const handleShowEquipos = () => setShowEquipos(true);

  const handleCloseAsignarRecurso = () => setShowAsignarRecurso(false);
  const handleShowAsignarRecurso = () => setShowAsignarRecurso(true);

  const handleCloseEditar = () => setShowEditar(false);
  const handleShowEditar = (id: number) => {
    setShowEditar(true);
    IdProyecto = id;
  };
  const handleCloseConfirmDelete = () => setShowConfirmDelete(false);
  const handleShowConfirmDelete = (id: number) => {
    setProjectIdToDelete(id);
    setShowConfirmDelete(true);
  };
  function deleteProyecto() {
    if (projectIdToDelete !== null) {
      apiService
        .delete(`http://localhost:4000/proyectos/${projectIdToDelete}`)
        .then((response) => {
          Show_Alerta("Proyecto eliminado", "success");
          fetchProyectos(); // Actualiza la lista de proyectos después de eliminar
        })
        .catch((error) => {
          Show_Alerta("Error al eliminar el proyecto", "error");
        })
        .finally(() => {
          handleCloseConfirmDelete(); // Cierra el modal después de la eliminación o error
        });
    }
  }

  // Función para obtener los proyectos usando el servicio apiService
  const fetchProyectos = async () => {
    try {
      const data: Proyecto[] = await apiService.get(
        "http://localhost:4000/proyectos"
      );
      setProyectos(data);
      // Inicializar la animación de la barra de progreso para cada proyecto
      data.forEach((proyecto) => {
        animateProgress(proyecto.idProyecto, proyecto.progreso);
      });
    } catch (error) {
      console.error("Error al obtener los proyectos:", error);
    }
  };

  // Función para obtener los Equipos y Miembros usando el servicio apiService
  const fetchEquipos = async (id: any) => {
    setEquipos([]);
    try {
      const data: Equipo[] = await apiService.get(
        `http://localhost:4000/equipo-proyecto/${id}`
      );
      setEquipos(data);
      console.log(data);
    } catch (error) {
      console.error("Error al obtener los proyectos:", error);
    }
  };

  // Animar el progreso de la barra
  const animateProgress = (id: number, target: number) => {
    let progress = 0;
    const step = target / 20;
    const interval = setInterval(() => {
      progress += step;
      if (progress >= target) {
        clearInterval(interval);
        setAnimatedProgress((prev) => ({ ...prev, [id]: target }));
      } else {
        setAnimatedProgress((prev) => ({
          ...prev,
          [id]: Math.floor(progress),
        }));
      }
    }, 25);
  };

  // Determinar el color del estado y la barra de progreso
  const getStateColor = (estado: string) => {
    switch (estado) {
      case "Finalizado":
        return { badgeColor: "bg-success", progressColor: "bg-success" }; // Verde
      case "En desarrollo":
        return { badgeColor: "bg-warning", progressColor: "bg-warning" }; // Azul
      case "En espera":
        return { badgeColor: "bg-secondary", progressColor: "bg-secondary" }; // Negro y rojo
      default:
        return { badgeColor: "bg-secondary", progressColor: "bg-secondary" }; // Gris
    }
  };

  // Función para convertir la prioridad en estrellas
  const renderStars = (prioridad: any) => {
    switch (prioridad) {
      case "Alta":
        return (
          <>
            <FaStar />
            <FaStar />
            <FaStar />
            <FaStar />
            <FaStar />
          </>
        ); // Cinco estrellas llenas
      case "Media":
        return (
          <>
            <FaStar />
            <FaStar />
            <FaStar />
            <FaRegStar />
            <FaRegStar />
          </>
        ); // Tres llenas, dos vacías
      case "Baja":
        return (
          <>
            <FaStar />
            <FaRegStar />
            <FaRegStar />
            <FaRegStar />
            <FaRegStar />
          </>
        ); // Una llena, cuatro vacías
      default:
        return (
          <>
            <FaRegStar />
            <FaRegStar />
            <FaRegStar />
          </>
        ); // Tres vacías (por defecto o error)
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

  const getSeverityColor = (
    estado: string
  ): "success" | "info" | "warning" | "danger" | "secondary" => {
    switch (estado) {
      case "Finalizado":
        return "success";
      case "En desarrollo":
        return "info";
      case "warning":
        return "warning";
      case "danger":
        return "danger";
      case "secondary":
        return "secondary";
      default:
        return "secondary"; // Valor predeterminado
    }
  };

  const renderEstado = (estado: string) => {
    const badgeColor = getSeverityColor(estado);
    return <Tag value={estado} severity={badgeColor} />;
  };

  // useEffect para llamar a la API cuando el componente se monta
  useEffect(() => {
    const subscription = notificationService
      .getNotification()
      .subscribe((value) => {
        fetchProyectos();
        handleCloseInsertar();
        handleCloseEditar();
      });
    const subscription2 = notificationService
      .getAsignacionRecurso()
      .subscribe((value) => {
        handleCloseAsignarRecurso();
      });

    fetchProyectos();
  }, []);

  return (
    <>
      <div className="mt-1 p-3 card ">
        <div className="row cintaOpciones  p-2">
          <div className="col-md-4">
            <div className="d-flex align-items-center">
              <h2 className=" fw-bold">Proyectos</h2>
              <span className="badge bg-secondary text-white ms-2">
                Total {proyectos.length}
              </span>
            </div>
          </div>
          <div className="col-md-4  d-flex justify-content-center align-items-center">
            <div>
              <Form>
                <Row>
                  <Col xs="auto">
                    <Form.Control
                      type="text"
                      placeholder="Search"
                      className="m-0 w-100"
                    />
                  </Col>
                </Row>
              </Form>
            </div>
          </div>
          <div className="col-md-4 ">
            <div
              style={{
                display: "flex",
                justifyContent: "end",
                gap: "8px",
              }}
            >
              <Button onClick={handleShowInsertar}>Crear Proyecto</Button>
              <Button
                className="btn btn-dark"
                onClick={handleShowAsignarRecurso}
              >
                Asignar Recurso
              </Button>
            </div>
          </div>
        </div>
        <hr className="divider" />
        <DataTable
          value={proyectos}
          tableStyle={{ minWidth: "50rem" }}
          paginator
          rows={rows}
          first={first}
          rowsPerPageOptions={[5, 10, 25, 50]} // Opciones para seleccionar cuántos ítems mostrar por página
          paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown" // Mover RowsPerPageDropdown al final
        >
          <Column field="Nombre" header="nombre" />
          <Column field="descripcion" header="descripcion" />
          <Column field="tipoProyecto" header="tipo" />
          <Column field="metodologia" header="metodologia" />
          <Column field="tecnologiasUsadas" header="tecnologias" />
          <Column
            header="Nivel Prioridad"
            body={(rowData) => renderStars(rowData.prioridad)}
          ></Column>
          <Column field="cliente.nombre" header="cliente" />
          <Column
            header="Estado"
            body={(rowData) => renderEstado(rowData.estado)}
          ></Column>

          <Column
            field="progreso"
            header="Progreso"
            body={(rowData) => `${rowData.progreso}%`}
          />
          <Column
            body={(rowData: Proyecto) => (
              <div className="d-flex justify-content-center">
                <button
                  className="btn btn-light"
                  onClick={() => {
                    fetchEquipos(rowData.idProyecto);
                    setShowEquipos(true);
                  }}
                >
                  <i className="bi bi-people"></i> Ver
                </button>
              </div>
            )}
            header="Recursos"
          />
          <Column
            body={(rowData: Proyecto) => (
              <div className="d-flex justify-content-center gap-1 ">
                <button
                  className="btn btn-light"
                  onClick={() => handleShowEditar(rowData.idProyecto)}
                >
                  <i className="bi bi-pencil-square text-primary"></i>
                </button>
                <button
                  className="btn btn-light"
                  onClick={() => handleShowConfirmDelete(rowData.idProyecto)}
                >
                  <i className="bi bi-archive text-danger"></i>
                </button>
              </div>
            )}
            header="Acciones"
          />
        </DataTable>
      </div>
      {/* Modal para Agregar Proyecto */}
      <Modal show={showInsertar} onHide={handleCloseInsertar}>
        <Modal.Header closeButton>
          <Modal.Title>Nuevo Proyecto</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <CrearProyecto idProyecto={0} />
        </Modal.Body>
      </Modal>

      {/* Modal para Editar Proyecto */}
      <Modal show={showEditar} onHide={handleCloseEditar}>
        <Modal.Header closeButton>
          <Modal.Title>Nuevo Proyecto</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <CrearProyecto idProyecto={IdProyecto} />
        </Modal.Body>
      </Modal>

      {/* Modal de Confirmación de Eliminación */}
      <Modal show={showConfirmDelete} onHide={handleCloseConfirmDelete}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Estás seguro de que quieres eliminar este proyecto?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseConfirmDelete}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={deleteProyecto}>
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal para Listar Recursos Asignados a un proyecto */}
      <Modal show={showEquipos} onHide={handleCloseEquipos}>
        <Modal.Header closeButton>
          <Modal.Title>Recursos del Proyecto</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {equipos.length === 0 ? (
            <div className="alert alert-info">No hay recursos asignados</div>
          ) : (
            <div className="accordion" id="accordionPanelsStayOpenExample">
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
                                    <Avatar sx={{ bgcolor: deepOrange[500] }}>
                                      {getInitials(miembro.nombre)}
                                    </Avatar>
                                    <p className="text-primary fw-medium mb-0 ms-2">
                                      {miembro.nombre}
                                    </p>
                                  </div>
                                </div>
                                <div className="col-md-4">
                                  <p className="fw-medium">{miembro.puesto}</p>
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
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseEquipos}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal para Asignar Recursos */}
      <Modal show={showAsignarRecurso} onHide={handleCloseAsignarRecurso}>
        <Modal.Header closeButton>
          <Modal.Title>Asignar Recurso</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <AsignarRecurso />
        </Modal.Body>
      </Modal>
    </>
  );
}

export default Proyectos;
