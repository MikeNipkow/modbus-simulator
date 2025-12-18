import type { DataPoint } from "@/types/DataPoint";
import type { SimulationProps } from "@/types/SimulationProps";
import { serializeValue } from "@/util/jsonUtils";
import {
  deserializeValueForType,
  getMaxValueForType,
  getMinValueForType,
  isBigIntType,
  isIntType,
} from "@/util/modbusUtils";
import { Field, Input } from "@chakra-ui/react";
import { useEffect, useState } from "react";

interface Props {
  datapoint: DataPoint;
  onChange: (newDatapoint: DataPoint) => void;
}

const MaxValueInput = ({ datapoint, onChange }: Props) => {
  // Local state for input value.
  const [value, setValue] = useState<string | number>(
    datapoint.simulation?.maxValue as string | number,
  );
  const [invalid, setInvalid] = useState(false);

  // Update local value when datapoint default value changes.
  useEffect(() => {
    setValue(datapoint.simulation?.maxValue as string | number);
    setInvalid(false);
  }, [datapoint.simulation?.maxValue]);

  const handleChange = (inputVal: any) => {
    // Deserialize input value based on datapoint type.
    let value = deserializeValueForType(inputVal, datapoint.type);

    // Check if value is integer for integer types.
    if (isIntType(datapoint.type)) value = Math.trunc(value as number);

    // Check if value is within allowed range.
    const minAllowedValue = getMinValueForType(datapoint.type);
    const maxAllowedValue = getMaxValueForType(datapoint.type);

    // Get highest possible minValue.
    const minValue: number | bigint = deserializeValueForType(
      datapoint.simulation?.minValue as string,
      datapoint.type,
    ) as number | bigint;
    const lowestPossibleMaxValue =
      minValue < minAllowedValue
        ? minAllowedValue
        : isBigIntType(datapoint.type)
          ? BigInt(minValue) + 1n
          : (minValue as number) + (isIntType(datapoint.type) ? 1 : 0.1);

    // Check if value is valid for the current data type.
    if (typeof value === "number" || typeof value === "bigint") {
      if (value > maxAllowedValue) value = maxAllowedValue;
      else if (value < lowestPossibleMaxValue) value = lowestPossibleMaxValue;

      setInvalid(false);
    } else {
      value = lowestPossibleMaxValue;
      setInvalid(true);
    }

    // Create new datapoint with updated default value and value.
    const serializedVal = serializeValue(value) as string | number;
    setValue(serializedVal);
    const simulationProps: SimulationProps | undefined = datapoint.simulation
      ? {
          ...datapoint.simulation,
          maxValue: serializedVal,
        }
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
      <Field.Label>Max Value</Field.Label>
      <Input
        type="number"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={(e) => handleChange(e.target.value)}
        aria-invalid={invalid}
      ></Input>
    </Field.Root>
  );
};

export default MaxValueInput;
