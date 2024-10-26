import { useState, useEffect } from "react";
import React, { useRef } from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import { apiService } from "../../../services/apiService";
import { notificationService } from "../../../services/notificaciones";
import { Show_Alerta } from "../../../alertas/alertas";
import { Image } from "primereact/image";
import { Message } from "primereact/message";
import { Toast } from "primereact/toast";

interface Error {
  idError: number;
  idPrueba: number;
  idResponsable: number;
  severidad: string;
  fechaLimite: string;
  fechaResolucion: string;
  estado: string;
  evidencia: string;
  fechaGenerado: string;
  descripcion: string;
  tiempoResolucion: number;
}

interface Prueba {
  idPrueba: number;
  idProyecto: number;
  escenario: string;
  caso: string;
  criterioAceptacion: string;
  fecha: string;
  duracion: string;
  resultado: string;
  cobertura: number;
  evidencia: string;
  log: string;
}
interface Miembro {
  id: number;
  nombre: string;
  equipo: string; // Agregamos el nombre del equipo
}

const CrearError = (props: any) => {
  const toast = useRef<Toast>(null);
  let _idProyecto = Number(sessionStorage.getItem("id"));
  const [validated, setValidated] = useState(false);
  const [miembros, setMiembros] = useState<Miembro[]>([]);
  const [pruebas, setPruebas] = useState<Prueba[]>([]);

  const [formData, setFormData] = useState<Error>({
    idError: 0,
    idPrueba: 0,
    idResponsable: 0,
    severidad: "",
    fechaLimite: "",
    fechaResolucion: "",
    estado: "",
    evidencia: "",
    fechaGenerado: "",
    descripcion: "",
    tiempoResolucion: 0,
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("La imagen no debe superar los 5 MB.");
        return;
      }
      if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
        alert("Solo se permiten archivos .jpeg, .jpg y .png.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData({ ...formData, evidencia: base64String });
        setPreviewImage(base64String);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const dataToSubmit = {
      ...formData,
      idError: props.IdError,
      evidencia: formData.evidencia || previewImage || null, // Mantener el valor original si no hay nueva evidencia
      fechaResolucion: formData.fechaResolucion || null
    };

    const form = event.currentTarget;

    // Verificamos si el formulario es válido
    if (form.checkValidity() === false) {
      setValidated(true);
      return;
    }

    // Validación manual para evidencia y log
    const isEvidenceValid =
      dataToSubmit.evidencia !== undefined && dataToSubmit.evidencia !== null;

 

    try {
      console.log("Form data:", dataToSubmit);
      const endpoint =
        props.IdError === 0 ? "errores" : `errores/${props.IdError}`;
      const method = props.IdError === 0 ? apiService.post : apiService.update;
      const response = await method(
        `https://sp-backend-production.up.railway.app/${endpoint}`,
        dataToSubmit
      );

      console.log("Respuesta del servidor:", response);
      notificationService.sendError(true);
      Show_Alerta(
        `Error ${props.IdError === 0 ? "creado" : "editado"} con éxito`,
        "success"
      );
    } catch (error) {
      console.log("Form data1:", dataToSubmit);
      console.error("Error al enviar datos:", error);
      alert(
        `Hubo un error al ${props.IdError === 0 ? "crear" : "editar"} el error.`
      );
    }
    setValidated(true);
  };

  const fetchErrorById = async () => {
    try {
      const data: Error = await apiService.get(
        `https://sp-backend-production.up.railway.app/error/${props.IdError}`
      );
      console.log("Prueba:", data);

      setFormData({
        ...formData,
        idError: data.idError,
        idPrueba: data.idPrueba,
        idResponsable: data.idResponsable,
        severidad: data.severidad,
        fechaLimite: data.fechaLimite,
        fechaResolucion: data.fechaResolucion,
        estado: data.estado,
        evidencia: data.evidencia,
        fechaGenerado: data.fechaGenerado,
        descripcion: data.descripcion,
        tiempoResolucion: data.tiempoResolucion,
      });

      if (data.evidencia) {
        setPreviewImage(data.evidencia);
      }
    } catch (error) {
      console.error("Error al obtener el error:", error);
    }
  };
  // Función para obtener los miembros de los equipos del proyecto
  const fetchMiembrosEquipos = async () => {
    try {
      const data = await apiService.get(
        `https://sp-backend-production.up.railway.app/equipo-proyecto/${_idProyecto}`
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
  const fetchPruebas = async () => {
    try {
      const data = await apiService.get(
        `https://sp-backend-production.up.railway.app/pruebas/${_idProyecto}`
      );
      setPruebas(data);
    } catch (error) {
      console.error("Error al obtener las pruebas:", error);
    }
  };

  useEffect(() => {
    if (props.IdError !== 0) {
      fetchErrorById();
    }
    fetchMiembrosEquipos();
    fetchPruebas();
    setFormData((prev) => ({ ...prev, idProyecto: _idProyecto }));
  }, [props.IdError]);

  return (
    <div>
      <Toast ref={toast} />
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Row className="g-2">
          <Form.Group as={Col} md="12" controlId="idPrueba">
            <Form.Label>Prueba donde se Generó el Error</Form.Label>
            <Form.Select
              required
              value={formData.idPrueba || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  idPrueba: parseInt(e.target.value),
                })
              }
            >
              <option value="">Selecciona una prueba</option>
              {pruebas.map((prueba) => (
                <option key={prueba.idPrueba} value={prueba.idPrueba}>
                  {prueba.idPrueba}. {prueba.escenario} - {prueba.caso}
                </option>
              ))}
            </Form.Select>
            <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
          </Form.Group>
          <Form.Group controlId="descripcion" className="mb-3">
            <Form.Label>Descripcion del Error</Form.Label>
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
          <Form.Group as={Col} md="6" controlId="responsable">
            <Form.Label>Responsable</Form.Label>
            <Form.Select
              required
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
          <Form.Group as={Col} md="6" controlId="fechaGenerado">
            <Form.Label>Fecha de Generación del error</Form.Label>
            <Form.Control
              required
              type="date"
              name="fecha"
              value={formData.fechaGenerado}
              onChange={(e) =>
                setFormData({ ...formData, fechaGenerado: e.target.value })
              }
            />
          </Form.Group>
          <Form.Group as={Col} md="6" controlId="fechaLimite">
            <Form.Label>Fecha Límite de Solución</Form.Label>
            <Form.Control
              required
              type="date"
              value={formData.fechaLimite}
              onChange={(e) =>
                setFormData({ ...formData, fechaLimite: e.target.value })
              }
            />
            <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
          </Form.Group>

          <Form.Group as={Col} md="6" controlId="fechaResolucion">
            <Form.Label>Fecha Solución</Form.Label>
            <Form.Control
              
              type="date"
              name="fecha"
              value={formData.fechaResolucion}
              onChange={(e) =>
                setFormData({ ...formData, fechaResolucion: e.target.value })
              }
            />
          </Form.Group>

          <Form.Group as={Col} md="6" controlId="severidad" className="mb-3">
            <Form.Label>Severidad</Form.Label>
            <Form.Select
              as="select"
              name="estado"
              value={formData.severidad}
              required
              onChange={(e) =>
                setFormData({ ...formData, severidad: e.target.value })
              }
            >
              <option value="">Seleccione...</option>
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </Form.Select>
          </Form.Group>

          <Form.Group as={Col} md="6" controlId="estado" className="mb-3">
            <Form.Label>Estado</Form.Label>
            <Form.Select
              as="select"
              name="estado"
              value={formData.estado}
              required
              onChange={(e) =>
                setFormData({ ...formData, estado: e.target.value })
              }
            >
              <option value="">Seleccione...</option>
              <option value="pendiente">Pendiente</option>
              <option value="corregido">Corregido</option>
            </Form.Select>
          </Form.Group>

          <Form.Group controlId="evidencia" className="mb-3">
            <Form.Label>Evidencia</Form.Label>
            <Form.Control
              type="file"
              accept="image/jpeg, image/png, image/jpg"
              onChange={handleImageChange}
            />
            <br />
            <center>
              {previewImage && (
                <Image
                  preview
                  src={previewImage}
                  alt="Preview"
                  className="mt-3"
                  width="200"
                />
              )}
            </center>
            <Form.Control.Feedback type="invalid">
              La evidencia es obligatoria.
            </Form.Control.Feedback>
          </Form.Group>
        </Row>

        <div className="d-grid gap-2">
          <Button variant="primary" type="submit">
            {props.IdError === 0 ? "Registrar Error" : "Actualizar Error"}
          </Button>
        </div>
      </Form>
    </div>
  );
};
export default CrearError;
