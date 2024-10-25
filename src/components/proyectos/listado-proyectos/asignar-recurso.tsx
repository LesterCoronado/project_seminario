import { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import { apiService } from "../../../services/apiService";
import { notificationService } from "../../../services/notificaciones";
import { Show_Alerta } from "../../../alertas/alertas";

interface Proyecto {
  idProyecto: number;
  Nombre: string;
}

interface Equipo {
  equipo: {
    idEquipo: number;
    nombre: string;
  };
}

export const AsignarRecurso = (props: any) => {
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [validated, setValidated] = useState(false);
  const [formData, setFormData] = useState({
    idProyecto: 0,
    idEquipo: 0,
  });

  // Función de validación reutilizable
  const validateForm = (form: HTMLFormElement) => {
    if (form.checkValidity() === false) {
      setValidated(true);
      return false;
    }
    return true;
  };

  const fetchProyectos = async () => {
    try {
      const data: Proyecto[] = await apiService.get(
        `http://localhost:4000/proyectos`
      );
      setProyectos(data);
    } catch (error) {
      console.error("Error al obtener los proyectos:", error);
    }
  };

  const fetchEquipos = async () => {
    try {
      const data: Equipo[] = await apiService.get(
        "http://localhost:4000/equipos"
      );
      setEquipos(data);
    } catch (error) {
      console.error("Error al obtener los equipos:", error);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const form = event.currentTarget;

    // Validar el formulario antes de enviar
    if (!validateForm(form)) return;

    const finalData = {
      idProyecto: formData.idProyecto,
      idEquipo: formData.idEquipo,
    };

    try {
      const response = await apiService.post(
        "http://localhost:4000/equipo-proyecto",
        finalData
      );
      console.log("Respuesta del servidor:", response);
      notificationService.sendAsignacionRecurso(true);
      Show_Alerta("Recurso asignado con éxito", "success");
    } catch (error: any) {
      if (
        error.response?.data?.message ===
        "El equipo ya está asignado a este proyecto."
      ) {
        Show_Alerta("El equipo ya está asignado a este proyecto.", "info");
      }
    }
  };

  // Función para desasignar el recurso, incluyendo validación
  const desAsignarRecurso = async () => {
    let idEquipo = formData.idEquipo;
    let idProyecto = formData.idProyecto;
    if (idEquipo == 0 || idProyecto == 0) {
      Show_Alerta("Por favor seleccione un equipo y un proyecto", "info");
    } else {
      try {
        const response = await apiService.delete(
          `http://localhost:4000/equipo-proyecto/${idEquipo}/${idProyecto}`
        );
        console.log("Respuesta del servidor:", response);
        Show_Alerta("Recurso desasignado con éxito", "success");
        notificationService.sendAsignacionRecurso(true);
      } catch (error: any) {
        if (
          error.response?.data?.message ===
          "No se encontró la asignación para eliminar"
        ) {
          Show_Alerta("No se encontró la asignación para eliminar", "info");
        } else {
          console.error("Error al desasignar el recurso:", error);
        }
      }
    }
  };

  useEffect(() => {
    fetchProyectos();
    fetchEquipos();
  }, []);

  return (
    <>
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Row className="mb-3">
          <Form.Group as={Col} md="12" controlId="validationCustom08">
            <Form.Label>Equipo</Form.Label>
            <Form.Select
              value={formData.idEquipo}
              required
              name="idEquipo"
              onChange={(e) =>
                setFormData({ ...formData, idEquipo: parseInt(e.target.value) })
              }
            >
              <option value="">Selecciona una opción</option>
              {equipos.map((equipoObj) => (
                <option
                  key={equipoObj.equipo.idEquipo}
                  value={equipoObj.equipo.idEquipo}
                >
                  {equipoObj.equipo.nombre}
                </option>
              ))}
            </Form.Select>
            <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
          </Form.Group>
          <Form.Group as={Col} md="12" controlId="validationCustom08">
            <Form.Label>Proyecto</Form.Label>
            <Form.Select
              value={formData.idProyecto}
              required
              name="idProyecto"
              onChange={(e) =>
                setFormData({
                  ...formData,
                  idProyecto: parseInt(e.target.value),
                })
              }
            >
              <option value="">Selecciona una opción</option>
              {proyectos.map((proyecto) => (
                <option key={proyecto.idProyecto} value={proyecto.idProyecto}>
                  {proyecto.Nombre}
                </option>
              ))}
            </Form.Select>
            <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
          </Form.Group>
        </Row>
        <div className="d-grid gap-2 d-md-flex justify-content-md-end mt-5">
          <Button
            disabled={formData.idEquipo == 0 || formData.idProyecto == 0}
            type="button"
            className="btn btn-secondary g-3"
            onClick={desAsignarRecurso}
          >
            DesAsignar
          </Button>
          <Button type="submit">Asignar</Button>
        </div>
      </Form>
    </>
  );
};

export default AsignarRecurso;
