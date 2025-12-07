import type { ModbusDevice } from "@/types/ModbusDevice";
import { Button, HStack, Icon, Text } from "@chakra-ui/react";
import { FaCircle } from "react-icons/fa";

interface DeviceButtonProps {
    device: ModbusDevice;
    showState?: boolean;
    isSelected?: boolean;
    onClick?: () => void;
}

function DeviceButton({ device, showState = true, isSelected = false, onClick }: DeviceButtonProps) {
    return (
        <Button
            width="100%"
            justifyContent="flex-start"
            variant={isSelected ? "solid" : "ghost"}
            colorPalette={isSelected ? "brand" : undefined}
            onClick={onClick}
            padding="12px"
            height="auto"
            borderRadius={0}
        >
            <HStack width="100%" gap={2} overflow="hidden">
                <Text 
                    flex={1} 
                    textAlign="left" 
                    fontWeight={isSelected ? "semibold" : "normal"}
                    truncate
                    minWidth={0}
                    overflow="hidden"
                    textOverflow="ellipsis"
                    whiteSpace="nowrap"
                    title={device.filename}
                >
                    {device.filename}
                </Text>

                {showState && (
                    <HStack gap={2} flexShrink={0}>
                        <Text 
                            fontSize="xs" 
                            color="gray.500"
                        >
                        Port {device.port}
                    </Text>

                    <Icon 
                        as={FaCircle} 
                        boxSize={3} 
                        color={device.running ? "green.500" : "red.500"}
                    />
                </HStack>
                )}
            </HStack>
        </Button>
    );
}

export default DeviceButton;
