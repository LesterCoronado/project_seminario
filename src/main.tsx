import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { BrowserRouter as Router } from "react-router-dom"; // Importa BrowserRouter
import "bootstrap-icons/font/bootstrap-icons.css";
import "./index.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from "./components/navbar/navbar.tsx";
import { PrimeReactProvider } from "primereact/api";
import "primereact/resources/themes/lara-light-cyan/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <PrimeReactProvider>
      <Router>
        <Navbar />
        <App />
      </Router>
    </PrimeReactProvider>
  </React.StrictMode>
);
