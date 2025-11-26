import { DataPoint } from "../src/DataPoint.js";
import { dataPointFromObject, dataPointToDataPointProps } from "../src/mapper/DataPointMapper.js";
import { AccessMode } from "../src/types/enums/AccessMode.js";
import { DataArea } from "../src/types/enums/DataArea.js";
import { DataType } from "../src/types/enums/DataType.js";

describe('DataPointMapper', () => {
    describe('dataPointToDataPointProps', () => {
        describe('Valid Conversions', () => {
            test('should convert a basic DataPoint to DataPointProps', () => {
                const dataPoint = new DataPoint({
                    id: 'dp1',
                    areas: [DataArea.HoldingRegister],
                    type: DataType.Int16,
                    address: 100,
                    accessMode: AccessMode.ReadWrite,
                    defaultValue: 42
                });

                const props = dataPointToDataPointProps(dataPoint);

                expect(props.id).toBe('dp1');
                expect(props.areas).toEqual([DataArea.HoldingRegister]);
                expect(props.type).toBe(DataType.Int16);
                expect(props.address).toBe(100);
                expect(props.accessMode).toBe(AccessMode.ReadWrite);
                expect(props.defaultValue).toBe(42);
            });

            test('should convert DataPoint with name and unit', () => {
                const dataPoint = new DataPoint({
                    id: 'temp1',
                    areas: [DataArea.InputRegister],
                    type: DataType.Float32,
                    address: 0,
                    accessMode: AccessMode.ReadOnly,
                    defaultValue: 20.5,
                    name: 'Temperature Sensor',
                    unit: '°C'
                });

                const props = dataPointToDataPointProps(dataPoint);

                expect(props.name).toBe('Temperature Sensor');
                expect(props.unit).toBe('°C');
            });

            test('should convert DataPoint with ASCII type including length', () => {
                const dataPoint = new DataPoint({
                    id: 'ascii1',
                    areas: [DataArea.HoldingRegister],
                    type: DataType.ASCII,
                    address: 50,
                    accessMode: AccessMode.ReadWrite,
                    defaultValue: 'Hello',
                    length: 10
                });

                const props = dataPointToDataPointProps(dataPoint);

                expect(props.type).toBe(DataType.ASCII);
                expect(props.length).toBe(10);
                expect(props.defaultValue).toBe('Hello');
            });

            test('should convert DataPoint with simulation', () => {
                const dataPoint = new DataPoint({
                    id: 'sim1',
                    areas: [DataArea.HoldingRegister],
                    type: DataType.Int16,
                    address: 10,
                    accessMode: AccessMode.ReadWrite,
                    defaultValue: 50,
                    simulation: {
                        enabled: true,
                        minValue: 0,
                        maxValue: 100
                    }
                });

                const props = dataPointToDataPointProps(dataPoint);

                expect(props.simulation).toBeDefined();
                expect(props.simulation?.enabled).toBe(true);
                expect(props.simulation?.minValue).toBe(0);
                expect(props.simulation?.maxValue).toBe(100);
            });

            test('should convert DataPoint with feedbackDataPoint', () => {
                const dataPoint = new DataPoint({
                    id: 'dp1',
                    areas: [DataArea.Coil],
                    type: DataType.Bool,
                    address: 0,
                    accessMode: AccessMode.WriteOnly,
                    defaultValue: false,
                    feedbackDataPoint: 'dp2'
                });

                const props = dataPointToDataPointProps(dataPoint);

                expect(props.feedbackDataPoint).toBe('dp2');
            });

            test('should convert DataPoint with multiple areas', () => {
                const dataPoint = new DataPoint({
                    id: 'multi1',
                    areas: [DataArea.HoldingRegister, DataArea.InputRegister],
                    type: DataType.UInt16,
                    address: 20,
                    accessMode: AccessMode.ReadOnly,
                    defaultValue: 1000
                });

                const props = dataPointToDataPointProps(dataPoint);

                expect(props.areas).toHaveLength(2);
                expect(props.areas).toContain(DataArea.HoldingRegister);
                expect(props.areas).toContain(DataArea.InputRegister);
            });

            test('should convert Bool DataPoint in Coil area', () => {
                const dataPoint = new DataPoint({
                    id: 'coil1',
                    areas: [DataArea.Coil],
                    type: DataType.Bool,
                    address: 5,
                    accessMode: AccessMode.ReadWrite,
                    defaultValue: true
                });

                const props = dataPointToDataPointProps(dataPoint);

                expect(props.type).toBe(DataType.Bool);
                expect(props.areas).toEqual([DataArea.Coil]);
                expect(props.defaultValue).toBe(true);
            });

            test('should convert BigInt DataPoint (Int64)', () => {
                const dataPoint = new DataPoint({
                    id: 'big1',
                    areas: [DataArea.HoldingRegister],
                    type: DataType.Int64,
                    address: 100,
                    accessMode: AccessMode.ReadWrite,
                    defaultValue: 9007199254740991n
                });

                const props = dataPointToDataPointProps(dataPoint);

                expect(props.type).toBe(DataType.Int64);
                expect(typeof props.defaultValue).toBe('string');
                expect(props.defaultValue).toBe('9007199254740991');
            });
        });

        describe('Error Handling', () => {
            test('should throw error for null DataPoint', () => {
                expect(() => dataPointToDataPointProps(null as any)).toThrow('Invalid DataPoint');
            });

            test('should throw error for undefined DataPoint', () => {
                expect(() => dataPointToDataPointProps(undefined as any)).toThrow('Invalid DataPoint');
            });
        });
    });

    describe('dataPointFromObject', () => {
        describe('Valid Object Conversions', () => {
            test('should create DataPoint from valid basic object', () => {
                const obj = {
                    id: 'dp1',
                    areas: [DataArea.HoldingRegister],
                    type: DataType.Int16,
                    address: 100,
                    accessMode: AccessMode.ReadWrite,
                    defaultValue: 42
                };

                const result = dataPointFromObject(obj);

                expect(result.success).toBe(true);
                if (result.success) {
                    expect(result.value).toBeInstanceOf(DataPoint);
                    expect(result.value.getId()).toBe('dp1');
                    expect(result.value.getType()).toBe(DataType.Int16);
                    expect(result.value.getAddress()).toBe(100);
                    expect(result.value.getValue()).toBe(42);
                }
            });

            test('should create DataPoint with name and unit', () => {
                const obj = {
                    id: 'temp1',
                    areas: [DataArea.InputRegister],
                    type: DataType.Float32,
                    address: 0,
                    accessMode: AccessMode.ReadOnly,
                    defaultValue: 20.5,
                    name: 'Temperature',
                    unit: '°C'
                };

                const result = dataPointFromObject(obj);

                expect(result.success).toBe(true);
                if (result.success) {
                    expect(result.value.getName()).toBe('Temperature');
                    expect(result.value.getUnit()).toBe('°C');
                }
            });

            test('should create ASCII DataPoint with length', () => {
                const obj = {
                    id: 'ascii1',
                    areas: [DataArea.HoldingRegister],
                    type: DataType.ASCII,
                    address: 50,
                    accessMode: AccessMode.ReadWrite,
                    defaultValue: 'Hello',
                    length: 10
                };

                const result = dataPointFromObject(obj);

                expect(result.success).toBe(true);
                if (result.success) {
                    expect(result.value.getType()).toBe(DataType.ASCII);
                    expect(result.value.getLength()).toBe(10);
                    expect(result.value.getValue()).toBe('Hello');
                }
            });

            test('should create DataPoint with simulation', () => {
                const obj = {
                    id: 'sim1',
                    areas: [DataArea.HoldingRegister],
                    type: DataType.Int16,
                    address: 10,
                    accessMode: AccessMode.ReadWrite,
                    defaultValue: 50,
                    simulation: {
                        enabled: true,
                        minValue: 0,
                        maxValue: 100
                    }
                };

                const result = dataPointFromObject(obj);

                expect(result.success).toBe(true);
                if (result.success) {
                    expect(result.value.getSimulation()).toEqual({
                        enabled: true,
                        minValue: 0,
                        maxValue: 100
                    });
                }
            });

            test('should create DataPoint with feedbackDataPoint', () => {
                const obj = {
                    id: 'dp1',
                    areas: [DataArea.Coil],
                    type: DataType.Bool,
                    address: 0,
                    accessMode: AccessMode.WriteOnly,
                    defaultValue: false,
                    feedbackDataPoint: 'dp2'
                };

                const result = dataPointFromObject(obj);

                expect(result.success).toBe(true);
                if (result.success) {
                    expect(result.value.hasFeedbackDataPoint()).toBe(true);
                    expect(result.value.getFeedbackDataPoint()).toBe('dp2');
                }
            });

            test('should create DataPoint without defaultValue', () => {
                const obj = {
                    id: 'dp1',
                    areas: [DataArea.HoldingRegister],
                    type: DataType.Int16,
                    address: 100,
                    accessMode: AccessMode.ReadWrite
                };

                const result = dataPointFromObject(obj);

                expect(result.success).toBe(true);
                if (result.success) {
                    expect(result.value.getValue()).toBe(0); // Default for Int16
                }
            });

            test('should create Bool DataPoint in Coil area', () => {
                const obj = {
                    id: 'coil1',
                    areas: [DataArea.Coil],
                    type: DataType.Bool,
                    address: 5,
                    accessMode: AccessMode.ReadWrite,
                    defaultValue: true
                };

                const result = dataPointFromObject(obj);

                expect(result.success).toBe(true);
                if (result.success) {
                    expect(result.value.getType()).toBe(DataType.Bool);
                    expect(result.value.getValue()).toBe(true);
                }
            });

            test('should create Bool DataPoint in DiscreteInput area with ReadOnly', () => {
                const obj = {
                    id: 'di1',
                    areas: [DataArea.DiscreteInput],
                    type: DataType.Bool,
                    address: 10,
                    accessMode: AccessMode.ReadOnly,
                    defaultValue: false
                };

                const result = dataPointFromObject(obj);

                expect(result.success).toBe(true);
                if (result.success) {
                    expect(result.value.getAreas()).toEqual([DataArea.DiscreteInput]);
                    expect(result.value.getAccessMode()).toBe(AccessMode.ReadOnly);
                }
            });

            test('should create DataPoint with multiple areas', () => {
                const obj = {
                    id: 'multi1',
                    areas: [DataArea.HoldingRegister, DataArea.InputRegister],
                    type: DataType.UInt16,
                    address: 20,
                    accessMode: AccessMode.ReadOnly,
                    defaultValue: 1000
                };

                const result = dataPointFromObject(obj);

                expect(result.success).toBe(true);
                if (result.success) {
                    const areas = result.value.getAreas();
                    expect(areas).toHaveLength(2);
                    expect(areas).toContain(DataArea.HoldingRegister);
                    expect(areas).toContain(DataArea.InputRegister);
                }
            });

            test('should create Float64 DataPoint', () => {
                const obj = {
                    id: 'float64',
                    areas: [DataArea.HoldingRegister],
                    type: DataType.Float64,
                    address: 200,
                    accessMode: AccessMode.ReadWrite,
                    defaultValue: 3.14159265359
                };

                const result = dataPointFromObject(obj);

                expect(result.success).toBe(true);
                if (result.success) {
                    expect(result.value.getType()).toBe(DataType.Float64);
                    expect(result.value.getValue()).toBeCloseTo(3.14159265359);
                }
            });
        });

        describe('Invalid Object - Null/Invalid Type', () => {
            test('should fail for null object', () => {
                const result = dataPointFromObject(null);

                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.errors).toContain('Invalid object for DataPoint');
                }
            });

            test('should fail for undefined object', () => {
                const result = dataPointFromObject(undefined);

                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.errors).toContain('Invalid object for DataPoint');
                }
            });

            test('should fail for non-object types', () => {
                const result = dataPointFromObject('string');

                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.errors).toContain('Invalid object for DataPoint');
                }
            });
        });

        describe('Invalid ID', () => {
            test('should fail for missing id', () => {
                const obj = {
                    areas: [DataArea.HoldingRegister],
                    type: DataType.Int16,
                    address: 100,
                    accessMode: AccessMode.ReadWrite
                };

                const result = dataPointFromObject(obj);

                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.errors).toContain('DataPoint must have a valid id');
                }
            });

            test('should fail for non-string id', () => {
                const obj = {
                    id: 123,
                    areas: [DataArea.HoldingRegister],
                    type: DataType.Int16,
                    address: 100,
                    accessMode: AccessMode.ReadWrite
                };

                const result = dataPointFromObject(obj);

                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.errors).toContain('DataPoint must have a valid id');
                }
            });

            test('should fail for empty string id', () => {
                const obj = {
                    id: '',
                    areas: [DataArea.HoldingRegister],
                    type: DataType.Int16,
                    address: 100,
                    accessMode: AccessMode.ReadWrite
                };

                const result = dataPointFromObject(obj);

                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.errors).toContain('DataPoint must have a valid id');
                }
            });
        });

        describe('Invalid Areas', () => {
            test('should fail for missing areas', () => {
                const obj = {
                    id: 'dp1',
                    type: DataType.Int16,
                    address: 100,
                    accessMode: AccessMode.ReadWrite
                };

                const result = dataPointFromObject(obj);

                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.errors).toContain('DataPoint must have valid areas');
                }
            });

            test('should fail for non-array areas', () => {
                const obj = {
                    id: 'dp1',
                    areas: 'HoldingRegister',
                    type: DataType.Int16,
                    address: 100,
                    accessMode: AccessMode.ReadWrite
                };

                const result = dataPointFromObject(obj);

                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.errors).toContain('DataPoint must have valid areas');
                }
            });

            test('should fail for invalid DataArea value', () => {
                const obj = {
                    id: 'dp1',
                    areas: ['InvalidArea'],
                    type: DataType.Int16,
                    address: 100,
                    accessMode: AccessMode.ReadWrite
                };

                const result = dataPointFromObject(obj);

                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.errors.some(e => e.includes('Invalid DataArea'))).toBe(true);
                }
            });

            test('should fail for DiscreteInput with non-ReadOnly accessMode', () => {
                const obj = {
                    id: 'di1',
                    areas: [DataArea.DiscreteInput],
                    type: DataType.Bool,
                    address: 10,
                    accessMode: AccessMode.ReadWrite
                };

                const result = dataPointFromObject(obj);

                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.errors).toContain('DataPoint in DiscreteInputs and InputRegisters can only have ReadOnly accessMode');
                }
            });

            test('should fail for InputRegister with WriteOnly accessMode', () => {
                const obj = {
                    id: 'ir1',
                    areas: [DataArea.InputRegister],
                    type: DataType.Int16,
                    address: 10,
                    accessMode: AccessMode.WriteOnly
                };

                const result = dataPointFromObject(obj);

                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.errors).toContain('DataPoint in DiscreteInputs and InputRegisters can only have ReadOnly accessMode');
                }
            });

            test('should fail for non-Bool type in Coil area', () => {
                const obj = {
                    id: 'coil1',
                    areas: [DataArea.Coil],
                    type: DataType.Int16,
                    address: 5,
                    accessMode: AccessMode.ReadWrite
                };

                const result = dataPointFromObject(obj);

                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.errors).toContain('DataPoint of type other than Bool cannot be in Coils or DiscreteInputs areas');
                }
            });

            test('should fail for non-Bool type in DiscreteInput area', () => {
                const obj = {
                    id: 'di1',
                    areas: [DataArea.DiscreteInput],
                    type: DataType.UInt16,
                    address: 10,
                    accessMode: AccessMode.ReadOnly
                };

                const result = dataPointFromObject(obj);

                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.errors).toContain('DataPoint of type other than Bool cannot be in Coils or DiscreteInputs areas');
                }
            });
        });

        describe('Invalid Type', () => {
            test('should fail for missing type', () => {
                const obj = {
                    id: 'dp1',
                    areas: [DataArea.HoldingRegister],
                    address: 100,
                    accessMode: AccessMode.ReadWrite
                };

                const result = dataPointFromObject(obj);

                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.errors).toContain('DataPoint must have a valid type');
                }
            });

            test('should fail for invalid DataType value', () => {
                const obj = {
                    id: 'dp1',
                    areas: [DataArea.HoldingRegister],
                    type: 'InvalidType',
                    address: 100,
                    accessMode: AccessMode.ReadWrite
                };

                const result = dataPointFromObject(obj);

                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.errors).toContain('DataPoint must have a valid type');
                }
            });
        });

        describe('Invalid Address', () => {
            test('should fail for missing address', () => {
                const obj = {
                    id: 'dp1',
                    areas: [DataArea.HoldingRegister],
                    type: DataType.Int16,
                    accessMode: AccessMode.ReadWrite
                };

                const result = dataPointFromObject(obj);

                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.errors).toContain('DataPoint must have a valid address');
                }
            });

            test('should fail for non-number address', () => {
                const obj = {
                    id: 'dp1',
                    areas: [DataArea.HoldingRegister],
                    type: DataType.Int16,
                    address: '100',
                    accessMode: AccessMode.ReadWrite
                };

                const result = dataPointFromObject(obj);

                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.errors).toContain('DataPoint must have a valid address');
                }
            });

            test('should fail for negative address', () => {
                const obj = {
                    id: 'dp1',
                    areas: [DataArea.HoldingRegister],
                    type: DataType.Int16,
                    address: -1,
                    accessMode: AccessMode.ReadWrite
                };

                const result = dataPointFromObject(obj);

                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.errors).toContain('DataPoint must have a valid address');
                }
            });

            test('should fail for address greater than 65535', () => {
                const obj = {
                    id: 'dp1',
                    areas: [DataArea.HoldingRegister],
                    type: DataType.Int16,
                    address: 65536,
                    accessMode: AccessMode.ReadWrite
                };

                const result = dataPointFromObject(obj);

                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.errors).toContain('DataPoint must have a valid address');
                }
            });

            test('should accept boundary address values', () => {
                const obj1 = {
                    id: 'dp1',
                    areas: [DataArea.HoldingRegister],
                    type: DataType.Int16,
                    address: 0,
                    accessMode: AccessMode.ReadWrite
                };
                const obj2 = {
                    id: 'dp2',
                    areas: [DataArea.HoldingRegister],
                    type: DataType.Int16,
                    address: 65535,
                    accessMode: AccessMode.ReadWrite
                };

                const result1 = dataPointFromObject(obj1);
                const result2 = dataPointFromObject(obj2);

                expect(result1.success).toBe(true);
                expect(result2.success).toBe(true);
            });
        });

        describe('Invalid AccessMode', () => {
            test('should fail for missing accessMode', () => {
                const obj = {
                    id: 'dp1',
                    areas: [DataArea.HoldingRegister],
                    type: DataType.Int16,
                    address: 100
                };

                const result = dataPointFromObject(obj);

                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.errors).toContain('DataPoint must have a valid accessMode');
                }
            });

            test('should fail for invalid AccessMode value', () => {
                const obj = {
                    id: 'dp1',
                    areas: [DataArea.HoldingRegister],
                    type: DataType.Int16,
                    address: 100,
                    accessMode: 'InvalidMode'
                };

                const result = dataPointFromObject(obj);

                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.errors).toContain('DataPoint must have a valid accessMode');
                }
            });
        });

        describe('Invalid DefaultValue', () => {
            test('should fail when defaultValue type does not match DataType (string for Int16)', () => {
                const obj = {
                    id: 'dp1',
                    areas: [DataArea.HoldingRegister],
                    type: DataType.Int16,
                    address: 100,
                    accessMode: AccessMode.ReadWrite,
                    defaultValue: 'not a number'
                };

                const result = dataPointFromObject(obj);

                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.errors.some(e => e.includes('defaultValue type does not match'))).toBe(true);
                }
            });

            test('should fail when defaultValue type does not match DataType (number for Bool)', () => {
                const obj = {
                    id: 'dp1',
                    areas: [DataArea.Coil],
                    type: DataType.Bool,
                    address: 0,
                    accessMode: AccessMode.ReadWrite,
                    defaultValue: 123
                };

                const result = dataPointFromObject(obj);

                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.errors.some(e => e.includes('defaultValue type does not match'))).toBe(true);
                }
            });

            test('should fail when defaultValue type does not match DataType (boolean for Float32)', () => {
                const obj = {
                    id: 'dp1',
                    areas: [DataArea.HoldingRegister],
                    type: DataType.Float32,
                    address: 100,
                    accessMode: AccessMode.ReadWrite,
                    defaultValue: true
                };

                const result = dataPointFromObject(obj);

                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.errors.some(e => e.includes('defaultValue type does not match'))).toBe(true);
                }
            });
        });

        describe('Invalid ASCII Length', () => {
            test('should fail for ASCII type without length', () => {
                const obj = {
                    id: 'ascii1',
                    areas: [DataArea.HoldingRegister],
                    type: DataType.ASCII,
                    address: 50,
                    accessMode: AccessMode.ReadWrite,
                    defaultValue: 'Hello'
                };

                const result = dataPointFromObject(obj);

                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.errors).toContain('DataPoint of type ASCII must have a valid length greater than 0');
                }
            });

            test('should fail for ASCII type with non-number length', () => {
                const obj = {
                    id: 'ascii1',
                    areas: [DataArea.HoldingRegister],
                    type: DataType.ASCII,
                    address: 50,
                    accessMode: AccessMode.ReadWrite,
                    defaultValue: 'Hello',
                    length: '10'
                };

                const result = dataPointFromObject(obj);

                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.errors).toContain('DataPoint of type ASCII must have a valid length greater than 0');
                }
            });

            test('should fail for ASCII type with length less than 1', () => {
                const obj = {
                    id: 'ascii1',
                    areas: [DataArea.HoldingRegister],
                    type: DataType.ASCII,
                    address: 50,
                    accessMode: AccessMode.ReadWrite,
                    defaultValue: 'Hello',
                    length: 0
                };

                const result = dataPointFromObject(obj);

                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.errors).toContain('DataPoint of type ASCII must have a valid length greater than 0');
                }
            });

            test('should fail when ASCII defaultValue exceeds length', () => {
                const obj = {
                    id: 'ascii1',
                    areas: [DataArea.HoldingRegister],
                    type: DataType.ASCII,
                    address: 50,
                    accessMode: AccessMode.ReadWrite,
                    defaultValue: 'HelloWorld',
                    length: 4
                };

                const result = dataPointFromObject(obj);

                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.errors).toContain('DataPoint defaultValue length exceeds defined length');
                }
            });
        });

        describe('Invalid Simulation', () => {
            test('should fail for non-object simulation', () => {
                const obj = {
                    id: 'dp1',
                    areas: [DataArea.HoldingRegister],
                    type: DataType.Int16,
                    address: 100,
                    accessMode: AccessMode.ReadWrite,
                    simulation: 'not an object'
                };

                const result = dataPointFromObject(obj);

                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.errors).toContain('DataPoint simulation must be an object');
                }
            });

            test('should fail for simulation without enabled property', () => {
                const obj = {
                    id: 'dp1',
                    areas: [DataArea.HoldingRegister],
                    type: DataType.Int16,
                    address: 100,
                    accessMode: AccessMode.ReadWrite,
                    simulation: {
                        minValue: 0,
                        maxValue: 100
                    }
                };

                const result = dataPointFromObject(obj);

                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.errors).toContain('DataPoint simulation must have enabled property of type boolean');
                }
            });

            test('should fail for simulation with non-boolean enabled', () => {
                const obj = {
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
                };

                const result = dataPointFromObject(obj);

                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.errors).toContain('DataPoint simulation must have enabled property of type boolean');
                }
            });

            test('should fail for simulation without minValue', () => {
                const obj = {
                    id: 'dp1',
                    areas: [DataArea.HoldingRegister],
                    type: DataType.Int16,
                    address: 100,
                    accessMode: AccessMode.ReadWrite,
                    simulation: {
                        enabled: true,
                        maxValue: 100
                    }
                };

                const result = dataPointFromObject(obj);

                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.errors).toContain('DataPoint simulation must have minValue and maxValue defined');
                }
            });

            test('should fail for simulation without maxValue', () => {
                const obj = {
                    id: 'dp1',
                    areas: [DataArea.HoldingRegister],
                    type: DataType.Int16,
                    address: 100,
                    accessMode: AccessMode.ReadWrite,
                    simulation: {
                        enabled: true,
                        minValue: 0
                    }
                };

                const result = dataPointFromObject(obj);

                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.errors).toContain('DataPoint simulation must have minValue and maxValue defined');
                }
            });

            test('should fail when minValue is out of range for Int16', () => {
                const obj = {
                    id: 'dp1',
                    areas: [DataArea.HoldingRegister],
                    type: DataType.Int16,
                    address: 100,
                    accessMode: AccessMode.ReadWrite,
                    simulation: {
                        enabled: true,
                        minValue: -40000,
                        maxValue: 100
                    }
                };

                const result = dataPointFromObject(obj);

                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.errors.some(e => e.includes('minValue is out of range'))).toBe(true);
                }
            });

            test('should fail when maxValue is out of range for UInt16', () => {
                const obj = {
                    id: 'dp1',
                    areas: [DataArea.HoldingRegister],
                    type: DataType.UInt16,
                    address: 100,
                    accessMode: AccessMode.ReadWrite,
                    simulation: {
                        enabled: true,
                        minValue: 0,
                        maxValue: 70000
                    }
                };

                const result = dataPointFromObject(obj);

                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.errors.some(e => e.includes('maxValue is out of range'))).toBe(true);
                }
            });
        });

        describe('Invalid FeedbackDataPoint', () => {
            test('should fail for non-string feedbackDataPoint', () => {
                const obj = {
                    id: 'dp1',
                    areas: [DataArea.Coil],
                    type: DataType.Bool,
                    address: 0,
                    accessMode: AccessMode.WriteOnly,
                    feedbackDataPoint: 123
                };

                const result = dataPointFromObject(obj);

                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.errors).toContain('DataPoint feedbackDataPoint must be a string');
                }
            });
        });

        describe('Multiple Errors', () => {
            test('should accumulate multiple validation errors', () => {
                const obj = {
                    id: '',
                    areas: 'invalid',
                    type: 'InvalidType',
                    address: -1,
                    accessMode: 'InvalidMode'
                };

                const result = dataPointFromObject(obj);

                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.errors.length).toBeGreaterThan(1);
                    expect(result.errors).toContain('DataPoint must have a valid id');
                    expect(result.errors).toContain('DataPoint must have valid areas');
                    expect(result.errors).toContain('DataPoint must have a valid type');
                    expect(result.errors).toContain('DataPoint must have a valid address');
                    expect(result.errors).toContain('DataPoint must have a valid accessMode');
                }
            });
        });

        describe('Round-trip Conversion', () => {
            test('should preserve all properties in round-trip conversion', () => {
                const originalDataPoint = new DataPoint({
                    id: 'roundtrip1',
                    areas: [DataArea.HoldingRegister, DataArea.InputRegister],
                    type: DataType.Int32,
                    address: 500,
                    accessMode: AccessMode.ReadOnly,
                    defaultValue: 123456,
                    name: 'Round Trip Test',
                    unit: 'units',
                    simulation: {
                        enabled: true,
                        minValue: 0,
                        maxValue: 1000000
                    },
                    feedbackDataPoint: 'feedback1'
                });

                const props = dataPointToDataPointProps(originalDataPoint);
                const result = dataPointFromObject(props);

                expect(result.success).toBe(true);
                if (result.success) {
                    const newDataPoint = result.value;
                    expect(newDataPoint.getId()).toBe(originalDataPoint.getId());
                    expect(newDataPoint.getAreas()).toEqual(originalDataPoint.getAreas());
                    expect(newDataPoint.getType()).toBe(originalDataPoint.getType());
                    expect(newDataPoint.getAddress()).toBe(originalDataPoint.getAddress());
                    expect(newDataPoint.getAccessMode()).toBe(originalDataPoint.getAccessMode());
                    expect(newDataPoint.getValue()).toBe(originalDataPoint.getValue());
                    expect(newDataPoint.getName()).toBe(originalDataPoint.getName());
                    expect(newDataPoint.getUnit()).toBe(originalDataPoint.getUnit());
                    expect(newDataPoint.getSimulation()).toEqual(originalDataPoint.getSimulation());
                    expect(newDataPoint.getFeedbackDataPoint()).toBe(originalDataPoint.getFeedbackDataPoint());
                }
            });

            test('should preserve ASCII DataPoint in round-trip conversion', () => {
                const originalDataPoint = new DataPoint({
                    id: 'ascii_roundtrip',
                    areas: [DataArea.HoldingRegister],
                    type: DataType.ASCII,
                    address: 100,
                    accessMode: AccessMode.ReadWrite,
                    defaultValue: 'Test String',
                    length: 20
                });

                const props = dataPointToDataPointProps(originalDataPoint);
                const result = dataPointFromObject(props);

                expect(result.success).toBe(true);
                if (result.success) {
                    const newDataPoint = result.value;
                    expect(newDataPoint.getType()).toBe(DataType.ASCII);
                    expect(newDataPoint.getLength()).toBe(20);
                    expect(newDataPoint.getValue()).toBe('Test String');
                }
            });
        });
    });
});
