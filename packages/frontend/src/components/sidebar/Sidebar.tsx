import { VStack } from "@chakra-ui/react";
import SidebarIconButton from "./SidebarIconButton";
import { FaBook, FaHome, FaNetworkWired } from "react-icons/fa";
import SidebarDropdownButton from "./SidebarDropdownButton";
import type { ModbusDevice } from "@/archive/types/ModbusDevice";
import { useState } from "react";
import useDevices from "@/hooks/useDevices";
import SidebarButton from "./SidebarButton";

const Sidebar = () => {
  const [selectedDevice, setSelectedDevice] = useState<ModbusDevice | null>(
    null,
  );
  const { devices: devices } = useDevices(false);
  const { devices: templates } = useDevices(true);

  const isDeviceSelected = () =>
    selectedDevice !== null && !selectedDevice.template;
  const isTemplateSelected = () =>
    selectedDevice !== null && selectedDevice.template;

  return (
    <VStack gap={0}>
      <SidebarIconButton
        variant={
          !isDeviceSelected() && !isTemplateSelected() ? "primary" : "secondary"
        }
        label="Home"
        icon={FaHome}
        data-active={selectedDevice === null ? true : undefined}
        onClick={() => setSelectedDevice(null)}
      />

      <SidebarDropdownButton
        variant={isDeviceSelected() ? "primary" : "secondary"}
        label="Devices"
        icon={FaNetworkWired}
        data-active={isDeviceSelected() ? true : undefined}
      >
        {devices.map((device) => (
          <SidebarButton
            variant="secondary"
            onClick={() => setSelectedDevice(device)}
            data-active={
              isDeviceSelected() && selectedDevice?.filename === device.filename
                ? true
                : undefined
            }
          >
            {device.filename}
          </SidebarButton>
        ))}
      </SidebarDropdownButton>

      <SidebarDropdownButton
        variant={isTemplateSelected() ? "primary" : "secondary"}
        label="Templates"
        icon={FaBook}
        data-active={isTemplateSelected() ? true : undefined}
      >
        {templates.map((template) => (
          <SidebarButton
            variant="secondary"
            onClick={() => setSelectedDevice(template)}
            data-active={
              isTemplateSelected() &&
              selectedDevice?.filename === template.filename
                ? true
                : undefined
            }
          >
            {template.filename}
          </SidebarButton>
        ))}
      </SidebarDropdownButton>
    </VStack>
  );
};

export default Sidebar;
