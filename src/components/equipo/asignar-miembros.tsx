import { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import { apiService } from "../../services/apiService";
import { notificationService } from "../../services/notificaciones";
import { Show_Alerta } from "../../alertas/alertas";

interface Equipo {
  equipo: {
    idEquipo: number;
    nombre: string;
  };
}
interface Usuario {
  idUsuario: number;
  nombre: string;
}

export const AsignarMiembros = (props: any) => {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [validated, setValidated] = useState(false);
  const [formData, setFormData] = useState({
    idEquipo: 0,
    idUsuario: 0,
    puesto: "",
  });

  // Función de validación reutilizable
  const validateForm = (form: HTMLFormElement) => {
    if (form.checkValidity() === false) {
      setValidated(true);
      return false;
    }
    return true;
  };

  const fetchEquipos = async () => {
    try {
      const data: Equipo[] = await apiService.get(
        `https://sp-backend-production.up.railway.app/equipos`
      );
      setEquipos(data);
    } catch (error) {
      console.error("Error al obtener los proyectos:", error);
    }
  };

  const fetchUsuarios = async () => {
    try {
      const data: Usuario[] = await apiService.get(
        "https://sp-backend-production.up.railway.app/usuarios"
      );
      setUsuarios(data);
    } catch (error) {
      console.error("Error al obtener los usuarios:", error);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const form = event.currentTarget;

    // Validar el formulario antes de enviar
    if (!validateForm(form)) return;

    const finalData = {
      idEquipo: formData.idEquipo,
      idUsuario: formData.idUsuario,
      puesto: formData.puesto,
    };

    try {
      const response = await apiService.post(
        "https://sp-backend-production.up.railway.app/miembroequipo",
        finalData
      );
      console.log("Respuesta del servidor:", response);
      notificationService.sendAsignacionRecurso(true);
      Show_Alerta("Usuario asignado con éxito", "success");
    } catch (error: any) {
      if (
        error.response?.data?.message ===
        "El usuario ya está asignado a este equipo."
      ) {
        Show_Alerta("El usuario ya está asignado a este equipo.", "info");
      }
    }
  };

  // Función para desasignar el recurso, incluyendo validación
  const desAsignarRecurso = async () => {
    let idEquipo = formData.idEquipo;
    let idUsuario = formData.idUsuario;
    if (idEquipo == 0 || idUsuario == 0) {
      Show_Alerta("Por favor seleccione un equipo y un usuario", "info");
    } else {
      try {
        const response = await apiService.delete(
          `https://sp-backend-production.up.railway.app/miembroequipo/${idEquipo}/${idUsuario}`
        );
        console.log("Respuesta del servidor:", response);
        Show_Alerta("Usuario desasignado con éxito", "success");
        notificationService.sendAsignacionRecurso(true);
      } catch (error: any) {
        if (
          error.response?.data?.message ===
          "No se encontró la relación de usuario con el equipo."
        ) {
          Show_Alerta("No se encontró la relación de usuario con el equipo.", "info");
        } else {
          console.error("Error al desasignar el recurso:", error);
        }
      }
    }
  };

  useEffect(() => {
    fetchEquipos();
    fetchUsuarios();
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
            <Form.Label>Usuario</Form.Label>
            <Form.Select
              value={formData.idUsuario}
              required
              name="idUsuario"
              onChange={(e) =>
                setFormData({
                  ...formData,
                  idUsuario: parseInt(e.target.value),
                })
              }
            >
              <option value="">Selecciona una opción</option>
              {usuarios.map((usuario) => (
                <option key={usuario.idUsuario} value={usuario.idUsuario}>
                  {usuario.nombre}
                </option>
              ))}
            </Form.Select>
            <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
          </Form.Group>
          <Form.Group as={Col} md="12" controlId="validationCustom08">
            <Form.Label>Puesto</Form.Label>

            <Form.Control
              type="text"
              placeholder="Puesto"
              required
              name="puesto"
              onChange={(e) =>
                setFormData({ ...formData, puesto: e.target.value })
              }
            ></Form.Control>

            <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
          </Form.Group>
        </Row>
        <div className="d-grid gap-2 d-md-flex justify-content-md-end mt-5">
          <Button
            disabled={formData.idEquipo == 0 || formData.idUsuario == 0}
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

export default AsignarMiembros;
