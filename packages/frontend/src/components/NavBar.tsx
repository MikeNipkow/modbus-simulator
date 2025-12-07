import { HStack, Image, Spacer, Text } from "@chakra-ui/react";

interface NavBarProps {
    onHomeClick?: () => void;
}

function NavBar({ onHomeClick }: NavBarProps) {
    return (
        <HStack 
            margin="0 20px"
            h="100%" 
            align="center"
            position="relative">

            <Image 
                height="60%"
                src="/src/assets/logo.svg"
                alt="Modbus Simulator Logo"
                cursor="pointer"
                onClick={onHomeClick}
                _hover={{ opacity: 0.8 }}
            />

            <Text
                fontSize="xl"
                position="absolute"
                left="50%"
                transform="translateX(-50%)">
                Modbus Simulator
            </Text>

            <Spacer />
            <Text fontSize="sm" color="gray.400">v1.0.0</Text>
        </HStack>
    );
}

export default NavBar;