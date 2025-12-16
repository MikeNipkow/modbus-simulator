import * as fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { DataArea } from "./types/enums/DataArea.js";
import { Endian } from "./types/enums/Endian.js";
import { AccessMode } from "./types/enums/AccessMode.js";
import { DataType } from "./types/enums/DataType.js";
import { initializeApiServer } from "./api/apiServer.js";
import { ModbusDeviceProps } from "./types/ModbusDeviceProps.js";
import { DataPoint } from "./classes/DataPoint.js";
import { DeviceManager } from "./classes/DeviceManager.js";
import { ModbusDevice } from "./classes/ModbusDevice.js";
import { ModbusUnit } from "./classes/ModbusUnit.js";

// Create directory containing device JSON files.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const deviceDir = path.join(__dirname, "devices");
const templateDir = path.join(__dirname, "templates");

// Ensure the directories exist.
if (!fs.existsSync(deviceDir)) fs.mkdirSync(deviceDir, { recursive: true });
if (!fs.existsSync(templateDir)) fs.mkdirSync(templateDir, { recursive: true });

// Create DeviceManagers for devices and templates.
export const deviceManager = new DeviceManager(deviceDir);
export const templateManager = new DeviceManager(templateDir);

// Log any errors encountered during template loading.
console.log("Loading templates...");
const templateErrors = await templateManager.loadDevices(false);
templateErrors.forEach((err) => console.error(err));
console.log(templateManager.getDevices().length + " templates loaded");

// Log any errors encountered during device loading.
console.log("\nLoading devices...");
const deviceErrors = await deviceManager.loadDevices(true);
deviceErrors.forEach((err) => console.error(err));
console.log(deviceManager.getDevices().length + " devices loaded");

// Sample device
if (false) {
  const deviceProps: ModbusDeviceProps = {
    filename: "sample_device.json",
    enabled: true,
    port: 502,
    endian: Endian.BigEndian,
    name: "Sample Device",
    vendor: "Sample Vendor",
    description:
      "This is a sample Modbus device with various data points for testing purposes.",
  };
  const device = new ModbusDevice(deviceProps);
  const unit = new ModbusUnit({ unitId: 1 });

  // Coils.
  const coil1 = new DataPoint({
    id: "sample_coil_1",
    name: "Sample Coil 1",
    unit: "Sample Unit",
    areas: [DataArea.Coil],
    type: DataType.Bool,
    address: 0,
    accessMode: AccessMode.ReadOnly,
    defaultValue: true,
  });
  const coil2 = new DataPoint({
    id: "sample_coil_2",
    name: "Sample Coil 2",
    unit: "Sample Unit",
    areas: [DataArea.Coil],
    type: DataType.Bool,
    address: 1,
    accessMode: AccessMode.ReadWrite,
    defaultValue: true,
    feedbackDataPoint: "sample_discreteInput_1",
  });
  unit.addDataPoint(coil1);
  unit.addDataPoint(coil2);

  // Discrete Inputs.
  const di1 = new DataPoint({
    id: "sample_discreteInput_1",
    name: "Sample Discrete Input 1",
    unit: "Sample Unit",
    areas: [DataArea.DiscreteInput],
    type: DataType.Bool,
    address: 0,
    accessMode: AccessMode.ReadOnly,
    defaultValue: true,
  });
  unit.addDataPoint(di1);

  // Holding Registers.
  const hr1 = new DataPoint({
    id: "sample_holdingRegister_1",
    name: "Sample Holding Register 1",
    unit: "Sample Unit",
    areas: [DataArea.HoldingRegister],
    type: DataType.Byte,
    address: 0,
    accessMode: AccessMode.ReadWrite,
    defaultValue: 0,
  });
  const hr2 = new DataPoint({
    id: "sample_holdingRegister_2",
    name: "Sample Holding Register 2",
    unit: "Sample Unit",
    areas: [DataArea.HoldingRegister],
    type: DataType.UInt16,
    address: 10,
    accessMode: AccessMode.ReadWrite,
    defaultValue: 0,
  });
  const hr3 = new DataPoint({
    id: "sample_holdingRegister_3",
    name: "Sample Holding Register 3",
    unit: "Sample Unit",
    areas: [DataArea.HoldingRegister],
    type: DataType.UInt32,
    address: 11,
    accessMode: AccessMode.ReadWrite,
    defaultValue: 0,
  });
  const hr4 = new DataPoint({
    id: "sample_holdingRegister_4",
    name: "Sample Holding Register 4",
    unit: "Sample Unit",
    areas: [DataArea.HoldingRegister],
    type: DataType.UInt64,
    address: 13,
    accessMode: AccessMode.ReadWrite,
    defaultValue: 0n,
  });
  const hr5 = new DataPoint({
    id: "sample_holdingRegister_5",
    name: "Sample Holding Register 5",
    unit: "Sample Unit",
    areas: [DataArea.HoldingRegister],
    type: DataType.Int16,
    address: 17,
    accessMode: AccessMode.ReadWrite,
    defaultValue: 0,
  });
  const hr6 = new DataPoint({
    id: "sample_holdingRegister_6",
    name: "Sample Holding Register 6",
    unit: "Sample Unit",
    areas: [DataArea.HoldingRegister],
    type: DataType.Int32,
    address: 18,
    accessMode: AccessMode.ReadWrite,
    defaultValue: 0,
  });
  const hr7 = new DataPoint({
    id: "sample_holdingRegister_7",
    name: "Sample Holding Register 7",
    unit: "Sample Unit",
    areas: [DataArea.HoldingRegister],
    type: DataType.Int64,
    address: 20,
    accessMode: AccessMode.ReadWrite,
    defaultValue: 0n,
  });
  const hr8 = new DataPoint({
    id: "sample_holdingRegister_8",
    name: "Sample Holding Register 8",
    unit: "Sample Unit",
    areas: [DataArea.HoldingRegister],
    type: DataType.Float32,
    address: 24,
    accessMode: AccessMode.ReadWrite,
    defaultValue: 0.0,
  });
  const hr9 = new DataPoint({
    id: "sample_holdingRegister_9",
    name: "Sample Holding Register 9",
    unit: "Sample Unit",
    areas: [DataArea.HoldingRegister],
    type: DataType.Float64,
    address: 26,
    accessMode: AccessMode.ReadWrite,
    defaultValue: 0.0,
  });
  const hr10 = new DataPoint({
    id: "sample_holdingRegister_10",
    name: "Sample Holding Register 10",
    unit: "Sample Unit",
    areas: [DataArea.HoldingRegister],
    type: DataType.ASCII,
    address: 30,
    accessMode: AccessMode.ReadWrite,
    defaultValue: "Sample String",
    length: 7,
  });
  unit.addDataPoint(hr1);
  unit.addDataPoint(hr2);
  unit.addDataPoint(hr3);
  unit.addDataPoint(hr4);
  unit.addDataPoint(hr5);
  unit.addDataPoint(hr6);
  unit.addDataPoint(hr7);
  unit.addDataPoint(hr8);
  unit.addDataPoint(hr9);
  unit.addDataPoint(hr10);

  const hr11 = new DataPoint({
    id: "sample_holdingRegister_11",
    name: "Sample Holding Register 11: Voltage L1",
    unit: "V",
    areas: [DataArea.HoldingRegister],
    type: DataType.Float32,
    address: 100,
    accessMode: AccessMode.ReadWrite,
    defaultValue: 230.0,
    simulation: { enabled: true, minValue: 225.0, maxValue: 235.0 },
  });
  const hr12 = new DataPoint({
    id: "sample_holdingRegister_12",
    name: "Sample Holding Register 12: Setpoint P",
    unit: "%",
    areas: [DataArea.HoldingRegister],
    type: DataType.Float32,
    address: 102,
    accessMode: AccessMode.WriteOnly,
    defaultValue: 0.0,
    feedbackDataPoint: "sample_inputRegister_1",
  });

  unit.addDataPoint(hr11);
  unit.addDataPoint(hr12);

  // Input Registers.
  const ir1 = new DataPoint({
    id: "sample_inputRegister_1",
    name: "Sample Input Register 1: Feedback Setpoint P",
    unit: "%",
    areas: [DataArea.InputRegister],
    type: DataType.Float32,
    address: 0,
    accessMode: AccessMode.ReadOnly,
    defaultValue: 0.0,
  });
  const ir2 = new DataPoint({
    id: "sample_inputRegister_2",
    name: "Sample Input Register 2: Can be read with FC03 and FC04",
    unit: "%",
    areas: [DataArea.InputRegister, DataArea.HoldingRegister],
    type: DataType.Float32,
    address: 200,
    accessMode: AccessMode.ReadOnly,
    defaultValue: 0.0,
  });
  unit.addDataPoint(ir1);
  unit.addDataPoint(ir2);

  // Device handling.
  device.addUnit(unit);

  if (deviceManager.addDevice("sample_device.json", device))
    deviceManager.saveDevice("sample_device.json");
}

export default deviceManager;

initializeApiServer();
