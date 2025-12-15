import { useDeleteUnit } from "@/hooks/unit/useDeleteUnit";
import type { ModbusDevice } from "@/types/ModbusDevice";
import type { ModbusUnit } from "@/types/ModbusUnit";
import {
  Badge,
  Button,
  Card,
  HStack,
  Icon,
  IconButton,
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
import DatapointTable from "./DatapointTable";
import DatapointEditDialog from "@/components/editor/datapoint/DatapointEditDialog";
import ChangeUnitIdDialog from "./ChangeUnitIdDialog";

interface Props {
  device: ModbusDevice;
  unit: ModbusUnit;
  onUpdate?: () => void;
}

const UnitConfigurationCard = ({ device, unit, onUpdate }: Props) => {
  // State to manage collapsible card.
  const [isOpen, setOpen] = useState(device.modbusUnits?.length === 1);
  // State to manage dialog visibility for editing unit ID.
  const [idEditDialogOpen, setIdEditDialogOpen] = useState(false);
  // State to manage dialog visibility for adding datapoint.
  const [isAddDatapointDialogOpen, setIsAddDatapointDialogOpen] =
    useState(false);

  // Hook for deleting unit.
  const {
    deleteUnit,
    isLoading: isDeleting,
    errors: deleteErrors,
  } = useDeleteUnit();

  /**
   * Handle deleting the unit.
   */
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
      {/* Dialog to add a Datapoint */}
      <DatapointEditDialog
        open={isAddDatapointDialogOpen}
        device={device}
        unit={unit}
        onClose={(update) => {
          setIsAddDatapointDialogOpen(false);
          if (update) onUpdate?.();
        }}
      />

      {/* Dialog to edit the unit id */}
      <ChangeUnitIdDialog
        open={idEditDialogOpen}
        device={device}
        unit={unit}
        onClose={() => setIdEditDialogOpen(false)}
        onChange={onUpdate}
      />

      {/* Unit Card */}
      <Card.Root
        width="100%"
        borderRadius={"2xl"}
        boxShadow={"lg"}
        overflow="hidden"
      >
        {/* Header */}
        <Card.Header padding="24px">
          <Card.Title>
            <HStack justifyContent={"space-between"}>
              {/* Left side */}
              <HStack gap={4}>
                {/* Collapsible trigger */}
                <IconButton
                  as={isOpen ? FaChevronDown : FaChevronRight}
                  padding="8px"
                  variant={"secondary"}
                  onClick={() => setOpen(!isOpen)}
                />

                {/* Unit id */}
                <Text>Unit {unit.unitId}</Text>

                {/* Edit unit id button */}
                <Button
                  size="lg"
                  variant="ghost"
                  onClick={() => setIdEditDialogOpen(true)}
                >
                  <Icon as={FaEdit} boxSize={4} />
                </Button>

                {/* Show amount of datapoints in this unit */}
                <Badge size={"lg"} colorPalette={"blue"}>
                  {unit.dataPoints?.length} Datapoints
                </Badge>
              </HStack>

              {/* Right side */}
              <HStack>
                {/* Add button */}
                <Button
                  variant={"outline"}
                  width="160px"
                  onClick={() => setIsAddDatapointDialogOpen(true)}
                >
                  <Icon as={FaPlus} boxSize={4} />
                  <Text fontSize={"md"}>Add Datapoint</Text>
                </Button>

                {/* Delete button */}
                <Button
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

        {/* Body */}
        {isOpen && (
          <Card.Body>
            <DatapointTable device={device} unit={unit} onUpdate={onUpdate} />
          </Card.Body>
        )}
      </Card.Root>
    </>
  );
};

export default UnitConfigurationCard;
