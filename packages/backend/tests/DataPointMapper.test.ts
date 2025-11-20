import { DataPoint } from '../src/DataPoint.js';
import { toJSON, fromJSON } from '../src/mapper/DataPointMapper.js';
import { AccessMode } from '../src/types/AccessMode.js';
import { DataArea } from '../src/types/DataArea.js';
import { DataType } from '../src/types/DataType.js';

describe('DataPointMapper', () => {

    describe('toJSON', () => {
        test('should serialize basic Int16 DataPoint', () => {
            const dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int16,
                address: 100,
                accessMode: AccessMode.ReadWrite,
                defaultValue: 1234,
                name: 'Temperature',
                unit: '°C',
                simulation: { enabled: false, minValue: -40, maxValue: 85 }
            });

            const json = toJSON(dp);

            expect(json.id).toBe('dp1');
            expect(json.areas).toEqual([DataArea.HoldingRegister]);
            expect(json.type).toBe(DataType.Int16);
            expect(json.address).toBe(100);
            expect(json.accessMode).toBe(AccessMode.ReadWrite);
            expect(json.defaultValue).toBe(1234);
            expect(json.name).toBe('Temperature');
            expect(json.unit).toBe('°C');
            expect(json.simulation).toEqual({ enabled: false, minValue: -40, maxValue: 85 });
        });

        test('should serialize Bool DataPoint', () => {
            const dp = new DataPoint({
                id: 'coil1',
                areas: [DataArea.Coil],
                type: DataType.Bool,
                address: 0,
                accessMode: AccessMode.ReadWrite,
                defaultValue: true
            });

            const json = toJSON(dp);

            expect(json.id).toBe('coil1');
            expect(json.type).toBe(DataType.Bool);
            expect(json.defaultValue).toBe(true);
        });

        test('should serialize ASCII DataPoint with length', () => {
            const dp = new DataPoint({
                id: 'ascii1',
                areas: [DataArea.HoldingRegister],
                type: DataType.ASCII,
                address: 100,
                accessMode: AccessMode.ReadWrite,
                length: 10,
                defaultValue: 'HELLO'
            });

            const json = toJSON(dp);

            expect(json.type).toBe(DataType.ASCII);
            expect(json.length).toBe(10);
            expect(json.defaultValue).toBe('HELLO');
        });

        test('should not include length for non-ASCII types', () => {
            const dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int32,
                address: 100,
                accessMode: AccessMode.ReadWrite
            });

            const json = toJSON(dp);

            expect(json.length).toBeUndefined();
        });

        test('should serialize DataPoint with feedback', () => {
            const dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int16,
                address: 100,
                accessMode: AccessMode.ReadWrite,
                feedbackDataPoint: 'dp2'
            });

            const json = toJSON(dp);

            expect(json.feedbackDataPoint).toBe('dp2');
        });

        test('should not include feedbackDataPoint if not present', () => {
            const dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int16,
                address: 100,
                accessMode: AccessMode.ReadWrite
            });

            const json = toJSON(dp);

            expect(json.feedbackDataPoint).toBeUndefined();
        });

        test('should serialize multi-area DataPoint', () => {
            const dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister, DataArea.InputRegister],
                type: DataType.Int16,
                address: 100,
                accessMode: AccessMode.ReadWrite
            });

            const json = toJSON(dp);

            expect(json.areas).toEqual([DataArea.HoldingRegister, DataArea.InputRegister]);
        });

        test('should serialize all numeric types', () => {
            const types = [
                DataType.Byte,
                DataType.Int16,
                DataType.UInt16,
                DataType.Int32,
                DataType.UInt32,
                DataType.Float32,
                DataType.Float64
            ];

            types.forEach((type, index) => {
                const dp = new DataPoint({
                    id: `dp${index}`,
                    areas: [DataArea.HoldingRegister],
                    type: type,
                    address: index * 10,
                    accessMode: AccessMode.ReadWrite
                });

                const json = toJSON(dp);
                expect(json.type).toBe(type);
            });
        });
    });

    describe('fromJSON', () => {
        test('should deserialize valid Int16 DataPoint', () => {
            const json = {
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int16,
                address: 100,
                accessMode: AccessMode.ReadWrite,
                defaultValue: 1234,
                name: 'Temperature',
                unit: '°C',
                simulation: { enabled: false, minValue: -40, maxValue: 85 }
            };

            const result = fromJSON(json);

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.value.getId()).toBe('dp1');
                expect(result.value.getType()).toBe(DataType.Int16);
                expect(result.value.getAddress()).toBe(100);
                expect(result.value.getValue()).toBe(1234);
                expect(result.value.getName()).toBe('Temperature');
                expect(result.value.getUnit()).toBe('°C');
            }
        });

        test('should deserialize Bool DataPoint', () => {
            const json = {
                id: 'coil1',
                areas: [DataArea.Coil],
                type: DataType.Bool,
                address: 0,
                accessMode: AccessMode.ReadWrite,
                defaultValue: true
            };

            const result = fromJSON(json);

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.value.getType()).toBe(DataType.Bool);
                expect(result.value.getValue()).toBe(true);
            }
        });

        test('should deserialize ASCII DataPoint with length', () => {
            const json = {
                id: 'ascii1',
                areas: [DataArea.HoldingRegister],
                type: DataType.ASCII,
                address: 100,
                accessMode: AccessMode.ReadWrite,
                length: 10,
                defaultValue: 'HELLO'
            };

            const result = fromJSON(json);

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.value.getType()).toBe(DataType.ASCII);
                expect(result.value.getLength()).toBe(10);
                expect(result.value.getValue()).toBe('HELLO');
            }
        });

        test('should fail when JSON is not an object', () => {
            const result = fromJSON('invalid');

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.errors).toContain('Invalid JSON object for DataPoint');
            }
        });

        test('should fail when JSON is null', () => {
            const result = fromJSON(null);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.errors).toContain('Invalid JSON object for DataPoint');
            }
        });

        test('should fail when id is missing', () => {
            const json = {
                areas: [DataArea.HoldingRegister],
                type: DataType.Int16,
                address: 100,
                accessMode: AccessMode.ReadWrite
            };

            const result = fromJSON(json);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.errors).toContain('DataPoint must have a valid id');
            }
        });

        test('should fail when areas are missing', () => {
            const json = {
                id: 'dp1',
                type: DataType.Int16,
                address: 100,
                accessMode: AccessMode.ReadWrite
            };

            const result = fromJSON(json);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.errors).toContain('DataPoint must have valid areas');
            }
        });

        test('should fail when type is invalid', () => {
            const json = {
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: 'InvalidType',
                address: 100,
                accessMode: AccessMode.ReadWrite
            };

            const result = fromJSON(json);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.errors).toContain('DataPoint must have a valid type');
            }
        });

        test('should fail when address is negative', () => {
            const json = {
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int16,
                address: -1,
                accessMode: AccessMode.ReadWrite
            };

            const result = fromJSON(json);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.errors).toContain('DataPoint must have a valid address');
            }
        });

        test('should fail when address exceeds 65535', () => {
            const json = {
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int16,
                address: 65536,
                accessMode: AccessMode.ReadWrite
            };

            const result = fromJSON(json);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.errors).toContain('DataPoint must have a valid address');
            }
        });

        test('should fail when accessMode is invalid', () => {
            const json = {
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int16,
                address: 100,
                accessMode: 'InvalidMode'
            };

            const result = fromJSON(json);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.errors).toContain('DataPoint must have a valid accessMode');
            }
        });

        test('should fail when ASCII type has no length', () => {
            const json = {
                id: 'ascii1',
                areas: [DataArea.HoldingRegister],
                type: DataType.ASCII,
                address: 100,
                accessMode: AccessMode.ReadWrite
            };

            const result = fromJSON(json);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.errors).toContain('DataPoint of type ASCII must have a valid length greater than 0');
            }
        });

        test('should fail when ASCII defaultValue exceeds length', () => {
            const json = {
                id: 'ascii1',
                areas: [DataArea.HoldingRegister],
                type: DataType.ASCII,
                address: 100,
                accessMode: AccessMode.ReadWrite,
                length: 2,
                defaultValue: 'TOOLONG'
            };

            const result = fromJSON(json);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.errors).toContain('DataPoint defaultValue length exceeds defined length');
            }
        });

        test('should fail when invalid DataArea is provided', () => {
            const json = {
                id: 'dp1',
                areas: ['InvalidArea'],
                type: DataType.Int16,
                address: 100,
                accessMode: AccessMode.ReadWrite
            };

            const result = fromJSON(json);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.errors.some(e => e.includes('Invalid DataArea'))).toBe(true);
            }
        });

        test('should fail when non-Bool type is in Coil area', () => {
            const json = {
                id: 'dp1',
                areas: [DataArea.Coil],
                type: DataType.Int16,
                address: 100,
                accessMode: AccessMode.ReadWrite
            };

            const result = fromJSON(json);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.errors).toContain('DataPoint of type other than Bool cannot be in Coils or DiscreteInputs areas');
            }
        });

        test('should fail when non-Bool type is in DiscreteInput area', () => {
            const json = {
                id: 'dp1',
                areas: [DataArea.DiscreteInput],
                type: DataType.Int16,
                address: 100,
                accessMode: AccessMode.ReadOnly
            };

            const result = fromJSON(json);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.errors).toContain('DataPoint of type other than Bool cannot be in Coils or DiscreteInputs areas');
            }
        });

        test('should fail when DiscreteInput area has non-ReadOnly accessMode', () => {
            const json = {
                id: 'dp1',
                areas: [DataArea.DiscreteInput],
                type: DataType.Bool,
                address: 100,
                accessMode: AccessMode.ReadWrite
            };

            const result = fromJSON(json);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.errors).toContain('DataPoint in DiscreteInputs and InputRegisters can only have ReadOnly accessMode');
            }
        });

        test('should fail when InputRegister area has non-ReadOnly accessMode', () => {
            const json = {
                id: 'dp1',
                areas: [DataArea.InputRegister],
                type: DataType.Int16,
                address: 100,
                accessMode: AccessMode.ReadWrite
            };

            const result = fromJSON(json);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.errors).toContain('DataPoint in DiscreteInputs and InputRegisters can only have ReadOnly accessMode');
            }
        });

        test('should fail when simulation is not an object', () => {
            const json = {
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int16,
                address: 100,
                accessMode: AccessMode.ReadWrite,
                simulation: 'invalid'
            };

            const result = fromJSON(json);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.errors).toContain('DataPoint simulation must be an object');
            }
        });

        test('should fail when simulation minValue is missing', () => {
            const json = {
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int16,
                address: 100,
                accessMode: AccessMode.ReadWrite,
                simulation: { maxValue: 100 }
            };

            const result = fromJSON(json);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.errors).toContain('DataPoint simulation must have minValue and maxValue defined');
            }
        });

        test('should deserialize DataPoint with feedbackDataPoint', () => {
            const json = {
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int16,
                address: 100,
                accessMode: AccessMode.ReadWrite,
                feedbackDataPoint: 'dp2'
            };

            const result = fromJSON(json);

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.value.hasFeedbackDataPoint()).toBe(true);
                expect(result.value.getFeedbackDataPoint()).toBe('dp2');
            }
        });

        test('should collect multiple errors', () => {
            const json = {
                areas: 'invalid',
                type: 'InvalidType',
                address: -1,
                accessMode: 'InvalidMode'
            };

            const result = fromJSON(json);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.errors.length).toBeGreaterThan(1);
            }
        });
    });

    describe('Serialization Round-Trip', () => {
        test('should maintain data integrity through serialize/deserialize cycle', () => {
            const original = new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int16,
                address: 100,
                accessMode: AccessMode.ReadWrite,
                defaultValue: 1234,
                name: 'Temperature',
                unit: '°C',
                simulation: { enabled: false, minValue: -40, maxValue: 85 }
            });

            const json = toJSON(original);
            const result = fromJSON(json);

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.value.getId()).toBe(original.getId());
                expect(result.value.getType()).toBe(original.getType());
                expect(result.value.getAddress()).toBe(original.getAddress());
                expect(result.value.getValue()).toBe(original.getValue());
                expect(result.value.getName()).toBe(original.getName());
                expect(result.value.getUnit()).toBe(original.getUnit());
            }
        });

        test('should maintain ASCII data through round-trip', () => {
            const original = new DataPoint({
                id: 'ascii1',
                areas: [DataArea.HoldingRegister],
                type: DataType.ASCII,
                address: 100,
                accessMode: AccessMode.ReadWrite,
                length: 10,
                defaultValue: 'HELLO'
            });

            const json = toJSON(original);
            const result = fromJSON(json);

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.value.getLength()).toBe(original.getLength());
                expect(result.value.getValue()).toBe(original.getValue());
            }
        });
    });

});
