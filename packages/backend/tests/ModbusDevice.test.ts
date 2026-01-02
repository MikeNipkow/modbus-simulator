import { ModbusDevice } from "../src/classes/ModbusDevice.js";
import { ModbusUnit } from "../src/classes/ModbusUnit.js";
import { DataPoint } from "../src/classes/DataPoint.js";
import { Endian } from "../src/types/enums/Endian.js";
import { DataArea } from "../src/types/enums/DataArea.js";
import { DataType } from "../src/types/enums/DataType.js";
import { AccessMode } from "../src/types/enums/AccessMode.js";
import { ModbusError } from "../src/types/enums/ModbusError.js";

describe("ModbusDevice", () => {
  describe("Constructor Validation", () => {
    test("should create a valid ModbusDevice with required properties", () => {
      const device = new ModbusDevice({
        filename: "test_device.json",
        enabled: true,
        port: 502,
        endian: Endian.BigEndian,
      });

      expect(device.getFilename()).toBe("test_device.json");
      expect(device.isEnabled()).toBe(true);
      expect(device.getPort()).toBe(502);
      expect(device.getName()).toBe("test_device");
    });

    test("should throw error when filename is invalid", () => {
      expect(
        () =>
          new ModbusDevice({
            filename: "",
            enabled: true,
            port: 502,
            endian: Endian.BigEndian,
          }),
      ).toThrow("ModbusDevice must have a valid non-empty filename");
    });

    test("should throw error when filename does not end with .json", () => {
      expect(
        () =>
          new ModbusDevice({
            filename: "test_device",
            enabled: true,
            port: 502,
            endian: Endian.BigEndian,
          }),
      ).toThrow("ModbusDevice filename must end with .json");
    });

    test("should throw error when port is less than 1", () => {
      expect(
        () =>
          new ModbusDevice({
            filename: "test_device.json",
            enabled: true,
            port: 0,
            endian: Endian.BigEndian,
          }),
      ).toThrow("ModbusDevice port must be between 1 and 65535");
    });

    test("should throw error when port is greater than 65535", () => {
      expect(
        () =>
          new ModbusDevice({
            filename: "test_device.json",
            enabled: true,
            port: 65536,
            endian: Endian.BigEndian,
          }),
      ).toThrow("ModbusDevice port must be between 1 and 65535");
    });

    test("should accept boundary port values", () => {
      const device1 = new ModbusDevice({
        filename: "dev1.json",
        enabled: true,
        port: 1,
        endian: Endian.BigEndian,
      });
      const device2 = new ModbusDevice({
        filename: "dev2.json",
        enabled: true,
        port: 65535,
        endian: Endian.BigEndian,
      });

      expect(device1.getPort()).toBe(1);
      expect(device2.getPort()).toBe(65535);
    });

    test("should use optional properties when provided", () => {
      const device = new ModbusDevice({
        filename: "test_device.json",
        enabled: false,
        port: 502,
        endian: Endian.BigEndian,
        name: "Test Device",
        vendor: "Test Vendor",
        description: "Test Description",
      });

      expect(device.getName()).toBe("Test Device");
      expect(device.getVendor()).toBe("Test Vendor");
      expect(device.getDescription()).toBe("Test Description");
    });

    test("should use default values when optional properties are omitted", () => {
      const device = new ModbusDevice({
        filename: "test_device.json",
        enabled: true,
        port: 502,
        endian: Endian.BigEndian,
      });

      expect(device.getName()).toBe("test_device");
      expect(device.getVendor()).toBe("");
      expect(device.getDescription()).toBe("");
    });

    test("should have BigEndian as default endian", () => {
      const device = new ModbusDevice({
        filename: "test_device.json",
        enabled: true,
        port: 502,
        endian: Endian.BigEndian,
      });

      expect(device.getEndian()).toBe(Endian.BigEndian);
    });
  });

  describe("Unit Management", () => {
    let device: ModbusDevice;

    beforeEach(() => {
      device = new ModbusDevice({
        filename: "test_device.json",
        enabled: true,
        port: 502,
        endian: Endian.BigEndian,
      });
    });

    test("should add a unit successfully", () => {
      const unit = new ModbusUnit({ unitId: 1 });

      expect(device.addUnit(unit)).toBe(true);
      expect(device.hasUnit(1)).toBe(true);
      expect(device.getUnit(1)).toBe(unit);
    });

    test("should not add undefined unit", () => {
      expect(device.addUnit(undefined as any)).toBe(false);
    });

    test("should not add duplicate unit", () => {
      const unit1 = new ModbusUnit({ unitId: 1 });
      const unit2 = new ModbusUnit({ unitId: 1 });

      device.addUnit(unit1);
      expect(device.addUnit(unit2)).toBe(false);
      expect(device.getUnit(1)).toBe(unit1);
    });

    test("should add multiple units with different IDs", () => {
      const unit1 = new ModbusUnit({ unitId: 1 });
      const unit2 = new ModbusUnit({ unitId: 2 });
      const unit3 = new ModbusUnit({ unitId: 3 });

      expect(device.addUnit(unit1)).toBe(true);
      expect(device.addUnit(unit2)).toBe(true);
      expect(device.addUnit(unit3)).toBe(true);

      expect(device.getAllUnits().length).toBe(3);
    });

    test("should get unit by ID", () => {
      const unit = new ModbusUnit({ unitId: 5 });
      device.addUnit(unit);

      expect(device.getUnit(5)).toBe(unit);
    });

    test("should return undefined for non-existent unit", () => {
      expect(device.getUnit(99)).toBeUndefined();
    });

    test("should check if unit exists", () => {
      const unit = new ModbusUnit({ unitId: 10 });
      device.addUnit(unit);

      expect(device.hasUnit(10)).toBe(true);
      expect(device.hasUnit(11)).toBe(false);
    });

    test("should delete unit successfully", () => {
      const unit = new ModbusUnit({ unitId: 1 });
      device.addUnit(unit);

      expect(device.deleteUnit(1)).toBe(true);
      expect(device.hasUnit(1)).toBe(false);
    });

    test("should return false when deleting non-existent unit", () => {
      expect(device.deleteUnit(99)).toBe(false);
    });

    test("should get all units", () => {
      const unit1 = new ModbusUnit({ unitId: 1 });
      const unit2 = new ModbusUnit({ unitId: 2 });

      device.addUnit(unit1);
      device.addUnit(unit2);

      const allUnits = device.getAllUnits();
      expect(allUnits.length).toBe(2);
      expect(allUnits).toContain(unit1);
      expect(allUnits).toContain(unit2);
    });
  });

  describe("Simulation Management", () => {
    let device: ModbusDevice;
    let unit: ModbusUnit;

    beforeEach(() => {
      device = new ModbusDevice({
        filename: "test_device.json",
        enabled: true,
        port: 5502,
        endian: Endian.BigEndian,
      });
      unit = new ModbusUnit({ unitId: 1 });
      device.addUnit(unit);
    });

    test("should start all enabled simulations", () => {
      const dp1 = new DataPoint({
        id: "dp1",
        areas: [DataArea.HoldingRegister],
        type: DataType.Int16,
        address: 100,
        accessMode: AccessMode.ReadWrite,
        simulation: { enabled: true, minValue: 0, maxValue: 100 },
      });
      const dp2 = new DataPoint({
        id: "dp2",
        areas: [DataArea.HoldingRegister],
        type: DataType.Int16,
        address: 200,
        accessMode: AccessMode.ReadWrite,
        simulation: { enabled: false, minValue: 0, maxValue: 100 },
      });

      unit.addDataPoint(dp1);
      unit.addDataPoint(dp2);

      device.startAllEnabledSimulations();

      expect(dp1.isSimulationRunning()).toBe(true);
      expect(dp2.isSimulationRunning()).toBe(false);

      device.stopAllSimulations();
    });

    test("should stop all simulations", () => {
      const dp = new DataPoint({
        id: "dp1",
        areas: [DataArea.HoldingRegister],
        type: DataType.Int16,
        address: 100,
        accessMode: AccessMode.ReadWrite,
        simulation: { enabled: true, minValue: 0, maxValue: 100 },
      });

      unit.addDataPoint(dp);
      dp.startSimulation();

      expect(dp.isSimulationRunning()).toBe(true);

      device.stopAllSimulations();

      expect(dp.isSimulationRunning()).toBe(false);
    });

    test("should handle multiple units with simulations", () => {
      const unit2 = new ModbusUnit({ unitId: 2 });
      device.addUnit(unit2);

      const dp1 = new DataPoint({
        id: "dp1",
        areas: [DataArea.HoldingRegister],
        type: DataType.Int16,
        address: 100,
        accessMode: AccessMode.ReadWrite,
        simulation: { enabled: true, minValue: 0, maxValue: 100 },
      });
      const dp2 = new DataPoint({
        id: "dp2",
        areas: [DataArea.HoldingRegister],
        type: DataType.Int16,
        address: 200,
        accessMode: AccessMode.ReadWrite,
        simulation: { enabled: true, minValue: 0, maxValue: 100 },
      });

      unit.addDataPoint(dp1);
      unit2.addDataPoint(dp2);

      device.startAllEnabledSimulations();

      expect(dp1.isSimulationRunning()).toBe(true);
      expect(dp2.isSimulationRunning()).toBe(true);

      device.stopAllSimulations();
    });
  });

  describe("Modbus Server Lifecycle", () => {
    let device: ModbusDevice;

    beforeEach(() => {
      device = new ModbusDevice({
        filename: "test_device.json",
        enabled: true,
        port: 5503,
        endian: Endian.BigEndian,
      });
    });

    afterEach(async () => {
      if (device.isRunning()) {
        await device.stopServer();
      }
    });

    test("should not be running initially", () => {
      expect(device.isRunning()).toBe(false);
    });

    test("should start server successfully", async () => {
      const result = await device.startServer();

      expect(result.success).toBe(true);
      expect(result.message).toContain("Modbus server started");
      expect(device.isRunning()).toBe(true);
    });

    test("should fail to start server twice", async () => {
      await device.startServer();
      const result = await device.startServer();

      expect(result.success).toBe(false);
      expect(result.message).toContain("already running");
    });

    test("should stop server successfully", async () => {
      await device.startServer();
      const result = await device.stopServer();

      expect(result.success).toBe(true);
      expect(result.message).toContain("stopped successfully");
      expect(device.isRunning()).toBe(false);
    });

    test("should fail to stop server when not running", async () => {
      const result = await device.stopServer();

      expect(result.success).toBe(false);
      expect(result.message).toContain("already stopped");
    });

    test("should allow restart after stop", async () => {
      await device.startServer();
      await device.stopServer();
      const result = await device.startServer();

      expect(result.success).toBe(true);
      expect(device.isRunning()).toBe(true);
    });

    test("should fail to start on occupied port", async () => {
      const device2 = new ModbusDevice({
        filename: "test_device2.json",
        enabled: true,
        port: 5503,
        endian: Endian.BigEndian,
      });

      await device.startServer();
      const result = await device2.startServer();

      expect(result.success).toBe(false);
      expect(result.message).toContain("already in use");
    });
  });

  describe("Enable/Disable Server", () => {
    let device: ModbusDevice;

    beforeEach(() => {
      device = new ModbusDevice({
        filename: "test_device.json",
        enabled: false,
        port: 5504,
        endian: Endian.BigEndian,
      });
    });

    afterEach(async () => {
      if (device.isRunning()) {
        await device.stopServer();
      }
    });

    test("should enable server and start it", async () => {
      const result = await device.enableServer();

      expect(result.success).toBe(true);
      expect(device.isEnabled()).toBe(true);
      expect(device.isRunning()).toBe(true);
    });

    test("should fail to enable already enabled server", async () => {
      await device.enableServer();
      const result = await device.enableServer();

      expect(result.success).toBe(false);
      expect(result.message).toContain("already running");
    });

    test("should disable server and stop it", async () => {
      await device.enableServer();
      const result = await device.disableServer();

      expect(result.success).toBe(true);
      expect(device.isEnabled()).toBe(false);
      expect(device.isRunning()).toBe(false);
    });

    test("should fail to disable already disabled server", async () => {
      const result = await device.disableServer();

      expect(result.success).toBe(false);
      expect(result.message).toContain("already stopped");
    });
  });

  describe("Modbus Read Requests", () => {
    let device: ModbusDevice;
    let unit: ModbusUnit;

    beforeEach(() => {
      device = new ModbusDevice({
        filename: "test_device.json",
        enabled: true,
        port: 5505,
        endian: Endian.BigEndian,
      });
      unit = new ModbusUnit({ unitId: 1 });
      device.addUnit(unit);
    });

    test("should read holding register successfully", (done) => {
      const dp = new DataPoint({
        id: "dp1",
        areas: [DataArea.HoldingRegister],
        type: DataType.Int16,
        address: 100,
        accessMode: AccessMode.ReadWrite,
        defaultValue: 1234,
      });
      unit.addDataPoint(dp);

      device.getHoldingRegister(100, 1, (err, value) => {
        expect(err).toBeNull();
        expect(value).toBe(1234);
        done();
      });
    });

    test("should read input register successfully", (done) => {
      const dp = new DataPoint({
        id: "dp1",
        areas: [DataArea.InputRegister],
        type: DataType.Int16,
        address: 200,
        accessMode: AccessMode.ReadOnly,
        defaultValue: 5678,
      });
      unit.addDataPoint(dp);

      device.getInputRegister(200, 1, (err, value) => {
        expect(err).toBeNull();
        expect(value).toBe(5678);
        done();
      });
    });

    test("should read coil successfully", (done) => {
      const coil = new DataPoint({
        id: "coil1",
        areas: [DataArea.Coil],
        type: DataType.Bool,
        address: 0,
        accessMode: AccessMode.ReadWrite,
        defaultValue: true,
      });
      unit.addDataPoint(coil);

      device.getCoil(0, 1, (err, value) => {
        expect(err).toBeNull();
        expect(value).toBe(true);
        done();
      });
    });

    test("should read discrete input successfully", (done) => {
      const discrete = new DataPoint({
        id: "discrete1",
        areas: [DataArea.DiscreteInput],
        type: DataType.Bool,
        address: 0,
        accessMode: AccessMode.ReadOnly,
        defaultValue: false,
      });
      unit.addDataPoint(discrete);

      device.getDiscreteInput(0, 1, (err, value) => {
        expect(err).toBeNull();
        expect(value).toBe(false);
        done();
      });
    });

    test("should return error for non-existent unit", (done) => {
      const dp = new DataPoint({
        id: "dp1",
        areas: [DataArea.HoldingRegister],
        type: DataType.Int16,
        address: 100,
        accessMode: AccessMode.ReadWrite,
      });
      unit.addDataPoint(dp);

      device.getHoldingRegister(100, 99, (err, value) => {
        expect(err).toHaveProperty(
          "modbusErrorCode",
          ModbusError.GATEWAY_TARGET_FAILED_TO_RESPOND,
        );
        done();
      });
    });

    test("should return error for invalid address", (done) => {
      const dp = new DataPoint({
        id: "dp1",
        areas: [DataArea.HoldingRegister],
        type: DataType.Int16,
        address: 100,
        accessMode: AccessMode.ReadWrite,
      });
      unit.addDataPoint(dp);

      device.getHoldingRegister(999, 1, (err, value) => {
        expect(err).toHaveProperty(
          "modbusErrorCode",
          ModbusError.ILLEGAL_DATA_ADDRESS,
        );
        done();
      });
    });

    test("should return error for write-only datapoint", (done) => {
      const dp = new DataPoint({
        id: "dp1",
        areas: [DataArea.HoldingRegister],
        type: DataType.Int16,
        address: 100,
        accessMode: AccessMode.WriteOnly,
        defaultValue: 1234,
      });
      unit.addDataPoint(dp);

      device.getHoldingRegister(100, 1, (err, value) => {
        expect(err).toHaveProperty(
          "modbusErrorCode",
          ModbusError.ILLEGAL_DATA_ADDRESS,
        );
        done();
      });
    });

    test("should read multi-register datapoint with offset", (done) => {
      const dp = new DataPoint({
        id: "dp32",
        areas: [DataArea.HoldingRegister],
        type: DataType.Int32,
        address: 300,
        accessMode: AccessMode.ReadWrite,
        defaultValue: 100000,
      });
      unit.addDataPoint(dp);

      device.getHoldingRegister(300, 1, (err, value) => {
        expect(err).toBeNull();
        expect(value).toBe(0x0001); // High word in big-endian
        done();
      });
    });
  });

  describe("Modbus Write Requests", () => {
    let device: ModbusDevice;
    let unit: ModbusUnit;

    beforeEach(() => {
      device = new ModbusDevice({
        filename: "test_device.json",
        enabled: true,
        port: 5506,
        endian: Endian.BigEndian,
      });
      unit = new ModbusUnit({ unitId: 1 });
      device.addUnit(unit);
    });

    test("should write holding register successfully", (done) => {
      const dp = new DataPoint({
        id: "dp1",
        areas: [DataArea.HoldingRegister],
        type: DataType.Int16,
        address: 100,
        accessMode: AccessMode.ReadWrite,
        defaultValue: 0,
      });
      unit.addDataPoint(dp);

      device.setRegister(100, 5000, 1, (err, value) => {
        expect(err).toBeNull();
        expect(value).toBe(5000);
        expect(dp.getValue()).toBe(5000);
        done();
      });
    });

    test("should write coil successfully", (done) => {
      const coil = new DataPoint({
        id: "coil1",
        areas: [DataArea.Coil],
        type: DataType.Bool,
        address: 0,
        accessMode: AccessMode.ReadWrite,
        defaultValue: false,
      });
      unit.addDataPoint(coil);

      device.setCoil(0, true, 1, (err, value) => {
        expect(err).toBeNull();
        expect(value).toBe(true);
        expect(coil.getValue()).toBe(true);
        done();
      });
    });

    test("should return error for non-existent unit", (done) => {
      const dp = new DataPoint({
        id: "dp1",
        areas: [DataArea.HoldingRegister],
        type: DataType.Int16,
        address: 100,
        accessMode: AccessMode.ReadWrite,
      });
      unit.addDataPoint(dp);

      device.setRegister(100, 5000, 99, (err, value) => {
        expect(err).toHaveProperty(
          "modbusErrorCode",
          ModbusError.GATEWAY_TARGET_FAILED_TO_RESPOND,
        );
        done();
      });
    });

    test("should return error for invalid address", (done) => {
      const dp = new DataPoint({
        id: "dp1",
        areas: [DataArea.HoldingRegister],
        type: DataType.Int16,
        address: 100,
        accessMode: AccessMode.ReadWrite,
      });
      unit.addDataPoint(dp);

      device.setRegister(999, 5000, 1, (err, value) => {
        expect(err).toHaveProperty(
          "modbusErrorCode",
          ModbusError.ILLEGAL_DATA_ADDRESS,
        );
        done();
      });
    });

    test("should return error for read-only datapoint", (done) => {
      const dp = new DataPoint({
        id: "dp1",
        areas: [DataArea.HoldingRegister],
        type: DataType.Int16,
        address: 100,
        accessMode: AccessMode.ReadOnly,
        defaultValue: 0,
      });
      unit.addDataPoint(dp);

      device.setRegister(100, 5000, 1, (err, value) => {
        expect(err).toHaveProperty(
          "modbusErrorCode",
          ModbusError.ILLEGAL_DATA_VALUE,
        );
        done();
      });
    });

    test("should write multi-register datapoint with offset", (done) => {
      const dp = new DataPoint({
        id: "dp32",
        areas: [DataArea.HoldingRegister],
        type: DataType.Int32,
        address: 100,
        accessMode: AccessMode.ReadWrite,
        defaultValue: 0,
      });
      unit.addDataPoint(dp);

      device.setRegister(100, 0x0001, 1, (err1) => {
        expect(err1).toBeNull();

        device.setRegister(101, 0x86a0, 1, (err2) => {
          expect(err2).toBeNull();
          expect(dp.getValue()).toBe(100000);
          done();
        });
      });
    });

    test("should handle feedback datapoint", (done) => {
      const dpFeedback = new DataPoint({
        id: "dpFeedback",
        areas: [DataArea.InputRegister],
        type: DataType.Int16,
        address: 200,
        accessMode: AccessMode.ReadOnly,
        defaultValue: 0,
      });

      const dpWrite = new DataPoint({
        id: "dpWrite",
        areas: [DataArea.HoldingRegister],
        type: DataType.Int16,
        address: 100,
        accessMode: AccessMode.ReadWrite,
        defaultValue: 0,
        feedbackDataPoint: "dpFeedback",
      });

      unit.addDataPoint(dpFeedback);
      unit.addDataPoint(dpWrite);

      device.setRegister(100, 7777, 1, (err) => {
        expect(err).toBeNull();
        expect(dpWrite.getValue()).toBe(7777);
        expect(dpFeedback.getValue()).toBe(7777);
        done();
      });
    });

    test("should handle feedback datapoint with multi-register type", (done) => {
      const dpFeedback = new DataPoint({
        id: "dpFeedback",
        areas: [DataArea.InputRegister],
        type: DataType.Int32,
        address: 200,
        accessMode: AccessMode.ReadOnly,
        defaultValue: 0,
      });

      const dpWrite = new DataPoint({
        id: "dpWrite",
        areas: [DataArea.HoldingRegister],
        type: DataType.Int32,
        address: 100,
        accessMode: AccessMode.ReadWrite,
        defaultValue: 0,
        feedbackDataPoint: "dpFeedback",
      });

      unit.addDataPoint(dpFeedback);
      unit.addDataPoint(dpWrite);

      device.setRegister(100, 0x0001, 1, (err1) => {
        expect(err1).toBeNull();

        device.setRegister(101, 0x86a0, 1, (err2) => {
          expect(err2).toBeNull();
          expect(dpWrite.getValue()).toBe(100000);
          expect(dpFeedback.getValue()).toBe(100000);
          done();
        });
      });
    });
  });
});
