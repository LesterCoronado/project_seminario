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
import CrearUsuario from "./crear-usuarios.tsx";
import { notificationService } from "../../services/notificaciones";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Show_Alerta } from "../../alertas/alertas";
import { Skeleton } from "primereact/skeleton";
import { ExternalLink } from "lucide-react";
import { Users } from "lucide-react";
import { Tag } from "primereact/tag";
import { useAuth } from "../../auth/adminContext.tsx";

let IdUsuario: number;

interface Usuario {
  idUsuario: number;
  nombre: string;
  apellido: string;
  correo: string;
  rol: string;
  estado: string;
}
function ListarUsuarios() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    
    return <div>No tienes acceso a este contenido.</div>;
  }
  const params = useParams();
  const [isOpen, setIsOpen] = useState(false);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
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
    IdUsuario = id;
    
  };
  const handleDeleteUsuario = (IdUsuario: number) => {
    confirmDialog({
      message: "¿Estás seguro de que deseas eliminar este usuario?",
      header: "Confirmar Eliminación",
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger rounded",
      accept: () => deleteUsuario(IdUsuario), // Llama a la función de eliminación si el usuario confirma
      reject: () => {
        // Puedes manejar lo que ocurre si el usuario cancela la acción aquí (opcional)
      },
    });
  };

  const deleteUsuario = async (IdUsuario: number) => {
    try {
      await apiService.delete(`https://sp-backend-production.up.railway.app/deleteuser/${IdUsuario}`);
      setUsuarios(
        usuarios.filter((usuario) => usuario.idUsuario !== IdUsuario)
      );
      Show_Alerta("usuario eliminado correctamente", "success");
    } catch (error) {
      
      Show_Alerta(
        "Error al eliminar el usuario, compruebe que no tenga proyectos asignados o intentelo nuevamente",
        "error"
      );
    }
  };

  const fetchUsuarios = async () => {
    try {
      const data = await apiService.get(`https://sp-backend-production.up.railway.app/allusers`);
      setUsuarios(data);
      
    } catch (error) {
      
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
        fetchUsuarios();
      });

    fetchUsuarios();
  }, []);

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
        className=" content card  w-100 "
        style={{ display: "flex", flexDirection: "column" }}
      >
        <div className="row p-2">
          <div className="col-md-6 d-flex flex-column justify-content-between p-3">
            <h2 className="mb-0 p-0 fw-bold text-muted">LISTA DE USUARIOS</h2>
          </div>
          <div className="col-md-6 d-flex align-items-center justify-content-md-end ">
            <Button
              label="Crear Usuario"
              className="rounded"
              raised
              onClick={handleShowInsertar}
            />
          </div>
        </div>

        <DataTable
          value={usuarios}
          tableStyle={{ width: "100%" }}
          paginator
          rows={rows}
          first={first}
          onPage={onPageChange}
          rowsPerPageOptions={[5, 10, 25, 50]} // Opciones para seleccionar cuántos ítems mostrar por página
          paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown" // Mover RowsPerPageDropdown al final
        >
          <Column field="idUsuario" header="ID Usuario" />
          <Column field="nombre" header="Nombre" />
          <Column field="apellido" header="Apellido" />
          <Column field="correo" header="Correo" />
          <Column field="rol" header="Rol" />

          <Column
            field="estado"
            header="Estado"
            body={(rowData) => getEstadoTag(rowData.estado)}
          />

          <Column
            body={(rowData: Usuario) => (
              <div className="d-flex align-items-center">
                <Button
                  severity="info"
                  className="rounded"
                  onClick={() => handleShowEditar(rowData.idUsuario)}
                  tooltip="Editar"
                >
                  <i className="bi bi-pencil-square"></i>
                </Button>

                <Button
                  severity="danger"
                  className="rounded ms-2"
                  tooltip="Eliminar"
                  onClick={() => handleDeleteUsuario(rowData.idUsuario)}
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
          <Modal.Title>Crear Usuario</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <CrearUsuario IdUsuario={0} />
        </Modal.Body>
      </Modal>
      {/* Modal para Editar  */}
      <Modal show={showEditar} onHide={handleCloseEditar}>
        <Modal.Header closeButton>
          <Modal.Title>Editar Usuario</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <CrearUsuario IdUsuario={IdUsuario} />
        </Modal.Body>
      </Modal>
      <ConfirmDialog />
    </div>
  );
}

export default ListarUsuarios;
