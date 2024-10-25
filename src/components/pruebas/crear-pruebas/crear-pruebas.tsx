import { useState, useEffect } from "react";
import React, { useRef } from 'react';
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import { apiService } from "../../../services/apiService";
import { notificationService } from "../../../services/notificaciones";
import { Show_Alerta } from "../../../alertas/alertas";
import { Image } from "primereact/image";
import { Message } from "primereact/message";
import { Toast } from 'primereact/toast';
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

export const CrearPrueba = (props: any) => {
  const toast = useRef<Toast>(null);
  let _idProyecto = Number(sessionStorage.getItem("id"));
  const [validated, setValidated] = useState(false);
  const [formData, setFormData] = useState<Prueba>({
    idPrueba: 0,
    idProyecto: _idProyecto,
    escenario: "",
    caso: "",
    criterioAceptacion: "",
    fecha: "",
    duracion: "",
    resultado: "",
    cobertura: 0,
    evidencia: "",
    log: "",
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [logFileName, setLogFileName] = useState<string | null>(null);

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

  const handleLogFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("El archivo de log no debe superar los 5 MB.");
        return;
      }

      const fileExtension = file.name.split(".").pop()?.toLowerCase();
      if (fileExtension !== "log" && fileExtension !== "txt") {
        alert("Solo se permiten archivos de texto .log o .txt.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData({ ...formData, log: base64String });
        setLogFileName(file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const dataToSubmit = {
        ...formData,
        idPrueba: props.idPrueba,
        evidencia: formData.evidencia || previewImage, // Mantener el valor original si no hay nueva evidencia
        log: formData.log || logFileName, // Mantener el valor original si no hay nuevo log
    };

    const form = event.currentTarget;
    
    // Verificamos si el formulario es válido
    if (form.checkValidity() === false) {
        setValidated(true);
        return;
    }

    // Validación manual para evidencia y log
    const isEvidenceValid = dataToSubmit.evidencia !== undefined && dataToSubmit.evidencia !== null;
    const isLogValid = dataToSubmit.log !== undefined && dataToSubmit.log !== null;

    if (!isEvidenceValid || !isLogValid) {
        // Si la evidencia o el log no son válidos, muestra un mensaje
        if (!isEvidenceValid) {
          toast.current?.show({ severity: 'info', summary: 'Info', detail: 'La evidencia es obligatoria' });

        }
        if (!isLogValid) {
          toast.current?.show({ severity: 'info', summary: 'Info', detail: 'El log es obligatorio' });

        }
        setValidated(true); // Para que se marquen los campos como inválidos
        return;
    }

    try {
        console.log("Form data:", dataToSubmit);
        const endpoint = props.idPrueba === 0 ? "pruebas" : `pruebas/${props.idPrueba}`;
        const method = props.idPrueba === 0 ? apiService.post : apiService.update;
        const response = await method(`http://localhost:4000/${endpoint}`, dataToSubmit);

        console.log("Respuesta del servidor:", response);
        notificationService.sendPrueba(true);
        Show_Alerta(`Prueba ${props.idPrueba === 0 ? "creada" : "editada"} con éxito`, "success");
    } catch (error) {
        console.error("Error al enviar datos:", error);
        alert(`Hubo un error al ${props.idPrueba === 0 ? "crear" : "editar"} la prueba.`);
    }
    setValidated(true);
};


  const fetchPruebaById = async () => {
    try {
      const data: Prueba = await apiService.get(
        `http://localhost:4000/prueba/${props.idPrueba}`
      );
      console.log("Prueba:", data);

      setFormData({
        ...formData,
        escenario: data.escenario,
        caso: data.caso,
        criterioAceptacion: data.criterioAceptacion,
        fecha: data.fecha,
        duracion: data.duracion,
        resultado: data.resultado,
        cobertura: data.cobertura,
        evidencia: data.evidencia,
        log: data.log,
      });

      if (data.evidencia) {
        setPreviewImage(data.evidencia);
      }

      if (data.log) {
        setLogFileName("Archivo de log cargado");
      }
    } catch (error) {
      console.error("Error al obtener la prueba:", error);
    }
  };

  useEffect(() => {
    if (props.idPrueba !== 0) {
      fetchPruebaById();
    }
    setFormData((prev) => ({ ...prev, idProyecto: _idProyecto }));
  }, [props.idPrueba]);

  useEffect(() => {
    setFormData((prev) => ({ ...prev, idProyecto: _idProyecto }));
  }, [props.idProyecto]);

  return (
    <div>
      <Toast ref={toast} />
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Row className="mb-3">
          <Form.Group as={Col} controlId="escenario">
            <Form.Label>Escenario</Form.Label>
            <Form.Control
              required
              type="text"
              name="escenario"
              value={formData.escenario}
              onChange={handleInputChange}
            />
          </Form.Group>

          <Form.Group as={Col} controlId="fecha">
            <Form.Label>Fecha</Form.Label>
            <Form.Control
              required
              type="date"
              name="fecha"
              value={formData.fecha}
              onChange={handleInputChange}
            />
          </Form.Group>
        </Row>

        <Form.Group controlId="caso" className="mb-3">
          <Form.Label>Caso</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            name="caso"
            value={formData.caso}
            onChange={handleInputChange}
            required
          />
        </Form.Group>

        <Form.Group controlId="criterioAceptacion" className="mb-3">
          <Form.Label>Criterio de Aceptación</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            name="criterioAceptacion"
            value={formData.criterioAceptacion}
            onChange={handleInputChange}
            required
          />
        </Form.Group>

        <Form.Group controlId="duracion" className="mb-3">
          <Form.Label>Duración (HH:MM:SS)</Form.Label>
          <Form.Control
            type="text"
            name="duracion"
            placeholder="Ejemplo: 01:30:00"
            value={formData.duracion}
            onChange={handleInputChange}
            required
          />
        </Form.Group>

        <Form.Group controlId="resultado" className="mb-3">
          <Form.Label>Resultado</Form.Label>
          <Form.Select
            as="select"
            name="resultado"
            value={formData.resultado}
            onChange={handleInputChange}
            required
          >
            <option value="">Seleccione...</option>
            <option value="passed">Passed</option>
            <option value="failed">Failed</option>
          </Form.Select>
        </Form.Group>

        <Form.Group controlId="cobertura" className="mb-3">
          <Form.Label>Cobertura (en %)</Form.Label>
          <Form.Control
            type="text"
            name="cobertura"
            placeholder="Ejemplo: 30"
            value={formData.cobertura}
            onChange={handleInputChange}
            required
          />
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
          <Form.Control.Feedback type="invalid" >
            La evidencia es obligatoria.
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group controlId="log" className="mb-3">
          <Form.Label>Log</Form.Label>
          <Form.Control
            type="file"
            accept=".log,.txt"
            onChange={handleLogFileChange}
          />
          <Form.Control.Feedback type="invalid">
            El log es obligatorio.
          </Form.Control.Feedback>

          {formData.log && formData.log.trim() !== "" && (
            <Message
              severity="success"
              className="mt-2"
              text="1 archivo de log cargado"
            >
              {logFileName} cargado
            </Message>
          )}
        </Form.Group>

        <Button variant="primary" type="submit">
          {props.idPrueba === 0 ? "Crear Prueba" : "Actualizar Prueba"}
        </Button>
      </Form>
      
    </div>
  );
};
export default CrearPrueba;
