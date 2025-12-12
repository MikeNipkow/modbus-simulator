import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import AppNew from "./AppNew.tsx";
import { ChakraProvider } from "@chakra-ui/react/styled-system";
import system from "./theme/theme.ts";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ChakraProvider value={ system}>
      <AppNew />
    </ChakraProvider>
  </StrictMode>,
);
