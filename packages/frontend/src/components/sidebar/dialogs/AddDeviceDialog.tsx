import { isValidFilename } from "@/util/fileUtils";
import {
  Field,
  Input,
  Text,
  VStack,
  NativeSelect,
  InputGroup,
} from "@chakra-ui/react";
import { useState } from "react";
import { useCreateDevice } from "@/hooks/device/useCreateDevice";
import type { ModbusDevice } from "@/types/ModbusDevice";
import { Endian } from "@/types/enums/Endian";
import { createErrorToast, createSuccessToast } from "../../ui/Toaster";
import BaseDialog from "../../ui/dialogs/base/BaseDialog";

interface Props {
  template: boolean;
  open: boolean;
  onClose: (filename?: string) => void;
  templates?: ModbusDevice[];
}

const AddDeviceDialog = ({ template, open, onClose, templates }: Props) => {
  const [filename, setFilename] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<ModbusDevice | null>(
    null,
  );
  const [error, setError] = useState("");

  const { createDevice, isLoading, errors } = useCreateDevice();

  const hasFilenameError = (): boolean => error !== "";

  /**
   * Validate filename and set error state
   * @param value Filename to validate
   * @return Boolean indicating if filename is valid
   */
  const validateFilename = (value: string): boolean => {
    let error = "";
    if (value.trim() == ".json") error = "Filename cannot be empty";
    else if (!isValidFilename(value)) error = "Invalid filename";
    else if (!value.endsWith(".json")) error = 'Filename must end with ".json"';

    setError(error);
    return error !== "" ? false : true;
  };

  const handleSubmit = async () => {
    // Append .json extension to filename.
    const filenameWithExtension = filename + ".json";

    // Check if filename is valid.
    if (!validateFilename(filenameWithExtension)) return;

    // Create device object.
    let device: ModbusDevice;

    // If a template is selected, use it as a base.
    if (selectedTemplate)
      device = { ...selectedTemplate, filename: filenameWithExtension };
    else
      device = {
        filename: filenameWithExtension,
        port: 502,
        enabled: false,
        running: false,
        endian: Endian.BigEndian,
        template: template,
      };

    // Call create device hook.
    const success = await createDevice(device, template);

    // Close dialog on success.
    if (success) onClose(filename);

    // Show toaster notification.
    success
      ? createSuccessToast({
          title: template ? "Template created" : "Device created",
          description: `Successfully created ${template ? "template" : "device"} "${device.filename}".`,
        })
      : createErrorToast({
          title: template
            ? "Failed to create template"
            : "Failed to create device",
          description: errors,
        });
  };

  return (
    <BaseDialog
      title={"Add " + (template ? "Template" : "Device")}
      open={open}
      onClose={() => onClose()}
      onSubmit={handleSubmit}
      loading={isLoading}
      loadingText="Saving..."
      submitDisabled={hasFilenameError()}
    >
      <VStack gap={4}>
        {/* Filename input */}
        <Field.Root invalid={hasFilenameError()}>
          <Field.Label>
            Filename
            <Text color="red">*</Text>
          </Field.Label>
          <InputGroup endAddon=".json">
            <Input
              value={filename}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const value = e.target.value;
                if (value.length > 0 && value.trim().length === 0) return;

                setFilename(value);
                if (e.target.value.length > 0)
                  validateFilename(e.target.value + ".json");
              }}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === " ") e.key = "_";
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder="e.g. my_device.json"
            />
          </InputGroup>
          {hasFilenameError() && (
            <Field.ErrorText color="red.600">{error}</Field.ErrorText>
          )}
        </Field.Root>
        {/* Template selection (optional) */}
        {true && (
          <Field.Root>
            <Field.Label>Template (Optional)</Field.Label>
            <NativeSelect.Root>
              <NativeSelect.Field
                value={selectedTemplate?.filename || ""}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  const templateFilename = e.target.value;
                  const template = templates?.find(
                    (t) => t.filename === templateFilename,
                  );
                  setSelectedTemplate(template || null);
                }}
                focusRingColor="primary"
              >
                <option value="">-- Select a template --</option>
                {templates?.map((template) => (
                  <option key={template.filename} value={template.filename}>
                    {template.filename}
                  </option>
                ))}
              </NativeSelect.Field>
            </NativeSelect.Root>
          </Field.Root>
        )}
      </VStack>
    </BaseDialog>
  );
};

export default AddDeviceDialog;
