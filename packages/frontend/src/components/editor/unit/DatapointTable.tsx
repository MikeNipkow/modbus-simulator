import DatapointEditDialog from "@/components/editor/datapoint/DatapointEditDialog";
import type { DataPoint } from "@/types/DataPoint";
import type { ModbusDevice } from "@/types/ModbusDevice";
import type { ModbusUnit } from "@/types/ModbusUnit";
import {
  Badge,
  Button,
  HStack,
  Table,
  Skeleton,
  VStack,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import DatapointRow from "./DatapointRow";

interface Props {
  device: ModbusDevice;
  unit: ModbusUnit;
  allowPolling?: boolean;
  onUpdate?: () => void;
}

const DatapointTable = ({ device, unit, allowPolling, onUpdate }: Props) => {
  // State to manage the datapoint being edited.
  const [dpToEdit, setDpToEdit] = useState<DataPoint | null>(null);

  // State to manage hex format usage.
  const [useHexFormat, setUseHexFormat] = useState(false);

  // Show a lightweight placeholder while the heavy table rows are rendered.
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // reset placeholder then allow content to render on next tick so browser can paint skeleton
    setShowContent(false);
    const id = setTimeout(() => setShowContent(true), 0);
    return () => clearTimeout(id);
  }, [unit.dataPoints?.length, useHexFormat]);

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
            <Table.ColumnHeader fontWeight={"bold"}>Name</Table.ColumnHeader>
            <Table.ColumnHeader fontWeight={"bold"}>Type</Table.ColumnHeader>
            <Table.ColumnHeader fontWeight={"bold"}>Areas</Table.ColumnHeader>
            <Table.ColumnHeader fontWeight={"bold"}>
              <HStack gap={0}>
                Address
                <Button
                  padding={1}
                  variant={"ghost"}
                  onClick={() => setUseHexFormat(!useHexFormat)}
                >
                  <Badge colorPalette={useHexFormat ? "yellow" : "green"}>
                    {useHexFormat ? "HEX" : "DEC"}
                  </Badge>
                </Button>
              </HStack>
            </Table.ColumnHeader>
            <Table.ColumnHeader fontWeight={"bold"}>Value</Table.ColumnHeader>
            <Table.ColumnHeader fontWeight={"bold"}>Unit</Table.ColumnHeader>
            <Table.ColumnHeader fontWeight={"bold"}>Access</Table.ColumnHeader>
            <Table.ColumnHeader fontWeight={"bold"}>Action</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>

        {/* Map rows or show placeholder while content is prepared */}
        <Table.Body>
          {!showContent ? (
            <Table.Row>
              <Table.Cell colSpan={8}>
                <VStack align="stretch" gap={2}>
                  {[...Array(unit.dataPoints?.length)].map((_, idx) => (
                    <Skeleton key={idx} height="30px" borderRadius="md" />
                  ))}
                </VStack>
              </Table.Cell>
            </Table.Row>
          ) : (
            unit.dataPoints
              ?.sort((dpA, dpB) => dpA.address - dpB.address)
              .map((datapoint) => (
                <DatapointRow
                  key={datapoint.id}
                  device={device}
                  unit={unit}
                  datapoint={datapoint}
                  onDelete={onUpdate}
                  onEdit={() => setDpToEdit(datapoint)}
                  useHexFormat={useHexFormat}
                  allowPolling={allowPolling}
                />
              ))
          )}
        </Table.Body>
      </Table.Root>
    </>
  );
};

export default DatapointTable;
