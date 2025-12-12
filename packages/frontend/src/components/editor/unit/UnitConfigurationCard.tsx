import { useDeleteUnit } from "@/hooks/useDeleteUnit";
import type { ModbusDevice } from "@/types/ModbusDevice";
import type { ModbusUnit } from "@/types/ModbusUnit";
import {
  Badge,
  Button,
  Card,
  HStack,
  Icon,
  IconButton,
  Table,
  Text,
} from "@chakra-ui/react";
import { useState } from "react";
import {
  FaChevronDown,
  FaChevronRight,
  FaEdit,
  FaPlus,
  FaTrash,
} from "react-icons/fa";
import { createErrorToast, createSuccessToast } from "../../ui/Toaster";
import ChangeUnitIdDialog from "../../dialogs/ChangeUnitIdDialog";
import useUpdateUnit from "@/hooks/useUpdateUnit";
import DatapointTable from "./DatapointTable";

interface Props {
  device: ModbusDevice;
  unit: ModbusUnit;
  onUpdate?: () => void;
  setField: (field: keyof ModbusDevice, value: any) => void;
}

const UnitConfigurationCard = ({ device, unit, onUpdate, setField }: Props) => {
  const [isOpen, setOpen] = useState(device.modbusUnits?.length === 1);
  const [idEditDialogOpen, setIdEditDialogOpen] = useState(false);
  const {
    updateUnit,
    isLoading: isUpdating,
    errors: updateErrors,
  } = useUpdateUnit();
  const {
    deleteUnit,
    isLoading: isDeleting,
    errors: deleteErrors,
  } = useDeleteUnit();

  const handleUnitIdChange = async (newUnitId: number) => {
    // Call update unit hook.
    const success = await updateUnit(unit.unitId, device, {
      ...unit,
      unitId: newUnitId,
    });

    // Notify parent component to refresh data.
    if (success) onUpdate?.();

    // Show toast notification.
    success
      ? createSuccessToast({
          title: "Unit ID changed",
          description: `Modbus unit ID has been changed to ${newUnitId}.`,
        })
      : createErrorToast({
          title: "Failed to change Unit ID",
          description: updateErrors,
        });
  };

  const handleDelete = async () => {
    // Call delete unit hook.
    const success = await deleteUnit(device, unit.unitId);

    // Update UI based on result.
    if (success) onUpdate?.();

    // Show toast notification.
    success
      ? createSuccessToast({
          title: "Unit deleted",
          description: `Modbus unit with ID ${unit.unitId} has been deleted.`,
        })
      : createErrorToast({
          title: "Failed to delete unit",
          description: deleteErrors,
        });
  };

  return (
    <>
      <ChangeUnitIdDialog
        open={idEditDialogOpen}
        unitId={unit.unitId}
        onClose={() => setIdEditDialogOpen(false)}
        onSubmit={handleUnitIdChange}
        loading={isUpdating}
      ></ChangeUnitIdDialog>
      <Card.Root
        width="100%"
        borderRadius={"2xl"}
        boxShadow={"xl"}
        overflow="hidden"
      >
        <Card.Header padding="24px">
          <Card.Title>
            <HStack justifyContent={"space-between"}>
              <HStack gap={4}>
                <IconButton
                  as={isOpen ? FaChevronDown : FaChevronRight}
                  padding="8px"
                  variant={"secondary"}
                  onClick={() => setOpen(!isOpen)}
                />
                <Text>Unit {unit.unitId}</Text>
                <Button
                  size="lg"
                  variant="ghost"
                  onClick={() => setIdEditDialogOpen(true)}
                >
                  <Icon as={FaEdit} boxSize={4} />
                </Button>
                <Badge size={"lg"} colorPalette={"blue"}>
                  {unit.dataPoints?.length} Datapoints
                </Badge>
              </HStack>
              <HStack>
                <Button variant={"outline"} width="160px">
                  <Icon as={FaPlus} boxSize={4} />
                  <Text fontSize={"md"}>Add Datapoint</Text>
                </Button>
                <Button
                  size="lg"
                  colorPalette="red"
                  variant="outline"
                  onClick={handleDelete}
                  loading={isDeleting}
                >
                  <Icon as={FaTrash} boxSize={4} />
                </Button>
              </HStack>
            </HStack>
          </Card.Title>
        </Card.Header>
        {isOpen && (
          <Card.Body>
            <DatapointTable
              device={device}
              unit={unit}
              onUpdate={onUpdate}
              setField={setField}
            />
          </Card.Body>
        )}
      </Card.Root>
    </>
  );
};

export default UnitConfigurationCard;
