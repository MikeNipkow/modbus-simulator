import { ModbusDevice } from '../src/ModbusDevice.js';
import { ModbusUnit } from '../src/ModbusUnit.js';
import { DataPoint } from '../src/DataPoint.js';
import { Endian } from '../src/types/Endian.js';
import { DataArea } from '../src/types/DataArea.js';
import { DataType } from '../src/types/DataType.js';
import { AccessMode } from '../src/types/AccessMode.js';
import { ModbusError } from '../src/types/ModbusError.js';

describe('ModbusDevice', () => {

    describe('Constructor', () => {
        test('should create a valid ModbusDevice with required properties', () => {
            const device = new ModbusDevice('dev1', true, 502, Endian.BigEndian, 'Test Device', 'Test Vendor', 'Test Description');

            expect(device.getId()).toBe('dev1');
            expect(device.isEnabled()).toBe(true);
            expect(device.getPort()).toBe(502);
            expect(device.getEndian()).toBe(Endian.BigEndian);
            expect(device.getName()).toBe('Test Device');
            expect(device.getVendor()).toBe('Test Vendor');
            expect(device.getDescription()).toBe('Test Description');
        });

        test('should throw error when id is empty', () => {
            expect(() => new ModbusDevice('', true, 502, Endian.BigEndian, 'Test', 'Vendor', 'Desc'))
                .toThrow('ModbusDevice must have a valid non-empty ID');
        });

        test('should throw error when id is only whitespace', () => {
            expect(() => new ModbusDevice('   ', true, 502, Endian.BigEndian, 'Test', 'Vendor', 'Desc'))
                .toThrow('ModbusDevice must have a valid non-empty ID');
        });

        test('should throw error when port is less than 1', () => {
            expect(() => new ModbusDevice('dev1', true, 0, Endian.BigEndian, 'Test', 'Vendor', 'Desc'))
                .toThrow('ModbusDevice port must be between 1 and 65535');
        });

        test('should throw error when port is greater than 65535', () => {
            expect(() => new ModbusDevice('dev1', true, 65536, Endian.BigEndian, 'Test', 'Vendor', 'Desc'))
                .toThrow('ModbusDevice port must be between 1 and 65535');
        });

        test('should accept boundary port values', () => {
            const device1 = new ModbusDevice('dev1', true, 1, Endian.BigEndian, 'Test', 'Vendor', 'Desc');
            const device2 = new ModbusDevice('dev2', true, 65535, Endian.BigEndian, 'Test', 'Vendor', 'Desc');
            
            expect(device1.getPort()).toBe(1);
            expect(device2.getPort()).toBe(65535);
        });

        test('should create device with little-endian', () => {
            const device = new ModbusDevice('dev1', false, 502, Endian.LittleEndian, 'Test', 'Vendor', 'Desc');
            
            expect(device.getEndian()).toBe(Endian.LittleEndian);
            expect(device.isEnabled()).toBe(false);
        });
    });

    describe('Unit Management', () => {
        let device: ModbusDevice;

        beforeEach(() => {
            device = new ModbusDevice('dev1', true, 502, Endian.BigEndian, 'Test Device', 'Vendor', 'Description');
        });

        test('should add a unit successfully', () => {
            const unit = new ModbusUnit(1);
            
            expect(device.addUnit(unit)).toBe(true);
            expect(device.hasUnit(1)).toBe(true);
            expect(device.getUnit(1)).toBe(unit);
        });

        test('should not add undefined unit', () => {
            expect(device.addUnit(undefined as any)).toBe(false);
        });

        test('should not add duplicate unit', () => {
            const unit1 = new ModbusUnit(1);
            const unit2 = new ModbusUnit(1);
            
            device.addUnit(unit1);
            expect(device.addUnit(unit2)).toBe(false);
            expect(device.getUnit(1)).toBe(unit1);
        });

        test('should add multiple units with different IDs', () => {
            const unit1 = new ModbusUnit(1);
            const unit2 = new ModbusUnit(2);
            const unit3 = new ModbusUnit(3);
            
            expect(device.addUnit(unit1)).toBe(true);
            expect(device.addUnit(unit2)).toBe(true);
            expect(device.addUnit(unit3)).toBe(true);
            
            expect(device.getAllUnits().length).toBe(3);
        });

        test('should get unit by ID', () => {
            const unit = new ModbusUnit(5);
            device.addUnit(unit);
            
            expect(device.getUnit(5)).toBe(unit);
        });

        test('should return undefined for non-existent unit', () => {
            expect(device.getUnit(99)).toBeUndefined();
        });

        test('should check if unit exists', () => {
            const unit = new ModbusUnit(10);
            device.addUnit(unit);
            
            expect(device.hasUnit(10)).toBe(true);
            expect(device.hasUnit(11)).toBe(false);
        });

        test('should delete unit successfully', () => {
            const unit = new ModbusUnit(1);
            device.addUnit(unit);
            
            expect(device.deleteUnit(1)).toBe(true);
            expect(device.hasUnit(1)).toBe(false);
        });

        test('should return false when deleting non-existent unit', () => {
            expect(device.deleteUnit(99)).toBe(false);
        });

        test('should get all units', () => {
            const unit1 = new ModbusUnit(1);
            const unit2 = new ModbusUnit(2);
            
            device.addUnit(unit1);
            device.addUnit(unit2);
            
            const allUnits = device.getAllUnits();
            expect(allUnits.length).toBe(2);
            expect(allUnits).toContain(unit1);
            expect(allUnits).toContain(unit2);
        });
    });

    describe('Modbus Server', () => {
        let device: ModbusDevice;

        beforeEach(() => {
            device = new ModbusDevice('dev1', true, 5502, Endian.BigEndian, 'Test Device', 'Vendor', 'Description');
        });

        afterEach(async () => {
            if (device.isRunning()) {
                await device.stopServer();
            }
        });

        test('should not be running initially', () => {
            expect(device.isRunning()).toBe(false);
        });

        test('should start server successfully', async () => {
            const result = await device.startServer();
            
            expect(result.success).toBe(true);
            expect(result.message).toContain('Modbus server started');
            expect(device.isRunning()).toBe(true);
            expect(device.isEnabled()).toBe(true);
        });

        test('should fail to start server twice', async () => {
            await device.startServer();
            const result = await device.startServer();
            
            expect(result.success).toBe(false);
            expect(result.message).toContain('already running');
        });

        test('should fail to start server on occupied port', async () => {
            const device2 = new ModbusDevice('dev2', true, 5502, Endian.BigEndian, 'Test Device 2', 'Vendor', 'Desc');
            
            await device.startServer();
            const result = await device2.startServer();
            
            expect(result.success).toBe(false);
            expect(result.message).toContain('already in use');
        });

        test('should stop server successfully', async () => {
            await device.startServer();
            const result = await device.stopServer();
            
            expect(result.success).toBe(true);
            expect(result.message).toContain('stopped successfully');
            expect(device.isRunning()).toBe(false);
            expect(device.isEnabled()).toBe(false);
        });

        test('should fail to stop server when not running', async () => {
            const result = await device.stopServer();
            
            expect(result.success).toBe(false);
            expect(result.message).toContain('already stopped');
        });

        test('should allow restart after stop', async () => {
            await device.startServer();
            await device.stopServer();
            const result = await device.startServer();
            
            expect(result.success).toBe(true);
            expect(device.isRunning()).toBe(true);
        });
    });

    describe('Modbus Read Requests', () => {
        let device: ModbusDevice;
        let unit: ModbusUnit;
        let dp: DataPoint;

        beforeEach(() => {
            device = new ModbusDevice('dev1', true, 5503, Endian.BigEndian, 'Test Device', 'Vendor', 'Description');
            unit = new ModbusUnit(1);
            
            dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int16,
                address: 100,
                accessMode: AccessMode.ReadWrite,
                defaultValue: 1234
            });
            
            unit.addDataPoint(dp);
            device.addUnit(unit);
        });

        test('should read holding register successfully', (done) => {
            device.getHoldingRegister(100, 1, (err, value) => {
                expect(err).toBeNull();
                expect(value).toBe(1234);
                done();
            });
        });

        test('should read input register successfully', (done) => {
            const dp2 = new DataPoint({
                id: 'dp2',
                areas: [DataArea.InputRegister],
                type: DataType.Int16,
                address: 200,
                accessMode: AccessMode.ReadOnly,
                defaultValue: 5678
            });
            unit.addDataPoint(dp2);

            device.getInputRegister(200, 1, (err, value) => {
                expect(err).toBeNull();
                expect(value).toBe(5678);
                done();
            });
        });

        test('should read coil successfully', (done) => {
            const coil = new DataPoint({
                id: 'coil1',
                areas: [DataArea.Coil],
                type: DataType.Bool,
                address: 0,
                accessMode: AccessMode.ReadWrite,
                defaultValue: true
            });
            unit.addDataPoint(coil);

            device.getCoil(0, 1, (err, value) => {
                expect(err).toBeNull();
                expect(value).toBe(true);
                done();
            });
        });

        test('should read discrete input successfully', (done) => {
            const discrete = new DataPoint({
                id: 'discrete1',
                areas: [DataArea.DiscreteInput],
                type: DataType.Bool,
                address: 0,
                accessMode: AccessMode.ReadOnly,
                defaultValue: false
            });
            unit.addDataPoint(discrete);

            device.getDiscreteInput(0, 1, (err, value) => {
                expect(err).toBeNull();
                expect(value).toBe(false);
                done();
            });
        });

        test('should return error for non-existent unit', (done) => {
            device.getHoldingRegister(100, 99, (err, value) => {
                expect(err).toHaveProperty('modbusErrorCode', ModbusError.GATEWAY_TARGET_FAILED_TO_RESPOND);
                expect(value).toBeNull();
                done();
            });
        });

        test('should return error for invalid address', (done) => {
            device.getHoldingRegister(999, 1, (err, value) => {
                expect(err).toHaveProperty('modbusErrorCode', ModbusError.ILLEGAL_DATA_ADDRESS);
                expect(value).toBeNull();
                done();
            });
        });

        test('should read multi-register datapoint with correct offset', (done) => {
            const dp32 = new DataPoint({
                id: 'dp32',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int32,
                address: 300,
                accessMode: AccessMode.ReadWrite,
                defaultValue: 100000
            });
            unit.addDataPoint(dp32);

            device.getHoldingRegister(300, 1, (err, value) => {
                expect(err).toBeNull();
                expect(value).toBe(0x0001); // First register of 100000
                done();
            });
        });

        test('should handle little-endian reads', (done) => {
            const deviceLE = new ModbusDevice('dev2', true, 5504, Endian.LittleEndian, 'LE Device', 'Vendor', 'Desc');
            const unitLE = new ModbusUnit(1);
            const dp32 = new DataPoint({
                id: 'dp32',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int32,
                address: 300,
                accessMode: AccessMode.ReadWrite,
                defaultValue: 100000
            });
            unitLE.addDataPoint(dp32);
            deviceLE.addUnit(unitLE);

            deviceLE.getHoldingRegister(300, 1, (err, value) => {
                expect(err).toBeNull();
                expect(value).toBe(0x86A0); // Little-endian first register
                done();
            });
        });
    });

    describe('Simulation Management', () => {
        let device: ModbusDevice;
        let unit1: ModbusUnit;
        let unit2: ModbusUnit;

        beforeEach(() => {
            device = new ModbusDevice('dev1', true, 5506, Endian.BigEndian, 'Test Device', 'Vendor', 'Description');
            unit1 = new ModbusUnit(1);
            unit2 = new ModbusUnit(2);

            // Add DataPoints with simulation enabled
            const dp1 = new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int16,
                address: 100,
                accessMode: AccessMode.ReadWrite,
                defaultValue: 25,
                simulation: { enabled: true, minValue: 0, maxValue: 100 }
            });

            const dp2 = new DataPoint({
                id: 'dp2',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int16,
                address: 200,
                accessMode: AccessMode.ReadWrite,
                defaultValue: 50,
                simulation: { enabled: false, minValue: 0, maxValue: 100 }
            });

            const dp3 = new DataPoint({
                id: 'dp3',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int16,
                address: 300,
                accessMode: AccessMode.ReadWrite,
                defaultValue: 75,
                simulation: { enabled: true, minValue: 0, maxValue: 100 }
            });

            unit1.addDataPoint(dp1);
            unit1.addDataPoint(dp2);
            unit2.addDataPoint(dp3);

            device.addUnit(unit1);
            device.addUnit(unit2);
        });

        test('should start all simulations regardless of enabled flag', () => {
            device.startAllSimulations();

            const dp1 = unit1.getDataPoint('dp1');
            const dp2 = unit1.getDataPoint('dp2');
            const dp3 = unit2.getDataPoint('dp3');

            expect(dp1?.isSimulationRunning()).toBe(true);
            expect(dp2?.isSimulationRunning()).toBe(true);
            expect(dp3?.isSimulationRunning()).toBe(true);

            device.stopAllSimulations();
        });

        test('should start all simulations with saveState', () => {
            const dp1 = unit1.getDataPoint('dp1');
            const dp2 = unit1.getDataPoint('dp2');

            expect(dp2?.isSimulationEnabled()).toBe(false);

            device.startAllSimulations(true);

            expect(dp1?.isSimulationRunning()).toBe(true);
            expect(dp2?.isSimulationRunning()).toBe(true);
            expect(dp2?.isSimulationEnabled()).toBe(true); // saveState changes enabled flag

            device.stopAllSimulations();
        });

        test('should start only enabled simulations', () => {
            device.startAllEnabledSimulations();

            const dp1 = unit1.getDataPoint('dp1');
            const dp2 = unit1.getDataPoint('dp2');
            const dp3 = unit2.getDataPoint('dp3');

            expect(dp1?.isSimulationRunning()).toBe(true);
            expect(dp2?.isSimulationRunning()).toBe(false); // simulation not enabled
            expect(dp3?.isSimulationRunning()).toBe(true);

            device.stopAllSimulations();
        });

        test('should stop all simulations', () => {
            device.startAllSimulations();

            const dp1 = unit1.getDataPoint('dp1');
            const dp2 = unit1.getDataPoint('dp2');
            const dp3 = unit2.getDataPoint('dp3');

            expect(dp1?.isSimulationRunning()).toBe(true);
            expect(dp2?.isSimulationRunning()).toBe(true);
            expect(dp3?.isSimulationRunning()).toBe(true);

            device.stopAllSimulations();

            expect(dp1?.isSimulationRunning()).toBe(false);
            expect(dp2?.isSimulationRunning()).toBe(false);
            expect(dp3?.isSimulationRunning()).toBe(false);
        });

        test('should stop all simulations with saveState', () => {
            const dp1 = unit1.getDataPoint('dp1');
            
            device.startAllSimulations();
            expect(dp1?.isSimulationRunning()).toBe(true);
            expect(dp1?.isSimulationEnabled()).toBe(true);

            device.stopAllSimulations(true);

            expect(dp1?.isSimulationRunning()).toBe(false);
            expect(dp1?.isSimulationEnabled()).toBe(false); // saveState changes enabled flag
        });

        test('should handle empty device without units', () => {
            const emptyDevice = new ModbusDevice('empty', true, 5507, Endian.BigEndian, 'Empty', 'Vendor', 'Desc');

            expect(() => emptyDevice.startAllSimulations()).not.toThrow();
            expect(() => emptyDevice.startAllEnabledSimulations()).not.toThrow();
            expect(() => emptyDevice.stopAllSimulations()).not.toThrow();
        });

        test('should handle unit without datapoints', () => {
            const emptyDevice = new ModbusDevice('empty', true, 5508, Endian.BigEndian, 'Empty', 'Vendor', 'Desc');
            const emptyUnit = new ModbusUnit(1);
            emptyDevice.addUnit(emptyUnit);

            expect(() => emptyDevice.startAllSimulations()).not.toThrow();
            expect(() => emptyDevice.startAllEnabledSimulations()).not.toThrow();
            expect(() => emptyDevice.stopAllSimulations()).not.toThrow();
        });

        test('should affect simulations across multiple units', () => {
            device.startAllSimulations();

            const dp1 = unit1.getDataPoint('dp1');
            const dp3 = unit2.getDataPoint('dp3');

            expect(dp1?.isSimulationRunning()).toBe(true);
            expect(dp3?.isSimulationRunning()).toBe(true);

            device.stopAllSimulations();

            expect(dp1?.isSimulationRunning()).toBe(false);
            expect(dp3?.isSimulationRunning()).toBe(false);
        });
    });

    describe('Modbus Write Requests', () => {
        let device: ModbusDevice;
        let unit: ModbusUnit;
        let dp: DataPoint;

        beforeEach(() => {
            device = new ModbusDevice('dev1', true, 5505, Endian.BigEndian, 'Test Device', 'Vendor', 'Description');
            unit = new ModbusUnit(1);
            device.addUnit(unit);
        });

        test('should write holding register successfully', (done) => {
            dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int16,
                address: 100,
                accessMode: AccessMode.ReadWrite,
                defaultValue: 0
            });
            
            unit.addDataPoint(dp);

            device.setRegister(100, 5000, 1, (err, value) => {
                expect(err).toBeNull();
                expect(value).toBe(5000);
                expect(dp.getValue()).toBe(5000);
                done();
            });
        });

        test('should write coil successfully', (done) => {
            const coil = new DataPoint({
                id: 'coil1',
                areas: [DataArea.Coil],
                type: DataType.Bool,
                address: 0,
                accessMode: AccessMode.ReadWrite,
                defaultValue: false
            });
            unit.addDataPoint(coil);

            device.setCoil(0, true, 1, (err, value) => {
                expect(err).toBeNull();
                expect(value).toBe(true);
                expect(coil.getValue()).toBe(true);
                done();
            });
        });

        test('should return error for non-existent unit', (done) => {
            dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int16,
                address: 100,
                accessMode: AccessMode.ReadWrite,
                defaultValue: 0
            });
            
            unit.addDataPoint(dp);
            
            device.setRegister(100, 5000, 99, (err, value) => {
                expect(err).toHaveProperty('modbusErrorCode', ModbusError.GATEWAY_TARGET_FAILED_TO_RESPOND);
                expect(value).toBeNull();
                done();
            });
        });

        test('should return error for invalid address', (done) => {
            dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int16,
                address: 100,
                accessMode: AccessMode.ReadWrite,
                defaultValue: 0
            });
            
            unit.addDataPoint(dp);
            
            device.setRegister(999, 5000, 1, (err, value) => {
                expect(err).toHaveProperty('modbusErrorCode', ModbusError.ILLEGAL_DATA_ADDRESS);
                expect(value).toBeNull();
                done();
            });
        });

        test('should return error for read-only datapoint', (done) => {
            dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int16,
                address: 100,
                accessMode: AccessMode.ReadOnly,
                defaultValue: 0
            });
            
            unit.addDataPoint(dp);

            device.setRegister(100, 5000, 1, (err, value) => {
                expect(err).toHaveProperty('modbusErrorCode', ModbusError.ILLEGAL_DATA_VALUE);
                expect(value).toBeNull();
                done();
            });
        });

        test('should write multi-register datapoint with correct offset', (done) => {
            const dp32 = new DataPoint({
                id: 'dp32',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int32,
                address: 100,
                accessMode: AccessMode.ReadWrite,
                defaultValue: 0
            });
            unit.addDataPoint(dp32);

            device.setRegister(100, 0x0001, 1, (err1) => {
                expect(err1).toBeNull();
                
                device.setRegister(101, 0x86A0, 1, (err2) => {
                    expect(err2).toBeNull();
                    expect(dp32.getValue()).toBe(100000);
                    done();
                });
            });
        });

        test('should handle feedback datapoint', (done) => {
            const dpFeedback = new DataPoint({
                id: 'dpFeedback',
                areas: [DataArea.InputRegister],
                type: DataType.Int16,
                address: 200,
                accessMode: AccessMode.ReadOnly,
                defaultValue: 0
            });
            
            const dpWrite = new DataPoint({
                id: 'dpWrite',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int16,
                address: 100,
                accessMode: AccessMode.ReadWrite,
                defaultValue: 0,
                feedbackDataPoint: 'dpFeedback'
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
    });

});
