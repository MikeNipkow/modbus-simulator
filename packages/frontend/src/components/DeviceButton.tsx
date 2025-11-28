import type { ModbusDevice } from "@/types/ModbusDevice";
import { Button, HStack, Icon, Text, Box } from "@chakra-ui/react";
import { FaCircle } from "react-icons/fa";

interface DeviceButtonProps {
    device: ModbusDevice;
    isSelected?: boolean;
    onClick?: () => void;
}

function DeviceButton({ device, isSelected = false, onClick }: DeviceButtonProps) {
    return (
        <Button
            width="100%"
            justifyContent="flex-start"
            variant={isSelected ? "solid" : "ghost"}
            colorScheme={isSelected ? "brand" : "gray"}
            onClick={onClick}
            padding="12px"
            height="auto"
            borderRadius={0}
        >
            <HStack width="100%" >
                <Text 
                    flex={1} 
                    textAlign="left" 
                    fontWeight={isSelected ? "semibold" : "normal"}
                >
                    {device.filename}
                </Text>

                <Text 
                    fontSize="xs" 
                    color="gray.500"
                    mr={2}
                >
                    Port {device.port}
                </Text>

                <Icon 
                    as={FaCircle} 
                    boxSize={3} 
                    color={device.running ? "green.500" : "red.500"}
                />
            </HStack>
        </Button>
    );
}

export default DeviceButton;
