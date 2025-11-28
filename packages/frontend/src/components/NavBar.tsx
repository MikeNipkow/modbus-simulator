import { HStack, Image, Spacer, Text } from "@chakra-ui/react";

function NavBar() {
    return (
        <HStack 
            margin="0 20px"
            h="100%" 
            align="center"
            position="relative">

            <Image 
                height="80%"
                src="/src/assets/logo.png"
                alt="Modbus Simulator Logo"
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