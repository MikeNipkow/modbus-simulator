import type { DataPoint } from "@/types/DataPoint";
import { DataType } from "@/types/enums/DataType";
import { deserializeValue, serializeValue } from "@/util/jsonUtils";
import { getMaxValueForType, getMinValueForType } from "@/util/modbusUtils";
import { Field, Input, NativeSelect } from "@chakra-ui/react";

interface Props {
  datapoint: DataPoint;
  onChange: (newDatapoint: DataPoint) => void;
}

const DefaultValueInput = ({ datapoint, onChange }: Props) => {
  // Handle change of default value for number data types.
  const handleNumberChange = (inputVal: string) => {
    // Deserialize input value based on datapoint type.
    let value = deserializeValue(inputVal);

    // Check if value is valid for the current data type.
    if (typeof value !== "number" && typeof value !== "bigint") return;

    // Check if value is within allowed range.
    const minAllowedValue = getMinValueForType(datapoint.type);
    const maxAllowedValue = getMaxValueForType(datapoint.type);
    if (value < minAllowedValue) value = minAllowedValue;
    else if (value > maxAllowedValue) value = maxAllowedValue;

    // Create new datapoint with updated default value and value.
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
            type="number"
            value={datapoint.defaultValue as number}
            onChange={(e) => handleNumberChange(e.target.value)}
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
