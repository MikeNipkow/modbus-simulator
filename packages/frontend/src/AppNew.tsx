import { Button, Grid, GridItem } from "@chakra-ui/react";
import SidebarButton from "./components/sidebar/SidebarButton";
import SidebarIconButton from "./components/sidebar/SidebarIconButton";
import { FaHome, FaNetworkWired } from "react-icons/fa";
import Sidebar from "./components/sidebar/Sidebar";
import SidebarDropdownButton from "./components/sidebar/SidebarDropdownButton";
import { useState } from "react";
import type { ModbusDevice } from "./types/ModbusDevice";

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
      ></GridItem>

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
        <Button size={"2xl"} variant={"primary"}>
          Test
        </Button>
        <Button size={"2xl"} variant={"secondary"}>
          Test
        </Button>
        <SidebarButton>Sidebar Button</SidebarButton>
        <SidebarButton fontWeight="bold" title="Test" variant={"primary"}>
          Sidebar Button
        </SidebarButton>
        <SidebarIconButton
          fontWeight="bold"
          label="Test"
          variant={"primary"}
          icon={FaHome}
        ></SidebarIconButton>
        <SidebarDropdownButton
          fontWeight="bold"
          label="Test"
          variant={"secondary"}
          icon={FaNetworkWired}
        >
          Dropdown
        </SidebarDropdownButton>
      </GridItem>
    </Grid>
  );
}

export default AppNew;
