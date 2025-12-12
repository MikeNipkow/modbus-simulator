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
import { FaTrash } from "react-icons/fa";

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
            <Table.Cell>
              <Input
                value={dp.name}
                onChange={(e) => handleFieldChange(dp, "name", e.target.value)}
              ></Input>
            </Table.Cell>

            <Table.Cell width="120px">
              <Select.Root
                collection={dataTypes}
                value={[dp.type]}
                onChange={(values: any) => {
                  const newType = Array.isArray(values) ? values[0] : values;
                  const newUnits = device.modbusUnits?.map((u) =>
                    u.unitId === unit.unitId
                      ? {
                          ...u,
                          dataPoints: u.dataPoints?.map((d) =>
                            d.id === dp.id
                              ? { ...d, type: newType as DataType }
                              : d,
                          ),
                        }
                      : u,
                  );
                  setField("modbusUnits", newUnits);
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
                collection={dataAreas}
                value={dp.areas}
                multiple
                onChange={(values: any) => {
                  const newAreas = Array.isArray(values) ? values : [values];
                  const newUnits = device.modbusUnits?.map((u) =>
                    u.unitId === unit.unitId
                      ? {
                          ...u,
                          dataPoints: u.dataPoints?.map((d) =>
                            d.id === dp.id
                              ? { ...d, areas: newAreas as DataArea[] }
                              : d,
                          ),
                        }
                      : u,
                  );
                  setField("modbusUnits", newUnits);
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
            </Table.Cell>
            <Table.Cell>{dp.address}</Table.Cell>
            <Table.Cell>{dp.value}</Table.Cell>
            <Table.Cell>{dp.unit}</Table.Cell>
            <Table.Cell>{dp.accessMode}</Table.Cell>
            <Table.Cell>
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
  );
};

export default DatapointTable;
