import { AbsoluteCenter, HStack, Image, Spacer, Text } from "@chakra-ui/react";
import VersionPopover from "./VersionPopover";
import logo from "../../assets/logo.svg";

interface Props {
  onHomeClick?: () => void;
  title: string;
}

const Navbar = ({ title, onHomeClick }: Props) => {
  return (
    <HStack height={"100%"} margin={"0 12px"}>
      {/* Left: Logo */}
      <HStack
        onClick={onHomeClick}
        cursor="pointer"
        _hover={{ opacity: 0.9 }}
        transition="opacity 0.2s"
      >
        <HStack gap="12px">
          <Image src={logo} alt="Logo" height="50px" />
          <Text fontWeight="bold" fontSize="2xl">
            Modbus Simulator
          </Text>
        </HStack>
      </HStack>

      {/* Mid: Title */}
      <AbsoluteCenter axis={"horizontal"}>
        <Text fontSize={"2xl"} fontWeight={"semibold"}>
          {title}
        </Text>
      </AbsoluteCenter>
      <Spacer />

      {/* Right: Version Popover */}
      <VersionPopover />
    </HStack>
  );
};

export default Navbar;
