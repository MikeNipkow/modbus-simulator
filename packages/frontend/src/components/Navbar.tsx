import {
  AbsoluteCenter,
  Badge,
  Box,
  HStack,
  Image,
  Spacer,
  Text,
} from "@chakra-ui/react";
import packageJson from "../../package.json";

interface Props {
  onHomeClick?: () => void;
  title: string;
}

const Navbar = ({ title, onHomeClick }: Props) => {
  return (
    <HStack height={"100%"} margin={"0 20px"}>
      <Box
        onClick={onHomeClick}
        cursor="pointer"
        _hover={{ opacity: 0.8 }}
        transition="opacity 0.2s"
      >
        <HStack gap="12px">
          <Image src="/src/assets/logo.svg" alt="Logo" height="50px" />
          <Text fontWeight="bold" fontSize="2xl">
            Modbus Simulator
          </Text>
        </HStack>
      </Box>
      <AbsoluteCenter axis={"horizontal"}>
        <Text fontWeight={"bold"}>{title}</Text>
      </AbsoluteCenter>
      <Spacer />
      <Badge size={"lg"} colorPalette="blue" padding="4px 8px">
        v{packageJson.version}
      </Badge>
    </HStack>
  );
};

export default Navbar;
