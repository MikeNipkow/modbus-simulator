import { VStack, Separator, HStack, Badge, Text } from "@chakra-ui/react";
import { FaBook, FaHome, FaNetworkWired, FaPlus } from "react-icons/fa";
import type { ModbusDevice } from "@/types/ModbusDevice";
import { useState } from "react";
import AddDeviceDialog from "./dialogs/AddDeviceDialog";
import SidebarIconButton from "./buttons/SidebarIconButton";
import SidebarDropdownButton from "./buttons/SidebarDropdownButton";
import SidebarButton from "./buttons/SidebarButton";

interface Props {
  devices: ModbusDevice[];
  templates: ModbusDevice[];
  selectedDevice: ModbusDevice | null;
  onDeviceSelect: (device: ModbusDevice | null) => void;
  onDeviceAdd(filename: string, template: boolean): void;
}

const Sidebar = ({
  devices,
  templates,
  selectedDevice,
  onDeviceSelect,
  onDeviceAdd,
}: Props) => {
  // State to manage visibility of add device/template dialog.
  const [addDialogVisible, setAddDialogVisible] = useState<
    "template" | "device" | false
  >(false);

  /**
   * Handle closing the add device/template dialog.
   * @param filename Optional filename of the added device/template.
   */
  const handleDialogClose = (filename?: string) => {
    const templateAddDialog = addDialogVisible === "template";
    setAddDialogVisible(false);
    if (filename) onDeviceAdd(filename, templateAddDialog);
  };

  // Check if a device is selected.
  const isDeviceSelected = () =>
    selectedDevice !== null && !selectedDevice.template;
  // Check if a template is selected.
  const isTemplateSelected = () =>
    selectedDevice !== null && selectedDevice.template;

  return (
    <>
      {/* Dialog to add devices/templates */}
      <AddDeviceDialog
        template={addDialogVisible === "template"}
        open={addDialogVisible !== false}
        onClose={handleDialogClose}
        templates={templates}
      />

      <VStack gap={0} padding="12px">
        {/* Home button */}
        <SidebarIconButton
          variant={
            !isDeviceSelected() && !isTemplateSelected()
              ? "primary"
              : "secondary"
          }
          label="Home"
          icon={FaHome}
          data-active={selectedDevice === null ? "" : undefined}
          onClick={() => onDeviceSelect(null)}
        />

        <Separator margin="12px 0" width="100%" />

        {/* Devices button */}
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
            onClick={() => setAddDialogVisible("device")}
          />
          {devices.map((device) => (
            <SidebarButton
              variant="secondary"
              fontWeight={
                isDeviceSelected() &&
                selectedDevice?.filename === device.filename
                  ? "bold"
                  : undefined
              }
              onClick={() => onDeviceSelect(device)}
              data-active={
                isDeviceSelected() &&
                selectedDevice?.filename === device.filename
                  ? true
                  : undefined
              }
              key={device.filename}
            >
              <HStack width="100%" justify={"space-between"}>
                <Text overflow={"hidden"}>{device.filename}</Text>
                <Badge hidden={!device.running} colorPalette={"green"}>
                  {"Running"}
                </Badge>
              </HStack>
            </SidebarButton>
          ))}
        </SidebarDropdownButton>

        <Separator margin="12px 0" width="100%" />

        {/* Templates button */}
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
            onClick={() => setAddDialogVisible("template")}
          />
          {templates.map((template) => (
            <SidebarButton
              variant="secondary"
              onClick={() => onDeviceSelect(template)}
              fontWeight={
                isTemplateSelected() &&
                selectedDevice?.filename === template.filename
                  ? "bold"
                  : undefined
              }
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
    </>
  );
};

export default Sidebar;
