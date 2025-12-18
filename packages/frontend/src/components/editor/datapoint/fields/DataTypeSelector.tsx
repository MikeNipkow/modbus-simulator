import type { DataPoint } from "@/types/DataPoint";
import { DataType } from "@/types/enums/DataType";
import { serializeValue } from "@/util/jsonUtils";
import { getDefaultValueForType } from "@/util/modbusUtils";
import { createListCollection, Field, Select, Text } from "@chakra-ui/react";

interface Props {
  datapoint: DataPoint;
  onSelect: (newDatapoint: DataPoint) => void;
}

const DataTypeSelector = ({ datapoint, onSelect }: Props) => {
  // Create collection of data types.
  const dataTypes = createListCollection({
    items: Object.values(DataType).map((type) => ({
      value: type.toString(),
      label: type.toString(),
    })),
  });

  // Handle selection of new data type.
  const handleSelect = (newType: DataType) => {
    // Create new datapoint with updated type and default value.
    const defaultValue = serializeValue(getDefaultValueForType(newType));
    const newDatapoint: DataPoint = {
      ...datapoint,
      type: newType,
      defaultValue: defaultValue,
      value: defaultValue,
      length: newType === DataType.ASCII ? 1 : undefined,
      simulation: {
        enabled: false,
        minValue: 0,
        maxValue: 1,
      },
    };

    // Notify parent component.
    onSelect(newDatapoint);
  };

  return (
    <Field.Root>
      <Field.Label>
        Type <Text color="red">*</Text>
      </Field.Label>

      <Select.Root
        collection={dataTypes}
        value={[datapoint.type]}
        onSelect={(newType) => handleSelect(newType.value as DataType)}
        positioning={{ strategy: "fixed", hideWhenDetached: true }}
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
            {dataTypes.items.map((type) => (
              <Select.Item item={type} key={type.value}>
                {type.label}
                <Select.ItemIndicator />
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Positioner>
      </Select.Root>
    </Field.Root>
  );
};

export default DataTypeSelector;
