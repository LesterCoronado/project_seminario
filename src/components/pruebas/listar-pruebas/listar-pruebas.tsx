import "./listar-pruebas.css";
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
import CrearPrueba from "../crear-pruebas/crear-pruebas";
import { notificationService } from "../../../services/notificaciones";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Show_Alerta } from "../../../alertas/alertas";
import { Skeleton } from "primereact/skeleton";
import { ExternalLink } from "lucide-react";
import { Pencil } from "lucide-react";
import { Trash2 } from "lucide-react";
import { useAuth } from "../../../auth/adminContext.tsx";

let IdPrueba: number;
interface Pruebas {
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
let nombreProyecto: any;
function ListarPruebas() {
  nombreProyecto = sessionStorage.getItem("project");

  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    console.log(isAuthenticated);
    return <div>No tienes acceso a este contenido.</div>;
  }
  const params = useParams();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPrueba, setSelectedPrueba] = useState<Pruebas | null>(null);
  const [pruebas, setPruebas] = useState<Pruebas[]>([]);
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
    IdPrueba = id;
  };
  const handleDeletePrueba = (idPrueba: number) => {
    confirmDialog({
      message: "¿Estás seguro de que deseas eliminar esta prueba?",
      header: "Confirmar Eliminación",
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger rounded",
      accept: () => deletePrueba(idPrueba), // Llama a la función de eliminación si el usuario confirma
      reject: () => {
        // Puedes manejar lo que ocurre si el usuario cancela la acción aquí (opcional)
      },
    });
  };

  const deletePrueba = async (idPrueba: number) => {
    try {
      await apiService.delete(`http://localhost:4000/pruebas/${idPrueba}`);
      setPruebas(pruebas.filter((prueba) => prueba.idPrueba !== idPrueba));
      Show_Alerta("Prueba eliminada correctamente", "success");
    } catch (error) {
      console.error("Error al eliminar la prueba:", error);
      Show_Alerta("Error al eliminar la prueba", "error");
    }
  };

  const fetchPruebas = async () => {
    try {
      const data: Pruebas[] = await apiService.get(
        `http://localhost:4000/pruebas/${params.id}`
      );
      setPruebas(data);
    } catch (error) {
      setError("Error al obtener las pruebas.");
      console.error("Error al obtener las pruebas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const subscription = notificationService
      .getPrueba()
      .subscribe((value: any) => {
        fetchPruebas();
        handleCloseInsertar();
        handleCloseEditar();
      });
    fetchPruebas();
  }, [params.id]);

  const handleShowDetails = (prueba: Pruebas) => {
    setSelectedPrueba(prueba);
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
        <div className="navbar-aside">
          <NavbarAside onToggle={handleToggle} />
        </div>
        <div className="listar-pruebas">
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
            <h1>Pruebas</h1>
          </div>
          <div className="col-md-6 d-flex align-items-center justify-content-md-end p-3">
            <Button
              label="Crear Prueba"
              className="rounded"
              raised
              onClick={handleShowInsertar}
            />
          </div>
          <hr />
        </div>

        <DataTable
          value={pruebas}
          tableStyle={{ minWidth: "50rem" }}
          paginator
          rows={rows}
          first={first}
          onPage={onPageChange}
          rowsPerPageOptions={[5, 10, 25, 50]} // Opciones para seleccionar cuántos ítems mostrar por página
          paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown" // Mover RowsPerPageDropdown al final
        >
          <Column field="idPrueba" header="ID" />
          <Column field="escenario" header="Escenario" />
          <Column field="caso" header="Caso" />
          <Column field="fecha" header="Fecha" />
          <Column field="resultado" header="Resultado" />
          <Column
            body={(rowData: Pruebas) => (
              <Button
                tooltip="Ver detalles"
                severity="secondary"
                rounded
                label="Detalles"
                className="rounded"
                onClick={() => handleShowDetails(rowData)}
              >
                <ExternalLink />
              </Button>
            )}
            header="Detalles"
          />
          <Column
            body={(rowData: Pruebas) => (
              <div className="d-flex align-items-center">
                <Button
                  severity="info"
                  className="rounded"
                  onClick={() => handleShowEditar(rowData.idPrueba)}
                  tooltip="Editar"
                >
                  <Pencil />
                </Button>

                <Button
                  severity="danger"
                  className="rounded ms-2"
                  tooltip="Eliminar"
                  onClick={() => handleDeletePrueba(rowData.idPrueba)}
                >
                  <Trash2 />
                </Button>
              </div>
            )}
            header="Acciones"
          />
        </DataTable>
      </div>

      {/* Dialogo para mostrar los detalles de la prueba */}
      <Dialog
        maximizable
        key={selectedPrueba ? selectedPrueba.idPrueba : "empty"} // Cambia el key basado en el contenido
        header={selectedPrueba?.escenario}
        visible={isOpen}
        onHide={handleCloseDialog}
        style={{ width: "50vw" }} // Ajusta el tamaño del diálogo según necesites
      >
        {selectedPrueba && (
          <div className="container">
            <strong>Caso:</strong>
            <p>{selectedPrueba.caso}</p>
            <hr />
            <strong>Criterio de Aceptación:</strong>
            <p>{selectedPrueba.criterioAceptacion}</p>
            <hr />
            <strong>Fecha:</strong>{" "}
            {moment(selectedPrueba.fecha).format("DD/MM/YYYY")}
            <hr />
            <strong>Duración:</strong> {selectedPrueba.duracion} minutos
            <hr />
            <strong>Resultado:</strong>
            {selectedPrueba.resultado === "failed" ? (
              <span className="pResultadoFailed text-danger text-center ms-1">
                {selectedPrueba.resultado}
              </span>
            ) : (
              <span className="pResultadoSuccess text-success text-center ms-1">
                {selectedPrueba.resultado}
              </span>
            )}
            <hr />
            <strong>Cobertura:</strong> {selectedPrueba.cobertura}%
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
            <hr />
            <strong>Log:</strong>
            <pre style={{ maxHeight: "300px", overflowY: "auto" }}>
              {decodeLog(selectedPrueba.log)} {/* Usar la función decodeLog */}
            </pre>
          </div>
        )}
      </Dialog>
      {/* Modal para crear nueva prueba */}
      <Modal show={showInsertar} onHide={handleCloseInsertar}>
        <Modal.Header closeButton>
          <Modal.Title>Registrar Prueba</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <CrearPrueba idPrueba={0} />
        </Modal.Body>
      </Modal>
      {/* Modal para Editar prueba */}
      <Modal show={showEditar} onHide={handleCloseEditar}>
        <Modal.Header closeButton>
          <Modal.Title>Editar Prueba</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <CrearPrueba idPrueba={IdPrueba} />
        </Modal.Body>
      </Modal>
      <ConfirmDialog />
    </div>
  );
}

export default ListarPruebas;
