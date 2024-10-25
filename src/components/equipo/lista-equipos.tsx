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
import CrearEquipo from "./crear-equipo.tsx";
import { notificationService } from "../../services/notificaciones";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Show_Alerta } from "../../alertas/alertas";
import { Skeleton } from "primereact/skeleton";
import { ExternalLink } from "lucide-react";
import { Users } from "lucide-react";
import "./equipo.css";
import AsignarMiembros from "./asignar-miembros";
import { useAuth } from "../../auth/adminContext.tsx";

let IdEquipo: number;
interface Equipos {
  idEquipo: number;
  nombre: string;
  descripcion: string;
  estado: string;
  areaTrabajo: string;
  miembros: [
    {
      id: number;
      nombre: string;
      puesto: string;
      correo: string;
    }
  ];
}

function ListarEquipos() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    console.log(isAuthenticated);
    return <div>No tienes acceso a este contenido.</div>;
  }
  const params = useParams();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedEquipo, setSelectedEquipo] = useState<Equipos | null>(null);
  const [equipos, setEquipos] = useState<Equipos[]>([]);
  const [loading, setLoading] = useState(true);
  const [equipo, setEquipo] = useState<string | null>(null);
  const [showInsertar, setShowInsertar] = useState(false);
  const [showEditar, setShowEditar] = useState(false);
  const [showAsignarRecurso, setShowAsignarRecurso] = useState(false);
  const handleCloseAsignarRecurso = () => setShowAsignarRecurso(false);
  const handleShowAsignarRecurso = () => setShowAsignarRecurso(true);

  // Paginación
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(5); // Número de filas por página

  const handleToggle = (isOpen: boolean) => {
    setIsOpen(isOpen);
  };
  const handleShowDetails = async (equipo: Equipos) => {
    await fetchEquipos(); // Asegúrate de obtener los equipos más recientes antes de mostrar detalles
    const equipoActualizado = equipos.find(
      (e) => e.idEquipo === equipo.idEquipo
    ); // Busca el equipo actualizado en la lista
    setSelectedEquipo(equipoActualizado || equipo); // Actualiza con la información más reciente
    setIsOpen(true); // Abre el diálogo
  };

  const handleCloseInsertar = () => setShowInsertar(false);
  const handleShowInsertar = () => setShowInsertar(true);
  const handleCloseEditar = () => setShowEditar(false);

  const handleShowEditar = (id: number) => {
    setShowEditar(true);
    IdEquipo = id;
  };
  const handleDeleteEquipo = (IdEquipo: number) => {
    confirmDialog({
      message: "¿Estás seguro de que deseas eliminar este equipo?",
      header: "Confirmar Eliminación",
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger rounded",
      accept: () => deleteEquipo(IdEquipo), // Llama a la función de eliminación si el usuario confirma
      reject: () => {
        // Puedes manejar lo que ocurre si el usuario cancela la acción aquí (opcional)
      },
    });
  };

  const deleteEquipo = async (IdEquipo: number) => {
    try {
      await apiService.delete(`http://localhost:4000/equipos/${IdEquipo}`);
      setEquipos(equipos.filter((equipo) => equipo.idEquipo !== IdEquipo));
      Show_Alerta("Equipo eliminado correctamente", "success");
    } catch (error) {
      console.error("Error al eliminar el equipo:", error);
      Show_Alerta(
        "Error al eliminar el equipo, compruebe que no tenga miembros asignados o intentelo nuevamente",
        "error"
      );
    }
  };

  const fetchEquipos = async () => {
    try {
      const data = await apiService.get(`http://localhost:4000/equipos`);

      // Verificar si la data contiene un array y mapear los equipos
      const equiposFormateados = data.map((item: any) => ({
        idEquipo: item.equipo.idEquipo,
        nombre: item.equipo.nombre,
        descripcion: item.equipo.descripcion,
        estado: item.equipo.estado,
        areaTrabajo: item.equipo.areaTrabajo,
        miembros: item.equipo.miembros, // También extrae los miembros si los necesitas
      }));

      setEquipos(equiposFormateados);
      console.log(equiposFormateados); // Para revisar cómo queda la estructura
    } catch (error) {
      setEquipo("Error al obtener los equipos.");
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
        fetchEquipos();
      });
    const subscription2 = notificationService
      .getAsignacionRecurso()
      .subscribe((value: any) => {
        handleCloseInsertar();
        handleCloseEditar();
        handleCloseAsignarRecurso();
        fetchEquipos();
      });

    fetchEquipos();
  }, [params.id]);

  const handleCloseDialog = () => {
    setSelectedEquipo(null); // Limpiar la selección primero
    setIsOpen(false); // Luego cerrar el diálogo
  };

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
            <h2 className="mb-0 p-0 fw-bold text-muted">LISTA DE EQUIPOS</h2>
          </div>
          <div className="col-md-6 d-flex align-items-center justify-content-md-end ">
            <Button
              label="Crear Equipo"
              className="rounded"
              raised
              onClick={handleShowInsertar}
            />
            <Button
              label="Asignar Miembros"
              className="rounded ms-3"
              raised
              onClick={handleShowAsignarRecurso}
            />
          </div>
        </div>

        <DataTable
          value={equipos}
          tableStyle={{ width: "100%" }}
          paginator
          rows={rows}
          first={first}
          onPage={onPageChange}
          rowsPerPageOptions={[5, 10, 25, 50]} // Opciones para seleccionar cuántos ítems mostrar por página
          paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown" // Mover RowsPerPageDropdown al final
        >
          <Column field="idEquipo" header="ID Equipo" />
          <Column field="nombre" header="Nombre" />
          <Column field="descripcion" header="Descripción" />
          <Column field="areaTrabajo" header="Área de Trabajo" />

          <Column
            body={(rowData: Equipos) => (
              <Button
                tooltip="Ver miembros"
                severity="secondary"
                rounded
                label="Miembros"
                className="rounded"
                onClick={() => handleShowDetails(rowData)}
              >
                <Users className="ms-2" />
              </Button>
            )}
            header="Detalles"
          />
          <Column
            body={(rowData: Equipos) => (
              <div className="d-flex align-items-center">
                <Button
                  severity="info"
                  className="rounded"
                  onClick={() => handleShowEditar(rowData.idEquipo)}
                  tooltip="Editar"
                >
                  <i className="bi bi-pencil-square"></i>
                </Button>

                <Button
                  severity="danger"
                  className="rounded ms-2"
                  tooltip="Eliminar"
                  onClick={() => handleDeleteEquipo(rowData.idEquipo)}
                >
                  <i className="bi bi-trash"></i>
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
        key={selectedEquipo ? selectedEquipo.idEquipo : "empty"} // Cambia el key basado en el contenido
        header={selectedEquipo?.nombre}
        visible={isOpen}
        onHide={handleCloseDialog}
        style={{ width: "60vw" }} // Ajusta el tamaño del diálogo según necesites
      >
        {selectedEquipo && (
          <div className="container">
            {/* Verifica si hay miembros en el equipo */}
            {selectedEquipo.miembros.length > 0 ? (
              selectedEquipo.miembros.map((miembro, index) => (
                <div key={miembro.id}>
                  <p>
                    <strong>{miembro.nombre}</strong> - {miembro.puesto} -{" "}
                    {miembro.correo}
                  </p>
                  {index < selectedEquipo.miembros.length - 1 && <hr />}{" "}
                  {/* Añade separador entre miembros */}
                </div>
              ))
            ) : (
              <p>El equipo aún no cuenta con miembros.</p>
            )}
          </div>
        )}
      </Dialog>

      {/* Modal para crear  */}
      <Modal show={showInsertar} onHide={handleCloseInsertar}>
        <Modal.Header closeButton>
          <Modal.Title>Crear Equipo</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <CrearEquipo IdEquipo={0} />
        </Modal.Body>
      </Modal>
      {/* Modal para Editar  */}
      <Modal show={showEditar} onHide={handleCloseEditar}>
        <Modal.Header closeButton>
          <Modal.Title>Editar Error</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <CrearEquipo IdEquipo={IdEquipo} />
        </Modal.Body>
      </Modal>
      <ConfirmDialog />
      {/* Modal para Asignar Recursos */}
      <Modal show={showAsignarRecurso} onHide={handleCloseAsignarRecurso}>
        <Modal.Header closeButton>
          <Modal.Title>Asignar Recurso</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <AsignarMiembros />
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default ListarEquipos;
