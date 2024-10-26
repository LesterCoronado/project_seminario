import "./listar-errores.css";
import NavbarAside from "../../proyectos/gestion-proyecto/navbar-aside/navbar-aside";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { apiService } from "../../../services/apiService";
import { Card, Col, Row, Spinner, Alert } from "react-bootstrap";
import { Button } from "primereact/button";
import { Image } from "primereact/image";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";
import moment from "moment";
import { Paginator } from "primereact/paginator";
import { Modal } from "react-bootstrap";
import CrearError from "../crear-error/crear-error";
import { notificationService } from "../../../services/notificaciones";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Show_Alerta } from "../../../alertas/alertas";
import { Skeleton } from "primereact/skeleton";
import { useAuth } from "../../../auth/adminContext.tsx";

let IdError: number;
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

let nombreProyecto: any;
function ListarErrores() {
  nombreProyecto = sessionStorage.getItem("project");
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    
    return <div>No tienes acceso a este contenido.</div>;
  }
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
      
      Show_Alerta("Error al eliminar la error", "error");
    }
  };

  const fetchErrores = async () => {
    try {
      const data: Errores[] = await apiService.get(
        `https://sp-backend-production.up.railway.app/errores/${params.id}`
      );
      setErrores(data);
    } catch (error) {
      setError("Error al obtener las errores.");
      
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const subscription = notificationService
      .getError()
      .subscribe((value: any) => {
        fetchErrores();
        handleCloseInsertar();
        handleCloseEditar();
      });
    fetchErrores();
  }, [params.id]);

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
      
      return "Error al decodificar el log.";
    }
  };

  if (loading) {
    return (
      <div className="contenido">
        <div className="navbar-aside">
          <NavbarAside onToggle={handleToggle} />
        </div>
        <div className="content card m-2 p-3 listar-errores">
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
      <div className="navbar-aside">
        <NavbarAside onToggle={handleToggle} />
      </div>

      <div
        className="content card m-2 p-3 w-100 "
        style={{ display: "flex", flexDirection: "column" }}
      >
        <div className="row ">
          <div className="col-md-6 d-flex flex-column justify-content-between p-3">
            <span className="fst-italic">Proyectos / {nombreProyecto}</span>
            <h1>Manejo de Errores</h1>
          </div>
          <div className="col-md-6 d-flex align-items-center justify-content-md-end p-3">
            <Button
              label="Registrar Error"
              className="rounded"
              raised
              onClick={handleShowInsertar}
            />
          </div>
          <hr />
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
                <Button
                  severity="info"
                  className="rounded"
                  onClick={() => handleShowEditar(rowData.idError)}
                  tooltip="Editar"
                >
                  <i className="bi bi-pencil-square"></i>
                </Button>

                <Button
                  severity="danger"
                  className="rounded ms-2"
                  tooltip="Eliminar"
                  onClick={() => handleDeletePrueba(rowData.idError)}
                >
                  <i className="bi bi-trash"></i>
                </Button>
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
            <strong>Evidencia:</strong>
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
      {/* Modal para crear nueva error */}
      <Modal show={showInsertar} onHide={handleCloseInsertar}>
        <Modal.Header closeButton>
          <Modal.Title>Registrar Error</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <CrearError IdError={0} />
        </Modal.Body>
      </Modal>
      {/* Modal para Editar error */}
      <Modal show={showEditar} onHide={handleCloseEditar}>
        <Modal.Header closeButton>
          <Modal.Title>Editar Error</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <CrearError IdError={IdError} />
        </Modal.Body>
      </Modal>
      <ConfirmDialog />
    </div>
  );
}

export default ListarErrores;
