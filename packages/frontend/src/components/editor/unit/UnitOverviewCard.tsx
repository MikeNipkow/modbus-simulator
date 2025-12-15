import {
  Button,
  Card,
  HStack,
  Icon,
  IconButton,
  Separator,
  Text,
  VStack,
} from "@chakra-ui/react";
import { FaPlus } from "react-icons/fa";
import { FaGears, FaRotate } from "react-icons/fa6";
import UnitConfigurationCard from "./UnitConfigurationCard";
import { createErrorToast, createSuccessToast } from "../../ui/Toaster";
import { useCreateUnit } from "@/hooks/unit/useCreateUnit";
import type { ModbusDevice } from "@/types/ModbusDevice";
import { Tooltip } from "@/components/ui/Tooltip";
import { useState } from "react";

interface Props {
  device: ModbusDevice;
  onUpdate?: () => void;
}

const UnitOverviewCard = ({ device, onUpdate }: Props) => {
  // State for polling option.
  const [allowPolling, setAllowPolling] = useState(false);

  // Hook for creating a new unit.
  const { createUnit, isLoading } = useCreateUnit();

  /**
   * Check if a unit ID is already taken in the device.
   * @param unitId The unit ID to check.
   * @returns True if the unit ID is taken, false otherwise.
   */
  const hasUnit = (unitId: number) => {
    return device.modbusUnits?.some((unit) => unit.unitId === unitId);
  };
  /**
   * Get the next free unit ID between 1 and 254.
   * @returns The next free unit ID, or null if all are taken.
   */
  const getNextFreeUnitId = () => {
    for (let i = 1; i <= 254; i++) if (!hasUnit(i)) return i;
    return null;
  };

  /**
   * Handle adding a new Modbus unit.
   */
  const handleAddUnit = async () => {
    const nextUnitId = getNextFreeUnitId();
    if (nextUnitId === null) {
      createErrorToast({
        title: "Failed to add unit",
        description: "Maximum number of Modbus units (1-254) reached.",
      });
      return;
    }

    // Send request to create unit.
    const result = await createUnit(device, nextUnitId);

    // Notify parent component to refresh data.
    if (result.success) onUpdate?.();

    // Show toast notification.
    result.success
      ? createSuccessToast({
          title: "Unit added",
          description: `Modbus unit with ID ${nextUnitId} has been added.`,
        })
      : createErrorToast({
          title: "Failed to add unit",
          description: result.errors,
        });
  };

  return (
    <Card.Root
      width="90%"
      borderRadius={"2xl"}
      boxShadow={"xl"}
      overflow="hidden"
    >
      {/* Header */}
      <Card.Header padding="24px" background="bg.medium">
        <Card.Title>
          <HStack justifyContent={"space-between"}>
            {/* Icon */}
            <HStack gap={4}>
              <Icon as={FaGears} boxSize={6} />
              <Text>Modbus Units ({device.modbusUnits?.length})</Text>
            </HStack>

            <HStack gap={4}>
              {/* Button to allow value polling */}
              {!device.template && (
                <Tooltip
                  content="Auto-Refresh values"
                  contentProps={{ css: { "--tooltip-bg": "white" } }}
                >
                  <IconButton
                    as={FaRotate}
                    variant={"subtle"}
                    colorPalette={allowPolling ? "green" : "white"}
                    padding={"10px"}
                    onClick={() => setAllowPolling(!allowPolling)}
                  />
                </Tooltip>
              )}

              {/* Add Unit Button */}
              <Button
                variant={"primary"}
                width="120px"
                onClick={handleAddUnit}
                loading={isLoading}
              >
                <Icon as={FaPlus} boxSize={4} />
                <Text fontSize={"md"}>Add Unit</Text>
              </Button>
            </HStack>
          </HStack>
        </Card.Title>
      </Card.Header>

      <Separator />

      {/* Body */}
      <Card.Body alignItems={"center"}>
        <VStack width="100%" gap={4}>
          {/* Map all modbus units */}
          {device.modbusUnits?.map((unit) => (
            <UnitConfigurationCard
              key={unit.unitId}
              device={device}
              unit={unit}
              allowPolling={allowPolling}
              onUpdate={onUpdate}
            />
          ))}
        </VStack>
      </Card.Body>
    </Card.Root>
  );
};

export default UnitOverviewCard;
