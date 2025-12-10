import {
  Badge,
  Button,
  Card,
  DownloadTrigger,
  HStack,
  Icon,
  Text,
  VStack,
} from "@chakra-ui/react";
import BaseDialog from "../dialogs/BaseDialog";
import { fetchDeviceData } from "@/services/downloadService";
import { FaServer, FaPlay, FaStop, FaDownload, FaTrash } from "react-icons/fa";
import { useDeleteDevice } from "@/hooks/useDeleteDevice";
import useStartDevice from "@/hooks/useStartDevice";
import useStopDevice from "@/hooks/useStopDevice";
import { useState, useEffect } from "react";
import type { ModbusDevice } from "@/types/ModbusDevice";
import { toaster } from "@/components/ui/toaster";

interface Props {
  device: ModbusDevice;
  onUpdate?: () => void;
  onDelete?: () => void;
}

const DeviceOverviewCard = ({ device, onUpdate, onDelete }: Props) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const {
    deleteDevice,
    isLoading: deletionLoading,
    errors: deleteErrors,
  } = useDeleteDevice();

  const {
    startDevice,
    isLoading: isStarting,
    errors: startErrors,
  } = useStartDevice();
  const {
    stopDevice,
    isLoading: isStopping,
    errors: stopErrors,
  } = useStopDevice();

  const handleDelete = async () => {
    const success = await deleteDevice(device);
    if (success) {
      setDeleteDialogOpen(false);
      onUpdate?.();
      onDelete?.();
      toaster.create({
        title: "Device deleted",
        type: "success",
        description: `Device "${device.filename}" has been deleted.`,
        closable: true,
      });
    } else
      toaster.create({
        title: "Failed to delete device",
        type: "error",
        description: deleteErrors,
        closable: true,
      });
  };

  const handleStart = async () => {
    if (await startDevice(device)) {
      onUpdate?.();
      toaster.create({
        title: "Modbus Server started",
        type: "success",
        description: `Modbus Server for device "${device.filename}" has been started.`,
        closable: true,
      });
    } else
      toaster.create({
        title: "Error starting Modbus Server",
        type: "error",
        description: startErrors,
        closable: true,
      });
  };

  const handleStop = async () => {
    if (await stopDevice(device)) {
      onUpdate?.();
      toaster.create({
        title: "Modbus Server stopped",
        type: "success",
        description: `Modbus Server for device "${device.filename}" has been stopped.`,
        closable: true,
      });
    } else
      toaster.create({
        title: "Error stopping Modbus Server",
        type: "error",
        description: startErrors,
        closable: true,
      });
  };

  return (
    <Card.Root width="80%">
      <BaseDialog
        open={deleteDialogOpen}
        title="Delete Device?"
        onClose={() => setDeleteDialogOpen(false)}
        onSubmit={handleDelete}
        loading={deletionLoading}
        confirmBtnLabel="Delete"
        confirmBtnColorPalette="red"
        confirmBtnVariant="solid"
        placement="top"
      >
        <Text>
          Are you sure you want to delete the device "{device.filename}"?
        </Text>
        {deleteErrors && deleteErrors.length > 0 && (
          <Text color="red.500">{deleteErrors[0]}</Text>
        )}
      </BaseDialog>

      <Card.Body>
        <HStack justifyContent="space-between">
          <HStack>
            <Icon as={FaServer} boxSize={10} color="primary" />
            <VStack>
              <Text>{device.filename}</Text>
              <Text>{device.name}</Text>
            </VStack>
            <Badge
              padding="8px 12px"
              colorPalette={device.running ? "green" : "red"}
            >
              {device.running ? "Running" : "Stopped"}
            </Badge>
          </HStack>
          <HStack>
            {!device.running && (
              <Button
                variant="solid"
                colorPalette="green"
                size="lg"
                loading={isStarting}
                onClick={handleStart}
              >
                <Icon as={FaPlay} boxSize={4} />
                Start
              </Button>
            )}
            {device.running && (
              <Button
                variant="solid"
                colorPalette="red"
                size="lg"
                loading={isStopping}
                onClick={handleStop}
              >
                <Icon as={FaStop} boxSize={4} />
                Stop
              </Button>
            )}

            <DownloadTrigger
              data={() => fetchDeviceData(device)}
              fileName={device.filename}
              asChild
              mimeType={"application/json"}
            >
              <Button size="lg" variant="outline">
                <Icon as={FaDownload} boxSize={4} />
                Download
              </Button>
            </DownloadTrigger>
            <Button
              size="lg"
              colorPalette="red"
              variant="outline"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Icon as={FaTrash} boxSize={4} />
              <Text>Delete</Text>
            </Button>
          </HStack>
        </HStack>
      </Card.Body>
    </Card.Root>
  );
};

export default DeviceOverviewCard;
