import { ModbusUnit } from '../src/ModbusUnit.js';
import { DataPoint } from '../src/DataPoint.js';
import { AccessMode } from '../src/types/enums/AccessMode.js';
import { DataArea } from '../src/types/enums/DataArea.js';
import { DataType } from '../src/types/enums/DataType.js';

describe('ModbusUnit', () => {

    describe('Constructor', () => {
        test('should create a valid ModbusUnit with valid id', () => {
            const unit = new ModbusUnit(1);
            expect(unit.getId()).toBe(1);
        });

        test('should throw error when id is less than 1', () => {
            expect(() => new ModbusUnit(0)).toThrow('ModbusUnit id must be between 1 and 254');
            expect(() => new ModbusUnit(-1)).toThrow('ModbusUnit id must be between 1 and 254');
        });

        test('should throw error when id is greater than 254', () => {
            expect(() => new ModbusUnit(255)).toThrow('ModbusUnit id must be between 1 and 254');
            expect(() => new ModbusUnit(300)).toThrow('ModbusUnit id must be between 1 and 254');
        });

        test('should accept boundary values', () => {
            const unit1 = new ModbusUnit(1);
            const unit254 = new ModbusUnit(254);
            expect(unit1.getId()).toBe(1);
            expect(unit254.getId()).toBe(254);
        });
    });

    describe('Set Unit ID', () => {
        test('should set a valid Unit ID', () => {
            const unit = new ModbusUnit(1);
            unit.setUnitId(100);
            expect(unit.getId()).toBe(100);
        });
        test('should throw error when setting id less than 1', () => {
            const unit = new ModbusUnit(1);
            expect(() => unit.setUnitId(0)).toThrow('ModbusUnit id must be between 1 and 254');
        });

        test('should throw error when setting id greater than 254', () => {
            const unit = new ModbusUnit(1);
            expect(() => unit.setUnitId(255)).toThrow('ModbusUnit id must be between 1 and 254');
        });
    });

    describe('DataPoint Management', () => {
        let unit: ModbusUnit;

        beforeEach(() => {
            unit = new ModbusUnit(1);
        });

        test('should add a DataPoint successfully', () => {
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

        test('should throw error when adding undefined DataPoint', () => {
            expect(() => unit.addDataPoint(undefined as any)).toThrow('Cannot add undefined DataPoint to ModbusUnit');
        });

        test('should fail when adding duplicate DataPoint id', () => {
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
                expect(result.errors).toContain("DataPoint with id 'dp1' already exists in ModbusUnit 1");
            }
        });

        test('should fail when adding DataPoint with occupied address', () => {
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
                expect(result.errors).toContain('Address 100 in area HoldingRegister is already occupied in ModbusUnit 1');
            }
        });

        test('should fail when adding DataPoint with overlapping multi-register addresses', () => {
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
                expect(result.errors).toContain('Address 101 in area HoldingRegister is already occupied in ModbusUnit 1');
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
                accessMode: AccessMode.ReadWrite
            });

            const result1 = unit.addDataPoint(dp1);
            const result2 = unit.addDataPoint(dp2);

            expect(result1.success).toBe(true);
            expect(result2.success).toBe(true);
        });

        test('should fail when adding non-Bool DataPoint to Coil area', () => {
            const dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.Coil],
                type: DataType.Int16,
                address: 100,
                accessMode: AccessMode.ReadWrite
            });

            const result = unit.addDataPoint(dp);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.errors).toContain('DataPoint of type Int16 cannot be added to area Coil');
            }
        });

        test('should fail when adding non-Bool DataPoint to DiscreteInput area', () => {
            const dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.DiscreteInput],
                type: DataType.Int16,
                address: 100,
                accessMode: AccessMode.ReadWrite
            });

            const result = unit.addDataPoint(dp);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.errors).toContain('DataPoint of type Int16 cannot be added to area DiscreteInput');
            }
        });

        test('should add Bool DataPoint to Coil area', () => {
            const dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.Coil],
                type: DataType.Bool,
                address: 100,
                accessMode: AccessMode.ReadWrite
            });

            const result = unit.addDataPoint(dp);
            expect(result.success).toBe(true);
        });
    });

    describe('DataPoint Retrieval', () => {
        let unit: ModbusUnit;
        let dp1: DataPoint;
        let dp2: DataPoint;

        beforeEach(() => {
            unit = new ModbusUnit(1);
            
            dp1 = new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int16,
                address: 100,
                accessMode: AccessMode.ReadWrite
            });

            dp2 = new DataPoint({
                id: 'dp2',
                areas: [DataArea.InputRegister],
                type: DataType.Int32,
                address: 200,
                accessMode: AccessMode.ReadWrite
            });

            unit.addDataPoint(dp1);
            unit.addDataPoint(dp2);
        });

        test('should get DataPoint by id', () => {
            expect(unit.getDataPoint('dp1')).toBe(dp1);
            expect(unit.getDataPoint('dp2')).toBe(dp2);
        });

        test('should return undefined for non-existent DataPoint id', () => {
            expect(unit.getDataPoint('nonexistent')).toBeUndefined();
        });

        test('should check if DataPoint exists', () => {
            expect(unit.hasDataPoint('dp1')).toBe(true);
            expect(unit.hasDataPoint('dp2')).toBe(true);
            expect(unit.hasDataPoint('nonexistent')).toBe(false);
        });

        test('should get DataPoint at specific address in area', () => {
            expect(unit.getDataPointAt(DataArea.HoldingRegister, 100)).toBe(dp1);
            expect(unit.getDataPointAt(DataArea.InputRegister, 200)).toBe(dp2);
        });

        test('should return undefined for non-occupied address', () => {
            expect(unit.getDataPointAt(DataArea.HoldingRegister, 999)).toBeUndefined();
        });

        test('should check if address is occupied', () => {
            expect(unit.hasDataPointAt(DataArea.HoldingRegister, 100)).toBe(true);
            expect(unit.hasDataPointAt(DataArea.HoldingRegister, 999)).toBe(false);
        });

        test('should handle multi-register DataPoint addresses', () => {
            expect(unit.hasDataPointAt(DataArea.InputRegister, 200)).toBe(true);
            expect(unit.hasDataPointAt(DataArea.InputRegister, 201)).toBe(true);
            expect(unit.getDataPointAt(DataArea.InputRegister, 200)).toBe(dp2);
            expect(unit.getDataPointAt(DataArea.InputRegister, 201)).toBe(dp2);
        });
    });

    describe('DataPoint Deletion', () => {
        let unit: ModbusUnit;
        let dp: DataPoint;

        beforeEach(() => {
            unit = new ModbusUnit(1);
            
            dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int16,
                address: 100,
                accessMode: AccessMode.ReadWrite
            });

            unit.addDataPoint(dp);
        });

        test('should delete DataPoint successfully', () => {
            const result = unit.deleteDataPoint('dp1');
            expect(result).toBe(true);
            expect(unit.hasDataPoint('dp1')).toBe(false);
            expect(unit.hasDataPointAt(DataArea.HoldingRegister, 100)).toBe(false);
        });

        test('should return false when deleting non-existent DataPoint', () => {
            const result = unit.deleteDataPoint('nonexistent');
            expect(result).toBe(false);
        });

        test('should delete multi-register DataPoint from all addresses', () => {
            const dp2 = new DataPoint({
                id: 'dp2',
                areas: [DataArea.InputRegister],
                type: DataType.Int32,
                address: 200,
                accessMode: AccessMode.ReadWrite
            });

            unit.addDataPoint(dp2);
            unit.deleteDataPoint('dp2');

            expect(unit.hasDataPointAt(DataArea.InputRegister, 200)).toBe(false);
            expect(unit.hasDataPointAt(DataArea.InputRegister, 201)).toBe(false);
        });

        test('should delete DataPoint from multiple areas', () => {
            const dp2 = new DataPoint({
                id: 'dp2',
                areas: [DataArea.HoldingRegister, DataArea.InputRegister],
                type: DataType.Int16,
                address: 300,
                accessMode: AccessMode.ReadWrite
            });

            unit.addDataPoint(dp2);
            unit.deleteDataPoint('dp2');

            expect(unit.hasDataPointAt(DataArea.HoldingRegister, 300)).toBe(false);
            expect(unit.hasDataPointAt(DataArea.InputRegister, 300)).toBe(false);
        });
    });

    describe('DataPoint Area Deletion', () => {
        let unit: ModbusUnit;
        let dp: DataPoint;

        beforeEach(() => {
            unit = new ModbusUnit(1);
            
            dp = new DataPoint({
                id: 'dp1',
                areas: [DataArea.HoldingRegister, DataArea.InputRegister],
                type: DataType.Int16,
                address: 100,
                accessMode: AccessMode.ReadWrite
            });

            unit.addDataPoint(dp);
        });

        test('should delete DataPoint from specific area', () => {
            const result = unit.deleteDataPointFromArea('dp1', DataArea.InputRegister);
            expect(result).toBe(true);
            expect(unit.hasDataPointAt(DataArea.HoldingRegister, 100)).toBe(true);
            expect(unit.hasDataPointAt(DataArea.InputRegister, 100)).toBe(false);
        });

        test('should return false when deleting from non-existent DataPoint', () => {
            const result = unit.deleteDataPointFromArea('nonexistent', DataArea.HoldingRegister);
            expect(result).toBe(false);
        });

        test('should return false when deleting last area', () => {
            const dp2 = new DataPoint({
                id: 'dp2',
                areas: [DataArea.Coil],
                type: DataType.Bool,
                address: 50,
                accessMode: AccessMode.ReadWrite
            });

            unit.addDataPoint(dp2);
            const result = unit.deleteDataPointFromArea('dp2', DataArea.Coil);
            expect(result).toBe(false);
        });

        test('should delete multi-register DataPoint from specific area', () => {
            const dp2 = new DataPoint({
                id: 'dp2',
                areas: [DataArea.HoldingRegister, DataArea.InputRegister],
                type: DataType.Int32,
                address: 200,
                accessMode: AccessMode.ReadWrite
            });

            unit.addDataPoint(dp2);
            unit.deleteDataPointFromArea('dp2', DataArea.InputRegister);

            expect(unit.hasDataPointAt(DataArea.HoldingRegister, 200)).toBe(true);
            expect(unit.hasDataPointAt(DataArea.HoldingRegister, 201)).toBe(true);
            expect(unit.hasDataPointAt(DataArea.InputRegister, 200)).toBe(false);
            expect(unit.hasDataPointAt(DataArea.InputRegister, 201)).toBe(false);
        });
    });

});