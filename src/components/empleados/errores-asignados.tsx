import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { apiService } from "../../services/apiService";
import { Card, Col, Row, Spinner, Alert } from "react-bootstrap";
import { Button } from "primereact/button";
import { Image } from "primereact/image";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";
import moment from "moment";
import { Paginator } from "primereact/paginator";
import { Modal } from "react-bootstrap";
import Cookies from "js-cookie"; // Importa Cookies para manejar las cookies
import { jwtDecode } from "jwt-decode";
import EditarError from "./editar-error";
import { notificationService } from "../../services/notificaciones";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Show_Alerta } from "../../alertas/alertas";
import { Skeleton } from "primereact/skeleton";

let IdError: number;
let IdResponsable: number;
interface Errores {
  idError: number;
  idPrueba: number;
  idResponsable: number;
  severidad: string;
  fechaGenerado: string;
  fechaLimite: string;
  fechaResolucion: string;
  criterioAceptacion: string;
  estado: string;
  evidencia: string;
  tiempoResolucion: string;
  descripcion: string;
}

function ErroresAsignados() {
  const token: any = Cookies.get("token");
  const decoded: any = jwtDecode(token);
  IdResponsable = decoded.idMiembroEquipo;
  console.log("IdResponsable", IdResponsable);
  const params = useParams();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPrueba, setSelectedPrueba] = useState<Errores | null>(null);
  const [errores, setErrores] = useState<Errores[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInsertar, setShowInsertar] = useState(false);
  const [showEditar, setShowEditar] = useState(false);

  // Paginación
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(5); // Número de filas por página

  const handleToggle = (isOpen: boolean) => {
    setIsOpen(isOpen);
  };
  const handleCloseInsertar = () => setShowInsertar(false);
  const handleShowInsertar = () => setShowInsertar(true);
  const handleCloseEditar = () => setShowEditar(false);

  const handleShowEditar = (id: number) => {
    setShowEditar(true);
    IdError = id;
  };
  const handleDeletePrueba = (IdError: number) => {
    confirmDialog({
      message: "¿Estás seguro de que deseas eliminar este error?",
      header: "Confirmar Eliminación",
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger rounded",
      accept: () => deleteError(IdError), // Llama a la función de eliminación si el usuario confirma
      reject: () => {
        // Puedes manejar lo que ocurre si el usuario cancela la acción aquí (opcional)
      },
    });
  };

  const deleteError = async (IdError: number) => {
    try {
      await apiService.delete(`https://sp-backend-production.up.railway.app/error/${IdError}`);
      setErrores(errores.filter((error) => error.idError !== IdError));
      Show_Alerta("Error eliminado correctamente", "success");
    } catch (error) {
      console.error("Error al eliminar la error:", error);
      Show_Alerta("Error al eliminar la error", "error");
    }
  };

  const fetchErrores = async () => {
    try {
      const data: Errores[] = await apiService.get(
        `https://sp-backend-production.up.railway.app/miserrores/${IdResponsable}`
      );
      setErrores(data);
    } catch (error) {
      setError("Error al obtener las errores.");
      console.error("Error al obtener las errores:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    // Suscribirse a las notificaciones
    const subscription = notificationService
      .getError()
      .subscribe((value: any) => {
        fetchErrores(); // Refresca los errores cuando llega una nueva notificación
        handleCloseInsertar();
        handleCloseEditar();
      });

    // Llamar fetchErrores solo una vez al montar el componente
    fetchErrores();

    // Limpiar la suscripción al desmontar el componente
    return () => {
      subscription.unsubscribe();
    };
  }, []); // [] asegura que el useEffect solo se ejecute una vez al montar el componente

  const handleShowDetails = (error: Errores) => {
    setSelectedPrueba(error);
    setIsOpen(true);
  };

  const handleCloseDialog = () => {
    setSelectedPrueba(null); // Limpiar la selección primero
    setIsOpen(false); // Luego cerrar el diálogo
  };

  const onPageChange = (event: { first: number; rows: number }) => {
    setFirst(event.first);
    setRows(event.rows);
  };
  const decodeLog = (log: string) => {
    // Función para verificar si una cadena es base64
    const isBase64 = (str: string) => {
      const base64Pattern = /^[A-Za-z0-9+/]+={0,2}$/; // Regex para comprobar base64
      return base64Pattern.test(str) && str.length % 4 === 0; // También verificar longitud
    };

    // Limpia el log de cualquier prefijo como "data:application/octet-stream;base64,"
    const base64Prefix = "data:application/octet-stream;base64,";
    const textPrefix = "data:text/plain;base64,";

    if (log.startsWith(base64Prefix)) {
      log = log.substring(base64Prefix.length); // Eliminar el prefijo
    } else if (log.startsWith(textPrefix)) {
      log = log.substring(textPrefix.length); // Eliminar el prefijo específico de archivos .txt
    }

    try {
      if (isBase64(log)) {
        return atob(log); // Decodifica el log de base64
      } else {
        return log; // Devuelve el log tal cual si no es base64
      }
    } catch (error) {
      console.error("Error al decodificar el log:", error);
      return "Error al decodificar el log.";
    }
  };

  if (loading) {
    return (
      <div className="contenido">
        <div className="listar-errores">
          <div className="container">
            <Skeleton width="70rem" className="mb-2"></Skeleton>
            <Skeleton width="40rem" className="mb-2"></Skeleton>
            <Skeleton width="20rem" className="mb-2"></Skeleton>
            <Skeleton height="10rem" width="70rem" className="mb-2"></Skeleton>
            <Skeleton width="70rem" height="1rem"></Skeleton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="contenido">
      <div
        className="content card m-2 p-3 w-100 "
        style={{ display: "flex", flexDirection: "column" }}
      >
        <div className="row mb-3">
          <h1 className="text-center fw-bol text-muted">
            Manejo de Errores Asginados
          </h1>
        </div>

        <DataTable
          value={errores}
          tableStyle={{ minWidth: "50rem" }}
          paginator
          rows={rows}
          first={first}
          onPage={onPageChange}
          rowsPerPageOptions={[5, 10, 25, 50]} // Opciones para seleccionar cuántos ítems mostrar por página
          paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown" // Mover RowsPerPageDropdown al final
        >
          <Column field="idPrueba" header="ID Prueba" />
          <Column field="descripcion" header="Descripción" />
          <Column field="severidad" header="Severidad" />
          <Column field="fechaLimite" header="Fecha Limite" />
          <Column field="fechaResolucion" header="Fecha Resolución" />
          <Column field="estado" header="Estado" />

          <Column
            body={(rowData: Errores) => (
              <Button
                tooltip="Ver detalles"
                severity="secondary"
                rounded
                label="Detalles"
                className="rounded"
                onClick={() => handleShowDetails(rowData)}
              >
                <i className="bi bi-box-arrow-up-right ms-1"></i>
              </Button>
            )}
            header="Detalles"
          />
          <Column
            body={(rowData: Errores) => (
              <div className="d-flex align-items-center">
                {rowData.estado === "corregido" ? (
                  <span className="d-flex align-items-center">
                    <i
                      className="pi pi-check-circle"
                      style={{ color: "green", marginRight: "5px" }}
                    ></i>
                    <span>Entregado</span>
                  </span>
                ) : (
                  <Button
                    severity="info"
                    className="rounded"
                    onClick={() => handleShowEditar(rowData.idError)}
                  >
                    <i className="pi pi-briefcase me-2"></i> Entregar
                  </Button>
                )}
              </div>
            )}
            header="Acciones"
          />
        </DataTable>
      </div>

      {/* Dialogo para mostrar los detalles de la error */}
      <Dialog
        maximizable
        key={selectedPrueba ? selectedPrueba.idError : "empty"}
        header="Detalles del Error"
        visible={isOpen}
        onHide={handleCloseDialog}
        style={{ width: "50vw" }}
      >
        {selectedPrueba && (
          <div className="container">
            <strong>ID Prueba</strong>
            <p>{selectedPrueba.idPrueba}</p>
            <hr />
            <strong>Descripcion:</strong>
            <p>{selectedPrueba.descripcion}</p>
            <hr />
            <strong>Severidad:</strong>
            <p>{selectedPrueba.severidad}</p>
            <hr />
            <strong>Fecha Generado:</strong>{" "}
            {moment(selectedPrueba.fechaGenerado).format("DD/MM/YYYY")}
            <hr />
            <strong>Fecha Limite:</strong>{" "}
            {moment(selectedPrueba.fechaLimite).format("DD/MM/YYYY")}
            <hr />
            <strong>Fecha de Resolucion:</strong>{" "}
            {moment(selectedPrueba.fechaResolucion).format("DD/MM/YYYY")}
            <hr />
            <strong>Tiempo de Resolucion:</strong>
            <p>{selectedPrueba.tiempoResolucion} días</p>
            <hr />
            <strong>Estado:</strong>
            {selectedPrueba.estado === "pendiente" ? (
              <span className="pResultadoFailed text-danger text-center ms-1">
                {selectedPrueba.estado}
              </span>
            ) : (
              <span className="pResultadoSuccess text-success text-center ms-1">
                {selectedPrueba.estado}
              </span>
            )}
            <hr />
            {selectedPrueba.evidencia && <strong>Evidencia:</strong>}
            <div className="">
              <br />
              <center>
                <Image
                  src={selectedPrueba.evidencia}
                  alt="Evidencia"
                  width="400"
                  preview
                />
              </center>
            </div>
          </div>
        )}
      </Dialog>

      {/* Modal para Editar error */}
      <Modal show={showEditar} onHide={handleCloseEditar}>
        <Modal.Header closeButton>
          <Modal.Title>Entregar Solución</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <EditarError IdError={IdError} />
        </Modal.Body>
      </Modal>
      <ConfirmDialog />
    </div>
  );
}

export default ErroresAsignados;
