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
import { FaServer, FaPlay, FaStop, FaDownload, FaTrash } from "react-icons/fa";
import { useDeleteDevice } from "@/hooks/device/useDeleteDevice";
import { useState } from "react";
import type { ModbusDevice } from "@/types/ModbusDevice";
import { createErrorToast, createSuccessToast } from "@/components/ui/Toaster";
import { useControlDevice } from "@/hooks/device/useControlDevice";

interface Props {
  device: ModbusDevice;
  onUpdate?: () => void;
  onDelete?: () => void;
}

const DeviceOverviewCard = ({ device, onUpdate, onDelete }: Props) => {
  // Delete dialog to prevent accidental deletions
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

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
    errors: controlErrors,
  } = useControlDevice();

  // ~~~~~ Function Handlers ~~~~~

  // Handle device deletion
  const handleDelete = async () => {
    // Delete device via hook
    const success = await deleteDevice(device);

    // Close delete dialog if successful and trigger onUpdate and onDelete callbacks
    if (success) {
      setDeleteDialogOpen(false);
      onUpdate?.();
      onDelete?.();
    }

    // Show toaster notification based on success or failure
    success
      ? createSuccessToast({
          title: "Device deleted",
          description: `Device "${device.filename}" has been deleted.`,
        })
      : createErrorToast({
          title: "Failed to delete device",
          description: deleteErrors,
        });
  };

  // Handle starting the device
  const handleStart = async () => {
    // Start device via hook
    const success = await startDevice(device);

    // Trigger onUpdate callback if successful
    if (success) onUpdate?.();

    // Show toaster notification based on success or failure
    success
      ? createSuccessToast({
          title: "Modbus Server started",
          description: `Modbus Server for device "${device.filename}" has been started.`,
        })
      : createErrorToast({
          title: "Error starting Modbus Server",
          description: controlErrors,
        });
  };

  // Handle stopping the device
  const handleStop = async () => {
    // Stop device via hook
    const success = await stopDevice(device);

    // Trigger onUpdate callback if successful
    if (success) onUpdate?.();

    // Show toaster notification based on success or failure
    success
      ? createSuccessToast({
          title: "Modbus Server stopped",
          description: `Modbus Server for device "${device.filename}" has been stopped.`,
        })
      : createErrorToast({
          title: "Error stopping Modbus Server",
          description: controlErrors,
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
