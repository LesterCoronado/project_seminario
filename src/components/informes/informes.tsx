import "primeflex/primeflex.css";
import NavbarAside from "../../components/proyectos/gestion-proyecto/navbar-aside/navbar-aside";
import { useEffect, useState } from "react";
import { apiService } from "../../services/apiService";
import { useParams } from "react-router-dom";
import { Bug } from "lucide-react";
import { CodeXml } from "lucide-react";
import "./informes.css";
import { Chart } from "primereact/chart";
import { useAuth } from "../../auth/adminContext";
import { DataScroller } from 'primereact/datascroller';
import '../../App.css'; // Asegúrate de que la ruta sea correcta


interface Informe {
  errores: [
    {
      total: number;
      corregidos: number;
      pendientes: number;
      severidad: {
        baja: number;
        media: number;
        alta: number;
      };
      tiempoPromedioResolucion: string;
      tasaDefectosCorregidos: string;
    }
  ];
  pruebas: [
    {
      total: number;
      failed: number;
      passed: number;
      cobertura: string;
    }
  ];
}

function Informes() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <div>No tienes acceso a este contenido.</div>;
  }

  const [isOpen, setIsOpen] = useState(false);
  const handleToggle = (isOpen: boolean) => {
    setIsOpen(isOpen);
  };
  const params = useParams();
  const [informe, setInforme] = useState<Informe | null>(null);
  const [chartData, setChartData] = useState({});
  const [chartPrueba, setChartPrueba] = useState({});
  const [chartOptions, setChartOptions] = useState({});

  const fetchInformes = async () => {
    try {
      const data: Informe = await apiService.get(
        `https://sp-backend-production.up.railway.app/informe/${params.id}`
      );

      // Si no hay datos, establece valores por defecto
      if (!data.errores) {
        data.errores = [{
          total: 0,
          corregidos: 0,
          pendientes: 0,
          severidad: {
            baja: 0,
            media: 0,
            alta: 0,
          },
          tiempoPromedioResolucion: "0",
          tasaDefectosCorregidos: "0%",
        }];
      }

      if (!data.pruebas) {
        data.pruebas = [{
          total: 0,
          failed: 0,
          passed: 0,
          cobertura: "0%",
        }];
      }

      setInforme(data);
      
    } catch (error) {
      
      // Establece valores por defecto en caso de error
      setInforme({
        errores: [{
          total: 0,
          corregidos: 0,
          pendientes: 0,
          severidad: {
            baja: 0,
            media: 0,
            alta: 0,
          },
          tiempoPromedioResolucion: "0",
          tasaDefectosCorregidos: "0%",
        }],
        pruebas: [{
          total: 0,
          failed: 0,
          passed: 0,
          cobertura: "0%",
        }],
      });
    } finally {
      
    }
  };

  useEffect(() => {
    fetchInformes();
  }, [params.id]);

  useEffect(() => {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue("--text-color");
    const textColorSecondary = documentStyle.getPropertyValue("--text-color-secondary");

    if (informe) {
      const data = {
        labels: [
          "Total",
          "Corregidos",
          "Pendientes",
          "Severidad Baja",
          "Severidad Media",
          "Severidad Alta",
        ],
        datasets: [
          {
            label: "Errores",
            borderColor: documentStyle.getPropertyValue("--pink-400"),
            pointBackgroundColor: documentStyle.getPropertyValue("--pink-400"),
            pointBorderColor: documentStyle.getPropertyValue("--pink-400"),
            pointHoverBackgroundColor: textColor,
            pointHoverBorderColor: documentStyle.getPropertyValue("--pink-400"),
            data: [
              informe.errores[0].total,
              informe.errores[0].corregidos,
              informe.errores[0].pendientes,
              informe.errores[0].severidad.baja,
              informe.errores[0].severidad.media,
              informe.errores[0].severidad.alta,
            ],
          },
        ],
      };

      const options = {
        plugins: {
          legend: {
            labels: {
              color: textColor,
            },
          },
        },
        scales: {
          r: {
            grid: {
              color: textColorSecondary,
            },
          },
        },
      };

      setChartData(data);
      setChartOptions(options);
    }
  }, [informe]);

  useEffect(() => {
    const documentStyle = getComputedStyle(document.documentElement);

    if (informe) {
      const data = {
        labels: ["Aprobadas", "Fallidas"],
        datasets: [
          {
            data: [informe.pruebas[0].passed, informe.pruebas[0].failed],
            backgroundColor: [
              documentStyle.getPropertyValue("--blue-500"),
              documentStyle.getPropertyValue("--yellow-500"),
            ],
            hoverBackgroundColor: [
              documentStyle.getPropertyValue("--blue-400"),
              documentStyle.getPropertyValue("--yellow-400"),
            ],
          },
        ],
      };
      const options = {
        cutout: "60%",
      };
      setChartPrueba(data);
      setChartOptions(options);
    }
  }, [informe]);

  const itemTemplate = (item: any) => {
    return (
      <div className="grid mt-2">
        <div className="col-12 md:col-12 lg:col-12">
          {informe &&
            informe.errores.map((error, index) => (
              <div
                key={index} // Añade el key aquí
                className="surface-0 shadow-2 p-3 border-1 border-50 border-round"
              >
                <div className="flex justify-content-between mb-3">
                  <div className="w-100">
                    <span className="block text-500 font-medium mb-3">
                      <span className="block text-500 font-medium mb-3">
                        INFORME DE ERRORES
                      </span>
                      <div className="row w-100 mt-5 text-center d-flex justify-content-center align-items-center">
                        <div className="col-md-2 text-center">
                          <span className="text-500">Total de Errores</span>
                          <div className="text-900 font-medium text-xl">
                            {error.total}
                          </div>
                        </div>
                        <div className="col-md-2 text-center">
                          <span className="text-500">Corregidos</span>
                          <div className="text-900 font-medium text-xl">
                            {error.corregidos}
                          </div>
                        </div>
                        <div className="col-md-2 text-center">
                          <span className="text-500">Pendientes</span>
                          <div className="text-900 font-medium text-xl">
                            {error.pendientes}
                          </div>
                        </div>

                        <div className="col-md-3 text-center">
                          <span className="text-500">Promedio Resolución</span>
                          <div className="text-900 font-medium text-xl">
                            {error.tiempoPromedioResolucion} días
                          </div>
                        </div>
                        <div className="col-md-2 text-center">
                          <span className="text-500">Tasa de Corregidos</span>
                          <div className="text-green-500 font-medium text-xl">
                            {error.tasaDefectosCorregidos}
                          </div>
                        </div>
                        <div className="col-md-12">
                          <div className="mt-5 flex justify-content-center">
                            <Chart
                              type="radar"
                              data={chartData}
                              options={chartOptions}
                              className="w-full md:w-30rem"
                            />
                          </div>
                        </div>
                      </div>
                    </span>
                  </div>

                  <div
                    className="flex align-items-center justify-content-center bg-blue-100 border-round text-primary"
                    style={{ width: "2.5rem", height: "2.5rem" }}
                  >
                    <Bug />
                  </div>
                </div>
                <span className="text-green-500 font-medium">
                  {error.tasaDefectosCorregidos}{" "}
                </span>
                <span className="text-500">tasa de errores corregidos</span>
              </div>
            ))}
        </div>
        <div className="col-12 md:col-12 lg:col-12">
          {informe &&
            informe.pruebas.map((prueba, index) => (
              <div
                key={index} // Añade el key aquí
                className="surface-0 shadow-2 p-3 border-1 border-50 border-round"
              >
                <div className="flex justify-content-between mb-3">
                  <div className="w-100">
                    <span className="block text-500 font-medium mb-3">
                      <span className="block text-500 font-medium mb-3">
                        INFORME DE PRUEBAS
                      </span>
                      <div className="row w-100 mt-5 text-center d-flex justify-content-center align-items-center">
                        <div className="col-md-2 text-center">
                          <span className="text-500">Total de Pruebas</span>
                          <div className="text-900 font-medium text-xl">
                            {prueba.total}
                          </div>
                        </div>
                        <div className="col-md-2 text-center">
                          <span className="text-500">Aprobadas</span>
                          <div className="text-900 font-medium text-xl">
                            {prueba.passed}
                          </div>
                        </div>
                        <div className="col-md-2 text-center">
                          <span className="text-500">Fallidas</span>
                          <div className="text-900 font-medium text-xl">
                            {prueba.failed}
                          </div>
                        </div>

                        <div className="col-md-2 text-center">
                          <span className="text-500">Tasa de Cobertura</span>
                          <div className="text-green-500 font-medium text-xl">
                            {prueba.cobertura}
                          </div>
                        </div>
                        <div className="col-md-12">
                          <div className="mt-5 flex justify-content-center">
                            <Chart
                              type="doughnut"
                              data={chartPrueba}
                              options={chartOptions}
                              className="w-full md:w-30rem"
                            />
                          </div>
                        </div>
                      </div>
                    </span>
                  </div>

                  <div
                    className="flex align-items-center justify-content-center bg-blue-100 border-round text-primary"
                    style={{ width: "2.5rem", height: "2.5rem" }}
                  >
                    <CodeXml />
                  </div>
                </div>
                <span className="text-green-500 font-medium">
                  {prueba.cobertura}{" "}
                </span>
                <span className="text-500">en cobertura de pruebas</span>
              </div>
            ))}
        </div>
      </div>
   
    );
  };

  return (
    <div className="contenido">
      <div className="navbar-aside">
        <NavbarAside onToggle={handleToggle} />
      </div>
      <div className="content grid">
        <div className="col-12 md:col-12 lg:col-12">
          {informe && (
            <DataScroller
              value={informe.errores}
              itemTemplate={itemTemplate}
              inline scrollHeight="500px"
              rows={2} // Número de filas a mostrar
              header="INFORMES"
              footer="Carga de datos finalizada."
              className="custom-datascroller"
            />
          )}
        </div>
      
      </div>
    </div>
  );
}

export default Informes;
