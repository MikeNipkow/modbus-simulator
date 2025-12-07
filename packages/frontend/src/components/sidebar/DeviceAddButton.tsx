import { Button, Icon } from "@chakra-ui/react";
import { FaPlus } from "react-icons/fa";

interface DeviceAddButtonProps {
    label: string;
    onClick: () => void;
}

function DeviceAddButton({ label, onClick }: DeviceAddButtonProps) {
    return (
        <Button
            width="100%"
            justifyContent="flex-start"
            variant="ghost"
            onClick={onClick}
            padding="12px"
            paddingLeft="20px"
            height="auto"
            borderRadius={0}
            gap={2}
            color="gray.500"
            _hover={{ bg: "gray.100", color: "#81A938" }}
            userSelect="text"
        >
            <Icon as={FaPlus} boxSize={3} />
            {label}
        </Button>
    );
}

export default DeviceAddButton;
