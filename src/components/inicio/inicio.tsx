import React, { useState, useEffect } from "react";
import { Button } from "primereact/button";
import { Carousel, CarouselResponsiveOption } from "primereact/carousel";
import { Tag } from "primereact/tag";
import { apiService } from "../../services/apiService";
import { notificationService } from "../../services/notificaciones";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/adminContext.tsx";
import "./inicio.css";
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

function Inicio() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    console.log(isAuthenticated);
    return <div>No tienes acceso a este contenido.</div>;
  }
  const navigate = useNavigate();
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);

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

  const responsiveOptions: CarouselResponsiveOption[] = [
    {
      breakpoint: "1400px",
      numVisible: 2,
      numScroll: 1,
    },
    {
      breakpoint: "1199px",
      numVisible: 3,
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

  // Plantilla del proyecto para el carrusel
  const projectTemplate = (proyecto: Proyecto) => {
    return (
      <div className="carrousel border-1 surface-border border-round m-2 text-center py-5 px-3">
        <div>
          <h4 className="mb-1">{proyecto.Nombre}</h4>
          <h6 className="mt-0 mb-3">{proyecto.descripcion}</h6>
          <Tag value={proyecto.estado} severity="success" />
          <div className="mt-5 flex flex-wrap gap-2 justify-content-center">
            <Button
              icon="pi pi-eye"
              rounded
              label="Ver Detalles"
              onClick={() => navigate(`/proyecto/${proyecto.idProyecto}`)}
            />
            <Button icon="pi pi-star-fill" rounded severity="success" />
          </div>
          <div className="mt-3">
            {/* Barra de progreso */}
            <div style={{ width: "100%", backgroundColor: "#f3f3f3" }}>
              <div
                style={{
                  width: `${proyecto.progreso}%`,
                  height: "10px",
                  backgroundColor: "#4caf50",
                }}
              />
            </div>
            <span>{proyecto.progreso}% completado</span>
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    const subscription = notificationService.getNotification().subscribe(() => {
      fetchProyectos();
    });

    fetchProyectos();

    // Limpieza del efecto
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="content">
      <h1 className="text-center text-muted fw-bold mt-5 mb-5">
        Mis Proyectos
      </h1>
      <div className="">
        <Carousel
          value={proyectos}
          numVisible={3}
          numScroll={3}
          responsiveOptions={responsiveOptions}
          autoplayInterval={10000}
          itemTemplate={projectTemplate}
        />
      </div>
    </div>
  );
}

export default Inicio;
