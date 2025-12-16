import { ModbusUnit } from '../src/ModbusUnit.js';
import { DataPoint } from '../src/DataPoint.js';
import { AccessMode } from '../src/types/enums/AccessMode.js';
import { DataArea } from '../src/types/enums/DataArea.js';
import { DataType } from '../src/types/enums/DataType.js';
describe('ModbusUnit', () => {
    describe('Constructor Validation', () => {
        test('should create a valid ModbusUnit with valid unit ID', () => {
            const unit = new ModbusUnit({ unitId: 1 });
            expect(unit.getId()).toBe(1);
            expect(unit.getAllDataPoints()).toHaveLength(0);
        });
        test('should throw error when unitId is less than 1', () => {
            expect(() => new ModbusUnit({ unitId: 0 })).toThrow('ModbusUnit id must be between 1 and 254');
        });
        test('should throw error when unitId is greater than 254', () => {
            expect(() => new ModbusUnit({ unitId: 255 })).toThrow('ModbusUnit id must be between 1 and 254');
        });
        test('should accept boundary values for unitId', () => {
            const unit1 = new ModbusUnit({ unitId: 1 });
            const unit254 = new ModbusUnit({ unitId: 254 });
            expect(unit1.getId()).toBe(1);
            expect(unit254.getId()).toBe(254);
        });
        test('should create ModbusUnit with DataPoints in constructor', () => {
            const unit = new ModbusUnit({
                unitId: 1,
                dataPoints: [
                    {
                        id: 'dp1',
                        areas: [DataArea.HoldingRegister],
                        type: DataType.Int16,
                        address: 100,
                        accessMode: AccessMode.ReadWrite
                    }
                ]
            });
            expect(unit.getAllDataPoints()).toHaveLength(1);
            expect(unit.hasDataPoint('dp1')).toBe(true);
        });
        test('should throw error when adding conflicting DataPoints in constructor', () => {
            expect(() => new ModbusUnit({
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
            })).toThrow('Failed to add DataPoint');
        });
    });
    describe('DataPoint Management - Add', () => {
        let unit;
        beforeEach(() => {
            unit = new ModbusUnit({ unitId: 1 });
        });
        test('should add a valid DataPoint', () => {
            const dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int16,
                address: 100,
                accessMode: AccessMode.ReadWrite
            });
            const result = unit.addDataPoint(dp);
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.value).toBe(dp);
            }
            expect(unit.hasDataPoint('dp1')).toBe(true);
        });
        test('should fail to add DataPoint with duplicate id', () => {
            const dp1 = new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int16,
                address: 100,
                accessMode: AccessMode.ReadWrite
            });
            const dp2 = new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int16,
                address: 200,
                accessMode: AccessMode.ReadWrite
            });
            unit.addDataPoint(dp1);
            const result = unit.addDataPoint(dp2);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.errors).toContain(`DataPoint with id 'dp1' already exists in ModbusUnit 1`);
            }
        });
        test('should fail to add DataPoint with conflicting address in same area', () => {
            const dp1 = new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int16,
                address: 100,
                accessMode: AccessMode.ReadWrite
            });
            const dp2 = new DataPoint({
                id: 'dp2',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int16,
                address: 100,
                accessMode: AccessMode.ReadWrite
            });
            unit.addDataPoint(dp1);
            const result = unit.addDataPoint(dp2);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.errors.some(e => e.includes('already occupied'))).toBe(true);
            }
        });
        test('should allow same address in different areas', () => {
            const dp1 = new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int16,
                address: 100,
                accessMode: AccessMode.ReadWrite
            });
            const dp2 = new DataPoint({
                id: 'dp2',
                areas: [DataArea.InputRegister],
                type: DataType.Int16,
                address: 100,
                accessMode: AccessMode.ReadOnly
            });
            const result1 = unit.addDataPoint(dp1);
            const result2 = unit.addDataPoint(dp2);
            expect(result1.success).toBe(true);
            expect(result2.success).toBe(true);
        });
        test('should fail to add non-Bool DataPoint to Coil area', () => {
            const dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.Coil],
                type: DataType.Int16,
                address: 0,
                accessMode: AccessMode.ReadWrite
            });
            const result = unit.addDataPoint(dp);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.errors.some(e => e.includes('cannot be added to area'))).toBe(true);
            }
        });
        test('should fail to add non-Bool DataPoint to DiscreteInput area', () => {
            const dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.DiscreteInput],
                type: DataType.Int16,
                address: 0,
                accessMode: AccessMode.ReadOnly
            });
            const result = unit.addDataPoint(dp);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.errors.some(e => e.includes('cannot be added to area'))).toBe(true);
            }
        });
        test('should add Bool DataPoint to Coil area', () => {
            const dp = new DataPoint({
                id: 'coil1',
                areas: [DataArea.Coil],
                type: DataType.Bool,
                address: 0,
                accessMode: AccessMode.ReadWrite
            });
            const result = unit.addDataPoint(dp);
            expect(result.success).toBe(true);
        });
        test('should detect multi-register address conflicts', () => {
            const dp1 = new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int32,
                address: 100,
                accessMode: AccessMode.ReadWrite
            });
            const dp2 = new DataPoint({
                id: 'dp2',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int16,
                address: 101,
                accessMode: AccessMode.ReadWrite
            });
            unit.addDataPoint(dp1);
            const result = unit.addDataPoint(dp2);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.errors.some(e => e.includes('already occupied'))).toBe(true);
            }
        });
        test('should allow non-conflicting multi-register DataPoints', () => {
            const dp1 = new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int32,
                address: 100,
                accessMode: AccessMode.ReadWrite
            });
            const dp2 = new DataPoint({
                id: 'dp2',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int32,
                address: 102,
                accessMode: AccessMode.ReadWrite
            });
            const result1 = unit.addDataPoint(dp1);
            const result2 = unit.addDataPoint(dp2);
            expect(result1.success).toBe(true);
            expect(result2.success).toBe(true);
        });
    });
    describe('DataPoint Management - Get', () => {
        let unit;
        let dp1;
        let dp2;
        beforeEach(() => {
            unit = new ModbusUnit({ unitId: 1 });
            dp1 = new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int16,
                address: 100,
                accessMode: AccessMode.ReadWrite
            });
            dp2 = new DataPoint({
                id: 'dp2',
                areas: [DataArea.Coil],
                type: DataType.Bool,
                address: 0,
                accessMode: AccessMode.ReadWrite
            });
            unit.addDataPoint(dp1);
            unit.addDataPoint(dp2);
        });
        test('should get DataPoint by id', () => {
            const dp = unit.getDataPoint('dp1');
            expect(dp).toBe(dp1);
        });
        test('should return undefined for non-existent DataPoint id', () => {
            const dp = unit.getDataPoint('nonexistent');
            expect(dp).toBeUndefined();
        });
        test('should check if DataPoint exists by id', () => {
            expect(unit.hasDataPoint('dp1')).toBe(true);
            expect(unit.hasDataPoint('dp2')).toBe(true);
            expect(unit.hasDataPoint('nonexistent')).toBe(false);
        });
        test('should get DataPoint by area and address', () => {
            const dp = unit.getDataPointAt(DataArea.HoldingRegister, 100);
            expect(dp).toBe(dp1);
        });
        test('should return undefined for non-existent area/address', () => {
            const dp = unit.getDataPointAt(DataArea.HoldingRegister, 999);
            expect(dp).toBeUndefined();
        });
        test('should check if DataPoint exists at area and address', () => {
            expect(unit.hasDataPointAt(DataArea.HoldingRegister, 100)).toBe(true);
            expect(unit.hasDataPointAt(DataArea.Coil, 0)).toBe(true);
            expect(unit.hasDataPointAt(DataArea.HoldingRegister, 999)).toBe(false);
        });
        test('should get all DataPoints', () => {
            const allDataPoints = unit.getAllDataPoints();
            expect(allDataPoints).toHaveLength(2);
            expect(allDataPoints).toContain(dp1);
            expect(allDataPoints).toContain(dp2);
        });
        test('should get DataPoint at multi-register addresses', () => {
            const dp32 = new DataPoint({
                id: 'dp32',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int32,
                address: 200,
                accessMode: AccessMode.ReadWrite
            });
            unit.addDataPoint(dp32);
            expect(unit.getDataPointAt(DataArea.HoldingRegister, 200)).toBe(dp32);
            expect(unit.getDataPointAt(DataArea.HoldingRegister, 201)).toBe(dp32);
        });
    });
    describe('DataPoint Management - Delete', () => {
        let unit;
        beforeEach(() => {
            unit = new ModbusUnit({ unitId: 1 });
        });
        test('should delete DataPoint by id', () => {
            const dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int16,
                address: 100,
                accessMode: AccessMode.ReadWrite
            });
            unit.addDataPoint(dp);
            const result = unit.deleteDataPoint('dp1');
            expect(result).toBe(true);
            expect(unit.hasDataPoint('dp1')).toBe(false);
        });
        test('should return false when deleting non-existent DataPoint', () => {
            const result = unit.deleteDataPoint('nonexistent');
            expect(result).toBe(false);
        });
        test('should remove DataPoint from all address maps', () => {
            const dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int32,
                address: 100,
                accessMode: AccessMode.ReadWrite
            });
            unit.addDataPoint(dp);
            unit.deleteDataPoint('dp1');
            expect(unit.hasDataPointAt(DataArea.HoldingRegister, 100)).toBe(false);
            expect(unit.hasDataPointAt(DataArea.HoldingRegister, 101)).toBe(false);
        });
        test('should delete DataPoint from specific area', () => {
            const dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister, DataArea.InputRegister],
                type: DataType.Int16,
                address: 100,
                accessMode: AccessMode.ReadWrite
            });
            unit.addDataPoint(dp);
            const result = unit.deleteDataPointFromArea('dp1', DataArea.InputRegister);
            expect(result).toBe(true);
            expect(unit.hasDataPointAt(DataArea.HoldingRegister, 100)).toBe(true);
            expect(unit.hasDataPointAt(DataArea.InputRegister, 100)).toBe(false);
        });
        test('should not delete last remaining area from DataPoint', () => {
            const dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int16,
                address: 100,
                accessMode: AccessMode.ReadWrite
            });
            unit.addDataPoint(dp);
            const result = unit.deleteDataPointFromArea('dp1', DataArea.HoldingRegister);
            expect(result).toBe(false);
            expect(unit.hasDataPointAt(DataArea.HoldingRegister, 100)).toBe(true);
        });
        test('should return false when deleting area from non-existent DataPoint', () => {
            const result = unit.deleteDataPointFromArea('nonexistent', DataArea.HoldingRegister);
            expect(result).toBe(false);
        });
    });
    describe('Unit ID Management', () => {
        test('should set valid unit ID', () => {
            const unit = new ModbusUnit({ unitId: 1 });
            unit.setUnitId(100);
            expect(unit.getId()).toBe(100);
        });
        test('should throw error when setting unitId less than 1', () => {
            const unit = new ModbusUnit({ unitId: 1 });
            expect(() => unit.setUnitId(0)).toThrow('ModbusUnit id must be between 1 and 254');
        });
        test('should throw error when setting unitId greater than 254', () => {
            const unit = new ModbusUnit({ unitId: 1 });
            expect(() => unit.setUnitId(255)).toThrow('ModbusUnit id must be between 1 and 254');
        });
        test('should accept boundary values when setting unitId', () => {
            const unit = new ModbusUnit({ unitId: 100 });
            unit.setUnitId(1);
            expect(unit.getId()).toBe(1);
            unit.setUnitId(254);
            expect(unit.getId()).toBe(254);
        });
    });
    describe('Complex Scenarios', () => {
        let unit;
        beforeEach(() => {
            unit = new ModbusUnit({ unitId: 1 });
        });
        test('should handle multiple DataPoints in different areas', () => {
            const dpHolding = new DataPoint({
                id: 'holding1',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int16,
                address: 100,
                accessMode: AccessMode.ReadWrite
            });
            const dpInput = new DataPoint({
                id: 'input1',
                areas: [DataArea.InputRegister],
                type: DataType.Int16,
                address: 100,
                accessMode: AccessMode.ReadOnly
            });
            const dpCoil = new DataPoint({
                id: 'coil1',
                areas: [DataArea.Coil],
                type: DataType.Bool,
                address: 0,
                accessMode: AccessMode.ReadWrite
            });
            const dpDiscrete = new DataPoint({
                id: 'discrete1',
                areas: [DataArea.DiscreteInput],
                type: DataType.Bool,
                address: 0,
                accessMode: AccessMode.ReadOnly
            });
            expect(unit.addDataPoint(dpHolding).success).toBe(true);
            expect(unit.addDataPoint(dpInput).success).toBe(true);
            expect(unit.addDataPoint(dpCoil).success).toBe(true);
            expect(unit.addDataPoint(dpDiscrete).success).toBe(true);
            expect(unit.getAllDataPoints()).toHaveLength(4);
        });
        test('should handle DataPoint spanning multiple areas', () => {
            const dp = new DataPoint({
                id: 'multi',
                areas: [DataArea.HoldingRegister, DataArea.InputRegister],
                type: DataType.Int16,
                address: 100,
                accessMode: AccessMode.ReadWrite
            });
            const result = unit.addDataPoint(dp);
            expect(result.success).toBe(true);
            expect(unit.hasDataPointAt(DataArea.HoldingRegister, 100)).toBe(true);
            expect(unit.hasDataPointAt(DataArea.InputRegister, 100)).toBe(true);
        });
        test('should detect conflict when adding DataPoint to area with existing DataPoint', () => {
            const dp1 = new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int16,
                address: 100,
                accessMode: AccessMode.ReadWrite
            });
            const dp2 = new DataPoint({
                id: 'dp2',
                areas: [DataArea.HoldingRegister, DataArea.InputRegister],
                type: DataType.Int16,
                address: 100,
                accessMode: AccessMode.ReadWrite
            });
            unit.addDataPoint(dp1);
            const result = unit.addDataPoint(dp2);
            expect(result.success).toBe(false);
        });
        test('should handle ASCII DataPoint', () => {
            const dp = new DataPoint({
                id: 'ascii1',
                areas: [DataArea.HoldingRegister],
                type: DataType.ASCII,
                address: 100,
                accessMode: AccessMode.ReadWrite,
                length: 10,
                defaultValue: 'HELLO'
            });
            const result = unit.addDataPoint(dp);
            expect(result.success).toBe(true);
            expect(unit.getDataPoint('ascii1')?.getValue()).toBe('HELLO');
        });
        test('should handle Float64 DataPoint with 4 registers', () => {
            const dp = new DataPoint({
                id: 'float64',
                areas: [DataArea.HoldingRegister],
                type: DataType.Float64,
                address: 100,
                accessMode: AccessMode.ReadWrite,
                defaultValue: 3.141592653589793
            });
            const result = unit.addDataPoint(dp);
            expect(result.success).toBe(true);
            expect(unit.hasDataPointAt(DataArea.HoldingRegister, 100)).toBe(true);
            expect(unit.hasDataPointAt(DataArea.HoldingRegister, 101)).toBe(true);
            expect(unit.hasDataPointAt(DataArea.HoldingRegister, 102)).toBe(true);
            expect(unit.hasDataPointAt(DataArea.HoldingRegister, 103)).toBe(true);
        });
        test('should allow deletion and re-addition of DataPoint', () => {
            const dp1 = new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int16,
                address: 100,
                accessMode: AccessMode.ReadWrite
            });
            const dp2 = new DataPoint({
                id: 'dp2',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int16,
                address: 100,
                accessMode: AccessMode.ReadWrite
            });
            unit.addDataPoint(dp1);
            unit.deleteDataPoint('dp1');
            const result = unit.addDataPoint(dp2);
            expect(result.success).toBe(true);
            expect(unit.hasDataPoint('dp2')).toBe(true);
        });
    });
});
//# sourceMappingURL=ModbusUnit.test.js.map