import { Button, HStack, Icon, Text } from "@chakra-ui/react";
import type { ElementType } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

interface DeviceListButtonProps {
    title: string;
    icon: ElementType;
    isOpen: boolean;
    onClick: () => void;
}

function DeviceListButton({ title, icon, isOpen, onClick }: DeviceListButtonProps) {
    return (
        <Button
            width="100%"
            justifyContent="flex-start"
            variant="ghost"
            onClick={onClick}
            padding="12px"
            height="auto"
            borderRadius={0}
            _hover={{ bg: "gray.100" }}
        >
            <HStack width="100%" >
                <Icon as={icon} boxSize={4} />
                <Text flex={1} textAlign="left" fontWeight="semibold">
                    {title}
                </Text>
                <Icon as={isOpen ? FaChevronUp : FaChevronDown} boxSize={3} />
            </HStack>
        </Button>
    );
}

export default DeviceListButton;
