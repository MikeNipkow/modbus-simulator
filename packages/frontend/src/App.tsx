import { Grid, GridItem } from "@chakra-ui/react"
import NavBar from "./components/NavBar"
import DeviceList from "./components/DeviceList"
import DeviceButton from "./components/DeviceButton"
import { FaNetworkWired } from "react-icons/fa6"
import { FaBook } from "react-icons/fa"
import type { ModbusDevice } from "./types/ModbusDevice"
import { Endian } from "./types/enums/Endian"

function App() {
  const mockDevices: ModbusDevice[] = [
    { filename: "Device1.json", enabled: true, port: 5020, endian: Endian.BigEndian, running: true },
    { filename: "Device2.json", enabled: false, port: 5021, endian: Endian.BigEndian, running: false },
    { filename: "wago_879_mid_modbus.json", enabled: true, port: 5022, endian: Endian.LittleEndian, running: true },
  ];

  return (
    <Grid
      minH="100vh"
      templateRows="80px 1fr"
      templateColumns="250px 1fr"
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
        <DeviceList title="Devices" icon={FaNetworkWired}>
          {mockDevices.map((device) => (
            <DeviceButton
              key={device.filename}
              device={device}
            />
          ))}
        </DeviceList>
        <DeviceList title="Templates" icon={FaBook}>
          {mockDevices.map((device) => (
            <DeviceButton
              key={device.filename}
              device={device}
            />
          ))}
        </DeviceList>
      </GridItem>

      {/* Main Content */}
      <GridItem>
        Main
      </GridItem>
    </Grid>
  )
}

export default App
