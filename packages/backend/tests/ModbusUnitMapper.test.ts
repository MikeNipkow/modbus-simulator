import { ModbusUnit } from "../src/ModbusUnit.js";
import { DataPoint } from "../src/DataPoint.js";
import { unitFromObject, unitToUnitProps } from "../src/mapper/ModbusUnitMapper.js";
import { AccessMode } from "../src/types/enums/AccessMode.js";
import { DataArea } from "../src/types/enums/DataArea.js";
import { DataType } from "../src/types/enums/DataType.js";

describe('ModbusUnitMapper', () => {
    describe('unitToUnitProps', () => {
        describe('Valid Conversions', () => {
            test('should convert a ModbusUnit without DataPoints to ModbusUnitProps', () => {
                const unit = new ModbusUnit({ unitId: 1 });

                const props = unitToUnitProps(unit);

                expect(props.unitId).toBe(1);
                expect(props.dataPoints).toEqual([]);
            });

            test('should convert a ModbusUnit with one DataPoint to ModbusUnitProps', () => {
                const unit = new ModbusUnit({ unitId: 5 });
                const dataPoint = new DataPoint({
                    id: 'dp1',
                    areas: [DataArea.HoldingRegister],
                    type: DataType.Int16,
                    address: 100,
                    accessMode: AccessMode.ReadWrite,
                    defaultValue: 42
                });
                unit.addDataPoint(dataPoint);

                const props = unitToUnitProps(unit);

                expect(props.unitId).toBe(5);
                expect(props.dataPoints).toHaveLength(1);
                expect(props.dataPoints).toBeDefined();
                expect(props.dataPoints![0]!.id).toBe('dp1');
                expect(props.dataPoints![0]!.type).toBe(DataType.Int16);
                expect(props.dataPoints![0]!.address).toBe(100);
                expect(props.dataPoints![0]!.defaultValue).toBe(42);
            });

            test('should convert a ModbusUnit with multiple DataPoints', () => {
                const unit = new ModbusUnit({ unitId: 10 });
                
                const dp1 = new DataPoint({
                    id: 'temp',
                    areas: [DataArea.InputRegister],
                    type: DataType.Float32,
                    address: 0,
                    accessMode: AccessMode.ReadOnly,
                    defaultValue: 20.5,
                    name: 'Temperature',
                    unit: '°C'
                });

                const dp2 = new DataPoint({
                    id: 'pressure',
                    areas: [DataArea.HoldingRegister],
                    type: DataType.UInt16,
                    address: 100,
                    accessMode: AccessMode.ReadWrite,
                    defaultValue: 1013,
                    name: 'Pressure',
                    unit: 'hPa'
                });

                const dp3 = new DataPoint({
                    id: 'status',
                    areas: [DataArea.Coil],
                    type: DataType.Bool,
                    address: 0,
                    accessMode: AccessMode.ReadWrite,
                    defaultValue: true
                });

                unit.addDataPoint(dp1);
                unit.addDataPoint(dp2);
                unit.addDataPoint(dp3);

                const props = unitToUnitProps(unit);

                expect(props.unitId).toBe(10);
                expect(props.dataPoints).toHaveLength(3);
                expect(props.dataPoints).toBeDefined();
                expect(props.dataPoints![0]!.id).toBe('temp');
                expect(props.dataPoints![1]!.id).toBe('pressure');
                expect(props.dataPoints![2]!.id).toBe('status');
            });

            test('should preserve all DataPoint properties in conversion', () => {
                const unit = new ModbusUnit({ unitId: 1 });
                const dataPoint = new DataPoint({
                    id: 'complex_dp',
                    areas: [DataArea.HoldingRegister, DataArea.InputRegister],
                    type: DataType.Int32,
                    address: 500,
                    accessMode: AccessMode.ReadOnly,
                    defaultValue: 123456,
                    name: 'Complex DataPoint',
                    unit: 'units',
                    simulation: {
                        enabled: true,
                        minValue: 0,
                        maxValue: 1000000
                    },
                    feedbackDataPoint: 'feedback1'
                });
                unit.addDataPoint(dataPoint);

                const props = unitToUnitProps(unit);

                expect(props.dataPoints).toHaveLength(1);
                expect(props.dataPoints).toBeDefined();
                const dpProps = props.dataPoints![0]!;
                expect(dpProps.id).toBe('complex_dp');
                expect(dpProps.areas).toEqual([DataArea.HoldingRegister, DataArea.InputRegister]);
                expect(dpProps.type).toBe(DataType.Int32);
                expect(dpProps.address).toBe(500);
                expect(dpProps.accessMode).toBe(AccessMode.ReadOnly);
                expect(dpProps.defaultValue).toBe(123456);
                expect(dpProps.name).toBe('Complex DataPoint');
                expect(dpProps.unit).toBe('units');
                expect(dpProps.simulation).toEqual({
                    enabled: true,
                    minValue: 0,
                    maxValue: 1000000
                });
                expect(dpProps.feedbackDataPoint).toBe('feedback1');
            });

            test('should convert ASCII DataPoint with length', () => {
                const unit = new ModbusUnit({ unitId: 1 });
                const dataPoint = new DataPoint({
                    id: 'ascii1',
                    areas: [DataArea.HoldingRegister],
                    type: DataType.ASCII,
                    address: 50,
                    accessMode: AccessMode.ReadWrite,
                    defaultValue: 'Hello',
                    length: 10
                });
                unit.addDataPoint(dataPoint);

                const props = unitToUnitProps(unit);

                expect(props.dataPoints).toBeDefined();
                expect(props.dataPoints![0]!.type).toBe(DataType.ASCII);
                expect(props.dataPoints![0]!.length).toBe(10);
                expect(props.dataPoints![0]!.defaultValue).toBe('Hello');
            });

            test('should convert DataPoints with different data types', () => {
                const unit = new ModbusUnit({ unitId: 1 });
                
                unit.addDataPoint(new DataPoint({
                    id: 'bool',
                    areas: [DataArea.Coil],
                    type: DataType.Bool,
                    address: 0,
                    accessMode: AccessMode.ReadWrite,
                    defaultValue: true
                }));

                unit.addDataPoint(new DataPoint({
                    id: 'int16',
                    areas: [DataArea.HoldingRegister],
                    type: DataType.Int16,
                    address: 100,
                    accessMode: AccessMode.ReadWrite,
                    defaultValue: -123
                }));

                unit.addDataPoint(new DataPoint({
                    id: 'float32',
                    areas: [DataArea.HoldingRegister],
                    type: DataType.Float32,
                    address: 200,
                    accessMode: AccessMode.ReadWrite,
                    defaultValue: 3.14
                }));

                unit.addDataPoint(new DataPoint({
                    id: 'int64',
                    areas: [DataArea.HoldingRegister],
                    type: DataType.Int64,
                    address: 300,
                    accessMode: AccessMode.ReadWrite,
                    defaultValue: 9007199254740991n
                }));

                const props = unitToUnitProps(unit);

                expect(props.dataPoints).toHaveLength(4);
                expect(props.dataPoints).toBeDefined();
                expect(props.dataPoints![0]!.type).toBe(DataType.Bool);
                expect(props.dataPoints![1]!.type).toBe(DataType.Int16);
                expect(props.dataPoints![2]!.type).toBe(DataType.Float32);
                expect(props.dataPoints![3]!.type).toBe(DataType.Int64);
            });
        });

        describe('Error Handling', () => {
            test('should throw error for null ModbusUnit', () => {
                expect(() => unitToUnitProps(null as any)).toThrow('Invalid ModbusUnit');
            });

            test('should throw error for undefined ModbusUnit', () => {
                expect(() => unitToUnitProps(undefined as any)).toThrow('Invalid ModbusUnit');
            });
        });
    });

    describe('unitFromObject', () => {
        describe('Valid Object Conversions', () => {
            test('should create ModbusUnit from valid object without DataPoints', () => {
                const obj = {
                    unitId: 1
                };

                const result = unitFromObject(obj);

                expect(result.success).toBe(true);
                if (result.success) {
                    expect(result.value).toBeInstanceOf(ModbusUnit);
                    expect(result.value.getId()).toBe(1);
                    expect(result.value.getAllDataPoints()).toHaveLength(0);
                }
            });

            test('should create ModbusUnit from valid object with one DataPoint', () => {
                const obj = {
                    unitId: 5,
                    dataPoints: [
                        {
                            id: 'dp1',
                            areas: [DataArea.HoldingRegister],
                            type: DataType.Int16,
                            address: 100,
                            accessMode: AccessMode.ReadWrite,
                            defaultValue: 42
                        }
                    ]
                };

                const result = unitFromObject(obj);

                expect(result.success).toBe(true);
                if (result.success) {
                    expect(result.value.getId()).toBe(5);
                    const dataPoints = result.value.getAllDataPoints();
                    expect(dataPoints).toHaveLength(1);
                    expect(dataPoints.length).toBeGreaterThan(0);
                    expect(dataPoints[0]!.getId()).toBe('dp1');
                    expect(dataPoints[0]!.getType()).toBe(DataType.Int16);
                    expect(dataPoints[0]!.getValue()).toBe(42);
                }
            });

            test('should create ModbusUnit with multiple DataPoints', () => {
                const obj = {
                    unitId: 10,
                    dataPoints: [
                        {
                            id: 'temp',
                            areas: [DataArea.InputRegister],
                            type: DataType.Float32,
                            address: 0,
                            accessMode: AccessMode.ReadOnly,
                            defaultValue: 20.5,
                            name: 'Temperature',
                            unit: '°C'
                        },
                        {
                            id: 'pressure',
                            areas: [DataArea.HoldingRegister],
                            type: DataType.UInt16,
                            address: 100,
                            accessMode: AccessMode.ReadWrite,
                            defaultValue: 1013,
                            name: 'Pressure',
                            unit: 'hPa'
                        },
                        {
                            id: 'status',
                            areas: [DataArea.Coil],
                            type: DataType.Bool,
                            address: 0,
                            accessMode: AccessMode.ReadWrite,
                            defaultValue: true
                        }
                    ]
                };

                const result = unitFromObject(obj);

                expect(result.success).toBe(true);
                if (result.success) {
                    const dataPoints = result.value.getAllDataPoints();
                    expect(dataPoints).toHaveLength(3);
                    expect(dataPoints.length).toBeGreaterThanOrEqual(3);
                    expect(dataPoints[0]!.getId()).toBe('temp');
                    expect(dataPoints[1]!.getId()).toBe('pressure');
                    expect(dataPoints[2]!.getId()).toBe('status');
                }
            });

            test('should create ModbusUnit with boundary unitId values', () => {
                const obj1 = { unitId: 1 };
                const obj2 = { unitId: 254 };

                const result1 = unitFromObject(obj1);
                const result2 = unitFromObject(obj2);

                expect(result1.success).toBe(true);
                expect(result2.success).toBe(true);
                if (result1.success) expect(result1.value.getId()).toBe(1);
                if (result2.success) expect(result2.value.getId()).toBe(254);
            });

            test('should create ModbusUnit with DataPoints containing all optional properties', () => {
                const obj = {
                    unitId: 1,
                    dataPoints: [
                        {
                            id: 'complex',
                            areas: [DataArea.HoldingRegister, DataArea.InputRegister],
                            type: DataType.Int32,
                            address: 500,
                            accessMode: AccessMode.ReadOnly,
                            defaultValue: 123456,
                            name: 'Complex DataPoint',
                            unit: 'units',
                            simulation: {
                                enabled: true,
                                minValue: 0,
                                maxValue: 1000000
                            },
                            feedbackDataPoint: 'feedback1'
                        }
                    ]
                };

                const result = unitFromObject(obj);

                expect(result.success).toBe(true);
                if (result.success) {
                    const dataPoints = result.value.getAllDataPoints();
                    expect(dataPoints.length).toBeGreaterThan(0);
                    const dp = dataPoints[0]!;
                    expect(dp.getName()).toBe('Complex DataPoint');
                    expect(dp.getUnit()).toBe('units');
                    expect(dp.getSimulation()).toEqual({
                        enabled: true,
                        minValue: 0,
                        maxValue: 1000000
                    });
                    expect(dp.getFeedbackDataPoint()).toBe('feedback1');
                }
            });

            test('should create ModbusUnit with ASCII DataPoint', () => {
                const obj = {
                    unitId: 1,
                    dataPoints: [
                        {
                            id: 'ascii1',
                            areas: [DataArea.HoldingRegister],
                            type: DataType.ASCII,
                            address: 50,
                            accessMode: AccessMode.ReadWrite,
                            defaultValue: 'Hello',
                            length: 10
                        }
                    ]
                };

                const result = unitFromObject(obj);

                expect(result.success).toBe(true);
                if (result.success) {
                    const dataPoints = result.value.getAllDataPoints();
                    expect(dataPoints.length).toBeGreaterThan(0);
                    const dp = dataPoints[0]!;
                    expect(dp.getType()).toBe(DataType.ASCII);
                    expect(dp.getLength()).toBe(10);
                    expect(dp.getValue()).toBe('Hello');
                }
            });

            test('should handle empty dataPoints array', () => {
                const obj = {
                    unitId: 1,
                    dataPoints: []
                };

                const result = unitFromObject(obj);

                expect(result.success).toBe(true);
                if (result.success) {
                    expect(result.value.getAllDataPoints()).toHaveLength(0);
                }
            });
        });

        describe('Invalid Object - Null/Invalid Type', () => {
            test('should fail for null object', () => {
                const result = unitFromObject(null);

                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.errors).toContain('Invalid object for ModbusUnit');
                }
            });

            test('should fail for undefined object', () => {
                const result = unitFromObject(undefined);

                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.errors).toContain('Invalid object for ModbusUnit');
                }
            });

            test('should fail for non-object types', () => {
                const result = unitFromObject('string');

                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.errors).toContain('Invalid object for ModbusUnit');
                }
            });
        });

        describe('Invalid UnitId', () => {
            test('should fail for missing unitId', () => {
                const obj = {};

                const result = unitFromObject(obj);

                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.errors).toContain('ModbusUnit unitId must be between 1 and 254');
                }
            });

            test('should fail for unitId less than 1', () => {
                const obj = { unitId: 0 };

                const result = unitFromObject(obj);

                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.errors).toContain('ModbusUnit unitId must be between 1 and 254');
                }
            });

            test('should fail for negative unitId', () => {
                const obj = { unitId: -5 };

                const result = unitFromObject(obj);

                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.errors).toContain('ModbusUnit unitId must be between 1 and 254');
                }
            });

            test('should fail for unitId greater than 254', () => {
                const obj = { unitId: 255 };

                const result = unitFromObject(obj);

                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.errors).toContain('ModbusUnit unitId must be between 1 and 254');
                }
            });
        });

        describe('Invalid DataPoints', () => {
            test('should fail when DataPoint has invalid id', () => {
                const obj = {
                    unitId: 1,
                    dataPoints: [
                        {
                            id: '',
                            areas: [DataArea.HoldingRegister],
                            type: DataType.Int16,
                            address: 100,
                            accessMode: AccessMode.ReadWrite
                        }
                    ]
                };

                const result = unitFromObject(obj);

                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.errors.some(e => e.includes('DataPoint error'))).toBe(true);
                    expect(result.errors.some(e => e.includes('valid id'))).toBe(true);
                }
            });

            test('should fail when DataPoint has invalid type', () => {
                const obj = {
                    unitId: 1,
                    dataPoints: [
                        {
                            id: 'dp1',
                            areas: [DataArea.HoldingRegister],
                            type: 'InvalidType',
                            address: 100,
                            accessMode: AccessMode.ReadWrite
                        }
                    ]
                };

                const result = unitFromObject(obj);

                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.errors.some(e => e.includes('DataPoint error'))).toBe(true);
                    expect(result.errors.some(e => e.includes('valid type'))).toBe(true);
                }
            });

            test('should fail when DataPoint has invalid address', () => {
                const obj = {
                    unitId: 1,
                    dataPoints: [
                        {
                            id: 'dp1',
                            areas: [DataArea.HoldingRegister],
                            type: DataType.Int16,
                            address: -1,
                            accessMode: AccessMode.ReadWrite
                        }
                    ]
                };

                const result = unitFromObject(obj);

                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.errors.some(e => e.includes('DataPoint error'))).toBe(true);
                    expect(result.errors.some(e => e.includes('valid address'))).toBe(true);
                }
            });

            test('should fail when DataPoint has invalid accessMode', () => {
                const obj = {
                    unitId: 1,
                    dataPoints: [
                        {
                            id: 'dp1',
                            areas: [DataArea.HoldingRegister],
                            type: DataType.Int16,
                            address: 100,
                            accessMode: 'InvalidMode'
                        }
                    ]
                };

                const result = unitFromObject(obj);

                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.errors.some(e => e.includes('DataPoint error'))).toBe(true);
                    expect(result.errors.some(e => e.includes('valid accessMode'))).toBe(true);
                }
            });

            test('should fail when DataPoint has type mismatch in defaultValue', () => {
                const obj = {
                    unitId: 1,
                    dataPoints: [
                        {
                            id: 'dp1',
                            areas: [DataArea.HoldingRegister],
                            type: DataType.Int16,
                            address: 100,
                            accessMode: AccessMode.ReadWrite,
                            defaultValue: 'not a number'
                        }
                    ]
                };

                const result = unitFromObject(obj);

                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.errors.some(e => e.includes('DataPoint error'))).toBe(true);
                    expect(result.errors.some(e => e.includes('defaultValue type does not match'))).toBe(true);
                }
            });

            test('should fail when ASCII DataPoint is missing length', () => {
                const obj = {
                    unitId: 1,
                    dataPoints: [
                        {
                            id: 'ascii1',
                            areas: [DataArea.HoldingRegister],
                            type: DataType.ASCII,
                            address: 50,
                            accessMode: AccessMode.ReadWrite,
                            defaultValue: 'Hello'
                        }
                    ]
                };

                const result = unitFromObject(obj);

                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.errors.some(e => e.includes('DataPoint error'))).toBe(true);
                    expect(result.errors.some(e => e.includes('ASCII must have a valid length'))).toBe(true);
                }
            });

            test('should fail when DataPoint has invalid simulation', () => {
                const obj = {
                    unitId: 1,
                    dataPoints: [
                        {
                            id: 'dp1',
                            areas: [DataArea.HoldingRegister],
                            type: DataType.Int16,
                            address: 100,
                            accessMode: AccessMode.ReadWrite,
                            simulation: {
                                enabled: 'yes',
                                minValue: 0,
                                maxValue: 100
                            }
                        }
                    ]
                };

                const result = unitFromObject(obj);

                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.errors.some(e => e.includes('DataPoint error'))).toBe(true);
                    expect(result.errors.some(e => e.includes('enabled property of type boolean'))).toBe(true);
                }
            });

            test('should fail when multiple DataPoints have validation errors', () => {
                const obj = {
                    unitId: 1,
                    dataPoints: [
                        {
                            id: '',
                            areas: [DataArea.HoldingRegister],
                            type: DataType.Int16,
                            address: 100,
                            accessMode: AccessMode.ReadWrite
                        },
                        {
                            id: 'dp2',
                            areas: [DataArea.HoldingRegister],
                            type: 'InvalidType',
                            address: 200,
                            accessMode: AccessMode.ReadWrite
                        }
                    ]
                };

                const result = unitFromObject(obj);

                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.errors.length).toBeGreaterThan(1);
                    expect(result.errors.filter(e => e.includes('DataPoint error')).length).toBeGreaterThan(0);
                }
            });
        });

        describe('DataPoint Addition Conflicts', () => {
            test('should fail when DataPoints have address conflicts in same area', () => {
                const obj = {
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

                const result = unitFromObject(obj);

                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.errors.some(e => e.includes('occupied'))).toBe(true);
                }
            });

            test('should fail when multi-register DataPoints overlap', () => {
                const obj = {
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

                const result = unitFromObject(obj);

                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.errors.some(e => e.includes('occupied'))).toBe(true);
                }
            });

            test('should fail when DataPoints in different areas have incompatible types', () => {
                const obj = {
                    unitId: 1,
                    dataPoints: [
                        {
                            id: 'dp1',
                            areas: [DataArea.Coil, DataArea.HoldingRegister],
                            type: DataType.Byte,
                            address: 0,
                            accessMode: AccessMode.ReadWrite
                        },
                        {
                            id: 'dp2',
                            areas: [DataArea.HoldingRegister],
                            type: DataType.Int16,
                            address: 1,
                            accessMode: AccessMode.ReadWrite
                        }
                    ]
                };

                const result = unitFromObject(obj);

                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.errors.some(e => e.includes('cannot be in Coils or DiscreteInputs areas'))).toBe(true);
                }
            });
        });

        describe('Round-trip Conversion', () => {
            test('should preserve all properties in round-trip conversion', () => {
                const originalUnit = new ModbusUnit({ unitId: 42 });
                
                const dp1 = new DataPoint({
                    id: 'temp',
                    areas: [DataArea.InputRegister],
                    type: DataType.Float32,
                    address: 0,
                    accessMode: AccessMode.ReadOnly,
                    defaultValue: 20.5,
                    name: 'Temperature',
                    unit: '°C',
                    simulation: {
                        enabled: true,
                        minValue: -40,
                        maxValue: 125
                    }
                });

                const dp2 = new DataPoint({
                    id: 'pressure',
                    areas: [DataArea.HoldingRegister],
                    type: DataType.UInt32,
                    address: 100,
                    accessMode: AccessMode.ReadWrite,
                    defaultValue: 101325,
                    name: 'Pressure',
                    unit: 'Pa'
                });

                originalUnit.addDataPoint(dp1);
                originalUnit.addDataPoint(dp2);

                const props = unitToUnitProps(originalUnit);
                const result = unitFromObject(props);

                expect(result.success).toBe(true);
                if (result.success) {
                    const newUnit = result.value;
                    expect(newUnit.getId()).toBe(originalUnit.getId());
                    
                    const originalDPs = originalUnit.getAllDataPoints();
                    const newDPs = newUnit.getAllDataPoints();
                    expect(newDPs).toHaveLength(originalDPs.length);
                    
                    for (let i = 0; i < originalDPs.length; i++) {
                        expect(newDPs[i]!.getId()).toBe(originalDPs[i]!.getId());
                        expect(newDPs[i]!.getType()).toBe(originalDPs[i]!.getType());
                        expect(newDPs[i]!.getAddress()).toBe(originalDPs[i]!.getAddress());
                        expect(newDPs[i]!.getAccessMode()).toBe(originalDPs[i]!.getAccessMode());
                        expect(newDPs[i]!.getValue()).toBe(originalDPs[i]!.getValue());
                        expect(newDPs[i]!.getName()).toBe(originalDPs[i]!.getName());
                        expect(newDPs[i]!.getUnit()).toBe(originalDPs[i]!.getUnit());
                    }
                }
            });

            test('should preserve empty ModbusUnit in round-trip conversion', () => {
                const originalUnit = new ModbusUnit({ unitId: 100 });

                const props = unitToUnitProps(originalUnit);
                const result = unitFromObject(props);

                expect(result.success).toBe(true);
                if (result.success) {
                    expect(result.value.getId()).toBe(100);
                    expect(result.value.getAllDataPoints()).toHaveLength(0);
                }
            });

            test('should preserve complex DataPoints in round-trip conversion', () => {
                const originalUnit = new ModbusUnit({ unitId: 1 });
                
                const complexDP = new DataPoint({
                    id: 'complex',
                    areas: [DataArea.HoldingRegister, DataArea.InputRegister],
                    type: DataType.Float64,
                    address: 500,
                    accessMode: AccessMode.ReadOnly,
                    defaultValue: 3.14159265359,
                    name: 'Pi',
                    unit: 'radians',
                    simulation: {
                        enabled: false,
                        minValue: 0,
                        maxValue: 10
                    },
                    feedbackDataPoint: 'feedback_pi'
                });

                originalUnit.addDataPoint(complexDP);

                const props = unitToUnitProps(originalUnit);
                const result = unitFromObject(props);

                expect(result.success).toBe(true);
                if (result.success) {
                    const dataPoints = result.value.getAllDataPoints();
                    expect(dataPoints.length).toBeGreaterThan(0);
                    const dp = dataPoints[0]!;
                    expect(dp.getId()).toBe('complex');
                    expect(dp.getAreas()).toEqual([DataArea.HoldingRegister, DataArea.InputRegister]);
                    expect(dp.getType()).toBe(DataType.Float64);
                    expect(dp.getValue()).toBeCloseTo(3.14159265359);
                    expect(dp.getSimulation()).toEqual({
                        enabled: false,
                        minValue: 0,
                        maxValue: 10
                    });
                    expect(dp.getFeedbackDataPoint()).toBe('feedback_pi');
                }
            });
        });

        describe('Edge Cases', () => {
            test('should handle non-array dataPoints property', () => {
                const obj = {
                    unitId: 1,
                    dataPoints: 'not an array'
                };

                const result = unitFromObject(obj);

                // Should succeed but ignore invalid dataPoints
                expect(result.success).toBe(true);
                if (result.success) {
                    expect(result.value.getAllDataPoints()).toHaveLength(0);
                }
            });

            test('should successfully add valid DataPoints and skip invalid ones', () => {
                const obj = {
                    unitId: 1,
                    dataPoints: [
                        {
                            id: 'valid',
                            areas: [DataArea.HoldingRegister],
                            type: DataType.Int16,
                            address: 100,
                            accessMode: AccessMode.ReadWrite
                        },
                        {
                            id: '',
                            areas: [DataArea.HoldingRegister],
                            type: DataType.Int16,
                            address: 200,
                            accessMode: AccessMode.ReadWrite
                        }
                    ]
                };

                const result = unitFromObject(obj);

                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.errors.some(e => e.includes('DataPoint error'))).toBe(true);
                }
            });
        });
    });
});
