import { useState, useEffect } from "react";
import NavbarAside from "../navbar-aside/navbar-aside.tsx";
import { apiService } from "../../../../services/apiService.ts";
import { useParams } from "react-router-dom";
import {
  Gantt,
  Task,
  ViewMode,
  Dependency,
  TaskOrEmpty,
  OnDateChangeSuggestionType,
} from "@wamra/gantt-task-react";

import { Modal } from "react-bootstrap";
import { notificationService } from "../../../../services/notificaciones.tsx";
import CrearActividad from "./crear-actividad.tsx";
import "@wamra/gantt-task-react/dist/style.css";
import "./crear-actividad.css";
import { Show_Alerta } from "../../../../alertas/alertas.tsx";
import { useAuth } from "../../../../auth/adminContext.tsx";

// Interfaces y tipos

interface Actividades {
  idActividad: number;
  idDependencia: number | null;
  tipo: string;
  idProyecto: number;
  idResponsable: number;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  progreso: number;
}

interface Tasks extends Task {
  start: Date;
  end: Date;
  name: string;
  id: string;
  type: "task" | "milestone";
  progress: number;
  isDisabled: boolean;
  dependencies: Dependency[];
  styles: {};
}
let nombreProyecto : any;

export const Cronograma = () => {
  nombreProyecto = sessionStorage.getItem("project");
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    console.log(isAuthenticated)
    return <div>No tienes acceso a este contenido.</div>;
  }
  const params = useParams();
  const [isOpen, setIsOpen] = useState(false);
  const [actividades, setActividades] = useState<Actividades[]>([]);
  const [tasks, setTasks] = useState<Tasks[]>([]);
  const [showInsertar, setShowInsertar] = useState(false);
  const [showEditar, setShowEditar] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false); // Estado para el modal de confirmación
  const [selectedTask, setSelectedTask] = useState<Tasks | null>(null);

  const handleCloseInsertar = () => setShowInsertar(false);
  const handleShowInsertar = () => setShowInsertar(true);
  const handleCloseEditar = () => setShowEditar(false);
  const handleShowEditar = () => setShowEditar(true);
  const handleCloseConfirmDelete = () => setShowConfirmDelete(false); // Cerrar modal de confirmación
  const handleShowConfirmDelete = (tasks: readonly TaskOrEmpty[]) => {
    if (tasks.length > 0 && "id" in tasks[0]) {
      const selected = tasks[0];
      const selectedTask = tasks.find((t) => t.id === selected.id);
      if (selectedTask) {
        setSelectedTask(selectedTask as Tasks); // Guardar la tarea seleccionada
        setShowConfirmDelete(true); // Mostrar modal de confirmación
      }
    }
  };

  const confirmDelete = async () => {
    if (selectedTask) {
      await deleteActividad(selectedTask.id); // Llama a deleteActividad directamente con el ID
      handleCloseConfirmDelete(); // Cierra el modal de confirmación
    }
  };

  const deleteActividad = async (id: string) => {
    try {
      await apiService.delete(`http://localhost:4000/actividad/${id}`);
      fetchHitos(); // Volver a obtener las tareas
      Show_Alerta("Actividad eliminada con éxito", "success");
    } catch (error) {
      console.error("Error al eliminar la actividad:", error);
      Show_Alerta("Error al eliminar la actividad", "error");
    }
  };

  const handleToggle = (isOpen: boolean) => {
    setIsOpen(isOpen);
  };

  const fetchHitos = async () => {
    try {
      const data: Actividades[] = await apiService.get(
        `http://localhost:4000/actividades/${params.id}`
      );

      setActividades(data);

      const mappedTasks: Tasks[] = data.map((actividades) => {
        const [startYear, startMonth, startDay] = actividades.fechaInicio
          .split("-")
          .map(Number);
        const [endYear, endMonth, endDay] = actividades.fechaFin
          .split("-")
          .map(Number);

        let dependencies: Dependency[] = [];

        if (actividades.idDependencia) {
          const parentTask = data.find(
            (item) => item.idActividad === actividades.idDependencia
          );
          if (parentTask) {
            dependencies.push({
              sourceId: parentTask.idActividad.toString(),
              sourceTarget: "endOfTask",
              ownTarget: "startOfTask",
            });
          }
        }

        return {
          start: new Date(startYear, startMonth - 1, startDay),
          end: new Date(endYear, endMonth - 1, endDay),
          name: actividades.nombre,
          id: actividades.idActividad.toString(),
          type:
            actividades.tipo === "task" || actividades.tipo === "milestone"
              ? actividades.tipo
              : "task",
          progress: actividades.progreso,
          isDisabled: false,
          dependencies,
          styles: {},
        };
      });

      setTasks(mappedTasks);
    } catch (error) {
      console.error("Error al obtener los hitos:", error);
    }
  };

  useEffect(() => {
    const subscription = notificationService
      .getActividad()
      .subscribe((value) => {
        fetchHitos();
        handleCloseInsertar();
        handleCloseEditar();
      });
    fetchHitos();
  }, [params.id]);

  const editar = (task: TaskOrEmpty) => {
    if (task && "id" in task) {
      const selected = tasks.find((t) => t.id === task.id);
      if (selected) {
        setSelectedTask(selected); // Guardar la tarea seleccionada
        handleShowEditar();
      }
    } else {
      console.log("No hay tarea seleccionada o no tiene un ID válido.");
    }
  };

  return (
    <div className="contenido">
      <div className="navbar-aside">
        <NavbarAside onToggle={handleToggle} />
      </div>
      <div className="content card m-2 p-3">
        <div className="row p-2 header">
          <div className="col-md-6 d-flex flex-column justify-content-between">
            <span className="fst-italic">Proyectos / {nombreProyecto}</span>
            <h1>Cronograma</h1>
          </div>
          <div className="col-md-6 d-flex align-items-center justify-content-md-end">
            <button
              className="btn btn-primary me-md-2"
              type="button"
              onClick={handleShowInsertar}
            >
              <i className="bi bi-plus-lg"></i>
              Nueva Actividad
            </button>
          </div>
        </div>

        {tasks.length > 0 ? (
          <Gantt
            tasks={tasks}
            viewMode={ViewMode.Day}
            onEditTaskClick={editar}
            onDelete={handleShowConfirmDelete} // Mostrar el modal de confirmación
          />
        ) : (
          <p>No hay actividades para mostrar.</p>
        )}
      </div>

      {/* Modal para Crear Actividades */}
      <Modal show={showInsertar} onHide={handleCloseInsertar}>
        <Modal.Header closeButton>
          <Modal.Title>Nueva Actividad</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <CrearActividad idActividad={0} />
        </Modal.Body>
      </Modal>

      {/* Modal para Editar Actividades */}
      <Modal show={showEditar} onHide={handleCloseEditar}>
        <Modal.Header closeButton>
          <Modal.Title>Editar Actividad</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTask ? (
            <CrearActividad idActividad={selectedTask.id} />
          ) : (
            <p>No se ha seleccionado ninguna actividad para editar.</p>
          )}
        </Modal.Body>
      </Modal>

      {/* Modal de Confirmación de Eliminación */}
      <Modal show={showConfirmDelete} onHide={handleCloseConfirmDelete}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>¿Estás seguro de que deseas eliminar esta actividad?</p>
        </Modal.Body>
        <Modal.Footer>
          <button
            className="btn btn-secondary"
            onClick={handleCloseConfirmDelete}
          >
            Cancelar
          </button>
          <button className="btn btn-danger" onClick={confirmDelete}>
            Eliminar
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Cronograma;
