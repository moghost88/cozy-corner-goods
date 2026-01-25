import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App.tsx";
import { LanguageProvider } from "./contexts/LanguageContext.tsx";
import "./index.css";

console.log("App initializing...");

createRoot(document.getElementById("root")!).render(
    <LanguageProvider>
        <HashRouter>
            <App />
        </HashRouter>
    </LanguageProvider>
);
