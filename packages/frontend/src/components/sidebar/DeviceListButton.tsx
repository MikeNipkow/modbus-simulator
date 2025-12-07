import { Button, HStack, Icon, Text } from "@chakra-ui/react";
import type { ElementType } from "react";
import { FaChevronRight } from "react-icons/fa";

interface DeviceListButtonProps {
    title: string;
    icon: ElementType;
    isOpen: boolean;
    onClick: () => void;
    isSelected?: boolean;
}

function DeviceListButton({ title, icon, isOpen, onClick, isSelected = false }: DeviceListButtonProps) {
    return (
        <Button
            width="100%"
            justifyContent="flex-start"
            variant="ghost"
            onClick={onClick}
            padding="12px"
            height="auto"
            borderRadius={0}
            color={isSelected ? "white" : "gray.600"}
            bg={isSelected ? "#81A938" : undefined}
            _hover={{ bg: isSelected ? "#81A938" : "gray.100", color: isSelected ? "white" : "#81A938" }}
            userSelect="text"
        >
            <HStack width="100%" >
                <Icon as={icon} boxSize={4} />
                <Text flex={1} textAlign="left" fontWeight="semibold">
                    {title}
                </Text>
                <Icon 
                    as={FaChevronRight} 
                    boxSize={3}
                    transform={isOpen ? "rotate(90deg)" : "rotate(0deg)"}
                    transition="transform 0.1s ease-in-out"
                />
            </HStack>
        </Button>
    );
}

export default DeviceListButton;
