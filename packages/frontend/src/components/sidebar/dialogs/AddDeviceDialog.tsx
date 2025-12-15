import {
  Field,
  VStack,
  NativeSelect,
  FileUpload,
  Button,
  type FileUploadFileAcceptDetails,
} from "@chakra-ui/react";
import { useState } from "react";
import { useCreateDevice } from "@/hooks/device/useCreateDevice";
import type { ModbusDevice } from "@/types/ModbusDevice";
import { Endian } from "@/types/enums/Endian";
import { createErrorToast, createSuccessToast } from "../../ui/Toaster";
import BaseDialog from "../../ui/dialogs/base/BaseDialog";
import { HiUpload } from "react-icons/hi";
import LabeledSeparator from "@/components/ui/LabeledSeparator";
import FilenameInput from "@/components/ui/FilenameInput";
import { useUploadTemplate } from "@/hooks/device/useUploadTemplate";

interface Props {
  template: boolean;
  open: boolean;
  onClose: (filename?: string) => void;
  templates?: ModbusDevice[];
}

const AddDeviceDialog = ({ template, open, onClose, templates }: Props) => {
  // State to manage filename input.
  const [filename, setFilename] = useState("");
  // State to manage filename validity.
  const [filenameValid, setFilenameValid] = useState(false);
  // State to manage selected template.
  const [selectedTemplate, setSelectedTemplate] = useState<ModbusDevice | null>(
    null,
  );

  // Hook for creating device.
  const { createDevice, isLoading } = useCreateDevice();

  const { uploadTemplateFile } = useUploadTemplate();

  const handleSubmit = async () => {
    // Check if filename is valid.
    if (!filenameValid) return;

    // Append .json extension to filename.
    const filenameWithExtension = filename + ".json";

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
    const result = await createDevice(device, template);

    // Close dialog on success.
    if (result.success) onClose(filenameWithExtension);

    // Show toaster notification.
    result.success
      ? createSuccessToast({
          title: template ? "Template created" : "Device created",
          description: `Successfully created ${template ? "template" : "device"} "${device.filename}".`,
        })
      : createErrorToast({
          title: template
            ? "Failed to create template"
            : "Failed to create device",
          description: result.errors,
        });
  };

  const handleFileUpload = async (details: FileUploadFileAcceptDetails) => {
    // Handle file upload.
    const result = await uploadTemplateFile(details.files[0]);

    // Close dialog on success.
    if (result.success) onClose(result.device.filename);

    // Show toaster notification.
    result.success
      ? createSuccessToast({
          title: "Template uploaded",
          description: `Successfully uploaded template "${result.device.filename}".`,
        })
      : createErrorToast({
          title: "Failed to upload template",
          description: result.errors,
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
      submitDisabled={!filenameValid}
    >
      <VStack gap={4}>
        {/* Filename input */}
        <FilenameInput
          filename={filename}
          onChange={({ filename, valid }) => {
            setFilename(filename);
            setFilenameValid(valid);
          }}
          onSubmit={handleSubmit}
        />
        {/* Template selection (optional) */}
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
      </VStack>

      {/* Upload button */}
      {template && (
        <>
          <LabeledSeparator label="OR" />
          <VStack width="100%" align="center">
            <FileUpload.Root
              accept={["application/json"]}
              onFileAccept={handleFileUpload}
            >
              <FileUpload.HiddenInput />
              <FileUpload.Trigger asChild>
                <Button variant="outline" size="sm" mx="auto">
                  <HiUpload /> Upload file
                </Button>
              </FileUpload.Trigger>
            </FileUpload.Root>
          </VStack>
        </>
      )}
    </BaseDialog>
  );
};

export default AddDeviceDialog;
