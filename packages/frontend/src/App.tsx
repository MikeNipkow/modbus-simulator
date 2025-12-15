import { Grid, GridItem } from "@chakra-ui/react";
import Sidebar from "./components/sidebar/Sidebar";
import { useEffect, useState } from "react";
import DeviceEditor from "./components/editor/DeviceEditor";
import useDevices from "./hooks/device/useDevices";
import { Toaster } from "./components/ui/Toaster";
import Navbar from "./components/navbar/Navbar";

function App() {
  // State to trigger device list refresh.
  const [refreshTrigger, setRefreshTrigger] = useState({});

  // Fetch devices and templates.
  const { devices: devices } = useDevices(false, [refreshTrigger]);
  const { devices: templates } = useDevices(true, [refreshTrigger]);

  // State to manage selected device.
  const [selectedDevice, setSelectedDevice] = useState<{
    filename: string;
    template: boolean;
  } | null>(null);

  // Effect to handle URL-based device selection.
  useEffect(() => {
    // Check if URL has device or template filename.
    const path = window.location.pathname || "";

    // Ignore if at root.
    if (path === "/") return;

    // Check if URL matches device or template pattern.
    const isDevicePath = path.startsWith("/device/");
    const isTemplatePath = path.startsWith("/template/");

    // Redirect to home if neither.
    if (!isDevicePath && !isTemplatePath) {
      redirect("/");
      return;
    }

    // Extract filename from URL.
    const filename = path.replace("/device/", "").replace("/template/", "");

    // Set selected device if it exists.
    if (isDevicePath) setSelectedDevice({ filename, template: false });
    else if (isTemplatePath) setSelectedDevice({ filename, template: true });
    else redirect("/");
  }, [devices, templates]);

  /**
   * Redirect to a given URI.
   * @param uri Target URI.
   */
  const redirect = (uri: string) => {
    window.history.replaceState(null, "", uri);
  };

  // Function to update device list.
  const updateDeviceList = () => {
    setRefreshTrigger({});
  };

  // Function to get the currently selected device object.
  const getSelectedDevice = () => {
    if (selectedDevice === null) return null;
    const collection = selectedDevice.template ? templates : devices;
    return collection.get(selectedDevice.filename) || null;
  };

  // Functions to convert devices Map to array for Sidebar.
  const getDevicesArray = () => {
    return Array.from(devices.values());
  };

  // Function to convert templates Map to array for Sidebar.
  const getTemplatesArray = () => {
    return Array.from(templates.values());
  };

  return (
    <>
      {/* Toaster init for later use */}
      <Toaster />

      {/* Main Grid */}
      <Grid
        h="100vh"
        templateRows="70px 1fr"
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
            title={selectedDevice === null ? "Home" : selectedDevice.filename}
            onHomeClick={() => {
              setSelectedDevice(null);
              redirect("/");
            }}
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
            onDeviceSelect={(sel) => {
              setSelectedDevice(sel);
              if (sel)
                redirect(
                  (sel.template ? "/template/" : "/device/") + sel.filename,
                );
              else redirect("/");
            }}
            onDeviceAdd={(filename, template) => {
              updateDeviceList();
              const sel = { filename, template };
              setSelectedDevice(sel);
              redirect(
                (sel.template ? "/template/" : "/device/") + sel.filename,
              );
            }}
          />
        </GridItem>

        {/* Main Content */}
        <GridItem background={"bg.dark"}>
          {getSelectedDevice() !== null && (
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

export default App;
