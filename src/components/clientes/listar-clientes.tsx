import NavbarAside from "../proyectos/gestion-proyecto/navbar-aside/navbar-aside.tsx";
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
import CrearCliente from "./crear-clientes.tsx";
import { notificationService } from "../../services/notificaciones";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Show_Alerta } from "../../alertas/alertas";
import { Skeleton } from "primereact/skeleton";
import { ExternalLink } from "lucide-react";
import { Users } from "lucide-react";
import { Tag } from "primereact/tag";
import { useAuth } from "../../auth/adminContext.tsx";
let IdCliente: number;

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
function ListarClientes() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    console.log(isAuthenticated)
    return <div>No tienes acceso a este contenido.</div>;
  }
  const params = useParams();
  const [isOpen, setIsOpen] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
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

  const getEstadoTag = (estado: any) => {
    return estado ? (
      <Tag severity="success" value="Activo" />
    ) : (
      <Tag severity="warning" value="Inactivo" />
    );
  };


  const handleShowEditar = (id: number) => {
    setShowEditar(true);
    IdCliente = id;
    console.log("IdCliente:", IdCliente);
  };
  const handleDeleteCliente = (IdCliente: number) => {
    confirmDialog({
      message: "¿Estás seguro de que deseas eliminar este cliente?",
      header: "Confirmar Eliminación",
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger rounded",
      accept: () => deleteCliente(IdCliente), // Llama a la función de eliminación si el usuario confirma
      reject: () => {
        // Puedes manejar lo que ocurre si el usuario cancela la acción aquí (opcional)
      },
    });
  };

  const deleteCliente = async (IdCliente: number) => {
    try {
      await apiService.delete(`https://sp-backend-production.up.railway.app/clientes/${IdCliente}`);
      setClientes(
        clientes.filter((cliente) => cliente.idCliente !== IdCliente)
      );
      Show_Alerta("cliente eliminado correctamente", "success");
    } catch (error) {
      console.error("Error al eliminar el cliente:", error);
      Show_Alerta(
        "Error al eliminar el cliente, compruebe que no tenga proyectos asignados o intentelo nuevamente",
        "error"
      );
    }
  };

  const fetchClientes = async () => {
    try {
      const data = await apiService.get(`https://sp-backend-production.up.railway.app/clientes`);
      setClientes(data);
      console.log("Clientes:", data);
    } catch (error) {
      console.error("Error al obtener los equipos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const subscription = notificationService
      .getEquipo()
      .subscribe((value: any) => {
        handleCloseInsertar();
        handleCloseEditar();
        fetchClientes();
      });
    fetchClientes();
  }, [params.id]);

  const onPageChange = (event: { first: number; rows: number }) => {
    setFirst(event.first);
    setRows(event.rows);
  };

  if (loading) {
    return (
      <div className="listar-errores">
        <div className="container">
          <Skeleton width="70rem" className="mb-2"></Skeleton>
          <Skeleton width="40rem" className="mb-2"></Skeleton>
          <Skeleton width="20rem" className="mb-2"></Skeleton>
          <Skeleton height="10rem" width="70rem" className="mb-2"></Skeleton>
          <Skeleton width="70rem" height="1rem"></Skeleton>
        </div>
      </div>
    );
  }

  return (
    <div className="contenido">
      <div
        className="content card  w-100 "
        style={{ display: "flex", flexDirection: "column" }}
      >
        <div className="row p-2">
          <div className="col-md-6 d-flex flex-column justify-content-between p-3">
            <h2 className="mb-0 p-0 fw-bold text-muted">LISTA DE CLIENTES</h2>
          </div>
          <div className="col-md-6 d-flex align-items-center justify-content-md-end ">
            <Button
              label="Crear Cliente"
              className="rounded"
              raised
              onClick={handleShowInsertar}
            />
          </div>
        </div>

        <DataTable
          value={clientes}
          tableStyle={{ width: "100%" }}
          paginator
          rows={rows}
          first={first}
          onPage={onPageChange}
          rowsPerPageOptions={[5, 10, 25, 50]} // Opciones para seleccionar cuántos ítems mostrar por página
          paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown" // Mover RowsPerPageDropdown al final
        >
          <Column field="idCliente" header="ID Cliente" />
          <Column field="nombre" header="Nombre" />
          <Column field="industria" header="Industria" />
          <Column field="direccion" header="Dirección" />
          <Column field="telefono" header="Telefono" />
          <Column field="correo" header="Correo" />
          <Column
            field="estado"
            header="Estado"
            body={(rowData) => getEstadoTag(rowData.estado)}
          />

          <Column
            body={(rowData: Cliente) => (
              <div className="d-flex align-items-center">
                <Button
                  severity="info"
                  className="rounded"
                  onClick={() => handleShowEditar(rowData.idCliente)}
                  tooltip="Editar"
                >
                  <i className="bi bi-pencil-square"></i>
                </Button>

                <Button
                  severity="danger"
                  className="rounded ms-2"
                  tooltip="Eliminar"
                  onClick={() => handleDeleteCliente(rowData.idCliente)}
                >
                  <i className="bi bi-trash"></i>
                </Button>
              </div>
            )}
            header="Acciones"
          />
        </DataTable>
      </div>

      {/* Modal para crear  */}
      <Modal show={showInsertar} onHide={handleCloseInsertar}>
        <Modal.Header closeButton>
          <Modal.Title>Crear Cliente</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <CrearCliente IdCliente={0} />
        </Modal.Body>
      </Modal>
      {/* Modal para Editar  */}
      <Modal show={showEditar} onHide={handleCloseEditar}>
        <Modal.Header closeButton>
          <Modal.Title>Editar Cliente</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <CrearCliente IdCliente={IdCliente} />
        </Modal.Body>
      </Modal>
      <ConfirmDialog />
    </div>
  );
}

export default ListarClientes;
