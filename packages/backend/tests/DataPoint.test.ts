
import { DataPoint } from '../src/DataPoint.js';
import { AccessMode } from '../src/types/enums/AccessMode.js';
import { DataArea } from '../src/types/enums/DataArea.js';
import { DataType } from '../src/types/enums/DataType.js';
import { Endian } from '../src/types/enums/Endian.js';
    
describe('DataPoint', () => {

    describe('Constructor', () => {
        test('should create a valid DataPoint with required properties', () => {
            const dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int16,
                address: 100,
                accessMode: AccessMode.ReadWrite
            });

            expect(dp.getId()).toBe('dp1');
            expect(dp.getAreas()).toEqual([DataArea.HoldingRegister]);
            expect(dp.getType()).toBe(DataType.Int16);
            expect(dp.getAddress()).toBe(100);
            expect(dp.getAccessMode()).toBe(AccessMode.ReadWrite);
            expect(dp.getLength()).toBe(1);
        });

        test('should throw error when id is missing', () => {
            expect(() => new DataPoint({
                id: '',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int16,
                address: 100,
                accessMode: AccessMode.ReadWrite
            })).toThrow('DataPoint must have an id');
        });

        test('should throw error when areas are empty', () => {
            expect(() => new DataPoint({
                id: 'dp1',
                areas: [],
                type: DataType.Int16,
                address: 100,
                accessMode: AccessMode.ReadWrite
            })).toThrow('DataPoint must have at least one DataArea');
        });

        test('should throw error when address is invalid', () => {
            expect(() => new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int16,
                address: -1,
                accessMode: AccessMode.ReadWrite
            })).toThrow('DataPoint must have a valid address');

            expect(() => new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int16,
                address: 65536,
                accessMode: AccessMode.ReadWrite
            })).toThrow('DataPoint must have a valid address');
        });

        test('should throw error for ASCII type without length', () => {
            expect(() => new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.ASCII,
                address: 100,
                accessMode: AccessMode.ReadWrite
            })).toThrow('DataPoint of type String must have a length defined');
        });

        test('should set default values correctly', () => {
            const dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int16,
                address: 100,
                accessMode: AccessMode.ReadWrite
            });

            expect(dp.getName()).toBe('');
            expect(dp.getUnit()).toBe('');
            expect(dp.getSimulation().enabled).toBe(false);
        });
    });

    describe('Value Management', () => {
        test('should get and set value for Bool', () => {
            const dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.Coil],
                type: DataType.Bool,
                address: 0,
                accessMode: AccessMode.ReadWrite,
                defaultValue: false
            });

            expect(dp.getValue()).toBe(false);
            expect(dp.setValue(true)).toBe(true);
            expect(dp.getValue()).toBe(true);
        });

        test('should get and set value for Byte', () => {
            const dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.Byte,
                address: 100,
                accessMode: AccessMode.ReadWrite,
                defaultValue: 128
            });

            expect(dp.getValue()).toBe(128);
            expect(dp.setValue(255)).toBe(true);
            expect(dp.getValue()).toBe(255);
        });

        test('should get and set value for Int16', () => {
            const dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int16,
                address: 100,
                accessMode: AccessMode.ReadWrite,
                defaultValue: -1000
            });

            expect(dp.getValue()).toBe(-1000);
            expect(dp.setValue(1000)).toBe(true);
            expect(dp.getValue()).toBe(1000);
        });

        test('should get and set value for UInt16', () => {
            const dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.UInt16,
                address: 100,
                accessMode: AccessMode.ReadWrite,
                defaultValue: 30000
            });

            expect(dp.getValue()).toBe(30000);
            expect(dp.setValue(50000)).toBe(true);
            expect(dp.getValue()).toBe(50000);
        });

        test('should get and set value for Int32', () => {
            const dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int32,
                address: 100,
                accessMode: AccessMode.ReadWrite,
                defaultValue: -100000
            });

            expect(dp.getValue()).toBe(-100000);
            expect(dp.setValue(100000)).toBe(true);
            expect(dp.getValue()).toBe(100000);
        });

        test('should get and set value for UInt32', () => {
            const dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.UInt32,
                address: 100,
                accessMode: AccessMode.ReadWrite,
                defaultValue: 3000000
            });

            expect(dp.getValue()).toBe(3000000);
            expect(dp.setValue(4000000)).toBe(true);
            expect(dp.getValue()).toBe(4000000);
        });

        test('should get and set value for Float32', () => {
            const dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.Float32,
                address: 100,
                accessMode: AccessMode.ReadWrite,
                defaultValue: 123.45
            });

            expect(dp.getValue()).toBeCloseTo(123.45);
            expect(dp.setValue(678.90)).toBe(true);
            expect(dp.getValue()).toBeCloseTo(678.90);
        });

        test('should get and set value for Float64', () => {
            const dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.Float64,
                address: 100,
                accessMode: AccessMode.ReadWrite,
                defaultValue: 123.456789
            });

            expect(dp.getValue()).toBeCloseTo(123.456789);
            expect(dp.setValue(987.654321)).toBe(true);
            expect(dp.getValue()).toBeCloseTo(987.654321);
        });

        test('should get and set value for ASCII', () => {
            const dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.ASCII,
                address: 100,
                accessMode: AccessMode.ReadWrite,
                length: 10,
                defaultValue: 'HELLO'
            });

            expect(dp.getValue()).toBe('HELLO');
            expect(dp.setValue('WORLD')).toBe(true);
            expect(dp.getValue()).toBe('WORLD');
        });

        test('should not set value on read-only DataPoint without force', () => {
            const dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.InputRegister],
                type: DataType.Int16,
                address: 100,
                accessMode: AccessMode.ReadOnly,
                defaultValue: 42
            });

            expect(dp.setValue(100)).toBe(false);
            expect(dp.getValue()).toBe(42);
        });

        test('should set value on read-only DataPoint with force', () => {
            const dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.InputRegister],
                type: DataType.Int16,
                address: 100,
                accessMode: AccessMode.ReadOnly,
                defaultValue: 42
            });

            expect(dp.setValue(100, true)).toBe(true);
            expect(dp.getValue()).toBe(100);
        });
    });

    describe('Register Value Management', () => {
        test('should get and set register value for Bool', () => {
            const dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.Coil],
                type: DataType.Bool,
                address: 0,
                accessMode: AccessMode.ReadWrite,
                defaultValue: false
            });

            expect(dp.getRegisterValue()).toBe(false);
            expect(dp.setRegisterValue(1)).toBe(true);
            expect(dp.getRegisterValue()).toBe(1);
        });

        test('should get and set register value for Byte', () => {
            const dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.Byte,
                address: 100,
                accessMode: AccessMode.ReadWrite,
                defaultValue: 128
            });

            expect(dp.getRegisterValue()).toBe(128);
            expect(dp.setRegisterValue(255)).toBe(true);
            expect(dp.getRegisterValue()).toBe(255);
        });

        test('should get and set register value for Int16', () => {
            const dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int16,
                address: 100,
                accessMode: AccessMode.ReadWrite,
                defaultValue: -1000
            });

            expect(dp.getRegisterValue()).toBe(-1000);
            expect(dp.setRegisterValue(1000)).toBe(true);
            expect(dp.getRegisterValue()).toBe(1000);
        });

        test('should get and set register value for UInt16', () => {
            const dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.UInt16,
                address: 100,
                accessMode: AccessMode.ReadWrite,
                defaultValue: 30000
            });

            expect(dp.getRegisterValue()).toBe(30000);
            expect(dp.setRegisterValue(50000)).toBe(true);
            expect(dp.getRegisterValue()).toBe(50000);
        });

        test('should get and set register values for Int32 (big-endian)', () => {
            const dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int32,
                address: 100,
                accessMode: AccessMode.ReadWrite,
                defaultValue: -100000
            });

            // -100000 = 0xFFFE7960
            expect(dp.getRegisterValue(0, Endian.BigEndian)).toBe(0xFFFE);
            expect(dp.getRegisterValue(1, Endian.BigEndian)).toBe(0x7960);

            // Set new value: 100000 = 0x000186A0
            expect(dp.setRegisterValue(0x0001, false, 0, Endian.BigEndian)).toBe(true);
            expect(dp.setRegisterValue(0x86A0, false, 1, Endian.BigEndian)).toBe(true);
            expect(dp.getValue()).toBe(100000);
        });

        test('should get and set register values for Int32 (little-endian)', () => {
            const dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int32,
                address: 100,
                accessMode: AccessMode.ReadWrite,
                defaultValue: -100000
            });

            // -100000 = 0xFFFE7960 (little-endian reversed)
            expect(dp.getRegisterValue(1, Endian.LittleEndian)).toBe(0xFFFE);
            expect(dp.getRegisterValue(0, Endian.LittleEndian)).toBe(0x7960);

            // Set new value: 100000 = 0x000186A0
            expect(dp.setRegisterValue(0x0001, false, 1, Endian.LittleEndian)).toBe(true);
            expect(dp.setRegisterValue(0x86A0, false, 0, Endian.LittleEndian)).toBe(true);
            expect(dp.getValue()).toBe(100000);
        });

        test('should get and set register values for UInt32 (big-endian)', () => {
            const dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.UInt32,
                address: 100,
                accessMode: AccessMode.ReadWrite,
                defaultValue: 3000000
            });

            // 3000000 = 0x002DC6C0
            expect(dp.getRegisterValue(0, Endian.BigEndian)).toBe(0x002D);
            expect(dp.getRegisterValue(1, Endian.BigEndian)).toBe(0xC6C0);
        });

        test('should get and set register values for Float32 (big-endian)', () => {
            const dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.Float32,
                address: 100,
                accessMode: AccessMode.ReadWrite,
                defaultValue: 123.45
            });

            // 123.45 ≈ 0x42F6E666
            expect(dp.getRegisterValue(0, Endian.BigEndian)).toBe(0x42F6);
            expect(dp.getRegisterValue(1, Endian.BigEndian)).toBe(0xE666);

            // Set new value via registers
            expect(dp.setRegisterValue(0x4348, false, 0, Endian.BigEndian)).toBe(true);
            expect(dp.setRegisterValue(0x0000, false, 1, Endian.BigEndian)).toBe(true);
            expect(dp.getValue()).toBeCloseTo(200.0, 1);
        });

        test('should get and set register values for Float32 (little-endian)', () => {
            const dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.Float32,
                address: 100,
                accessMode: AccessMode.ReadWrite,
                defaultValue: 123.45
            });

            expect(dp.getRegisterValue(1, Endian.LittleEndian)).toBe(0x42F6);
            expect(dp.getRegisterValue(0, Endian.LittleEndian)).toBe(0xE666);
        });

        test('should get and set register values for Float64 (big-endian)', () => {
            const dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.Float64,
                address: 100,
                accessMode: AccessMode.ReadWrite,
                defaultValue: 123.45
            });

            // 123.45 ≈ 0x405EDCCCCCCCCCCD
            expect(dp.getRegisterValue(0, Endian.BigEndian)).toBe(0x405E);
            expect(dp.getRegisterValue(1, Endian.BigEndian)).toBe(0xDCCC);
            expect(dp.getRegisterValue(2, Endian.BigEndian)).toBe(0xCCCC);
            expect(dp.getRegisterValue(3, Endian.BigEndian)).toBe(0xCCCD);
        });

        test('should get and set register values for Float64 (little-endian)', () => {
            const dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.Float64,
                address: 100,
                accessMode: AccessMode.ReadWrite,
                defaultValue: 123.45
            });

            expect(dp.getRegisterValue(3, Endian.LittleEndian)).toBe(0x405E);
            expect(dp.getRegisterValue(2, Endian.LittleEndian)).toBe(0xDCCC);
            expect(dp.getRegisterValue(1, Endian.LittleEndian)).toBe(0xCCCC);
            expect(dp.getRegisterValue(0, Endian.LittleEndian)).toBe(0xCCCD);
        });

        test('should throw error for invalid offset', () => {
            const dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int32,
                address: 100,
                accessMode: AccessMode.ReadWrite
            });

            expect(() => dp.setRegisterValue(1000, false, 5)).toThrow('Invalid offset 5 for datapoint dp1');
        });

        test('should not set register value on read-only without force', () => {
            const dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.InputRegister],
                type: DataType.Int16,
                address: 100,
                accessMode: AccessMode.ReadOnly,
                defaultValue: 42
            });

            expect(dp.setRegisterValue(100)).toBe(false);
            expect(dp.getRegisterValue()).toBe(42);
        });

        test('should set register value on read-only with force', () => {
            const dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.InputRegister],
                type: DataType.Int16,
                address: 100,
                accessMode: AccessMode.ReadOnly,
                defaultValue: 42
            });

            expect(dp.setRegisterValue(100, true)).toBe(true);
            expect(dp.getRegisterValue()).toBe(100);
        });
    });

    describe('Data Areas', () => {
        test('should add data area', () => {
            const dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int16,
                address: 100,
                accessMode: AccessMode.ReadWrite
            });

            dp.addDataArea(DataArea.InputRegister);
            expect(dp.getAreas()).toContain(DataArea.InputRegister);
            expect(dp.hasDataArea(DataArea.InputRegister)).toBe(true);
        });

        test('should not add duplicate data area', () => {
            const dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int16,
                address: 100,
                accessMode: AccessMode.ReadWrite
            });

            dp.addDataArea(DataArea.HoldingRegister);
            expect(dp.getAreas().filter(a => a === DataArea.HoldingRegister).length).toBe(1);
        });

        test('should throw error when adding incompatible area', () => {
            const dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int16,
                address: 100,
                accessMode: AccessMode.ReadWrite
            });

            expect(() => dp.addDataArea(DataArea.Coil)).toThrow('DataPoint of type Int16 cannot have area Coil');
        });

        test('should delete data area', () => {
            const dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister, DataArea.InputRegister],
                type: DataType.Int16,
                address: 100,
                accessMode: AccessMode.ReadWrite
            });

            dp.deleteDataArea(DataArea.InputRegister);
            expect(dp.hasDataArea(DataArea.InputRegister)).toBe(false);
        });

        test('should throw error when deleting last area', () => {
            const dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int16,
                address: 100,
                accessMode: AccessMode.ReadWrite
            });

            expect(() => dp.deleteDataArea(DataArea.HoldingRegister)).toThrow('DataPoint must have at least one DataArea');
        });
    });

    describe('Simulation', () => {
        test('should start simulation', () => {
            const dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int16,
                address: 100,
                accessMode: AccessMode.ReadWrite,
                simulation: { enabled: false, minValue: 0, maxValue: 100 }
            });

            expect(dp.startSimulation(true, 100)).toBe(true);
            expect(dp.isSimulationRunning()).toBe(true);
            expect(dp.getSimulation().enabled).toBe(true);

            dp.stopSimulation();
        });

        test('should not start simulation twice', () => {
            const dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int16,
                address: 100,
                accessMode: AccessMode.ReadWrite
            });

            dp.startSimulation(true, 100);
            expect(dp.startSimulation(true, 100)).toBe(false);

            dp.stopSimulation();
        });

        test('should stop simulation', () => {
            const dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int16,
                address: 100,
                accessMode: AccessMode.ReadWrite
            });

            dp.startSimulation(true, 100);
            expect(dp.stopSimulation()).toBe(true);
            expect(dp.isSimulationRunning()).toBe(false);
            expect(dp.getSimulation().enabled).toBe(false);
        });

        test('should not stop simulation if not running', () => {
            const dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int16,
                address: 100,
                accessMode: AccessMode.ReadWrite
            });

            expect(dp.stopSimulation()).toBe(false);
        });

        test('should not start simulation for ASCII type', () => {
            const dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.ASCII,
                address: 100,
                accessMode: AccessMode.ReadWrite,
                length: 10
            });

            expect(dp.startSimulation()).toBe(false);
        });
    });

    describe('Access Control', () => {
        test('should have read access for ReadOnly', () => {
            const dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.InputRegister],
                type: DataType.Int16,
                address: 100,
                accessMode: AccessMode.ReadOnly
            });

            expect(dp.hasReadAccess()).toBe(true);
            expect(dp.hasWriteAccess()).toBe(false);
        });

        test('should have write access for WriteOnly', () => {
            const dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int16,
                address: 100,
                accessMode: AccessMode.WriteOnly
            });

            expect(dp.hasReadAccess()).toBe(false);
            expect(dp.hasWriteAccess()).toBe(true);
        });

        test('should have both accesses for ReadWrite', () => {
            const dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int16,
                address: 100,
                accessMode: AccessMode.ReadWrite
            });

            expect(dp.hasReadAccess()).toBe(true);
            expect(dp.hasWriteAccess()).toBe(true);
        });
    });

    describe('Occupied Addresses', () => {
        test('should return single address for single-register type', () => {
            const dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int16,
                address: 100,
                accessMode: AccessMode.ReadWrite
            });

            expect(dp.getOccupiedAddresses()).toEqual([100]);
        });

        test('should return multiple addresses for multi-register type', () => {
            const dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int32,
                address: 100,
                accessMode: AccessMode.ReadWrite
            });

            expect(dp.getOccupiedAddresses()).toEqual([100, 101]);
        });

        test('should return correct addresses for ASCII type', () => {
            const dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.ASCII,
                address: 100,
                accessMode: AccessMode.ReadWrite,
                length: 5
            });

            expect(dp.getOccupiedAddresses()).toEqual([100, 101, 102, 103, 104]);
        });
    });

    describe('Feedback DataPoint', () => {
        test('should have feedback datapoint when set', () => {
            const dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int16,
                address: 100,
                accessMode: AccessMode.ReadWrite,
                feedbackDataPoint: 'dp2'
            });

            expect(dp.hasFeedbackDataPoint()).toBe(true);
            expect(dp.getFeedbackDataPoint()).toBe('dp2');
        });

        test('should not have feedback datapoint when not set', () => {
            const dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int16,
                address: 100,
                accessMode: AccessMode.ReadWrite
            });

            expect(dp.hasFeedbackDataPoint()).toBe(false);
            expect(dp.getFeedbackDataPoint()).toBeUndefined();
        });
    });

});