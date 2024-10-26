import { useState, useEffect } from "react";
import React, { useRef } from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import { apiService } from "../../services/apiService";
import { notificationService } from "../../services/notificaciones";
import { Show_Alerta } from "../../alertas/alertas";
import { Image } from "primereact/image";
import { Message } from "primereact/message";
import { Toast } from "primereact/toast";

interface Equipo {
  idEquipo: number;
  nombre: string;
  descripcion: string;
  idAreaTrabajo: number;
  estado: boolean;
}

interface AreaTrabajo {
  idAreaTrabajo: number;
  nombre: string;
  funciones: string;
}

const CrearEquipo = (props: any) => {
  const toast = useRef<Toast>(null);
  let _idProyecto = Number(sessionStorage.getItem("id"));
  const [validated, setValidated] = useState(false);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [areaTrabajo, setAreaTrabajo] = useState<AreaTrabajo[]>([]);

  const [formData, setFormData] = useState<Equipo>({
    idEquipo: 0,
    nombre: "",
    descripcion: "",
    idAreaTrabajo: 0,
    estado: true,
  });
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const dataToSubmit = {
      ...formData,
    };

    const form = event.currentTarget;

    // Verificamos si el formulario es válido
    if (form.checkValidity() === false) {
      setValidated(true);
      return;
    }

    try {
      console.log("Form data:", dataToSubmit);
      const endpoint =
        props.IdEquipo === 0 ? "equipos" : `equipos/${props.IdEquipo}`;
      const method = props.IdEquipo === 0 ? apiService.post : apiService.update;
      const response = await method(
        `https://sp-backend-production.up.railway.app/${endpoint}`,
        dataToSubmit
      );

      console.log("Respuesta del servidor:", response);
      notificationService.sendEquipo(true);
      Show_Alerta(
        `Error ${props.IdEquipo === 0 ? "creado" : "editado"} con éxito`,
        "success"
      );
    } catch (error) {
      console.error("Error al enviar datos:", error);
      alert(
        `Hubo un error al ${
          props.IdEquipo === 0 ? "crear" : "editar"
        } el equipo.`
      );
    }
    setValidated(true);
  };

  const fetchEquipoById = async () => {
    try {
      const data: Equipo = await apiService.get(
        `https://sp-backend-production.up.railway.app/equipo/${props.IdEquipo}`
      );
      console.log("Equipo:", data);

      setFormData({
        ...formData,
        idEquipo: data.idEquipo,
        nombre: data.nombre,
        descripcion: data.descripcion,
        idAreaTrabajo: data.idAreaTrabajo,
        estado: data.estado,
      });
    } catch (error) {
      console.error("Error al obtener el error:", error);
    }
  };
  const fetchAreaTrabajo = async () => {
    try {
      const data = await apiService.get(`https://sp-backend-production.up.railway.app/areaTrabajo`);

      setAreaTrabajo(data);
    } catch (error) {
      console.error("Error al obtener las áreas de trabajo:", error);
    }
  };

  useEffect(() => {
    if (props.IdEquipo !== 0) {
      fetchEquipoById();
    }
    fetchAreaTrabajo();
  }, [props.IdEquipo]);

  return (
    <div>
      <Toast ref={toast} />
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Row className="g-2">
          
          <Form.Group as={Col} md="12" controlId="nombre">
            <Form.Label>Nombre del Equipo</Form.Label>
            <Form.Control
              required
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={(e) =>
                setFormData({ ...formData, nombre: e.target.value })
              }
            />
          </Form.Group>
          <Form.Group as={Col} md="12" controlId="idPrueba">
            <Form.Label>Área de Trabajo</Form.Label>
            <Form.Select
              required
              value={formData.idAreaTrabajo || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  idAreaTrabajo: parseInt(e.target.value),
                })
              }
            >
              <option value="">Selecciona</option>
              {areaTrabajo.map((aTrabajo) => (
                <option key={aTrabajo.idAreaTrabajo} value={aTrabajo.idAreaTrabajo}>
                  {aTrabajo.nombre}
                </option>
              ))}
            </Form.Select>
            <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
          </Form.Group>
          <Form.Group controlId="descripcion" className="mb-3">
            <Form.Label>Descripcion</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="descripcion"
              value={formData.descripcion}
              required
              onChange={(e) =>
                setFormData({ ...formData, descripcion: e.target.value })
              }
            />
          </Form.Group>
        </Row>
         
        <div className="d-grid gap-2">
          <Button variant="primary" type="submit">
            {props.IdEquipo === 0 ? "Crear Equipo" : "Editar Equipo"}
          </Button>
        </div>
      </Form>
    </div>
  );
};
export default CrearEquipo;
