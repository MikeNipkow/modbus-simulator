import {
  AbsoluteCenter,
  Badge,
  HStack,
  Icon,
  IconButton,
  Image,
  Popover,
  Spacer,
  Text,
  VStack,
} from "@chakra-ui/react";
import packageJson from "../../package.json";
import { FaQuestionCircle } from "react-icons/fa";
import useBackendVersion from "@/hooks/useBackendVersion";

interface Props {
  onHomeClick?: () => void;
  title: string;
}

const Navbar = ({ title, onHomeClick }: Props) => {
  const { version: backendVersion } = useBackendVersion();

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
          <Image src="/src/assets/logo.svg" alt="Logo" height="50px" />
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
      <Popover.Root>
        <Popover.Trigger asChild>
          <IconButton
            colorPalette={"blue"}
            aria-label="Show versions"
            variant="ghost"
          >
            <Icon as={FaQuestionCircle} />
          </IconButton>
        </Popover.Trigger>

        <Popover.Positioner>
          <Popover.Content
            width="fit-content"
            padding={4}
            bg="bg.medium"
            borderRadius="md"
            boxShadow="lg"
            borderWidth="1px"
          >
            <Popover.Arrow />
            <HStack justifyContent="space-between" gap={8}>
              {/* Frontend version */}
              <VStack>
                <Text fontWeight={"semibold"}>Frontend</Text>
                <Badge colorPalette="blue">v{packageJson.version}</Badge>
              </VStack>

              {/* Backend version */}
              <VStack>
                <Text fontWeight={"semibold"}>Backend</Text>
                <HStack>
                  <Badge colorPalette={backendVersion ? "green" : "red"}>
                    {backendVersion ? "v" + backendVersion : "loading..."}
                  </Badge>
                </HStack>
              </VStack>
            </HStack>
          </Popover.Content>
        </Popover.Positioner>
      </Popover.Root>
    </HStack>
  );
};

export default Navbar;
