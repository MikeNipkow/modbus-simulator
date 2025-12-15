import useBackendVersion from "@/hooks/server/useBackendVersion";
import {
  Badge,
  HStack,
  Icon,
  IconButton,
  Popover,
  Text,
  VStack,
} from "@chakra-ui/react";
import packageJson from "../../../package.json";
import { FaQuestionCircle } from "react-icons/fa";

const VersionPopover = () => {
  // Hook to get backend version.
  const { version: backendVersion } = useBackendVersion();

  return (
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
  );
};

export default VersionPopover;
