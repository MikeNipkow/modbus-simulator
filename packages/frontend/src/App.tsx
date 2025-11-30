import { Grid, GridItem } from "@chakra-ui/react"
import NavBar from "./components/NavBar"
import SideBar from "./components/sidebar/SideBar"
import DeviceEditor from "./components/device/DeviceEditor"
import { useState } from "react"
import type { ModbusDevice } from "@/types/ModbusDevice"

function App() {
  const [selectedDevice, setSelectedDevice] = useState<ModbusDevice | null>(null);

  return (
    <Grid
      minH="100vh"
      templateRows="80px 1fr"
      templateColumns="300px 1fr"
      gap={0}
    >
      {/* Navbar */}
      <GridItem colSpan={2} 
        borderBottom="2px solid" borderColor="brand" 
        boxShadow="0 4px 8px -2px rgba(0, 0, 0, 0.2)">
        <NavBar />
      </GridItem>

      {/* Sidebar */}
      <GridItem borderRight="2px solid" borderColor="brand">
        <SideBar 
          selectedDevice={selectedDevice}
          onSelectDevice={setSelectedDevice}
        />
      </GridItem>

      {/* Main Content */}
      <GridItem>
        {selectedDevice && (
          <DeviceEditor 
            device={selectedDevice}
            onSave={(updatedDevice) => {
              console.log("Device saved:", updatedDevice);
              // TODO: API Call zum Speichern
            }}
            onCancel={() => setSelectedDevice(null)}
          />
        )}
      </GridItem>
    </Grid>
  )
}

export default App
