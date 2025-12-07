import { Grid, GridItem } from "@chakra-ui/react"
import NavBar from "./components/NavBar"
import SideBar from "./components/sidebar/SideBar"
import DeviceEditor from "./components/device/DeviceEditor"
import { useState } from "react"
import type { ModbusDevice } from "@/types/ModbusDevice"

function App() {
  const [selectedDevice, setSelectedDevice] = useState<ModbusDevice | undefined>(undefined);

  return (
    <Grid
      h="100vh"
      templateRows="60px 1fr"
      templateColumns="300px 1fr"
      gap={0}
    >
      {/* Navbar */}
      <GridItem colSpan={2} 
        borderBottom="1px solid" borderColor="brand" 
        boxShadow="0 4px 8px -2px rgba(0, 0, 0, 0.2)">
        <NavBar onHomeClick={() => setSelectedDevice(undefined)} />
      </GridItem>

      {/* Sidebar */}
      <GridItem 
        borderRight="1px solid" 
        borderColor="brand" 
        bg="gray.50" 
        overflowY="auto"
        css={{
          '&::-webkit-scrollbar': {
            width: '2px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#81A938',
            borderRadius: '0',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: '#6d8f30',
          },
        }}
      >
        <SideBar 
          selectedDevice={selectedDevice}
          onSelectDevice={setSelectedDevice}
        />
      </GridItem>

      {/* Main Content */}
      <GridItem bg="gray.100">
        {selectedDevice && (
          <DeviceEditor 
            device={selectedDevice}
            onSave={(updatedDevice) => {
              console.log("Device saved:", updatedDevice);
              // TODO: API Call zum Speichern
            }}
            onCancel={() => setSelectedDevice(undefined)}
          />
        )}
      </GridItem>
    </Grid>
  )
}

export default App
