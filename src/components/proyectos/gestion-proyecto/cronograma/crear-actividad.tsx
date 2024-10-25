import { useState, useEffect } from "react";
import NavbarAside from "../navbar-aside/navbar-aside.tsx";
import { apiService } from "../../../../services/apiService.ts";
import { useParams } from "react-router-dom";
import { Show_Alerta } from "../../../../alertas/alertas.tsx";
import { notificationService } from "../../../../services/notificaciones.tsx";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import "./crear-actividad.css";

interface Actividad {
  idActividad: number;
  idDependencia: number | null;
  tipo: string;
  idProyecto: number;
  idResponsable: number | null;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  progreso: number;
}

interface Miembro {
  id: number;
  nombre: string;
  equipo: string; // Agregamos el nombre del equipo
}

export const CrearActividad = (props: any) => {
  let idProyecto = Number(sessionStorage.getItem("id"));
  const [validated, setValidated] = useState(false);
  const [miembros, setMiembros] = useState<Miembro[]>([]);
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [isMilestone, setIsMilestone] = useState(false);

  const [formData, setFormData] = useState<Actividad>({
    idActividad: 0,
    idDependencia: null,
    tipo: "",
    idProyecto: idProyecto,
    idResponsable: null,
    nombre: "",
    fechaInicio: "",
    fechaFin: "",
    progreso: 0,
  });

  /*funcion para listar las actividades registradas en la bd, 
  con el fin de que el usuairo pueda asignar una dependencia 
  a la actividad que se esta creando*/
  const fetchActividades = async () => {
    try {
      const data: Actividad[] = await apiService.get(
        `http://localhost:4000/actividades/${idProyecto}`
      );
      setActividades(data);
    } catch (error) {
      console.error("Error al obtener los hitos:", error);
    }
  };

  /* 
  Funcion para obtener la informacion de la actividad que se esta editando
  */
  const fetchActividad = async () => {
    try {
      const data: Actividad = await apiService.get(
        `http://localhost:4000/actividad/${props.idActividad}`
      );
      console.log("Actividad:", data);
      setFormData({
        idActividad: data.idActividad,
        idDependencia: data.idDependencia,
        tipo: data.tipo,
        idProyecto: data.idProyecto,
        idResponsable: data.idResponsable,
        nombre: data.nombre,
        fechaInicio: data.fechaInicio,
        fechaFin: data.fechaFin,
        progreso: data.progreso
      })
        // Actualizamos isMilestone si el tipo de la actividad es "milestone"
    setIsMilestone(data.tipo === "milestone");
    } catch (error) {
      console.error("Error al obtener la actividad:", error);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      setValidated(true);
      return;
    }

    const finalData = {
      ...formData,
      idProyecto: idProyecto,
      fechaFin: isMilestone ? formData.fechaInicio : formData.fechaFin,
    };

    if (props.idActividad == 0) {
      try {
        const response = await apiService.post(
          "http://localhost:4000/actividades",
          finalData
        );
        notificationService.sendActividad(true);
        Show_Alerta("Actividad creada con éxito", "success");
      } catch (error) {
        console.log(finalData);
        console.error("Error al enviar datos:", error);
        Show_Alerta(
          "Hubo un error al crear actividad, intente nuevamente",
          "error"
        );
      }
    } else {
      try {
        const response = await apiService.update(
          `http://localhost:4000/actividad/${props.idActividad}`,
          finalData
        );
        notificationService.sendActividad(true);
        Show_Alerta("Actividad actualizada con éxito", "success");
      } catch (error) {
        console.error("Error al enviar datos:", error);
        Show_Alerta(
          "Hubo un error al actualizar actividad, intente nuevamente",
          "error"
        );
        }
    }

    setValidated(true);
  };

  // Función para obtener los miembros de los equipos del proyecto
  const fetchMiembrosEquipos = async () => {
    try {
      const data = await apiService.get(
        `http://localhost:4000/equipo-proyecto/${idProyecto}`
      );
      const miembrosList: Miembro[] = [];
      data.forEach((equipo: any) => {
        equipo.miembros.forEach((miembro: any) => {
          miembrosList.push({
            id: miembro.id,
            nombre: miembro.nombre,
            equipo: equipo.equipo, // Agregamos el equipo del miembro
          });
        });
      });
      setMiembros(miembrosList);
    } catch (error) {
      console.error("Error al obtener los miembros del equipo:", error);
    }
  };

  useEffect(() => {
    if (props.idActividad === 0) {
      console.log("CREANDO");
    } else {
      console.log("EDITANDO");
      fetchActividad();
    }
    fetchMiembrosEquipos();
    fetchActividades();
  }, [props.idActividad]);

  const handleTipoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tipo = e.target.value;
    setFormData({ ...formData, tipo });
    setIsMilestone(tipo === "milestone");
  };

  return (
    <Form noValidate validated={validated} onSubmit={handleSubmit}>
      <Row className="mb-3">
        <Form.Group as={Col} md="6" controlId="nombreActividad">
          <Form.Label>Nombre de la Actividad</Form.Label>
          <Form.Control
            required
            type="text"
            value={formData.nombre}
            onChange={(e) =>
              setFormData({ ...formData, nombre: e.target.value })
            }
          />
          <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
        </Form.Group>
  
        <Form.Group as={Col} md="6" controlId="tipoActividad">
          <Form.Label>Tipo de Actividad</Form.Label>
          <Form.Select
            required
            value={formData.tipo}
            onChange={handleTipoChange}
          >
            <option value="">Selecciona una opción</option>
            <option value="task">Tarea</option>
            <option value="milestone">Hito</option>
          </Form.Select>
          <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
        </Form.Group>
  
        <Form.Group as={Col} md="6" controlId="responsable">
          <Form.Label>Responsable</Form.Label>
          <Form.Select
            value={formData.idResponsable || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                idResponsable: parseInt(e.target.value),
              })
            }
            disabled={miembros.length === 0}
          >
            <option value="">Selecciona un responsable</option>
            {miembros.map((miembro) => (
              <option key={miembro.id} value={miembro.id}>
                {miembro.nombre} - {miembro.equipo}
              </option>
            ))}
          </Form.Select>
          <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
        </Form.Group>
  
        <Form.Group as={Col} md="6" controlId="fechaInicio">
          <Form.Label>Fecha de Inicio</Form.Label>
          <Form.Control
            required
            type="date"
            value={formData.fechaInicio}
            onChange={(e) =>
              setFormData({ ...formData, fechaInicio: e.target.value })
            }
          />
          <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
        </Form.Group>
  
        {/* Solo mostrar el campo de fecha de fin si no es un hito */}
        {!isMilestone && (
          <Form.Group as={Col} md="6" controlId="fechaFin">
            <Form.Label>Fecha de Fin</Form.Label>
            <Form.Control
              required
              type="date"
              value={formData.fechaFin}
              onChange={(e) =>
                setFormData({ ...formData, fechaFin: e.target.value })
              }
            />
            <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
          </Form.Group>
        )}
  
        <Form.Group as={Col} md="6" controlId="progreso">
          <Form.Label>Progreso (%)</Form.Label>
          <Form.Control
            required
            type="number"
            min="0"
            max="100"
            value={formData.progreso}
            onChange={(e) =>
              setFormData({ ...formData, progreso: parseFloat(e.target.value) })
            }
          />
          <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
        </Form.Group>
  
        <Form.Group as={Col} md="6" controlId="dependenciaActividad">
          <Form.Label>Dependencia</Form.Label>
          <Form.Select
            value={formData.idDependencia || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                idDependencia: e.target.value ? parseInt(e.target.value) : null,
              })
            }
          >
            <option value="" className="fst-italic">
              Sin Dependencia
            </option>
            {actividades.map((actividad) => (
              <option key={actividad.idActividad} value={actividad.idActividad}>
                {actividad.nombre}
              </option>
            ))}
          </Form.Select>
          <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
        </Form.Group>
      </Row>
  
      <Button type="submit">Guardar</Button>
    </Form>
  );
  
};

export default CrearActividad;
