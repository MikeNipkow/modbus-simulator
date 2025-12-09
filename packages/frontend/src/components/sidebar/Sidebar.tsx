import { FaBook, FaHome, FaNetworkWired } from "react-icons/fa";
import SidebarButton from "./SidebarButton";
import SidebarDropdownButton from "./SidebarDropdownButton";
import { VStack } from "@chakra-ui/react";
import { useState } from "react";
import type { ModbusDevice } from "@/types/ModbusDevice";
import DeviceButton from "./DeviceButton";
import DeviceAddButton from "./DeviceAddButton";
import AddDeviceDialog from "../dialogs/AddDeviceDialog";
import useDevices from "@/hooks/useDevices";

interface Props {
  selectedDevice?: ModbusDevice | null;
  onSelectDevice?: (device: ModbusDevice | null) => void;
}

const SideBar = ({ selectedDevice, onSelectDevice }: Props) => {
  const { devices: devices } = useDevices(false);
  const { devices: templates } = useDevices(true);
  const [isDeviceDialogOpen, setIsDeviceDialogOpen] = useState(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);

  const handleAddDevice = () => {
    // TODO: API call to create device
  };

  const handleAddTemplate = () => {
    // TODO: API call to create template
  };

  return (
    <VStack width={"100%"} gap={0}>
      <AddDeviceDialog
        open={isDeviceDialogOpen}
        onClose={() => setIsDeviceDialogOpen(false)}
        template={false}
        templates={templates}
        onSubmit={handleAddDevice}
      />
      <AddDeviceDialog
        open={isTemplateDialogOpen}
        onClose={() => setIsTemplateDialogOpen(false)}
        template={true}
        onSubmit={handleAddTemplate}
      />
      <SidebarButton
        icon={FaHome}
        text="Home"
        onClick={() => onSelectDevice?.(null)}
      />

      <SidebarDropdownButton icon={FaNetworkWired} text="Devices">
        <DeviceAddButton
          title="Add Device"
          onClick={() => setIsDeviceDialogOpen(true)}
        />
        {devices.map((device) => (
          <DeviceButton
            key={device.filename}
            device={device}
            isSelected={
              !selectedDevice?.template &&
              selectedDevice?.filename === device.filename
            }
            onClick={() => onSelectDevice?.(device)}
          />
        ))}
      </SidebarDropdownButton>

      <SidebarDropdownButton icon={FaBook} text="Templates">
        <DeviceAddButton
          title="Add Template"
          onClick={() => setIsTemplateDialogOpen(true)}
        />
        {templates.map((device) => (
          <DeviceButton
            key={device.filename}
            device={device}
            isSelected={
              selectedDevice?.template &&
              selectedDevice?.filename === device.filename
            }
            onClick={() => onSelectDevice?.(device)}
          />
        ))}
      </SidebarDropdownButton>
    </VStack>
  );
};

export default SideBar;
