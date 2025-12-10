import { VStack } from "@chakra-ui/react";
import SidebarIconButton from "./SidebarIconButton";
import { FaBook, FaHome, FaNetworkWired, FaPlus } from "react-icons/fa";
import SidebarDropdownButton from "./SidebarDropdownButton";
import useDevices from "@/hooks/useDevices";
import SidebarButton from "./SidebarButton";
import type { ModbusDevice } from "@/types/ModbusDevice";
import { useState } from "react";
import AddDeviceDialog from "../dialogs/AddDeviceDialog";

interface Props {
  selectedDevice: ModbusDevice | null;
  onDeviceSelect: (device: ModbusDevice | null) => void;
  templates?: ModbusDevice[];
}

const Sidebar = ({ selectedDevice, onDeviceSelect }: Props) => {
  const { devices: devices } = useDevices(false);
  const { devices: templates } = useDevices(true);

  const [dialogVisible, setDialogVisible] = useState<
    "template" | "device" | false
  >(false);

  const isDeviceSelected = () =>
    selectedDevice !== null && !selectedDevice.template;
  const isTemplateSelected = () =>
    selectedDevice !== null && selectedDevice.template;

  return (
    <VStack gap={0}>
      <AddDeviceDialog
        template={dialogVisible === "template"}
        open={dialogVisible !== false}
        onClose={() => setDialogVisible(false)}
        templates={templates}
      />
      <SidebarIconButton
        variant={
          !isDeviceSelected() && !isTemplateSelected() ? "primary" : "secondary"
        }
        label="Home"
        icon={FaHome}
        data-active={selectedDevice === null ? "" : undefined}
        onClick={() => onDeviceSelect(null)}
      />

      <SidebarDropdownButton
        variant={isDeviceSelected() ? "primary" : "secondary"}
        label="Devices"
        icon={FaNetworkWired}
        data-active={isDeviceSelected() ? true : undefined}
      >
        <SidebarIconButton
          variant="secondary"
          icon={FaPlus}
          iconSize={3}
          label="Add Device"
          onClick={() => setDialogVisible("device")}
        />
        {devices.map((device) => (
          <SidebarButton
            variant="secondary"
            onClick={() => onDeviceSelect(device)}
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
        <SidebarIconButton
          variant="secondary"
          icon={FaPlus}
          iconSize={3}
          label="Add Template"
          onClick={() => setDialogVisible("template")}
        />
        {templates.map((template) => (
          <SidebarButton
            variant="secondary"
            onClick={() => onDeviceSelect(template)}
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
