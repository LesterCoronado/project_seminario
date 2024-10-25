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

interface Cliente {
  idCliente: number;
  nombre: string;
  industria: string;
  pais: string;
  direccion: string;
  telefono: number;
  correo: string;
  estado: boolean;
}

const CrearCliente = (props: any) => {
  const toast = useRef<Toast>(null);
  const [validated, setValidated] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);

  const [formData, setFormData] = useState<Cliente>({
    idCliente: 0,
    nombre: "",
    industria: "",
    pais: "",
    direccion: "",
    telefono: 0,
    correo: "",
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
        props.IdCliente === 0 ? "clientes" : `clientes/${props.IdCliente}`;
      const method =
        props.IdCliente === 0 ? apiService.post : apiService.update;
      const response = await method(
        `http://localhost:4000/${endpoint}`,
        dataToSubmit
      );

      console.log("Respuesta del servidor:", response);
      notificationService.sendEquipo(true);
      Show_Alerta(
        `Error ${props.IdCliente === 0 ? "creado" : "editado"} con éxito`,
        "success"
      );
    } catch (error) {
      console.error("Error al enviar datos:", error);
      alert(
        `Hubo un error al ${
          props.IdCliente === 0 ? "crear" : "editar"
        } el cliente.`
      );
    }
    setValidated(true);
  };

  const fetchClienteById = async () => {
    console.log("Id del cliente2:", props);
    try {
      const data: Cliente = await apiService.get(
        `http://localhost:4000/cliente/${props.IdCliente}`
      );
      console.log("Cliente:", data);

      setFormData({
        ...formData,
        idCliente: data.idCliente,
        nombre: data.nombre,
        industria: data.industria,
        pais: data.pais,
        direccion: data.direccion,
        telefono: data.telefono,
        correo: data.correo,
        estado: data.estado,
      });
    } catch (error) {
      console.error("Error al obtener el error:", error);
    }
  };

  useEffect(() => {
    if (props.IdCliente !== 0) {
      fetchClienteById();
    }
  }, [props.IdCliente]);

  return (
    <div>
      <Toast ref={toast} />
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Row className="g-2">
          <Form.Group as={Col} md="6" controlId="nombre">
            <Form.Label>Nombre del Cliente</Form.Label>
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
          <Form.Group as={Col} md="6" controlId="industria">
            <Form.Label>Industria</Form.Label>
            <Form.Control
              required
              type="text"
              name="industria"
              value={formData.industria}
              onChange={(e) =>
                setFormData({ ...formData, industria: e.target.value })
              }
            />
          </Form.Group>
          <Form.Group as={Col} md="6" controlId="pais">
            <Form.Label>Pais</Form.Label>
            <Form.Select
              required
              name="pais"
              value={formData.pais}
              onChange={(e) =>
                setFormData({ ...formData, pais: e.target.value })
              }
            >
              <option disabled selected value="">
                Seleccione...
              </option>
              <option value="Peru">Peru</option>
              <option value="Colombia">Colombia</option>
              <option value="Argentina">Argentina</option>
              <option value="Chile">Chile</option>
            </Form.Select>
          </Form.Group>
          <Form.Group as={Col} md="6" controlId="direccion">
            <Form.Label>Dirección</Form.Label>
            <Form.Control
              required
              type="text"
              name="direccion"
              value={formData.direccion}
              onChange={(e) =>
                setFormData({ ...formData, direccion: e.target.value })
              }
            />
          </Form.Group>
          <Form.Group as={Col} md="6" controlId="telefono">
            <Form.Label>Telefono</Form.Label>
            <Form.Control
              required
              type="number"
              name="telefono"
              value={formData.telefono}
              onChange={(e) =>
                setFormData({ ...formData, telefono: parseInt(e.target.value) })
              }
            />
          </Form.Group>
          <Form.Group as={Col} md="6" controlId="correo">
            <Form.Label>Correo</Form.Label>
            <Form.Control
              required
              type="email"
              name="correo"
              value={formData.correo}
              onChange={(e) =>
                setFormData({ ...formData, correo: e.target.value })
              }
            />
          </Form.Group>
          <Form.Group as={Col} md="6" controlId="estado">
            <Form.Label>Estado</Form.Label>
            <Form.Select
              required
              as="select"
              name="estado"
              value={formData.estado ? "true" : "false"} // Convertir booleano a string para el select
              onChange={
                (e) =>
                  setFormData({
                    ...formData,
                    estado: e.target.value === "true",
                  }) // Convertir string a booleano
              }
            >
              <option disabled selected value="">
                Seleccione
              </option>
              <option value="true">Activo</option>
              <option value="false">Inactivo</option>
            </Form.Select>
          </Form.Group>
        </Row>

        <div className="d-grid gap-2 mt-3">
          <Button variant="primary" type="submit">
            {props.IdCliente === 0 ? "Crear Cliente" : "Editar Cliente"}
          </Button>
        </div>
      </Form>
    </div>
  );
};
export default CrearCliente;
