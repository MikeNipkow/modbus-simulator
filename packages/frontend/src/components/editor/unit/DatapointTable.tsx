import DatapointEditDialog from "@/components/dialogs/DatapointEditDialog";
import { createErrorToast, createSuccessToast } from "@/components/ui/Toaster";
import { useDeleteDatapoint } from "@/hooks/useDeleteDatapoint";
import type { DataPoint } from "@/types/DataPoint";
import { DataArea } from "@/types/enums/DataArea";
import { DataType } from "@/types/enums/DataType";
import type { ModbusDevice } from "@/types/ModbusDevice";
import type { ModbusUnit } from "@/types/ModbusUnit";
import {
  createListCollection,
  IconButton,
  Input,
  Portal,
  Select,
  Table,
} from "@chakra-ui/react";
import { useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";

interface Props {
  device: ModbusDevice;
  unit: ModbusUnit;
  onUpdate?: () => void;
  setField: (field: keyof ModbusDevice, value: any) => void;
}
const dataTypes = createListCollection({
  items: Object.values(DataType).map((type) => ({
    value: type.toString(),
    label: type.toString(),
  })),
});
const dataAreas = createListCollection({
  items: Object.values(DataArea).map((area) => ({
    value: area,
    label: area,
  })),
});

const DatapointTable = ({ device, unit, onUpdate, setField }: Props) => {
  const [dpToEdit, setDpToEdit] = useState<DataPoint | null>(null);
  const { deleteDatapoint, isLoading, errors } = useDeleteDatapoint();

  const handleDelete = async (dp: DataPoint) => {
    // Call delete datapoint hook.
    const success = await deleteDatapoint(device, unit.unitId, dp.id);

    // Notify parent component to refresh data.
    if (success) onUpdate?.();

    // Show toast notification.
    success
      ? createSuccessToast({
          title: "Datapoint deleted",
          description: `Datapoint "${dp.name}" has been deleted.`,
        })
      : createErrorToast({
          title: "Failed to delete datapoint",
          description: errors,
        });
  };

  const handleFieldChange = (
    dp: DataPoint,
    field: keyof DataPoint,
    value: any,
  ) => {
    const newUnits = device.modbusUnits?.map((u) =>
      u.unitId === unit.unitId
        ? {
            ...u,
            dataPoints: u.dataPoints?.map((d) =>
              d.id === dp.id ? { ...d, [field]: value } : d,
            ),
          }
        : u,
    );
    setField("modbusUnits", newUnits);
  };

  return (
    <>
      {dpToEdit !== null && (
        <DatapointEditDialog
          open={dpToEdit !== null}
          device={device}
          unitId={unit.unitId}
          datapoint={dpToEdit!}
          onClose={(update) => {
            setDpToEdit(null);
            if (update) onUpdate?.();
          }}
        />
      )}
      <Table.Root
        size="sm"
        striped
        variant="outline"
        borderRadius={"xl"}
        overflow={"hidden"}
      >
        <Table.Header background={"bg.darker"} height={"50px"}>
          <Table.Row>
            <Table.ColumnHeader>Name</Table.ColumnHeader>
            <Table.ColumnHeader fontWeight={"bold"}>Type</Table.ColumnHeader>
            <Table.ColumnHeader fontWeight={"bold"}>Area</Table.ColumnHeader>
            <Table.ColumnHeader fontWeight={"bold"}>Address</Table.ColumnHeader>
            <Table.ColumnHeader fontWeight={"bold"}>Value</Table.ColumnHeader>
            <Table.ColumnHeader fontWeight={"bold"}>Unit</Table.ColumnHeader>
            <Table.ColumnHeader fontWeight={"bold"}>Access</Table.ColumnHeader>
            <Table.ColumnHeader fontWeight={"bold"}>Action</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {unit.dataPoints?.map((dp) => (
            <Table.Row key={dp.id}>
              {/* <Table.Cell>
                <Input
                  value={dp.name}
                  onChange={(e) =>
                    handleFieldChange(dp, "name", e.target.value)
                  }
                ></Input>
              </Table.Cell>

              <Table.Cell width="120px">
                <Select.Root
                  collection={dataTypes}
                  value={[dp.type]}
                  onSelect={(newType) =>
                    handleFieldChange(dp, "type", newType.value)
                  }
                >
                  <Select.HiddenSelect />
                  <Select.Control>
                    <Select.Trigger>
                      <Select.ValueText />
                    </Select.Trigger>
                    <Select.IndicatorGroup>
                      <Select.Indicator />
                    </Select.IndicatorGroup>
                  </Select.Control>
                  <Portal>
                    <Select.Positioner>
                      <Select.Content>
                        {dataTypes.items.map((type) => (
                          <Select.Item item={type} key={type.value}>
                            {type.label}
                            <Select.ItemIndicator />
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Positioner>
                  </Portal>
                </Select.Root>
              </Table.Cell>

              <Table.Cell>
                <Select.Root
                  multiple
                  collection={dataAreas}
                  value={dp.areas}
                  onSelect={(area) => {
                    const included = dp.areas.includes(area.value as DataArea);
                    const newAreas = included
                      ? dp.areas.filter((a) => a !== area.value)
                      : [...dp.areas, area.value as DataArea];
                    handleFieldChange(dp, "areas", newAreas);
                  }}
                >
                  <Select.HiddenSelect />
                  <Select.Control>
                    <Select.Trigger>
                      <Select.ValueText />
                    </Select.Trigger>
                    <Select.IndicatorGroup>
                      <Select.Indicator />
                    </Select.IndicatorGroup>
                  </Select.Control>
                  <Portal>
                    <Select.Positioner>
                      <Select.Content>
                        {dataAreas.items.map((area) => (
                          <Select.Item item={area} key={area.value}>
                            {area.label}
                            <Select.ItemIndicator />
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Positioner>
                  </Portal>
                </Select.Root>
              </Table.Cell> */}
              <Table.Cell>{dp.name}</Table.Cell>
              <Table.Cell>{dp.type}</Table.Cell>
              <Table.Cell>{dp.areas}</Table.Cell>
              <Table.Cell>{dp.address}</Table.Cell>
              <Table.Cell>{dp.value}</Table.Cell>
              <Table.Cell>{dp.unit}</Table.Cell>
              <Table.Cell>{dp.accessMode}</Table.Cell>
              <Table.Cell>
                <IconButton
                  padding={"4px"}
                  as={FaEdit}
                  boxSize={7}
                  color={"blackAlpha.700"}
                  variant={"ghost"}
                  onClick={() => setDpToEdit(dp)}
                  loading={isLoading}
                />
                <IconButton
                  padding={"4px"}
                  as={FaTrash}
                  boxSize={7}
                  colorPalette={"red"}
                  variant={"ghost"}
                  onClick={() => handleDelete(dp)}
                  loading={isLoading}
                />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </>
  );
};

export default DatapointTable;
