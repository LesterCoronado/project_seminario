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
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { InputGroup } from "react-bootstrap";

interface Usuario {
  idUsuario: number;
  nombre: string;
  apellido: string;
  correo: string;
  contraseña: string;
  telefono: number;
  fechaNac: string;
  idRol: number;
  estado: boolean;
}
interface Rol {
  idRol: number;
  nombre: string;
}

const CrearUsuario = (props: any) => {
  let isEdit: boolean = props.IdUsuario !== 0;
  const toast = useRef<Toast>(null);
  const [validated, setValidated] = useState(false);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loader, setLoader] = useState(false);

  const [formData, setFormData] = useState<Usuario>({
    idUsuario: 0,
    nombre: "",
    apellido: "",
    correo: "",
    contraseña: "",
    telefono: 0,
    fechaNac: "",
    idRol: 0,
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
    setLoader(true);
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
        props.IdUsuario === 0 ? "createuser" : `edituser/${props.IdUsuario}`;
      const method =
        props.IdUsuario === 0 ? apiService.post : apiService.update;
      const response = await method(
        `https://sp-backend-production.up.railway.app/${endpoint}`,
        dataToSubmit
      );

      console.log("Respuesta del servidor:", response);
      notificationService.sendEquipo(true);
      setLoader(false);
      Show_Alerta(
        `Usuario ${props.IdUsuario === 0 ? "creado" : "editado"} con éxito`,
        "success"
      );
    } catch (error) {
      setLoader(false);
      console.error("Error al enviar datos:", error);
      alert(
        `Hubo un error al ${
          props.IdUsuario === 0 ? "crear" : "editar"
        } el usuario.`
      );
    }
    setValidated(true);
  };
  const fetchRoles = async () => {
    try {
      const data = await apiService.get(`https://sp-backend-production.up.railway.app/roles`);
      setRoles(data);
      console.log("Roles:", data);
    } catch (error) {
      console.error("Error al obtener los roles:", error);
    }
  };
  const fetchUsuarioById = async () => {
    console.log("Id del cliente2:", props);
    try {
      const data: Usuario = await apiService.get(
        `https://sp-backend-production.up.railway.app/user/${props.IdUsuario}`
      );
      console.log("Usuario:", data);
      setFormData({
        ...formData,
        idUsuario: data.idUsuario,
        nombre: data.nombre,
        apellido: data.apellido,
        correo: data.correo,
        telefono: data.telefono || 0,
        fechaNac: data.fechaNac,
        idRol: data.idRol,
        estado: data.estado === null ? false : data.estado,
      });
    } catch (error) {
      console.error("Error al obtener el error:", error);
    }
  };

  useEffect(() => {
    if (props.IdUsuario !== 0) {
      fetchUsuarioById();
    }
    fetchRoles();
  }, [props.IdUsuario]);

  return (
    <div>
      <Toast ref={toast} />
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Row className="g-2">
          <Form.Group as={Col} md="6" controlId="nombre">
            <Form.Label>Nombre</Form.Label>
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

          <Form.Group as={Col} md="6" controlId="apellido">
            <Form.Label>Apellido</Form.Label>
            <Form.Control
              required
              type="text"
              name="apellido"
              value={formData.apellido}
              onChange={(e) =>
                setFormData({ ...formData, apellido: e.target.value })
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

          <Form.Group as={Col} md="6" controlId="telefono">
            <Form.Label>Teléfono</Form.Label>
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

          <Form.Group as={Col} md="6" controlId="fechaNac">
            <Form.Label>Fecha de Nacimiento</Form.Label>
            <Form.Control
              required
              type="date"
              name="fechaNac"
              value={formData.fechaNac}
              onChange={(e) =>
                setFormData({ ...formData, fechaNac: e.target.value })
              }
            />
          </Form.Group>

          <Form.Group as={Col} md="6" controlId="idRol">
            <Form.Label>Rol</Form.Label>
            <Form.Select
              required
              name="idRol"
              value={formData.idRol}
              onChange={(e) =>
                setFormData({ ...formData, idRol: parseInt(e.target.value) })
              }
            >
              <option disabled selected value={0}>
                Seleccione...
              </option>
              {roles.map((rol) => (
                <option key={rol.idRol} value={rol.idRol}>
                  {rol.nombre}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          {/* Si estamos creando un nuevo usuario, siempre mostrar el campo de contraseña */}
          {props.IdUsuario === 0 && (
            <Form.Group as={Col} md="12" controlId="contraseña">
              <Form.Label>Contraseña</Form.Label>
              <InputGroup>
                <Form.Control
                  required
                  type={showPassword ? "text" : "password"}
                  name="contraseña"
                  value={formData.contraseña || ""} // Inicialmente vacío
                  placeholder="Ingrese una contraseña"
                  onChange={(e) =>
                    setFormData({ ...formData, contraseña: e.target.value })
                  }
                />
                <InputGroup.Text
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ cursor: "pointer" }}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </InputGroup.Text>
              </InputGroup>
            </Form.Group>
          )}

          {/* Solo mostrar el botón para cambiar la contraseña si estamos editando */}
          {props.IdUsuario !== 0 && (
            <Col md="12">
              <Button
                variant="secondary"
                onClick={() => setShowPasswordField(!showPasswordField)}
              >
                {showPasswordField ? "Cancelar" : "Cambiar Contraseña"}
              </Button>
            </Col>
          )}

          {/* Si se hace clic en "Cambiar Contraseña", aparece este campo */}
          {showPasswordField && (
            <Form.Group as={Col} md="12" controlId="nuevaContraseña">
              <Form.Label>Nueva Contraseña</Form.Label>
              <InputGroup>
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  name="nuevaContraseña"
                  value={formData.contraseña || ""} // Inicialmente vacío
                  placeholder="Ingrese una nueva contraseña"
                  onChange={(e) =>
                    setFormData({ ...formData, contraseña: e.target.value })
                  }
                />
                <InputGroup.Text
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ cursor: "pointer" }}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </InputGroup.Text>
              </InputGroup>
            </Form.Group>
          )}
          <Form.Group as={Col} md="12" controlId="estado">
            <Form.Check
              type="switch"
              id="estado"
              label="Usuario Activo"
              checked={formData.estado ?? false} // Asegúrate de que no sea null
              onChange={(e) => {
                const isChecked = e.target.checked;
                setFormData({ ...formData, estado: isChecked });
              }}
            />
          </Form.Group>
        </Row>

        <div className="d-grid gap-2 mt-3">
          <Button variant="primary" type="submit"
            disabled={loader}
          >
            {props.IdUsuario === 0 ? "Crear Usuario" : "Editar Usuario"}
            {loader && (
              <div className="spinner-border spinner-border-sm text-light ms-2"  role="status">
               
                </div>)}
          </Button>
        </div>
      </Form>
    </div>
  );
};
export default CrearUsuario;
