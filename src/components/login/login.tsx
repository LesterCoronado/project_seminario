import React, { useState, useRef } from "react";
import { Button } from "primereact/button";
import "./login.css"; // Asegúrate de que tienes este archivo CSS
import { InputText } from "primereact/inputtext";
import "primeflex/primeflex.css";
import { Checkbox } from "primereact/checkbox";
import { Password } from "primereact/password";
import { apiService } from "../../services/apiService";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { Toast } from "primereact/toast";
import { Dialog } from "primereact/dialog";
import { notificationService } from "../../services/notificaciones";
import { jwtDecode } from "jwt-decode";
function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [checked, setChecked] = useState(false);
  const navigate = useNavigate();
  const toast = useRef<Toast>(null);
  const [visible, setVisible] = useState(false);
  const [loader, setLoader] = useState(false);
  const [value, setValue] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      toast.current?.show({
        severity: "info",
        summary: "Info",
        detail: "Complete el formulario",
      });
    } else {
      let json = {
        email: email,
        password: password,
      };
      console.log("json:", json); 
      try {
        const data = await apiService.login(
          `https://sp-backend-production.up.railway.app/login`,
          json
        );
        console.log("Data:", data);

        if (data.token) {
          const decoded: any = jwtDecode(data.token); // Decodifica el token
          console.log("decoded", decoded);
          console.log("idRol", decoded.idRol);
          // Guarda el token en cookies
          const options: any = {
            expires: 1 / 24, // 1 hora
            secure: true,
            sameSite: "Strict",
          };
          Cookies.set("token", data.token, options);
          if (decoded.idRol === 1) {
            navigate("/inicio");
          } else {
            navigate("/tareas-pendientes");
          }

          notificationService.sendLogin(true);
          console.log("Login successful!", data.token);
        } else {
        }
      } catch (error: any) {
        if (error.message == "Network Error") {
          toast.current?.show({
            severity: "info",
            summary: "Info",
            detail: "comprueba tu conexion a internet, e intenta de nuevo",
          });
        }
        if (error.response.data.message == "not found") {
          toast.current?.show({
            severity: "info",
            summary: "Info",
            detail: "Usuario o contraseña incorrectos",
          });
        } else {
          toast.current?.show({
            severity: "info",
            summary: "Info",
            detail: "Ocurrio un error, intentelo de nuevo",
          });
        }
        console.error("Error occurred during login:", error);
      }
    }
  };
  const getResetLink = async () => {
    setLoader(true);

    const json = { email: value };
    console.log("email:", value);
    console.log("json:", json);

    try {
      const data = await apiService.forgotPwd(
        `https://sp-backend-production.up.railway.app/forgot-password`,
        json
      );
      console.log("Data:", data);
      showToast(
        "success",
        "Éxito",
        "Se ha enviado un enlace de restablecimiento a su correo"
      );
      setVisible(false);
    } catch (error) {
      console.error("Error occurred during password reset:", error);
      handleError(error);
    } finally {
      setLoader(false);
    }
  };

  const showToast = (severity: any, summary: any, detail: any) => {
    toast.current?.show({ severity, summary, detail });
  };

  const handleError = (error: any) => {
    let message = "Ocurrió un error, inténtelo de nuevo";

    if (error.message === "Network Error") {
      message = "Comprueba tu conexión a Internet e intenta de nuevo";
    } else if (error.response?.data?.message) {
      switch (error.response.data.message) {
        case "Empleado no encontrado":
          message = "Usuario no encontrado";
          break;
        case "not found":
          message = "Usuario o contraseña incorrectos";
          break;
        default:
          break;
      }
    }

    showToast("info", "Info", message);
  };
  const passwordInputStyle = {
    width: "625px", // Ancho por defecto
    maxWidth: "100%", // Asegura que no se exceda en pantallas pequeñas
    "@media (max-width: 768px)": {
      width: "100%", // Ancho completo en pantallas pequeñas
    },
  };

  return (
    <div className="wallper">
      <div className=" surface-card p-4 shadow-2 border-round w-full lg:w-6">
        <div className="text-center mb-5">
          <img
            src="https://blocks.primereact.org/demo/images/blocks/logos/hyper.svg"
            alt="hyper"
            height={50}
            className="mb-3"
          />
          <div className="text-900 text-3xl font-medium mb-3 text-muted fw-bold">
            TestZen
          </div>
        </div>

        <div className="w-100">
          <label htmlFor="email" className="block text-900 font-medium mb-2">
            Email
          </label>
          <InputText
            id="email"
            placeholder="Email address"
            className="p-inputtext w-full mb-3"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label htmlFor="password" className="block text-900 font-medium mb-2">
            Password
          </label>
      

          <Password
              id="password"
              placeholder="Password"
              inputClassName="w-full"
              className="w-full"
              feedback={false}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              toggleMask
              pt={{ iconField: { root: { className: "w-full" } } }}
            />
          <div className="flex align-items-center justify-content-between mb-6">
            <div className="flex align-items-center">
              <Checkbox
                id="rememberme"
                onChange={(e) => setChecked(e.checked ?? false)}
                checked={checked}
                className="mr-2"
              />
              <label htmlFor="rememberme">Remember me</label>
            </div>
            <a
              className="font-medium no-underline ml-2 text-blue-500 text-right cursor-pointer"
              onClick={() => setVisible(true)}
            >
              Forgot your password?
            </a>
          </div>

          <Button
            label="Sign In"
            icon="pi pi-user"
            className="w-full"
            onClick={handleLogin}
          />
        </div>
      </div>
      <Toast ref={toast} />
      <Dialog
        header="Restablece tu contraseña"
        visible={visible}
        style={{ width: "50vw" }}
        onHide={() => {
          if (!visible) return;
          setVisible(false);
        }}
      >
        <p className="m-0">
          Para restablecer su contraseña, ingrese la dirección de correo
          electrónico que utiliza para iniciar sesión.
        </p>
        <div className="p-inputgroup flex-1 mt-3">
          <span className="p-inputgroup-addon">
            <i className="pi pi-envelope"></i>
          </span>
          <InputText
            placeholder="Correo"
            onChange={(e: any) => setValue(e.target.value)}
            value={value}
          />
        </div>
        {loader && (
          <div className="flex justify-content-center mt-3">
            <div className="spinner-border text-primary"></div>
          </div>
        )}
        <Button
          disabled={loader}
          label="Get reset link"
          icon="pi pi-link"
          className="w-full mt-3"
          onClick={getResetLink}
        />
      </Dialog>
    </div>
  );
}

export default Login;
