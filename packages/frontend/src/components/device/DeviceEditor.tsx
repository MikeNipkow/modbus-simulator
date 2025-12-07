import { Box, Heading, VStack, HStack, Input, Text, Button, Flex } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import type { ModbusDevice } from "@/types/ModbusDevice";
import { Endian } from "@/types/enums/Endian";

interface DeviceEditorProps {
    device: ModbusDevice;
    onSave?: (device: ModbusDevice) => void;
    onCancel?: () => void;
}

function DeviceEditor({ device, onSave, onCancel }: DeviceEditorProps) {
    const [editedDevice, setEditedDevice] = useState<ModbusDevice>(device);

    useEffect(() => {
        setEditedDevice(device);
    }, [device]);

    const handleChange = (field: keyof ModbusDevice, value: string | number | boolean) => {
        setEditedDevice({ ...editedDevice, [field]: value });
    };

    const handleSave = () => {
        onSave?.(editedDevice);
    };

    return (
        <Box p={6} maxW="800px">
            <Heading size="lg" mb={6}>
                Device Editor
            </Heading>

            <VStack gap={4} align="stretch">
                {/* Filename */}
                <Box>
                    <Text fontSize="sm" fontWeight="medium" mb={1}>
                        Filename
                    </Text>
                    <Input
                        value={editedDevice.filename}
                        onChange={(e) => handleChange("filename", e.target.value)}
                        placeholder="device.json"
                    />
                </Box>

                {/* Name */}
                <Box>
                    <Text fontSize="sm" fontWeight="medium" mb={1}>
                        Name
                    </Text>
                    <Input
                        value={editedDevice.name || ""}
                        onChange={(e) => handleChange("name", e.target.value)}
                        placeholder="Device Name"
                    />
                </Box>

                {/* Vendor */}
                <Box>
                    <Text fontSize="sm" fontWeight="medium" mb={1}>
                        Vendor
                    </Text>
                    <Input
                        value={editedDevice.vendor || ""}
                        onChange={(e) => handleChange("vendor", e.target.value)}
                        placeholder="Vendor Name"
                    />
                </Box>

                {/* Description */}
                <Box>
                    <Text fontSize="sm" fontWeight="medium" mb={1}>
                        Description
                    </Text>
                    <Input
                        value={editedDevice.description || ""}
                        onChange={(e) => handleChange("description", e.target.value)}
                        placeholder="Device Description"
                    />
                </Box>

                {/* Port and Endian */}
                <HStack gap={4}>
                    <Box flex={1}>
                        <Text fontSize="sm" fontWeight="medium" mb={1}>
                            Port
                        </Text>
                        <Input
                            type="number"
                            value={editedDevice.port}
                            onChange={(e) => handleChange("port", parseInt(e.target.value))}
                            placeholder="502"
                        />
                    </Box>

                    <Box flex={1}>
                        <Text fontSize="sm" fontWeight="medium" mb={1}>
                            Endian
                        </Text>
                        <select
                            value={editedDevice.endian}
                            onChange={(e) => handleChange("endian", e.target.value as Endian)}
                            style={{
                                width: "100%",
                                padding: "8px",
                                borderRadius: "6px",
                                border: "1px solid #E2E8F0",
                            }}
                        >
                            <option value={Endian.BigEndian}>Big Endian</option>
                            <option value={Endian.LittleEndian}>Little Endian</option>
                        </select>
                    </Box>
                </HStack>

                {/* Status Info (Read-only) */}
                <HStack gap={4}>
                    <Box>
                        <Text fontSize="sm" color="gray.600">
                            Status: {editedDevice.running ? "Running" : "Stopped"}
                        </Text>
                    </Box>
                    <Box>
                        <Text fontSize="sm" color="gray.600">
                            Enabled: {editedDevice.enabled ? "Yes" : "No"}
                        </Text>
                    </Box>
                </HStack>

                {/* Units count */}
                {editedDevice.modbusUnits && (
                    <Box>
                        <Text fontSize="sm" color="gray.600">
                            Modbus Units: {editedDevice.modbusUnits.length}
                        </Text>
                    </Box>
                )}

                {/* Action Buttons */}
                <Flex gap={3} mt={4}>
                    <Button colorScheme="blue" onClick={handleSave}>
                        Save Changes
                    </Button>
                    {onCancel && (
                        <Button variant="outline" onClick={onCancel}>
                            Cancel
                        </Button>
                    )}
                </Flex>
            </VStack>
        </Box>
    );
}

export default DeviceEditor;
