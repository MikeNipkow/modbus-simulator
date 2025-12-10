import type { ModbusDevice } from "@/types/ModbusDevice";
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
import { FaDownload, FaServer } from "react-icons/fa";
import { fetchDeviceData } from "@/services/downloadService";

interface Props {
  device: ModbusDevice;
}

const DeviceEditor = ({ device }: Props) => {
  return (
    <VStack>
      <Card.Root>
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
          </HStack>
        </Card.Body>
      </Card.Root>
    </VStack>
  );
};

export default DeviceEditor;
