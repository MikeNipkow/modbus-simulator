import { Grid, GridItem } from "@chakra-ui/react";
import Navbar from "./components/Navbar";
import { useState } from "react";
import Sidebar from "./components/sidebar/Sidebar";
import type { ModbusDevice } from "./types/ModbusDevice";

function AppNew() {
  const [title, setTitle] = useState("Modbus Simulator");
  const [device, setDevice] = useState<ModbusDevice | null>(null);

  const setSelectedDevice = (device: ModbusDevice | null) => {
    if (device === null) {
      resetSelectedDevice();
      return;
    }

    setDevice(device);
    setTitle(device.filename);
  };

  const resetSelectedDevice = () => {
    setDevice(null);
    setTitle("Modbus Simulator");
  };

  return (
    <Grid h="100vh" templateRows="60px 1fr" templateColumns="300px 1fr" gap={0}>
      {/* Navbar */}
      <GridItem
        colSpan={2}
        background={"bg.light"}
        borderBottom={"1px solid"}
        borderColor={"brand"}
      >
        <Navbar title={title} onHomeClick={() => resetSelectedDevice()} />
      </GridItem>

      {/* Sidebar */}
      <GridItem
        background={"bg.medium"}
        borderRight={"1px solid"}
        borderColor={"brand"}
      >
        <Sidebar selectedDevice={device} onSelectDevice={setSelectedDevice} />
      </GridItem>

      {/* Main Content */}
      <GridItem background={"bg.dark"}></GridItem>
    </Grid>
  );
}

export default AppNew;
