import { Box } from "@chakra-ui/react";
import { useState, type ElementType, type ReactNode } from "react";
import DeviceListButton from "../DeviceListButton";

interface DeviceListProps {
    title: string;
    icon: ElementType;
    children: ReactNode;
}

function DeviceList({ title, icon, children }: DeviceListProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <DeviceListButton 
                title={title}
                icon={icon}
                isOpen={isOpen} 
                onClick={() => setIsOpen(!isOpen)} 
            />
            <Box
                overflow="hidden"
                maxHeight={isOpen ? "1000px" : "0"}
                opacity={isOpen ? 1 : 0}
                transition="max-height 0.3s ease-in-out, opacity 0.2s ease-in-out"
            >
                {children}
            </Box>
        </>
    );
}

export default DeviceList;
