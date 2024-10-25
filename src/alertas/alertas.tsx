import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

export function Show_Alerta(message: string, icon: any) {
  const MySwal = withReactContent(Swal);
  MySwal.fire({
    title: message,
    icon: icon,
    confirmButtonText: "Ok",
  });
}

function onfocus(foco: any) {
  if (foco !== "") {
    document.getElementById(foco)?.focus();
  }
}
