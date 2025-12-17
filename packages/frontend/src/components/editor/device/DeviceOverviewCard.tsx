import {
  Button,
  Card,
  DownloadTrigger,
  HStack,
  Icon,
  Text,
  VStack,
} from "@chakra-ui/react";
import BaseDialog from "../../ui/dialogs/base/BaseDialog";
import { fetchDeviceData } from "@/services/downloadService";
import {
  FaServer,
  FaPlay,
  FaStop,
  FaDownload,
  FaTrash,
  FaSave,
} from "react-icons/fa";
import { useDeleteDevice } from "@/hooks/device/useDeleteDevice";
import { useState } from "react";
import type { ModbusDevice } from "@/types/ModbusDevice";
import { createErrorToast, createSuccessToast } from "@/components/ui/Toaster";
import { useControlDevice } from "@/hooks/device/useControlDevice";
import { useCreateDevice } from "@/hooks/device/useCreateDevice";
import FilenameInput from "@/components/ui/FilenameInput";

interface Props {
  device: ModbusDevice;
  onUpdate?: () => void;
  onDelete?: () => void;
}

const DeviceOverviewCard = ({ device, onUpdate, onDelete }: Props) => {
  // State to manage filename input.
  const [filename, setFilename] = useState("");
  // State to manage filename validity.
  const [filenameValid, setFilenameValid] = useState(false);

  // Delete dialog to prevent accidental deletions
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Delete dialog to save device as template
  const [saveAsTemplateDialogOpen, setSaveAsTemplateDialogOpen] =
    useState(false);

  // Hook to delete device
  const {
    deleteDevice,
    isLoading: deletionLoading,
    errors: deleteErrors,
  } = useDeleteDevice();

  // Hook to start/stop device
  const {
    startDevice,
    stopDevice,
    isLoading: isControlLoading,
  } = useControlDevice();

  // Hook to save device as template
  const { createDevice, isLoading: isSaving } = useCreateDevice();

  // ~~~~~ Function Handlers ~~~~~

  // Handle device deletion
  const handleDelete = async () => {
    // Delete device via hook
    const result = await deleteDevice(device);

    // Close delete dialog if successful and trigger onUpdate and onDelete callbacks
    if (result.success) {
      setDeleteDialogOpen(false);
      onUpdate?.();
      onDelete?.();
    }

    // Show toaster notification based on success or failure
    result.success
      ? createSuccessToast({
          title: "Device deleted",
          description: `Device "${device.filename}" has been deleted.`,
        })
      : createErrorToast({
          title: "Failed to delete device",
          description: result.errors,
        });
  };

  // Handle saving device as template.
  const handleSaveAsTemplate = async () => {
    // Create a new device object based on the current device but marked as a template
    const templateDevice: ModbusDevice = {
      ...device,
      template: true,
      filename: filename + ".json",
    };

    // Save device as template via hook.
    const result = await createDevice(templateDevice, true);

    // Update UI based on result.
    if (result.success) {
      onUpdate?.();
      setSaveAsTemplateDialogOpen(false);
    }

    // Show toaster notification.
    result.success
      ? createSuccessToast({
          title: "Template saved",
          description: `Device "${device.filename}" has been saved as a template.`,
        })
      : createErrorToast({
          title: "Failed to save device as template",
          description: result.errors,
        });
  };

  // Handle starting the device
  const handleStart = async () => {
    // Start device via hook
    const result = await startDevice(device);

    // Trigger onUpdate callback if successful
    if (result.success) onUpdate?.();

    // Show toaster notification based on success or failure
    result.success
      ? createSuccessToast({
          title: "Modbus Server started",
          description: `Modbus Server for device "${device.filename}" has been started.`,
        })
      : createErrorToast({
          title: "Error starting Modbus Server",
          description: result.errors,
        });
  };

  // Handle stopping the device
  const handleStop = async () => {
    // Stop device via hook
    const result = await stopDevice(device);

    // Trigger onUpdate callback if successful
    if (result.success) onUpdate?.();

    // Show toaster notification based on success or failure
    result.success
      ? createSuccessToast({
          title: "Modbus Server stopped",
          description: `Modbus Server for device "${device.filename}" has been stopped.`,
        })
      : createErrorToast({
          title: "Error stopping Modbus Server",
          description: result.errors,
        });
  };

  return (
    <>
      {/* Dialog for device deletion */}
      <BaseDialog
        open={deleteDialogOpen}
        title="Delete Device?"
        confirmBtnLabel="Delete"
        confirmBtnColorPalette="red"
        confirmBtnVariant="solid"
        placement="top"
        loading={deletionLoading}
        onClose={() => setDeleteDialogOpen(false)}
        onSubmit={handleDelete}
      >
        <Text>
          Are you sure you want to delete the device "{device.filename}"?
        </Text>
        {deleteErrors.length > 0 && (
          <Text color="red.500">{deleteErrors[0]}</Text>
        )}
      </BaseDialog>

      {/* Dialog for saving as template */}
      <BaseDialog
        open={saveAsTemplateDialogOpen}
        title="Save device as Template?"
        placement="top"
        loading={isSaving}
        submitDisabled={!filenameValid}
        onClose={() => setSaveAsTemplateDialogOpen(false)}
        onSubmit={handleSaveAsTemplate}
      >
        {/* Filename input */}
        <FilenameInput
          filename={filename}
          onChange={({ filename, valid }) => {
            setFilename(filename);
            setFilenameValid(valid);
          }}
          onSubmit={handleSaveAsTemplate}
        />
      </BaseDialog>

      {/* Card */}
      <Card.Root width="90%" borderRadius={"2xl"} boxShadow={"xl"}>
        <Card.Body>
          <HStack justifyContent="space-between">
            {/* Left: Info */}
            <HStack gap={4}>
              {/* Icon */}
              <Icon
                as={FaServer}
                boxSize={14}
                color={"primary.contrast"}
                background={"primary"}
                padding={"12px"}
                borderRadius={"2xl"}
              />

              {/* Device Info */}
              <VStack alignItems="flex-start" gap={0}>
                <Text fontWeight={"semibold"} fontSize={"2xl"}>
                  {device.filename}
                </Text>
                <Text fontSize={"md"}>{device.name}</Text>
              </VStack>
            </HStack>

            {/* Right: Buttons */}
            <HStack>
              {/* Start/Stop button */}
              <Button
                width="120px"
                variant="solid"
                colorPalette={device.running ? "red" : "green"}
                size="lg"
                loading={isControlLoading}
                onClick={device.running ? handleStop : handleStart}
                hidden={device.template || undefined}
              >
                <Icon as={device.running ? FaStop : FaPlay} boxSize={4} />
                {device.running ? "Stop" : "Start"}
              </Button>

              {/* Save as template button */}
              <Button
                size="lg"
                colorPalette="blue"
                variant="outline"
                onClick={() => setSaveAsTemplateDialogOpen(true)}
                hidden={device.template || undefined}
                loading={isSaving}
              >
                <Icon as={FaSave} boxSize={4} />
                <Text>Save as Template</Text>
              </Button>

              {/* Delete button */}
              <Button
                size="lg"
                colorPalette="red"
                variant="outline"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Icon as={FaTrash} boxSize={4} />
                <Text>Delete</Text>
              </Button>

              {/* Download button */}
              <DownloadTrigger
                data={() => fetchDeviceData(device)}
                fileName={device.filename}
                asChild
                mimeType={"application/json"}
              >
                <Button size="lg" variant="outline">
                  <Icon as={FaDownload} boxSize={4} />
                </Button>
              </DownloadTrigger>
            </HStack>
          </HStack>
        </Card.Body>
      </Card.Root>
    </>
  );
};

export default DeviceOverviewCard;
