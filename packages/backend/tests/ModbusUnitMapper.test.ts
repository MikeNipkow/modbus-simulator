import { ModbusUnit } from '../src/ModbusUnit.js';
import { DataPoint } from '../src/DataPoint.js';
import { toJSON, fromJSON } from '../src/mapper/ModbusUnitMapper.js';
import { AccessMode } from '../src/types/enums/AccessMode.js';
import { DataArea } from '../src/types/enums/DataArea.js';
import { DataType } from '../src/types/enums/DataType.js';

describe('ModbusUnitMapper', () => {

    describe('toJSON', () => {
        test('should serialize empty ModbusUnit', () => {
            const unit = new ModbusUnit(1);

            const json = toJSON(unit);

            expect(json).toEqual({
                unitId: 1,
                dataPoints: []
            });
        });

        test('should serialize ModbusUnit with single DataPoint', () => {
            const unit = new ModbusUnit(1);
            const dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int16,
                address: 100,
                accessMode: AccessMode.ReadWrite,
                defaultValue: 1234
            });
            unit.addDataPoint(dp);

            const json = toJSON(unit);

            expect(json).toHaveProperty('unitId', 1);
            expect(json).toHaveProperty('dataPoints');
            expect((json as any).dataPoints).toHaveLength(1);
            expect((json as any).dataPoints[0].id).toBe('dp1');
            expect((json as any).dataPoints[0].address).toBe(100);
        });

        test('should serialize ModbusUnit with multiple DataPoints', () => {
            const unit = new ModbusUnit(5);
            const dp1 = new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int16,
                address: 100,
                accessMode: AccessMode.ReadWrite
            });
            const dp2 = new DataPoint({
                id: 'dp2',
                areas: [DataArea.Coil],
                type: DataType.Bool,
                address: 0,
                accessMode: AccessMode.ReadWrite
            });
            const dp3 = new DataPoint({
                id: 'dp3',
                areas: [DataArea.InputRegister],
                type: DataType.Float32,
                address: 200,
                accessMode: AccessMode.ReadOnly
            });

            unit.addDataPoint(dp1);
            unit.addDataPoint(dp2);
            unit.addDataPoint(dp3);

            const json = toJSON(unit);

            expect((json as any).unitId).toBe(5);
            expect((json as any).dataPoints).toHaveLength(3);
            expect((json as any).dataPoints[0].id).toBe('dp1');
            expect((json as any).dataPoints[1].id).toBe('dp2');
            expect((json as any).dataPoints[2].id).toBe('dp3');
        });

        test('should serialize DataPoint properties correctly', () => {
            const unit = new ModbusUnit(10);
            const dp = new DataPoint({
                id: 'temp',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int16,
                address: 100,
                accessMode: AccessMode.ReadWrite,
                defaultValue: 25,
                name: 'Temperature',
                unit: '°C',
                simulation: { enabled: true, minValue: -40, maxValue: 85 }
            });
            unit.addDataPoint(dp);

            const json = toJSON(unit);

            const dpJson = (json as any).dataPoints[0];
            expect(dpJson.id).toBe('temp');
            expect(dpJson.name).toBe('Temperature');
            expect(dpJson.unit).toBe('°C');
            expect(dpJson.simulation).toEqual({ enabled: true, minValue: -40, maxValue: 85 });
        });

        test('should serialize ASCII DataPoint with length', () => {
            const unit = new ModbusUnit(1);
            const dp = new DataPoint({
                id: 'ascii1',
                areas: [DataArea.HoldingRegister],
                type: DataType.ASCII,
                address: 100,
                accessMode: AccessMode.ReadWrite,
                length: 10,
                defaultValue: 'HELLO'
            });
            unit.addDataPoint(dp);

            const json = toJSON(unit);

            const dpJson = (json as any).dataPoints[0];
            expect(dpJson.type).toBe(DataType.ASCII);
            expect(dpJson.length).toBe(10);
        });

        test('should serialize different unitId values', () => {
            const unitIds = [1, 50, 127, 200, 254];

            unitIds.forEach(id => {
                const unit = new ModbusUnit(id);
                const json = toJSON(unit);
                expect((json as any).unitId).toBe(id);
            });
        });
    });

    describe('fromJSON', () => {
        test('should deserialize empty ModbusUnit', () => {
            const json = {
                unitId: 1,
                dataPoints: []
            };

            const result = fromJSON(json);

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.value.getId()).toBe(1);
                expect(result.value.getAllDataPoints()).toHaveLength(0);
            }
        });

        test('should deserialize ModbusUnit with single DataPoint', () => {
            const json = {
                unitId: 1,
                dataPoints: [
                    {
                        id: 'dp1',
                        areas: [DataArea.HoldingRegister],
                        type: DataType.Int16,
                        address: 100,
                        accessMode: AccessMode.ReadWrite,
                        defaultValue: 1234
                    }
                ]
            };

            const result = fromJSON(json);

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.value.getId()).toBe(1);
                expect(result.value.getAllDataPoints()).toHaveLength(1);
                const dp = result.value.getDataPoint('dp1');
                expect(dp).toBeDefined();
                expect(dp?.getAddress()).toBe(100);
                expect(dp?.getValue()).toBe(1234);
            }
        });

        test('should deserialize ModbusUnit with multiple DataPoints', () => {
            const json = {
                unitId: 5,
                dataPoints: [
                    {
                        id: 'dp1',
                        areas: [DataArea.HoldingRegister],
                        type: DataType.Int16,
                        address: 100,
                        accessMode: AccessMode.ReadWrite
                    },
                    {
                        id: 'dp2',
                        areas: [DataArea.Coil],
                        type: DataType.Bool,
                        address: 0,
                        accessMode: AccessMode.ReadWrite
                    },
                    {
                        id: 'dp3',
                        areas: [DataArea.InputRegister],
                        type: DataType.Float32,
                        address: 200,
                        accessMode: AccessMode.ReadOnly
                    }
                ]
            };

            const result = fromJSON(json);

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.value.getId()).toBe(5);
                expect(result.value.getAllDataPoints()).toHaveLength(3);
                expect(result.value.getDataPoint('dp1')).toBeDefined();
                expect(result.value.getDataPoint('dp2')).toBeDefined();
                expect(result.value.getDataPoint('dp3')).toBeDefined();
            }
        });

        test('should fail when JSON is null', () => {
            const result = fromJSON(null);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.errors).toContain('Invalid JSON object for ModbusUnit');
            }
        });

        test('should fail when JSON is not an object', () => {
            const result = fromJSON('invalid');

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.errors).toContain('Invalid JSON object for ModbusUnit');
            }
        });

        test('should fail when unitId is missing', () => {
            const json = {
                dataPoints: []
            };

            const result = fromJSON(json);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.errors).toContain('ModbusUnit must have a valid unitId');
            }
        });

        test('should fail when unitId is not a number', () => {
            const json = {
                unitId: 'invalid',
                dataPoints: []
            };

            const result = fromJSON(json);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.errors).toContain('ModbusUnit must have a valid unitId');
            }
        });

        test('should fail when unitId is less than 1', () => {
            const json = {
                unitId: 0,
                dataPoints: []
            };

            const result = fromJSON(json);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.errors).toContain('ModbusUnit unitId must be between 1 and 254');
            }
        });

        test('should fail when unitId is greater than 254', () => {
            const json = {
                unitId: 255,
                dataPoints: []
            };

            const result = fromJSON(json);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.errors).toContain('ModbusUnit unitId must be between 1 and 254');
            }
        });

        test('should accept valid unitId boundary values', () => {
            const validIds = [1, 254];

            validIds.forEach(id => {
                const json = { unitId: id, dataPoints: [] };
                const result = fromJSON(json);
                expect(result.success).toBe(true);
                if (result.success) {
                    expect(result.value.getId()).toBe(id);
                }
            });
        });

        test('should handle missing dataPoints field', () => {
            const json = {
                unitId: 1
            };

            const result = fromJSON(json);

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.value.getAllDataPoints()).toHaveLength(0);
            }
        });

        test('should fail when DataPoint JSON is invalid', () => {
            const json = {
                unitId: 1,
                dataPoints: [
                    {
                        id: 'dp1',
                        type: 'InvalidType',
                        address: 100,
                        accessMode: AccessMode.ReadWrite
                    }
                ]
            };

            const result = fromJSON(json);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.errors.some(e => e.includes('DataPoint error:'))).toBe(true);
            }
        });

        test('should fail when DataPoints have address conflicts in same area', () => {
            const json = {
                unitId: 1,
                dataPoints: [
                    {
                        id: 'dp1',
                        areas: [DataArea.HoldingRegister],
                        type: DataType.Int16,
                        address: 100,
                        accessMode: AccessMode.ReadWrite
                    },
                    {
                        id: 'dp2',
                        areas: [DataArea.HoldingRegister],
                        type: DataType.Int16,
                        address: 100,
                        accessMode: AccessMode.ReadWrite
                    }
                ]
            };

            const result = fromJSON(json);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.errors.some(e => e.includes('occupied'))).toBe(true);
            }
        });

        test('should fail when DataPoints have overlapping register ranges', () => {
            const json = {
                unitId: 1,
                dataPoints: [
                    {
                        id: 'dp1',
                        areas: [DataArea.HoldingRegister],
                        type: DataType.Int32,
                        address: 100,
                        accessMode: AccessMode.ReadWrite
                    },
                    {
                        id: 'dp2',
                        areas: [DataArea.HoldingRegister],
                        type: DataType.Int16,
                        address: 101,
                        accessMode: AccessMode.ReadWrite
                    }
                ]
            };

            const result = fromJSON(json);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.errors.some(e => e.includes('Address') || e.includes('overlaps'))).toBe(true);
            }
        });

        test('should allow same address in different areas', () => {
            const json = {
                unitId: 1,
                dataPoints: [
                    {
                        id: 'dp1',
                        areas: [DataArea.HoldingRegister],
                        type: DataType.Int16,
                        address: 100,
                        accessMode: AccessMode.ReadWrite
                    },
                    {
                        id: 'dp2',
                        areas: [DataArea.InputRegister],
                        type: DataType.Int16,
                        address: 100,
                        accessMode: AccessMode.ReadOnly
                    }
                ]
            };

            const result = fromJSON(json);

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.value.getAllDataPoints()).toHaveLength(2);
            }
        });

        test('should collect multiple DataPoint errors', () => {
            const json = {
                unitId: 1,
                dataPoints: [
                    {
                        id: 'dp1',
                        type: 'InvalidType',
                        address: -1,
                        accessMode: 'InvalidMode'
                    },
                    {
                        id: 'dp2',
                        areas: 'invalid',
                        type: DataType.Int16
                    }
                ]
            };

            const result = fromJSON(json);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.errors.length).toBeGreaterThan(1);
            }
        });

        test('should deserialize ASCII DataPoint correctly', () => {
            const json = {
                unitId: 1,
                dataPoints: [
                    {
                        id: 'ascii1',
                        areas: [DataArea.HoldingRegister],
                        type: DataType.ASCII,
                        address: 100,
                        accessMode: AccessMode.ReadWrite,
                        length: 10,
                        defaultValue: 'HELLO'
                    }
                ]
            };

            const result = fromJSON(json);

            expect(result.success).toBe(true);
            if (result.success) {
                const dp = result.value.getDataPoint('ascii1');
                expect(dp).toBeDefined();
                expect(dp?.getType()).toBe(DataType.ASCII);
                expect(dp?.getLength()).toBe(10);
                expect(dp?.getValue()).toBe('HELLO');
            }
        });

        test('should deserialize DataPoint with all optional properties', () => {
            const json = {
                unitId: 1,
                dataPoints: [
                    {
                        id: 'dp1',
                        areas: [DataArea.HoldingRegister],
                        type: DataType.Int16,
                        address: 100,
                        accessMode: AccessMode.ReadWrite,
                        defaultValue: 25,
                        name: 'Temperature',
                        unit: '°C',
                        simulation: { enabled: true, minValue: -40, maxValue: 85 },
                        feedbackDataPoint: 'dp2'
                    }
                ]
            };

            const result = fromJSON(json);

            expect(result.success).toBe(true);
            if (result.success) {
                const dp = result.value.getDataPoint('dp1');
                expect(dp?.getName()).toBe('Temperature');
                expect(dp?.getUnit()).toBe('°C');
                expect(dp?.hasFeedbackDataPoint()).toBe(true);
            }
        });
    });

    describe('Serialization Round-Trip', () => {
        test('should maintain empty unit through round-trip', () => {
            const original = new ModbusUnit(1);

            const json = toJSON(original);
            const result = fromJSON(json);

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.value.getId()).toBe(original.getId());
                expect(result.value.getAllDataPoints()).toHaveLength(0);
            }
        });

        test('should maintain single DataPoint unit through round-trip', () => {
            const original = new ModbusUnit(1);
            const dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int16,
                address: 100,
                accessMode: AccessMode.ReadWrite,
                defaultValue: 1234,
                name: 'Temperature',
                unit: '°C'
            });
            original.addDataPoint(dp);

            const json = toJSON(original);
            const result = fromJSON(json);

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.value.getId()).toBe(original.getId());
                expect(result.value.getAllDataPoints()).toHaveLength(1);
                const restoredDp = result.value.getDataPoint('dp1');
                expect(restoredDp?.getValue()).toBe(1234);
                expect(restoredDp?.getName()).toBe('Temperature');
                expect(restoredDp?.getUnit()).toBe('°C');
            }
        });

        test('should maintain multiple DataPoints unit through round-trip', () => {
            const original = new ModbusUnit(10);
            const dp1 = new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int16,
                address: 100,
                accessMode: AccessMode.ReadWrite,
                defaultValue: 100
            });
            const dp2 = new DataPoint({
                id: 'dp2',
                areas: [DataArea.Coil],
                type: DataType.Bool,
                address: 0,
                accessMode: AccessMode.ReadWrite,
                defaultValue: true
            });
            const dp3 = new DataPoint({
                id: 'dp3',
                areas: [DataArea.InputRegister],
                type: DataType.Float32,
                address: 200,
                accessMode: AccessMode.ReadOnly,
                defaultValue: 3.14
            });

            original.addDataPoint(dp1);
            original.addDataPoint(dp2);
            original.addDataPoint(dp3);

            const json = toJSON(original);
            const result = fromJSON(json);

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.value.getId()).toBe(10);
                expect(result.value.getAllDataPoints()).toHaveLength(3);
                expect(result.value.getDataPoint('dp1')?.getValue()).toBe(100);
                expect(result.value.getDataPoint('dp2')?.getValue()).toBe(true);
                expect(result.value.getDataPoint('dp3')?.getValue()).toBeCloseTo(3.14, 2);
            }
        });

        test('should maintain ASCII DataPoint through round-trip', () => {
            const original = new ModbusUnit(1);
            const dp = new DataPoint({
                id: 'ascii1',
                areas: [DataArea.HoldingRegister],
                type: DataType.ASCII,
                address: 100,
                accessMode: AccessMode.ReadWrite,
                length: 10,
                defaultValue: 'HELLO'
            });
            original.addDataPoint(dp);

            const json = toJSON(original);
            const result = fromJSON(json);

            expect(result.success).toBe(true);
            if (result.success) {
                const restoredDp = result.value.getDataPoint('ascii1');
                expect(restoredDp?.getLength()).toBe(10);
                expect(restoredDp?.getValue()).toBe('HELLO');
            }
        });

        test('should maintain complex unit configuration through round-trip', () => {
            const original = new ModbusUnit(42);
            
            // Add various DataPoints with different configurations
            original.addDataPoint(new DataPoint({
                id: 'temp',
                areas: [DataArea.HoldingRegister, DataArea.InputRegister],
                type: DataType.Int16,
                address: 100,
                accessMode: AccessMode.ReadWrite,
                defaultValue: 25,
                name: 'Temperature',
                unit: '°C',
                simulation: { enabled: true, minValue: -40, maxValue: 85 }
            }));

            original.addDataPoint(new DataPoint({
                id: 'pressure',
                areas: [DataArea.HoldingRegister],
                type: DataType.Float32,
                address: 200,
                accessMode: AccessMode.ReadWrite,
                defaultValue: 101.325,
                name: 'Pressure',
                unit: 'kPa'
            }));

            original.addDataPoint(new DataPoint({
                id: 'alarm',
                areas: [DataArea.Coil],
                type: DataType.Bool,
                address: 0,
                accessMode: AccessMode.ReadWrite,
                defaultValue: false,
                name: 'Alarm Status'
            }));

            const json = toJSON(original);
            const result = fromJSON(json);

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.value.getId()).toBe(42);
                expect(result.value.getAllDataPoints()).toHaveLength(3);
                
                const temp = result.value.getDataPoint('temp');
                expect(temp?.getName()).toBe('Temperature');
                expect(temp?.getAreas()).toEqual([DataArea.HoldingRegister, DataArea.InputRegister]);
                
                const pressure = result.value.getDataPoint('pressure');
                expect(pressure?.getValue()).toBeCloseTo(101.325, 3);
                
                const alarm = result.value.getDataPoint('alarm');
                expect(alarm?.getValue()).toBe(false);
            }
        });
    });

});
