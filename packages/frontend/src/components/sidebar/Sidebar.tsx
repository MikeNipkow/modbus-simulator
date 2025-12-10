import { VStack, Separator } from "@chakra-ui/react";
import SidebarIconButton from "./SidebarIconButton";
import { FaBook, FaHome, FaNetworkWired, FaPlus } from "react-icons/fa";
import SidebarDropdownButton from "./SidebarDropdownButton";
import SidebarButton from "./SidebarButton";
import type { ModbusDevice } from "@/types/ModbusDevice";
import { useState } from "react";
import AddDeviceDialog from "../dialogs/AddDeviceDialog";

interface Props {
  onDeviceSelect: (device: ModbusDevice | null) => void;
  onDeviceAdd(filename: string, template: boolean): void;
  devices: ModbusDevice[];
  templates: ModbusDevice[];
  selectedDevice: ModbusDevice | null;
}

const Sidebar = ({
  onDeviceSelect,
  onDeviceAdd,
  devices,
  templates,
  selectedDevice,
}: Props) => {
  const [dialogVisible, setDialogVisible] = useState<
    "template" | "device" | false
  >(false);

  const handleDialogClose = (filename?: string) => {
    const templateAddDialog = dialogVisible === "template";
    setDialogVisible(false);
    if (filename) onDeviceAdd(filename, templateAddDialog);
  };

  const isDeviceSelected = () =>
    selectedDevice !== null && !selectedDevice.template;
  const isTemplateSelected = () =>
    selectedDevice !== null && selectedDevice.template;

  return (
    <VStack gap={0} padding="12px">
      <AddDeviceDialog
        template={dialogVisible === "template"}
        open={dialogVisible !== false}
        onClose={handleDialogClose}
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

      <Separator margin="12px 0" width="100%" />

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
            key={device.filename}
          >
            {device.filename}
          </SidebarButton>
        ))}
      </SidebarDropdownButton>

      <Separator margin="12px 0" width="100%" />

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
            key={template.filename}
          >
            {template.filename}
          </SidebarButton>
        ))}
      </SidebarDropdownButton>
    </VStack>
  );
};

export default Sidebar;
