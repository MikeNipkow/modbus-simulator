import { Grid, GridItem } from "@chakra-ui/react";
import Sidebar from "./components/sidebar/Sidebar";
import { useState } from "react";
import Navbar from "./components/Navbar";
import DeviceEditorOld from "./components/editor/DeviceEditor_";
import DeviceEditor from "./components/editor/DeviceEditor";
import useDevices from "./hooks/useDevices";
import { Toaster } from "./components/ui/toaster";

function AppNew() {
  const [refreshTrigger, setRefreshTrigger] = useState({});
  const { devices: devices } = useDevices(false, [refreshTrigger]);
  const { devices: templates } = useDevices(true, [refreshTrigger]);
  const [selectedDevice, setSelectedDevice] = useState<{
    filename: string;
    template: boolean;
  } | null>(null);

  const updateDeviceList = () => {
    setRefreshTrigger({});
  };

  const getSelectedDevice = () => {
    if (selectedDevice === null) return null;
    const collection = selectedDevice.template ? templates : devices;
    return collection.get(selectedDevice.filename) || null;
  };

  const getDevicesArray = () => {
    return Array.from(devices.values());
  };

  const getTemplatesArray = () => {
    return Array.from(templates.values());
  };

  return (
    <>
      <Toaster />
      <Grid
        h="100vh"
        templateRows="60px 1fr"
        templateColumns="300px 1fr"
        gap={0}
      >
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
            devices={getDevicesArray()}
            templates={getTemplatesArray()}
            selectedDevice={getSelectedDevice()}
            onDeviceSelect={setSelectedDevice}
            onDeviceAdd={(filename, template) => {
              updateDeviceList();
              setSelectedDevice({ filename, template });
            }}
          />
        </GridItem>

        {/* Main Content */}
        <GridItem background={"bg.dark"}>
          {selectedDevice !== null && selectedDevice.template && (
            <DeviceEditorOld device={getSelectedDevice()!} />
          )}
          {getSelectedDevice() !== null && !selectedDevice?.template && (
            <DeviceEditor
              device={getSelectedDevice()!}
              onUpdate={updateDeviceList}
              onDelete={() => setSelectedDevice(null)}
            />
          )}
        </GridItem>
      </Grid>
    </>
  );
}

export default AppNew;
