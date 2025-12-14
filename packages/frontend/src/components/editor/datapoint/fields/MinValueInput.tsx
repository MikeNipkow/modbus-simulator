import type { DataPoint } from "@/types/DataPoint";
import type { SimulationProps } from "@/types/SimulationProps";
import { deserializeValue } from "@/util/jsonUtils";
import { getMaxValueForType, getMinValueForType } from "@/util/modbusUtils";
import { Field, Input } from "@chakra-ui/react";

interface Props {
  datapoint: DataPoint;
  onChange: (newDatapoint: DataPoint) => void;
}

const MinValueInput = ({ datapoint, onChange }: Props) => {
  const handleChange = (inputValue: any) => {
    // Deserialize input value based on datapoint type.
    let value = deserializeValue(inputValue);

    // Check if value is valid for the current data type.
    if (typeof value !== "number" && typeof value !== "bigint") return;

    const isBigIntType = typeof value === "bigint";

    // Check if new value is larger than minValue.
    const minAllowedValue = getMinValueForType(datapoint.type);
    const maxAllowedValue = getMaxValueForType(datapoint.type);
    if (value >= datapoint.simulation!.maxValue) {
      value = isBigIntType
        ? (datapoint.simulation!.maxValue as bigint) - 1n
        : (datapoint.simulation!.maxValue as number) - 1;

      // Check if value is within allowed range.
      if (value < minAllowedValue || value > maxAllowedValue) return;
    } else if (value < minAllowedValue) value = minAllowedValue;
    else if (value > maxAllowedValue) value = maxAllowedValue;

    // Create new datapoint with updated min value.
    const simulationProps: SimulationProps | undefined = datapoint.simulation
      ? { ...datapoint.simulation, minValue: value }
      : undefined;
    const newDatapoint: DataPoint = {
      ...datapoint,
      simulation: simulationProps,
    };

    // Notify parent component.
    onChange(newDatapoint);
  };

  return (
    <Field.Root>
      <Field.Label>Min Value</Field.Label>
      <Input
        type="number"
        value={datapoint.simulation?.minValue as number}
        onChange={(e) => handleChange(Number(e.target.value))}
      ></Input>
    </Field.Root>
  );
};

export default MinValueInput;
