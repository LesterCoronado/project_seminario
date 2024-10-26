import React, { useEffect, useState } from "react";
import { apiService } from "../../services/apiService";
import { Carousel, CarouselResponsiveOption } from "primereact/carousel"; // Importar el Carousel
import { Card } from "primereact/card";
import { Divider } from "primereact/divider";
import { ProgressBar } from "primereact/progressbar";
import { Button } from "primereact/button";
import { Avatar } from "primereact/avatar";
import { formatDistanceToNow } from "date-fns";
import es from "date-fns/locale/es";
import Cookies from "js-cookie"; // Para manejar las cookies
import { jwtDecode } from "jwt-decode";

function TareasPendientes() {
  interface Tareas {
    idActividad: number;
    idProyecto: number;
    nombreProyecto: string;
    idDependencia: number;
    tipo: string;
    idResponsable: number;
    nombre: string;
    fechaInicio: string;
    fechaFin: string;
    progreso: number;
  }

  const [tareas, setTareas] = useState<Tareas[]>([]);

  const fecthTasks = async () => {
    const token: any = Cookies.get("token");
    const decoded: any = jwtDecode(token); // Decodifica el token
    try {
      const data = await apiService.get(
        `https://sp-backend-production.up.railway.app/misactividades/${decoded.idMiembroEquipo}`
      );
      console.log(data);
      setTareas(data);
    } catch (error) {
      console.error("Error al obtener las tareas:", error);
    }
  };

  useEffect(() => {
    fecthTasks();
  }, []);

  // Template de la tarea para el carrusel
  const taskTemplate = (tarea: Tareas) => {
    return (
      <Card
        title={"Proyecto: " + tarea.nombreProyecto}
        className="border-1 surface-border border-round m-2 text-center py-5 px-3"
      >
        <p>
          <span className="fw-bold">Tarea:</span> {tarea.nombre}
        </p>
        <Divider />
        <p>Inicio: {new Date(tarea.fechaInicio).toLocaleDateString()}</p>
        <p>Fin: {new Date(tarea.fechaFin).toLocaleDateString()}</p>
        <p>
          Progreso: <ProgressBar value={tarea.progreso} />
        </p>
        <p>
          <small>{`Hace ${formatDistanceToNow(new Date(tarea.fechaInicio), {
            locale: es,
          })}`}</small>
        </p>
      </Card>
    );
  };

  const responsiveOptions: CarouselResponsiveOption[] = [
    {
      breakpoint: "1400px",
      numVisible: 3,
      numScroll: 1,
    },
    {
      breakpoint: "1199px",
      numVisible: 2,
      numScroll: 1,
    },
    {
      breakpoint: "767px",
      numVisible: 2,
      numScroll: 1,
    },
    {
      breakpoint: "575px",
      numVisible: 1,
      numScroll: 1,
    },
  ];

  return (
    <div className="carrousel content">
      <h1 className="text-center mt-3 mb-3 fw-bold text-muted">
        Mis Tareas Asignadas
      </h1>
      {/* si no hay tareas Asignadas */}
      {tareas.length === 0 && (
        <div className="text-center mt-5">
          <Avatar
            icon="pi pi-folder"
            size="xlarge"
            shape="circle"
            className="p-m-2"
          />
          <h2 className="text-muted">No hay tareas asignadas</h2>
          <Button
            label="Refrescar"
            icon="pi pi-refresh"
            className="p-button-raised p-button-text mt-3 mb-5"
            onClick={fecthTasks}
          />
        </div>
      )}
     {/* si hay tareas Asignadas */}
      {tareas.length > 0 && (
         <div className="tareas-container">
         <Carousel
           value={tareas}
           numVisible={3}
           numScroll={3}
           responsiveOptions={responsiveOptions}
           autoplayInterval={15000}
           itemTemplate={taskTemplate}
         />
       </div>
      )}
    </div>
  );
}

export default TareasPendientes;
