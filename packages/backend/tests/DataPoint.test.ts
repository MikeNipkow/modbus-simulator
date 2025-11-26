import { DataPoint } from '../src/DataPoint.js';
import { AccessMode } from '../src/types/enums/AccessMode.js';
import { DataArea } from '../src/types/enums/DataArea.js';
import { DataType } from '../src/types/enums/DataType.js';
import { Endian } from '../src/types/enums/Endian.js';

describe('DataPoint', () => {

    describe('Constructor Validation', () => {
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

        test('should throw error when address is negative', () => {
            expect(() => new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int16,
                address: -1,
                accessMode: AccessMode.ReadWrite
            })).toThrow('DataPoint must have a valid address');
        });

        test('should throw error when address exceeds 65535', () => {
            expect(() => new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int16,
                address: 65536,
                accessMode: AccessMode.ReadWrite
            })).toThrow('DataPoint must have a valid address');
        });

        test('should throw error when ASCII type has no length', () => {
            expect(() => new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.ASCII,
                address: 100,
                accessMode: AccessMode.ReadWrite
            })).toThrow('DataPoint of type String must have a length defined');
        });

        test('should throw error when ASCII defaultValue exceeds length', () => {
            expect(() => new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.ASCII,
                address: 100,
                accessMode: AccessMode.ReadWrite,
                length: 2,
                defaultValue: 'TOOLONG'
            })).toThrow('DataPoint defaultValue length exceeds defined length for String type');
        });

        test('should accept valid ASCII DataPoint', () => {
            const dp = new DataPoint({
                id: 'ascii1',
                areas: [DataArea.HoldingRegister],
                type: DataType.ASCII,
                address: 100,
                accessMode: AccessMode.ReadWrite,
                length: 10,
                defaultValue: 'HELLO'
            });

            expect(dp.getType()).toBe(DataType.ASCII);
            expect(dp.getLength()).toBe(10);
            expect(dp.getValue()).toBe('HELLO');
        });
    });

    describe('Value Handling', () => {
        test('should get and set value for ReadWrite DataPoint', () => {
            const dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int16,
                address: 100,
                accessMode: AccessMode.ReadWrite,
                defaultValue: 100
            });

            expect(dp.getValue()).toBe(100);
            expect(dp.setValue(200)).toBe(true);
            expect(dp.getValue()).toBe(200);
        });

        test('should not set value for ReadOnly DataPoint without force', () => {
            const dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.InputRegister],
                type: DataType.Int16,
                address: 100,
                accessMode: AccessMode.ReadOnly,
                defaultValue: 100
            });

            expect(dp.setValue(200)).toBe(false);
            expect(dp.getValue()).toBe(100);
        });

        test('should set value for ReadOnly DataPoint with force', () => {
            const dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.InputRegister],
                type: DataType.Int16,
                address: 100,
                accessMode: AccessMode.ReadOnly,
                defaultValue: 100
            });

            expect(dp.setValue(200, true)).toBe(true);
            expect(dp.getValue()).toBe(200);
        });

        test('should handle Bool type correctly', () => {
            const dp = new DataPoint({
                id: 'coil1',
                areas: [DataArea.Coil],
                type: DataType.Bool,
                address: 0,
                accessMode: AccessMode.ReadWrite,
                defaultValue: false
            });

            expect(dp.getValue()).toBe(false);
            dp.setValue(true);
            expect(dp.getValue()).toBe(true);
        });

        test('should handle all numeric types', () => {
            const types = [
                { type: DataType.Byte, value: 255 },
                { type: DataType.Int16, value: -32768 },
                { type: DataType.UInt16, value: 65535 },
                { type: DataType.Int32, value: -2147483648 },
                { type: DataType.UInt32, value: 4294967295 },
                { type: DataType.Float32, value: 3.14 },
                { type: DataType.Float64, value: 3.141592653589793 }
            ];

            types.forEach(({ type, value }) => {
                const dp = new DataPoint({
                    id: `dp_${type}`,
                    areas: [DataArea.HoldingRegister],
                    type: type,
                    address: 100,
                    accessMode: AccessMode.ReadWrite,
                    defaultValue: value
                });

                expect(dp.getValue()).toBe(value);
            });
        });
    });

    describe('Access Mode', () => {
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

        test('should have both read and write access for ReadWrite', () => {
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

    describe('Register Value Handling - Big Endian', () => {
        test('should get register value for Bool', () => {
            const dp = new DataPoint({
                id: 'coil1',
                areas: [DataArea.Coil],
                type: DataType.Bool,
                address: 0,
                accessMode: AccessMode.ReadWrite,
                defaultValue: true
            });

            expect(dp.getRegisterValue()).toBe(true);
        });

        test('should get register value for Int16', () => {
            const dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int16,
                address: 100,
                accessMode: AccessMode.ReadWrite,
                defaultValue: 1234
            });

            expect(dp.getRegisterValue()).toBe(1234);
        });

        test('should get register value for UInt16', () => {
            const dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.UInt16,
                address: 100,
                accessMode: AccessMode.ReadWrite,
                defaultValue: 65535
            });

            expect(dp.getRegisterValue()).toBe(65535);
        });

        test('should get multi-register value for Int32 with big-endian', () => {
            const dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int32,
                address: 100,
                accessMode: AccessMode.ReadWrite,
                defaultValue: 100000
            });

            const reg0 = dp.getRegisterValue(0, Endian.BigEndian);
            const reg1 = dp.getRegisterValue(1, Endian.BigEndian);

            expect(reg0).toBe(0x0001); // High word
            expect(reg1).toBe(0x86A0); // Low word
        });

        test('should get multi-register value for Float32 with big-endian', () => {
            const dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.Float32,
                address: 100,
                accessMode: AccessMode.ReadWrite,
                defaultValue: 3.14
            });

            const reg0 = dp.getRegisterValue(0, Endian.BigEndian);
            const reg1 = dp.getRegisterValue(1, Endian.BigEndian);

            expect(typeof reg0).toBe('number');
            expect(typeof reg1).toBe('number');
        });

        test('should throw error for invalid offset', () => {
            const dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int32,
                address: 100,
                accessMode: AccessMode.ReadWrite,
                defaultValue: 100000
            });

            expect(() => dp.getRegisterValue(5)).toThrow('Invalid offset');
        });
    });

    describe('Register Value Handling - Little Endian', () => {
        test('should get multi-register value for Int32 with little-endian', () => {
            const dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int32,
                address: 100,
                accessMode: AccessMode.ReadWrite,
                defaultValue: 100000
            });

            const reg0 = dp.getRegisterValue(0, Endian.LittleEndian);
            const reg1 = dp.getRegisterValue(1, Endian.LittleEndian);

            expect(reg0).toBe(0x86A0); // Low word first
            expect(reg1).toBe(0x0001); // High word second
        });

        test('should get multi-register value for UInt32 with little-endian', () => {
            const dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.UInt32,
                address: 100,
                accessMode: AccessMode.ReadWrite,
                defaultValue: 4294967295
            });

            const reg0 = dp.getRegisterValue(0, Endian.LittleEndian);
            const reg1 = dp.getRegisterValue(1, Endian.LittleEndian);

            expect(reg0).toBe(0xFFFF);
            expect(reg1).toBe(0xFFFF);
        });
    });

    describe('Set Register Value', () => {
        test('should set register value for Bool', () => {
            const dp = new DataPoint({
                id: 'coil1',
                areas: [DataArea.Coil],
                type: DataType.Bool,
                address: 0,
                accessMode: AccessMode.ReadWrite,
                defaultValue: false
            });

            dp.setRegisterValue(1);
            expect(dp.getValue()).toBe(1);
        });

        test('should set register value for Int16', () => {
            const dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int16,
                address: 100,
                accessMode: AccessMode.ReadWrite,
                defaultValue: 0
            });

            dp.setRegisterValue(5000);
            expect(dp.getValue()).toBe(5000);
        });

        test('should set multi-register value for Int32 with big-endian', () => {
            const dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int32,
                address: 100,
                accessMode: AccessMode.ReadWrite,
                defaultValue: 0
            });

            dp.setRegisterValue(0x0001, false, 0, Endian.BigEndian);
            dp.setRegisterValue(0x86A0, false, 1, Endian.BigEndian);

            expect(dp.getValue()).toBe(100000);
        });

        test('should set multi-register value for Int32 with little-endian', () => {
            const dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int32,
                address: 100,
                accessMode: AccessMode.ReadWrite,
                defaultValue: 0
            });

            dp.setRegisterValue(0x86A0, false, 0, Endian.LittleEndian);
            dp.setRegisterValue(0x0001, false, 1, Endian.LittleEndian);

            expect(dp.getValue()).toBe(100000);
        });

        test('should not set register value for ReadOnly without force', () => {
            const dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.InputRegister],
                type: DataType.Int16,
                address: 100,
                accessMode: AccessMode.ReadOnly,
                defaultValue: 100
            });

            const result = dp.setRegisterValue(200);
            expect(result).toBe(false);
            expect(dp.getValue()).toBe(100);
        });

        test('should set register value for ReadOnly with force', () => {
            const dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.InputRegister],
                type: DataType.Int16,
                address: 100,
                accessMode: AccessMode.ReadOnly,
                defaultValue: 100
            });

            const result = dp.setRegisterValue(200, true);
            expect(result).toBe(true);
            expect(dp.getValue()).toBe(200);
        });
    });

    describe('Data Areas', () => {
        test('should add valid data area', () => {
            const dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int16,
                address: 100,
                accessMode: AccessMode.ReadWrite
            });

            dp.addDataArea(DataArea.InputRegister);
            expect(dp.hasDataArea(DataArea.InputRegister)).toBe(true);
            expect(dp.getAreas()).toHaveLength(2);
        });

        test('should not add duplicate area', () => {
            const dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int16,
                address: 100,
                accessMode: AccessMode.ReadWrite
            });

            dp.addDataArea(DataArea.HoldingRegister);
            expect(dp.getAreas()).toHaveLength(1);
        });

        test('should throw error when adding Coil area to non-Bool type', () => {
            const dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int16,
                address: 100,
                accessMode: AccessMode.ReadWrite
            });

            expect(() => dp.addDataArea(DataArea.Coil)).toThrow('DataPoint of type');
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
            expect(dp.getAreas()).toHaveLength(1);
        });

        test('should throw error when deleting last area', () => {
            const dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int16,
                address: 100,
                accessMode: AccessMode.ReadWrite
            });

            expect(() => dp.deleteDataArea(DataArea.HoldingRegister)).toThrow('must have at least one DataArea');
        });
    });

    describe('Simulation', () => {
        test('should start simulation for numeric type', () => {
            const dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int16,
                address: 100,
                accessMode: AccessMode.ReadWrite,
                simulation: { enabled: true, minValue: 0, maxValue: 100 }
            });

            expect(dp.startSimulation(100)).toBe(true);
            expect(dp.isSimulationRunning()).toBe(true);
            dp.stopSimulation();
        });

        test('should not start simulation twice', () => {
            const dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int16,
                address: 100,
                accessMode: AccessMode.ReadWrite,
                simulation: { enabled: true, minValue: 0, maxValue: 100 }
            });

            dp.startSimulation(100);
            expect(dp.startSimulation(100)).toBe(false);
            dp.stopSimulation();
        });

        test('should not start simulation for ASCII type', () => {
            const dp = new DataPoint({
                id: 'ascii1',
                areas: [DataArea.HoldingRegister],
                type: DataType.ASCII,
                address: 100,
                accessMode: AccessMode.ReadWrite,
                length: 10
            });

            expect(dp.startSimulation()).toBe(false);
        });

        test('should stop simulation', () => {
            const dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int16,
                address: 100,
                accessMode: AccessMode.ReadWrite,
                simulation: { enabled: true, minValue: 0, maxValue: 100 }
            });

            dp.startSimulation(100);
            expect(dp.stopSimulation()).toBe(true);
            expect(dp.isSimulationRunning()).toBe(false);
        });

        test('should not stop simulation when not running', () => {
            const dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int16,
                address: 100,
                accessMode: AccessMode.ReadWrite
            });

            expect(dp.stopSimulation()).toBe(false);
        });

        test('should enable simulation', () => {
            const dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int16,
                address: 100,
                accessMode: AccessMode.ReadWrite,
                simulation: { enabled: false, minValue: 0, maxValue: 100 }
            });

            expect(dp.isSimulationEnabled()).toBe(false);
            dp.enableSimulation();
            expect(dp.isSimulationEnabled()).toBe(true);
            expect(dp.isSimulationRunning()).toBe(true);
            dp.stopSimulation();
        });

        test('should disable simulation', () => {
            const dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int16,
                address: 100,
                accessMode: AccessMode.ReadWrite,
                simulation: { enabled: true, minValue: 0, maxValue: 100 }
            });

            dp.startSimulation(100);
            dp.disableSimulation();
            expect(dp.isSimulationEnabled()).toBe(false);
            expect(dp.isSimulationRunning()).toBe(false);
        });

        test('should generate value within range for Bool type', (done) => {
            const dp = new DataPoint({
                id: 'coil1',
                areas: [DataArea.Coil],
                type: DataType.Bool,
                address: 0,
                accessMode: AccessMode.ReadWrite,
                defaultValue: false,
                simulation: { enabled: true, minValue: 0, maxValue: 1 }
            });

            dp.startSimulation(50);
            
            setTimeout(() => {
                dp.stopSimulation();
                const value = dp.getValue();
                expect(typeof value).toBe('boolean');
                done();
            }, 100);
        });

        test('should generate value within range for numeric type', (done) => {
            const dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int16,
                address: 100,
                accessMode: AccessMode.ReadWrite,
                defaultValue: 50,
                simulation: { enabled: true, minValue: 0, maxValue: 100 }
            });

            dp.startSimulation(50);
            
            setTimeout(() => {
                dp.stopSimulation();
                const value = dp.getValue() as number;
                expect(value).toBeGreaterThanOrEqual(0);
                expect(value).toBeLessThanOrEqual(100);
                done();
            }, 100);
        });
    });

    describe('Getters', () => {
        test('should get occupied addresses for single register', () => {
            const dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int16,
                address: 100,
                accessMode: AccessMode.ReadWrite
            });

            expect(dp.getOccupiedAddresses()).toEqual([100]);
        });

        test('should get occupied addresses for multi-register', () => {
            const dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int32,
                address: 100,
                accessMode: AccessMode.ReadWrite
            });

            expect(dp.getOccupiedAddresses()).toEqual([100, 101]);
        });

        test('should get default value', () => {
            const dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int16,
                address: 100,
                accessMode: AccessMode.ReadWrite,
                defaultValue: 1234
            });

            expect(dp.getDefaultValue()).toBe(1234);
        });

        test('should get name and unit', () => {
            const dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int16,
                address: 100,
                accessMode: AccessMode.ReadWrite,
                name: 'Temperature',
                unit: '°C'
            });

            expect(dp.getName()).toBe('Temperature');
            expect(dp.getUnit()).toBe('°C');
        });

        test('should check feedback datapoint', () => {
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

        test('should return undefined for no feedback datapoint', () => {
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
