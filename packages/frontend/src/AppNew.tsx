import { Grid, GridItem } from "@chakra-ui/react";
import Navbar from "./components/Navbar";
import { useState } from "react";

function AppNew() {
  const [title, setTitle] = useState("Modbus Simulator");

  return (
    <Grid h="100vh" templateRows="60px 1fr" templateColumns="300px 1fr" gap={0}>
      {/* Navbar */}
      <GridItem colSpan={2}>
        <Navbar
          title={title}
          onHomeClick={() => setTitle("Modbus Simulator")}
        />
      </GridItem>

      {/* Sidebar */}
      <GridItem></GridItem>

      {/* Main Content */}
      <GridItem
        bg="blue.100"
        display="flex"
        alignItems="center"
        justifyContent="center"
      ></GridItem>
    </Grid>
  );
}

export default AppNew;
