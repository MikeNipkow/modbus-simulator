import { Box } from "@chakra-ui/react";
import { useState, useRef, useEffect, type ElementType, type ReactNode } from "react";
import DeviceListButton from "./DeviceListButton";

interface DeviceListProps {
    title: string;
    icon: ElementType;
    children: ReactNode;
    isSelected?: boolean;
}

function DeviceList({ title, icon, children, isSelected = false }: DeviceListProps) {
    const [isOpen, setIsOpen] = useState(true);
    const [height, setHeight] = useState<number>(0);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (contentRef.current) {
            setHeight(contentRef.current.scrollHeight);
        }
    }, [children]);

    return (
        <>
            <DeviceListButton 
                title={title}
                icon={icon}
                isOpen={isOpen} 
                onClick={() => setIsOpen(!isOpen)}
                isSelected={isSelected}
            />
            <Box
                overflow="hidden"
                maxHeight={isOpen ? `${height}px` : "0"}
                transition="max-height 0.1s linear"
                bg="gray.50"
                borderLeft="3px solid"
                borderColor="#81A938"
            >
                <div ref={contentRef}>
                    {children}
                </div>
            </Box>
        </>
    );
}

export default DeviceList;
