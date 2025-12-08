import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./archive/App.tsx";
import AppNew from "./AppNew.tsx";
import { ChakraProvider } from "@chakra-ui/react/styled-system";
import oldsystem from "./archive/themes/theme.ts";
import system from "./themes/theme.ts";
import { features } from "./archive/config/features.ts";

// Zeige aktive Features in der Konsole
if (features.newVersion) {
  console.log(
    "%c🚀 NEUE VERSION AKTIV",
    "color: #2563eb; font-size: 16px; font-weight: bold",
  );
  console.log("Zurück zur alten Version: ?newVersion=false");
} else {
  console.log("%c📦 Standard Version aktiv", "color: #81A938; font-size: 14px");
  console.log("Zur neuen Version wechseln: ?newVersion=true");
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ChakraProvider value={features.newVersion ? system : oldsystem}>
      {features.newVersion ? <AppNew /> : <App />}
    </ChakraProvider>
  </StrictMode>,
);
