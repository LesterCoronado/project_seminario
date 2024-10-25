import React, { useRef, useState } from "react";
import "bootstrap-icons/font/bootstrap-icons.css"; // Asegúrate de tener los íconos de Bootstrap instalados
import "./resetPassword.css"; // Importa la hoja de estilo externa
import { Card, InputGroup, Form } from "react-bootstrap";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Asegúrate de importar los íconos
import { Toast } from "primereact/toast";
import { Message } from "primereact/message";
import { useNavigate, useParams } from "react-router-dom";
import { apiService } from "../../services/apiService";

function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [pwdnotallowed, setPwdnotallowed] = useState(false);
  const [redirect, setRedirect] = useState(false);
  const [timeleft, setTimeleft] = useState(5);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const toast = useRef<Toast>(null);
  const navigate = useNavigate();
  const params = useParams();

  const showToastWithTimer = () => {
    // Mostrar el toast inicial
    toast.current?.show({
      severity: "success",
      summary: "Success",
      detail: `Contraseña restablecida con éxito.`,
      life: 5000, // Duración del toast en milisegundos
    });

    // Temporizador para la cuenta regresiva
    const downloadTimer = setInterval(() => {
      setTimeleft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(downloadTimer);
          navigate("/login");
          return 0; // Para evitar que el tiempo se vuelva negativo
        }
        return prevTime - 1; // Decrementar el tiempo restante
      });
    }, 1000);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPwdnotallowed(true);
      setRedirect(false);
    } else {
      setPwdnotallowed(false);
      let json: any = {
        password: newPassword,
      };
      try {
        let token: any = params.token;
        const data = await apiService.resetpwd(
          `http://localhost:4000/reset-password`,
          json,
          token
        );
        showToastWithTimer();
        setRedirect(true);
      } catch (error: any) {
        if (
          error.response.data.mensaje ==
          "El token ha expirado. Por favor, solicite uno nuevo."
        ) {
          toast.current?.show({
            severity: "error",
            summary: "Error",
            detail: "El token ha expirado. Por favor, solicite uno nuevo.",
            life: 5000, // Duración del toast en milisegundos
          });
        }
        if (error.message == "Network Error") {
          setErrorMessage(
            "Comprueba tu conexión a internet e intenta de nuevo"
          );
        } else {
          console.error("Error occurred during reset password:", error);
        }
      }
    }
  };

  return (
    <Card className="card reset-password-container">
      <Card.Header className="bg-primary bm-5">
        <h3 className="text-center mt-2 fw-medium">Restablecer Contraseña</h3>
      </Card.Header>
      {pwdnotallowed && (
        <Message
          severity="warn"
          className="m-3"
          text="Las contraseñas no coinciden"
        />
      )}
      {redirect && (
        <Message
          severity="success"
          className="m-3"
          text={`Redirigiendo al login en ${timeleft} segundos.`}
        />
      )}

      <Card.Body className="card-body">
        <form onSubmit={handleSubmit} className="reset-password-form mt-5 ">
          {/* Campo de nueva contraseña */}
          <label htmlFor="newPassword" className="reset-password-label">
            Nueva Contraseña
          </label>
          <InputGroup className="reset-password-input-container">
            <Form.Control
              type={showNewPassword ? "text" : "password"}
              id="newPassword"
              placeholder="Ingrese su nueva contraseña"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <InputGroup.Text
              onClick={() => setShowNewPassword(!showNewPassword)}
              style={{ cursor: "pointer" }}
            >
              {showNewPassword ? <FaEyeSlash /> : <FaEye />}
            </InputGroup.Text>
          </InputGroup>

          {/* Campo de confirmar contraseña */}
          <label htmlFor="confirmPassword" className="reset-password-label">
            Confirmar Contraseña
          </label>
          <InputGroup className="reset-password-input-container">
            <Form.Control
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              placeholder="Confirme su nueva contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <InputGroup.Text
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{ cursor: "pointer" }}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </InputGroup.Text>
          </InputGroup>

          {/* Mensajes de error y éxito */}
          {errorMessage && (
            <div className="reset-password-error">{errorMessage}</div>
          )}
          {successMessage && (
            <div className="reset-password-success">{successMessage}</div>
          )}

          <button type="submit" className="reset-password-button mt-5">
            Restablecer Contraseña
          </button>
        </form>
      </Card.Body>

      <Toast ref={toast} />
    </Card>
  );
}

export default ResetPassword;
