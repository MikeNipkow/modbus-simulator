import { Button, Card, HStack, Icon, Separator, Text } from "@chakra-ui/react";
import { FaPlus } from "react-icons/fa";
import { FaGears } from "react-icons/fa6";
import UnitConfigurationCard from "./UnitConfigurationCard";
import { createErrorToast, createSuccessToast } from "../../ui/Toaster";
import { useCreateUnit } from "@/hooks/useCreateUnit";
import type { ModbusDevice } from "@/types/ModbusDevice";

interface Props {
  device: ModbusDevice;
  onUpdate?: () => void;
  setField: (field: keyof ModbusDevice, value: any) => void;
}

const UnitOverviewCard = ({ device, onUpdate, setField }: Props) => {
  const { createUnit, unit, isLoading, errors } = useCreateUnit();

  const hasUnit = (unitId: number) => {
    return device.modbusUnits?.some((unit) => unit.unitId === unitId);
  };
  const getNextFreeUnitId = () => {
    for (let i = 1; i <= 254; i++) if (!hasUnit(i)) return i;
    return null;
  };

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
    const success = await createUnit(device, nextUnitId);

    // Notify parent component to refresh data.
    if (success) onUpdate?.();

    success
      ? createSuccessToast({
          title: "Unit added",
          description: `Modbus unit with ID ${nextUnitId} has been added.`,
        })
      : createErrorToast({
          title: "Failed to add unit",
          description: errors,
        });
  };

  return (
    <Card.Root
      width="80%"
      borderRadius={"2xl"}
      boxShadow={"xl"}
      overflow="hidden"
    >
      <Card.Header padding="24px" background="bg.medium">
        <Card.Title>
          <HStack justifyContent={"space-between"}>
            <HStack gap={4}>
              <Icon as={FaGears} boxSize={6} />
              <Text>Modbus Units ({device.modbusUnits?.length})</Text>
            </HStack>
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
        </Card.Title>
      </Card.Header>
      <Separator />
      <Card.Body alignItems={"center"}>
        {device.modbusUnits?.map((unit) => (
          <UnitConfigurationCard
            key={unit.unitId}
            device={device}
            unit={unit}
            onUpdate={onUpdate}
            setField={setField}
          />
        ))}
      </Card.Body>
    </Card.Root>
  );
};

export default UnitOverviewCard;
