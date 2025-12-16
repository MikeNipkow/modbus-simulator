import type { DataPoint } from "@/types/DataPoint";
import { DataType } from "@/types/enums/DataType";
import type { SimulationProps } from "@/types/SimulationProps";
import { serializeValue } from "@/util/jsonUtils";
import {
  deserializeValueForType,
  getMaxValueForType,
  getMinValueForType,
  isBigIntType,
} from "@/util/modbusUtils";
import { Field, Input } from "@chakra-ui/react";
import { useEffect, useState } from "react";

interface Props {
  datapoint: DataPoint;
  onChange: (newDatapoint: DataPoint) => void;
}

const MinValueInput = ({ datapoint, onChange }: Props) => {
  // Local state for input value.
  const [value, setValue] = useState<string | number>(
    datapoint.simulation?.minValue as string | number,
  );
  const [invalid, setInvalid] = useState(false);

  // Update local value when datapoint default value changes.
  useEffect(() => {
    setValue(datapoint.simulation?.minValue as string | number);
    setInvalid(false);
  }, [datapoint.simulation?.minValue]);

  const handleChange = (inputVal: any) => {
    // Deserialize input value based on datapoint type.
    let value = deserializeValueForType(inputVal, datapoint.type);

    // Check if value is valid for the current data type.
    if (typeof value === "number" || typeof value === "bigint") {
      // Check if value is within allowed range.
      const minAllowedValue = getMinValueForType(datapoint.type);
      const maxAllowedValue = getMaxValueForType(datapoint.type);

      // Get highest possible minValue.
      const maxValue: number | bigint = deserializeValueForType(
        datapoint.simulation?.maxValue as string,
        datapoint.type,
      ) as number | bigint;
      const highestPossibleMinValue =
        maxValue > maxAllowedValue
          ? maxAllowedValue
          : isBigIntType(datapoint.type)
            ? BigInt(maxValue) - 1n
            : (maxValue as number) - 1;

      if (value < minAllowedValue) value = minAllowedValue;
      else if (value > highestPossibleMinValue) value = highestPossibleMinValue;

      setInvalid(false);
    } else {
      value =
        datapoint.type === DataType.Int64 || datapoint.type === DataType.UInt64
          ? 0n
          : 0;
      setInvalid(true);
    }

    // Create new datapoint with updated default value and value.
    const serializedVal = serializeValue(value) as string | number;
    setValue(serializedVal);
    const simulationProps: SimulationProps | undefined = datapoint.simulation
      ? {
          ...datapoint.simulation,
          minValue: serializedVal,
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
      <Field.Label>Min Value</Field.Label>
      <Input
        type={"number"}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={(e) => handleChange(e.target.value)}
        aria-invalid={invalid}
      ></Input>
    </Field.Root>
  );
};

export default MinValueInput;
