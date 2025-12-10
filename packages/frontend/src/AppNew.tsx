import { Grid, GridItem } from "@chakra-ui/react";
import Sidebar from "./components/sidebar/Sidebar";
import { useState } from "react";
import type { ModbusDevice } from "./types/ModbusDevice";
import Navbar from "./components/Navbar";
import DeviceEditorOld from "./components/editor/DeviceEditor_";
import DeviceEditor from "./components/editor/DeviceEditor";

function AppNew() {
  const [selectedDevice, setSelectedDevice] = useState<ModbusDevice | null>(
    null,
  );

  return (
    <Grid h="100vh" templateRows="60px 1fr" templateColumns="300px 1fr" gap={0}>
      {/* Navbar */}
      <GridItem
        colSpan={2}
        background={"bg.light"}
        borderBottom={"1px solid"}
        borderColor={"primary"}
      >
        <Navbar
          title={selectedDevice === null ? "" : selectedDevice.filename}
          onHomeClick={() => setSelectedDevice(null)}
        />
      </GridItem>

      {/* Sidebar */}
      <GridItem
        background={"bg.medium"}
        borderRight={"1px solid"}
        borderColor={"primary"}
      >
        <Sidebar
          selectedDevice={selectedDevice}
          onDeviceSelect={setSelectedDevice}
        />
      </GridItem>

      {/* Main Content */}
      <GridItem background={"bg.dark"}>
        {selectedDevice !== null && selectedDevice.template && (
          <DeviceEditorOld device={selectedDevice} />
        )}
        {selectedDevice !== null && !selectedDevice.template && (
          <DeviceEditor device={selectedDevice} />
        )}
      </GridItem>
    </Grid>
  );
}

export default AppNew;
