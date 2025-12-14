import DatapointEditDialog from "@/components/editor/datapoint/DatapointEditDialog";
import type { DataPoint } from "@/types/DataPoint";
import type { ModbusDevice } from "@/types/ModbusDevice";
import type { ModbusUnit } from "@/types/ModbusUnit";
import { Table } from "@chakra-ui/react";
import { useState } from "react";
import DatapointRow from "./DatapointRow";

interface Props {
  device: ModbusDevice;
  unit: ModbusUnit;
  onUpdate?: () => void;
}

const DatapointTable = ({ device, unit, onUpdate }: Props) => {
  // State to manage the datapoint being edited.
  const [dpToEdit, setDpToEdit] = useState<DataPoint | null>(null);

  return (
    <>
      {/* Dialog to edit a datapoint */}
      {dpToEdit !== null && (
        <DatapointEditDialog
          open={dpToEdit !== null}
          device={device}
          unit={unit}
          datapoint={dpToEdit!}
          onClose={(update) => {
            setDpToEdit(null);
            if (update) onUpdate?.();
          }}
        />
      )}

      {/* Table of datapoints in this unit */}
      <Table.Root
        size="sm"
        striped
        variant="outline"
        borderRadius={"xl"}
        overflow={"hidden"}
      >
        <Table.Header background={"bg.darker"} height={"50px"}>
          {/* Row Headers */}
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

        {/* Map rows */}
        <Table.Body>
          {unit.dataPoints?.map((datapoint) => (
            <DatapointRow
              device={device}
              unit={unit}
              datapoint={datapoint}
              onDelete={onUpdate}
              onEdit={() => setDpToEdit(datapoint)}
            />
          ))}
        </Table.Body>
      </Table.Root>
    </>
  );
};

export default DatapointTable;
