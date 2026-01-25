import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App.tsx";
import "./index.css";

console.log("App initializing...");

createRoot(document.getElementById("root")!).render(
    <HashRouter>
        <App />
    </HashRouter>
);
