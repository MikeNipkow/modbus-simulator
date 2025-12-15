import { createErrorToast, createSuccessToast } from "@/components/ui/Toaster";
import { useDeleteDatapoint } from "@/hooks/datapoint/useDeleteDatapoint";
import type { DataPoint } from "@/types/DataPoint";
import type { ModbusDevice } from "@/types/ModbusDevice";
import type { ModbusUnit } from "@/types/ModbusUnit";
import { IconButton, Table } from "@chakra-ui/react";
import { FaEdit, FaTrash } from "react-icons/fa";

/**
 * Props for DatapointRow component.
 */
interface Props {
  device: ModbusDevice;
  unit: ModbusUnit;
  datapoint: DataPoint;
  onEdit?: () => void;
  onDelete?: () => void;
}

const DatapointRow = ({ device, unit, datapoint, onEdit, onDelete }: Props) => {
  // Hook to delete a datapoint.
  const { deleteDatapoint, isLoading, errors } = useDeleteDatapoint();

  /**
   * Handle deletion of a datapoint.
   * @param dp Datapoint to delete.
   */
  const handleDelete = async () => {
    // Call delete datapoint hook.
    const success = await deleteDatapoint(device, unit.unitId, datapoint.id);

    // Notify parent component to refresh data.
    if (success) onDelete?.();

    // Show toast notification.
    success
      ? createSuccessToast({
          title: "Datapoint deleted",
          description: `Datapoint "${datapoint.name}" has been deleted.`,
        })
      : createErrorToast({
          title: "Failed to delete datapoint",
          description: errors,
        });
  };

  return (
    <Table.Row key={datapoint.id}>
      <Table.Cell>{datapoint.name}</Table.Cell>
      <Table.Cell>{datapoint.type}</Table.Cell>
      <Table.Cell>{datapoint.areas}</Table.Cell>
      <Table.Cell>{datapoint.address}</Table.Cell>
      <Table.Cell>{datapoint.value}</Table.Cell>
      <Table.Cell>{datapoint.unit}</Table.Cell>
      <Table.Cell>{datapoint.accessMode}</Table.Cell>
      <Table.Cell>
        <IconButton
          padding={"4px"}
          as={FaEdit}
          boxSize={7}
          color={"blackAlpha.700"}
          variant={"ghost"}
          onClick={() => onEdit?.()}
        />
        <IconButton
          padding={"4px"}
          as={FaTrash}
          boxSize={7}
          colorPalette={"red"}
          variant={"ghost"}
          onClick={() => handleDelete()}
          loading={isLoading}
        />
      </Table.Cell>
    </Table.Row>
  );
};

export default DatapointRow;
