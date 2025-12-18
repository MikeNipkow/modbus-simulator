import type { DataPoint } from "@/types/DataPoint";
import { DataType } from "@/types/enums/DataType";
import { serializeValue } from "@/util/jsonUtils";
import {
  deserializeValueForType,
  getMaxValueForType,
  getMinValueForType,
  isIntType,
} from "@/util/modbusUtils";
import { Field, Input, NativeSelect } from "@chakra-ui/react";
import { useEffect, useState } from "react";

interface Props {
  datapoint: DataPoint;
  onChange: (newDatapoint: DataPoint) => void;
}

const DefaultValueInput = ({ datapoint, onChange }: Props) => {
  // Local state for input value.
  const [value, setValue] = useState<string | number>(
    datapoint.defaultValue as string | number,
  );
  const [invalid, setInvalid] = useState(false);

  // Update local value when datapoint default value changes.
  useEffect(() => {
    setValue(datapoint.defaultValue as string | number);
    setInvalid(false);
  }, [datapoint.defaultValue]);

  // Handle change of default value for number data types.
  const handleNumberChange = (inputVal: string) => {
    // Deserialize input value based on datapoint type.
    let value = deserializeValueForType(inputVal, datapoint.type);

    // Check if value is valid for the current data type.
    if (typeof value === "number" || typeof value === "bigint") {
      // Check if value is integer for integer types.
      if (isIntType(datapoint.type)) value = Math.trunc(value as number);

      // Check if value is within allowed range.
      const minAllowedValue = getMinValueForType(datapoint.type);
      const maxAllowedValue = getMaxValueForType(datapoint.type);
      if (value < minAllowedValue) value = minAllowedValue;
      else if (value > maxAllowedValue) value = maxAllowedValue;

      setInvalid(false);
    } else {
      value =
        datapoint.type === DataType.Int64 || datapoint.type === DataType.UInt64
          ? 0n
          : 0;
      setInvalid(true);
    }

    // Create new datapoint with updated default value and value.
    setValue(serializeValue(value) as string | number);
    const newDatapoint: DataPoint = {
      ...datapoint,
      defaultValue: serializeValue(value),
      value: serializeValue(value),
    };

    // Notify parent component.
    onChange(newDatapoint);
  };

  // Handle change of default value for boolean type.
  const handleBooleanChange = (value: boolean) => {
    // Create new datapoint with updated default value and value.
    const newDatapoint: DataPoint = {
      ...datapoint,
      defaultValue: value,
      value: value,
    };

    // Notify parent component.
    onChange(newDatapoint);
  };

  // Handle change of default value for ASCII type.
  const handleASCIIChange = (value: string) => {
    // Validate length according to datapoint length.
    if (value.length > datapoint.length! * 2) return;

    // Create new datapoint with updated default value and value.
    const newDatapoint: DataPoint = {
      ...datapoint,
      defaultValue: value,
      value: value,
    };

    // Notify parent component.
    onChange(newDatapoint);
  };

  return (
    <Field.Root>
      <Field.Label>Default Value</Field.Label>

      {/* Number DataType */}
      {datapoint.type !== DataType.ASCII &&
        datapoint.type !== DataType.Bool && (
          <Input
            type={"number"}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={(e) => handleNumberChange(e.target.value)}
            aria-invalid={invalid}
          />
        )}

      {/* Bool Data Type */}
      {datapoint.type === DataType.Bool && (
        <NativeSelect.Root>
          <NativeSelect.Field
            value={datapoint.defaultValue as string}
            onChange={(e) => handleBooleanChange(e.target.value === "true")}
          >
            <option value="true">true</option>
            <option value="false">false</option>
          </NativeSelect.Field>
        </NativeSelect.Root>
      )}

      {/* ASCII Data Type */}
      {datapoint.type === DataType.ASCII && (
        <Input
          placeholder={`max. ${datapoint.length! * 2} characters`}
          value={datapoint.defaultValue as string}
          onChange={(e) => handleASCIIChange(e.target.value)}
        />
      )}
    </Field.Root>
  );
};

export default DefaultValueInput;
