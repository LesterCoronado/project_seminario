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
  descripcion: string;
  tipoProyecto: string;
  tecnologiasUsadas: string;
  prioridad: string;
  idCliente: number;
  metodologia: string;
  estado: string;
  progreso: number;
}

interface Cliente {
  idCliente: number;
  nombre: string;
}

export const CrearProyectos = (props: any) => {
  const fetchProyectos = async () => {
    try {
      const data: Proyecto = await apiService.get(
        `https://sp-backend-production.up.railway.app/proyectos/${props.idProyecto}`
      );
      console.log("Proyecto:", data);

      setFormData({
        Nombre: data.Nombre,
        descripcion: data.descripcion,
        prioridad: data.prioridad,
        tipoProyecto: data.tipoProyecto,
        tecnologiasUsadas: data.tecnologiasUsadas,
        estado: data.estado,
        progreso: data.progreso,
        metodologia: data.metodologia,
        cliente: data.idCliente,
      });

      setSelectedType(data.tipoProyecto);
      setCustomType(data.tipoProyecto === "other" ? data.tipoProyecto : "");
      setSelectedMethodology(data.metodologia);
      setCustomMethodology(
        data.metodologia === "other" ? data.metodologia : ""
      );
    } catch (error) {
      console.error("Error al obtener el proyecto:", error);
    }
  };

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const fetchClientes = async () => {
    try {
      const data: Cliente[] = await apiService.get(
        "https://sp-backend-production.up.railway.app/clientes"
      );
      setClientes(data);
    } catch (error) {
      console.error("Error al obtener los clientes:", error);
    }
  };

  const [validated, setValidated] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [customType, setCustomType] = useState("");
  const [selectedMethodology, setSelectedMethodology] = useState("");
  const [customMethodology, setCustomMethodology] = useState("");
  const [formData, setFormData] = useState({
    Nombre: "",
    descripcion: "",
    prioridad: "",
    tipoProyecto: "",
    tecnologiasUsadas: "",
    estado: "",
    progreso: 0,
    metodologia: "",
    cliente: 0,
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      setValidated(true);
      return;
    }

    const progresoValue = parseFloat(formData.progreso.toString()) || 0;
    const clienteValue = parseInt(formData.cliente.toString(), 10) || 0;

    const finalData = {
      Nombre: formData.Nombre,
      descripcion: formData.descripcion,
      prioridad: formData.prioridad,
      tipoProyecto: selectedType === "other" ? customType : selectedType,
      tecnologiasUsadas: formData.tecnologiasUsadas,
      estado: formData.estado,
      progreso: progresoValue,
      metodologia:
        selectedMethodology === "other"
          ? customMethodology
          : selectedMethodology,
      idCliente: clienteValue,
    };

    console.log("Form Data:", JSON.stringify(finalData, null, 2));

    if (props.idProyecto === 0) {
      try {
        const response = await apiService.post(
          "https://sp-backend-production.up.railway.app/proyectos",
          finalData
        );
        console.log("Respuesta del servidor:", response);
        notificationService.sendNotification(true);
        Show_Alerta("Proyecto creado con éxito", "success");
      } catch (error) {
        console.error("Error al enviar datos:", error);
        alert("Hubo un error al crear el proyecto.");
      }
    } else {
      try {
        const response = await apiService.update(
          `https://sp-backend-production.up.railway.app/proyectos/${props.idProyecto}`,
          finalData
        );
        console.log("Respuesta del servidor:", response);
        notificationService.sendNotification(true);
        Show_Alerta("Proyecto editado con éxito", "success");
      } catch (error) {
        console.error("Error al enviar datos:", error);
        alert("Hubo un error al editar el proyecto.");
      }
      setValidated(true);
    }
  };

  const tipoProyectoHandleSelectChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedType(event.target.value);
    if (event.target.value !== "other") {
      setCustomType("");
    }
  };

  const metodologiaHandleSelectChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedMethodology(event.target.value);
    if (event.target.value !== "other") {
      setCustomMethodology("");
    }
  };

  const handleCustomTypeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCustomType(event.target.value);
  };

  const handleCustomMethodologyChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCustomMethodology(event.target.value);
  };

  useEffect(() => {
    fetchClientes();
    if (props.idProyecto === 0) {
      console.log("CREANDO");
    } else {
      console.log("EDITANDO");
      fetchProyectos();
    }
  }, [props.idProyecto]);

  return (
    <Form noValidate validated={validated} onSubmit={handleSubmit}>
      <Row className="mb-3">
        <Form.Group as={Col} md="6" controlId="validationCustom01">
          <Form.Label>Nombre del Proyecto</Form.Label>
          <Form.Control
            className="form-control"
            name="Nombre"
            value={formData.Nombre}
            required
            type="text"
            onChange={(e) =>
              setFormData({ ...formData, Nombre: e.target.value })
            }
          />
          <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
        </Form.Group>
        <Form.Group as={Col} md="6" controlId="validationCustom02">
          <Form.Label>Descripción</Form.Label>
          <Form.Control
            className="form-control"
            value={formData.descripcion}
            name="descripcion"
            required
            as="textarea"
            style={{ height: "38px" }}
            onChange={(e) =>
              setFormData({ ...formData, descripcion: e.target.value })
            }
          />
          <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
        </Form.Group>
        <Form.Group as={Col} md="6" controlId="validationCustom05">
          <Form.Label>Prioridad</Form.Label>
          <Form.Select
            value={formData.prioridad}
            required
            className="prioridad"
            name="prioridad"
            onChange={(e) =>
              setFormData({ ...formData, prioridad: e.target.value })
            }
          >
            <option value="">Selecciona una opción</option>
            <option value="Baja">Baja</option>
            <option value="Media">Media</option>
            <option value="Alta">Alta</option>
          </Form.Select>
          <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
        </Form.Group>
        <Form.Group as={Col} md="6" controlId="validationCustom03">
          <Form.Label>Tipo de Proyecto</Form.Label>
          <Form.Select
            required
            className="form-select"
            name="tipoProyecto"
            value={selectedType}
            onChange={tipoProyectoHandleSelectChange}
          >
            <option value="" disabled>
              Selecciona una opción
            </option>
            <option value="ERP">ERP</option>
            <option value="CRM">CRM</option>
            <option value="Business Intelligence">Business Intelligence</option>
            <option value="E-commerce">E-commerce</option>
            <option value="IoT">IoT</option>
            <option value="Aplicacion Web">Aplicacion Web</option>
            <option value="Aplicacion Móvil">Aplicacion Móvil</option>
            <option value="Microservicios">Microservicios</option>
            <option value="Inteligencia Artificial">
              Inteligencia Artificial
            </option>
            <option value="other">Otra</option>
            <option value={selectedType}>{selectedType}</option>  

          </Form.Select>
          {selectedType === "other" && (
            <Form.Control
              type="text"
              placeholder="Especifica otro tipo"
              value={customType}
              onChange={handleCustomTypeChange}
            />
          )}
          <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
        </Form.Group>
        <Form.Group as={Col} md="6" controlId="validationCustom02">
          <Form.Label>Tecnologías empleadas</Form.Label>
          <Form.Control
            value={formData.tecnologiasUsadas}
            className="form-control"
            name="tecnologiasUsadas"
            required
            as="textarea"
            onChange={(e) =>
              setFormData({ ...formData, tecnologiasUsadas: e.target.value })
            }
          />
          <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
        </Form.Group>
        <Form.Group as={Col} md="6" controlId="validationCustom04">
          <Form.Label>Estado</Form.Label>
          <Form.Select
            value={formData.estado}
            required
            className="estado"
            name="estado"
            onChange={(e) =>
              setFormData({ ...formData, estado: e.target.value })
            }
          >
            <option value="" disabled>
              Selecciona una opción
            </option>
            <option value="En desarrollo">En desarrollo</option>
            <option value="Finalizado">Finalizado</option>
            <option value="En espera">En espera</option>
          </Form.Select>
          <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
        </Form.Group>

        <Form.Group as={Col} md="6" controlId="validationCustom06">
          <Form.Label>Progreso (%)</Form.Label>
          <Form.Control
            type="number"
            min="0"
            max="100"
            value={formData.progreso}
            className="form-control"
            name="progreso"
            required
            onChange={(e) =>
              setFormData({ ...formData, progreso: parseFloat(e.target.value) })
            }
          />
          <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
        </Form.Group>
        <Form.Group as={Col} md="6" controlId="validationCustom07">
          <Form.Label>Metodología</Form.Label>
          <Form.Select
            required
            className="form-select"
            name="metodologia"
            value={selectedMethodology}
            onChange={metodologiaHandleSelectChange}
          >
            <option value="" disabled>
              Selecciona una opción
            </option>
            <option value="Ágil">Ágil</option>
            <option value="Cascada">Cascada</option>
            <option value="Scrum">Scrum</option>
            <option value="Kanban">Kanban</option>
            <option value="DevOps">DevOps</option>
            <option value="other">Otra</option>
            <option value={selectedMethodology}>{selectedMethodology}</option>  
          </Form.Select>
          {selectedMethodology === "other" && (
            <Form.Control
              type="text"
              placeholder="Especifica otra metodología"
              value={customMethodology}
              onChange={handleCustomMethodologyChange}
            />
          )}
          <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
        </Form.Group>
        <Form.Group as={Col} md="6" controlId="validationCustom08">
          <Form.Label>Cliente</Form.Label>
          <Form.Select
            value={formData.cliente}
            required
            className="cliente"
            name="cliente"
            onChange={(e) =>
              setFormData({ ...formData, cliente: parseInt(e.target.value) })
            }
          >
            <option value="">Selecciona una opción</option>
            {clientes.map((cliente) => (
              <option key={cliente.idCliente} value={cliente.idCliente}>
                {cliente.nombre}
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
export default CrearProyectos;
