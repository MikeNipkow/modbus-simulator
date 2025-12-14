import type { DataPoint } from "@/types/DataPoint";
import { AccessMode } from "@/types/enums/AccessMode";
import { DataArea } from "@/types/enums/DataArea";
import { DataType } from "@/types/enums/DataType";
import { createListCollection, Field, Select, Text } from "@chakra-ui/react";

interface Props {
  datapoint: DataPoint;
  onSelect: (newDatapoint: DataPoint) => void;
}

const DataAreaSelector = ({ datapoint, onSelect }: Props) => {
  // Collection of data areas.
  const dataAreas = createListCollection({
    items: (datapoint.type !== DataType.Bool
      ? [DataArea.HoldingRegister, DataArea.InputRegister]
      : Object.values(DataArea)
    ).map((area) => ({
      value: area,
      label: area,
    })),
  });

  // Handle selection of data area.
  const handleSelect = (area: DataArea) => {
    // Check if area is already included.
    const included: boolean = datapoint.areas.includes(area);

    // Cancel, if trying to deselect the last area.
    if (included && datapoint.areas.length === 1) return;

    // Create array of selected areas.
    const newAreas = included
      ? datapoint.areas.filter((a) => a !== area)
      : [...datapoint.areas, area as DataArea];

    // Create new datapoint with updated areas.
    const newDatapoint: DataPoint = {
      ...datapoint,
      areas: newAreas,
    };

    // Check if only read-only area is selected to adjust the access mode.
    if (
      !newAreas.includes(DataArea.HoldingRegister) &&
      !newAreas.includes(DataArea.Coil) &&
      datapoint.accessMode !== AccessMode.ReadOnly
    )
      newDatapoint.accessMode = AccessMode.ReadOnly;

    // Notify parent component.
    onSelect(newDatapoint);
  };

  return (
    <Field.Root>
      <Field.Label>
        Areas <Text color="red">*</Text>
      </Field.Label>
      <Select.Root
        multiple
        collection={dataAreas}
        value={datapoint.areas}
        onSelect={(area) => handleSelect(area.value as DataArea)}
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
      </Select.Root>
    </Field.Root>
  );
};

export default DataAreaSelector;
