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
import moment from "moment";

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
  idProyecto: number;
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
let _idProyecto: number = 0;
const EditarError = (props: any) => {
  const toast = useRef<Toast>(null);

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
    idProyecto: 0,
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Validar si el estado es "corregido" y actualizar fechaResolucion
    if (name === 'estado' && value === 'corregido') {
        setFormData((prevData) => ({
          ...prevData,
          fechaResolucion: moment().format('YYYY-MM-DD'), // Asigna la fecha actual
        }));
      }
    
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
      fechaResolucion: moment().format('YYYY-MM-DD'),
      estado: "corregido"

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
      
      const endpoint =
        props.IdError === 0 ? "errores" : `errores/${props.IdError}`;
      const method = props.IdError === 0 ? apiService.post : apiService.update;
      const response = await method(
        `https://sp-backend-production.up.railway.app/${endpoint}`,
        dataToSubmit
      );

      
      notificationService.sendError(true);
      Show_Alerta(
        `Error ${props.IdError === 0 ? "creado" : "editado"} con éxito`,
        "success"
      );
    } catch (error) {
      
      
      alert(
        `Hubo un error al ${props.IdError === 0 ? "crear" : "editar"} el error.`
      );
    }
    setValidated(true);
  };

  const fetchErrorById = async () => {
    try {
      const data: Error = await apiService.get(
        `https://sp-backend-production.up.railway.app/error2/${props.IdError}`
      );
      

      
      setFormData({
        ...formData,
        idError: data.idError,
        idPrueba: data.idPrueba,
        idResponsable: data.idResponsable,
        severidad: data.severidad,
        fechaLimite: data.fechaLimite,
        fechaResolucion: data.fechaResolucion || "",
        estado: data.estado,
        evidencia: data.evidencia,
        fechaGenerado: data.fechaGenerado,
        descripcion: data.descripcion,
        tiempoResolucion: data.tiempoResolucion,
      });

      _idProyecto = data.idProyecto;

      if (data.evidencia) {
        setPreviewImage(data.evidencia);
      }
    } catch (error) {
      
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
      
    }
  };
  const fetchPruebas = async () => {
    try {
      const data = await apiService.get(
        `https://sp-backend-production.up.railway.app/pruebas/${_idProyecto}`
      );
      setPruebas(data);
    } catch (error) {
      
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
         

          <Form.Group controlId="evidencia" className="mb-3">
            <Form.Label>Evidencia</Form.Label>
            <Form.Control
            required
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
           Entregar Solución
          </Button>
        </div>
      </Form>
    </div>
  );
};
export default EditarError;
