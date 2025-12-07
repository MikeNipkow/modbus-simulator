import { ModbusDevice } from "../src/ModbusDevice.js";
import { ModbusUnit } from "../src/ModbusUnit.js";
import { DataPoint } from "../src/DataPoint.js";
import { deviceFromObject, deviceToDeviceProps } from "../src/mapper/ModbusDeviceMapper.js";
import { Endian } from "../src/types/enums/Endian.js";
import { AccessMode } from "../src/types/enums/AccessMode.js";
import { DataArea } from "../src/types/enums/DataArea.js";
import { DataType } from "../src/types/enums/DataType.js";

describe('ModbusDeviceMapper', () => {
    describe('deviceToDeviceProps', () => {
        describe('Valid Conversions', () => {
            test('should convert a ModbusDevice without units to ModbusDeviceProps', () => {
                const device = new ModbusDevice({
                    filename: 'test.json',
                    enabled: true,
                    port: 502,
                    endian: Endian.BigEndian
                });

                const props = deviceToDeviceProps(device);

                expect(props.filename).toBe('test.json');
                expect(props.enabled).toBe(true);
                expect(props.port).toBe(502);
                expect(props.endian).toBe(Endian.BigEndian);
                expect(props.modbusUnits).toEqual([]);
            });

            test('should convert a ModbusDevice with optional properties', () => {
                const device = new ModbusDevice({
                    filename: 'device.json',
                    enabled: false,
                    port: 5020,
                    endian: Endian.LittleEndian,
                    name: 'Test Device',
                    vendor: 'Test Vendor',
                    description: 'Test Description'
                });

                const props = deviceToDeviceProps(device);

                expect(props.filename).toBe('device.json');
                expect(props.enabled).toBe(false);
                expect(props.port).toBe(5020);
                expect(props.endian).toBe(Endian.LittleEndian);
                expect(props.name).toBe('Test Device');
                expect(props.vendor).toBe('Test Vendor');
                expect(props.description).toBe('Test Description');
            });

            test('should convert a ModbusDevice with one unit', () => {
                const device = new ModbusDevice({
                    filename: 'test.json',
                    enabled: true,
                    port: 502,
                    endian: Endian.BigEndian
                });

                const unit = new ModbusUnit({ unitId: 1 });
                device.addUnit(unit);

                const props = deviceToDeviceProps(device);

                expect(props.modbusUnits).toHaveLength(1);
                expect(props.modbusUnits).toBeDefined();
                expect(props.modbusUnits![0]!.unitId).toBe(1);
            });

            test('should convert a ModbusDevice with multiple units', () => {
                const device = new ModbusDevice({
                    filename: 'test.json',
                    enabled: true,
                    port: 502,
                    endian: Endian.BigEndian
                });

                const unit1 = new ModbusUnit({ unitId: 1 });
                const unit2 = new ModbusUnit({ unitId: 2 });
                const unit3 = new ModbusUnit({ unitId: 3 });

                device.addUnit(unit1);
                device.addUnit(unit2);
                device.addUnit(unit3);

                const props = deviceToDeviceProps(device);

                expect(props.modbusUnits).toHaveLength(3);
                expect(props.modbusUnits).toBeDefined();
                expect(props.modbusUnits![0]!.unitId).toBe(1);
                expect(props.modbusUnits![1]!.unitId).toBe(2);
                expect(props.modbusUnits![2]!.unitId).toBe(3);
            });

            test('should convert a ModbusDevice with units containing DataPoints', () => {
                const device = new ModbusDevice({
                    filename: 'test.json',
                    enabled: true,
                    port: 502,
                    endian: Endian.BigEndian
                });

                const unit = new ModbusUnit({ unitId: 1 });
                const dataPoint = new DataPoint({
                    id: 'dp1',
                    areas: [DataArea.HoldingRegister],
                    type: DataType.Int16,
                    address: 100,
                    accessMode: AccessMode.ReadWrite,
                    defaultValue: 42
                });
                unit.addDataPoint(dataPoint);
                device.addUnit(unit);

                const props = deviceToDeviceProps(device);

                expect(props.modbusUnits).toHaveLength(1);
                expect(props.modbusUnits).toBeDefined();
                expect(props.modbusUnits![0]!.dataPoints).toHaveLength(1);
                expect(props.modbusUnits![0]!.dataPoints).toBeDefined();
                expect(props.modbusUnits![0]!.dataPoints![0]!.id).toBe('dp1');
            });

            test('should preserve all properties of complex device', () => {
                const device = new ModbusDevice({
                    filename: 'complex.json',
                    enabled: true,
                    port: 5502,
                    endian: Endian.LittleEndian,
                    name: 'Complex Device',
                    vendor: 'ACME Corp',
                    description: 'A complex test device'
                });

                const unit1 = new ModbusUnit({ unitId: 1 });
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
                unit1.addDataPoint(dp1);

                const unit2 = new ModbusUnit({ unitId: 2 });
                const dp2 = new DataPoint({
                    id: 'pressure',
                    areas: [DataArea.HoldingRegister],
                    type: DataType.UInt16,
                    address: 100,
                    accessMode: AccessMode.ReadWrite,
                    defaultValue: 1013
                });
                unit2.addDataPoint(dp2);

                device.addUnit(unit1);
                device.addUnit(unit2);

                const props = deviceToDeviceProps(device);

                expect(props.filename).toBe('complex.json');
                expect(props.enabled).toBe(true);
                expect(props.port).toBe(5502);
                expect(props.endian).toBe(Endian.LittleEndian);
                expect(props.name).toBe('Complex Device');
                expect(props.vendor).toBe('ACME Corp');
                expect(props.description).toBe('A complex test device');
                expect(props.modbusUnits).toHaveLength(2);
            });
        });

        describe('Error Handling', () => {
            test('should throw error for null ModbusDevice', () => {
                expect(() => deviceToDeviceProps(null as any)).toThrow('Invalid ModbusDevice');
            });

            test('should throw error for undefined ModbusDevice', () => {
                expect(() => deviceToDeviceProps(undefined as any)).toThrow('Invalid ModbusDevice');
            });
        });
    });

    describe('deviceFromObject', () => {
        describe('Valid Object Conversions', () => {
            test('should create ModbusDevice from valid minimal object', () => {
                const obj = {
                    enabled: true,
                    port: 502,
                    endian: Endian.BigEndian
                };

                const result = deviceFromObject(obj, 'test.json');

                expect(result.success).toBe(true);
                if (result.success) {
                    expect(result.value).toBeInstanceOf(ModbusDevice);
                    expect(result.value.getFilename()).toBe('test.json');
                    expect(result.value.isEnabled()).toBe(true);
                    expect(result.value.getPort()).toBe(502);
                    expect(result.value.getEndian()).toBe(Endian.BigEndian);
                }
            });

            test('should create ModbusDevice with optional properties', () => {
                const obj = {
                    enabled: false,
                    port: 5020,
                    endian: Endian.LittleEndian,
                    name: 'Test Device',
                    vendor: 'Test Vendor',
                    description: 'Test Description'
                };

                const result = deviceFromObject(obj, 'device.json');

                expect(result.success).toBe(true);
                if (result.success) {
                    expect(result.value.getName()).toBe('Test Device');
                    expect(result.value.getVendor()).toBe('Test Vendor');
                    expect(result.value.getDescription()).toBe('Test Description');
                }
            });

            test('should create ModbusDevice with one unit', () => {
                const obj = {
                    enabled: true,
                    port: 502,
                    endian: Endian.BigEndian,
                    modbusUnits: [
                        { unitId: 1 }
                    ]
                };

                const result = deviceFromObject(obj, 'test.json');

                expect(result.success).toBe(true);
                if (result.success) {
                    const units = result.value.getAllUnits();
                    expect(units).toHaveLength(1);
                    expect(units[0]!.getId()).toBe(1);
                }
            });

            test('should create ModbusDevice with multiple units', () => {
                const obj = {
                    enabled: true,
                    port: 502,
                    endian: Endian.BigEndian,
                    modbusUnits: [
                        { unitId: 1 },
                        { unitId: 2 },
                        { unitId: 3 }
                    ]
                };

                const result = deviceFromObject(obj, 'test.json');

                expect(result.success).toBe(true);
                if (result.success) {
                    const units = result.value.getAllUnits();
                    expect(units).toHaveLength(3);
                    expect(units[0]!.getId()).toBe(1);
                    expect(units[1]!.getId()).toBe(2);
                    expect(units[2]!.getId()).toBe(3);
                }
            });

            test('should create ModbusDevice with units containing DataPoints', () => {
                const obj = {
                    enabled: true,
                    port: 502,
                    endian: Endian.BigEndian,
                    modbusUnits: [
                        {
                            unitId: 1,
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
                        }
                    ]
                };

                const result = deviceFromObject(obj, 'test.json');

                expect(result.success).toBe(true);
                if (result.success) {
                    const units = result.value.getAllUnits();
                    expect(units).toHaveLength(1);
                    const dataPoints = units[0]!.getAllDataPoints();
                    expect(dataPoints).toHaveLength(1);
                    expect(dataPoints[0]!.getId()).toBe('dp1');
                }
            });

            test('should create ModbusDevice with boundary port values', () => {
                const obj1 = {
                    enabled: true,
                    port: 1,
                    endian: Endian.BigEndian
                };
                const obj2 = {
                    enabled: true,
                    port: 65535,
                    endian: Endian.BigEndian
                };

                const result1 = deviceFromObject(obj1, 'test1.json');
                const result2 = deviceFromObject(obj2, 'test2.json');

                expect(result1.success).toBe(true);
                expect(result2.success).toBe(true);
                if (result1.success) expect(result1.value.getPort()).toBe(1);
                if (result2.success) expect(result2.value.getPort()).toBe(65535);
            });

            test('should handle empty modbusUnits array', () => {
                const obj = {
                    enabled: true,
                    port: 502,
                    endian: Endian.BigEndian,
                    modbusUnits: []
                };

                const result = deviceFromObject(obj, 'test.json');

                expect(result.success).toBe(true);
                if (result.success) {
                    expect(result.value.getAllUnits()).toHaveLength(0);
                }
            });

            test('should accept both BigEndian and LittleEndian', () => {
                const obj1 = {
                    enabled: true,
                    port: 502,
                    endian: Endian.BigEndian
                };
                const obj2 = {
                    enabled: true,
                    port: 502,
                    endian: Endian.LittleEndian
                };

                const result1 = deviceFromObject(obj1, 'test1.json');
                const result2 = deviceFromObject(obj2, 'test2.json');

                expect(result1.success).toBe(true);
                expect(result2.success).toBe(true);
                if (result1.success) expect(result1.value.getEndian()).toBe(Endian.BigEndian);
                if (result2.success) expect(result2.value.getEndian()).toBe(Endian.LittleEndian);
            });
        });

        describe('Invalid Object - Null/Invalid Type', () => {
            test('should fail for null object', () => {
                const result = deviceFromObject(null, 'test.json');

                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.errors).toContain('Invalid object for ModbusDevice');
                }
            });

            test('should fail for undefined object', () => {
                const result = deviceFromObject(undefined, 'test.json');

                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.errors).toContain('Invalid object for ModbusDevice');
                }
            });

            test('should fail for non-object types', () => {
                const result = deviceFromObject('string', 'test.json');

                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.errors).toContain('Invalid object for ModbusDevice');
                }
            });
        });

        describe('Invalid Filename', () => {
            test('should fail for missing filename', () => {
                const obj = {
                    enabled: true,
                    port: 502,
                    endian: Endian.BigEndian
                };

                const result = deviceFromObject(obj, '');

                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.errors.some(e => e.includes('valid filename'))).toBe(true);
                }
            });

            test('should fail for empty filename', () => {
                const obj = {
                    enabled: true,
                    port: 502,
                    endian: Endian.BigEndian
                };

                const result = deviceFromObject(obj, '');

                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.errors.some(e => e.includes('valid filename'))).toBe(true);
                }
            });

            test('should fail for non-string filename', () => {
                const obj = {
                    enabled: true,
                    port: 502,
                    endian: Endian.BigEndian
                };

                const result = deviceFromObject(obj, 123 as any);

                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.errors.some(e => e.includes('valid filename'))).toBe(true);
                }
            });

            test('should fail for invalid file extension', () => {
                const obj = {
                    enabled: true,
                    port: 502,
                    endian: Endian.BigEndian
                };

                const result = deviceFromObject(obj, 'test.txt');

                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.errors.some(e => e.includes('end with .json'))).toBe(true);
                }
            });
        });

        describe('Invalid Enabled', () => {
            test('should fail for non-boolean enabled', () => {
                const obj = {
                    enabled: 'true',
                    port: 502,
                    endian: Endian.BigEndian
                };

                const result = deviceFromObject(obj, 'test.json');

                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.errors).toContain('ModbusDevice must have a valid enabled boolean');
                }
            });
        });

        describe('Invalid Port', () => {
            test('should fail for missing port', () => {
                const obj = {
                    enabled: true,
                    endian: Endian.BigEndian
                };

                const result = deviceFromObject(obj, 'test.json');

                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.errors).toContain('ModbusDevice must have a valid port number');
                }
            });

            test('should fail for non-number port', () => {
                const obj = {
                    enabled: true,
                    port: '502',
                    endian: Endian.BigEndian
                };

                const result = deviceFromObject(obj, 'test.json');

                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.errors).toContain('ModbusDevice must have a valid port number');
                }
            });

            test('should fail for port less than 1', () => {
                const obj = {
                    enabled: true,
                    port: 0,
                    endian: Endian.BigEndian
                };

                const result = deviceFromObject(obj, 'test.json');

                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.errors).toContain('ModbusDevice port must be between 1 and 65535');
                }
            });

            test('should fail for negative port', () => {
                const obj = {
                    enabled: true,
                    port: -1,
                    endian: Endian.BigEndian
                };

                const result = deviceFromObject(obj, 'test.json');

                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.errors).toContain('ModbusDevice port must be between 1 and 65535');
                }
            });

            test('should fail for port greater than 65535', () => {
                const obj = {
                    enabled: true,
                    port: 65536,
                    endian: Endian.BigEndian
                };

                const result = deviceFromObject(obj, 'test.json');

                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.errors).toContain('ModbusDevice port must be between 1 and 65535');
                }
            });
        });

        describe('Invalid Endian', () => {
            test('should fail for missing endian', () => {
                const obj = {
                    enabled: true,
                    port: 502
                };

                const result = deviceFromObject(obj, 'test.json');

                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.errors).toContain('ModbusDevice must have a valid endian string');
                }
            });

            test('should fail for non-string endian', () => {
                const obj = {
                    enabled: true,
                    port: 502,
                    endian: 123
                };

                const result = deviceFromObject(obj, 'test.json');

                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.errors).toContain('ModbusDevice must have a valid endian string');
                }
            });

            test('should fail for invalid endian value', () => {
                const obj = {
                    enabled: true,
                    port: 502,
                    endian: 'InvalidEndian'
                };

                const result = deviceFromObject(obj, 'test.json');

                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.errors.some(e => e.includes('BigEndian') && e.includes('LittleEndian'))).toBe(true);
                }
            });
        });

        describe('Invalid Optional Properties', () => {
            test('should fail for non-string name', () => {
                const obj = {
                    enabled: true,
                    port: 502,
                    endian: Endian.BigEndian,
                    name: 123
                };

                const result = deviceFromObject(obj, 'test.json');

                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.errors).toContain('ModbusDevice must have a valid name string');
                }
            });

            test('should fail for non-string vendor', () => {
                const obj = {
                    enabled: true,
                    port: 502,
                    endian: Endian.BigEndian,
                    vendor: 123
                };

                const result = deviceFromObject(obj, 'test.json');

                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.errors).toContain('ModbusDevice must have a valid vendor string');
                }
            });

            test('should fail for non-string description', () => {
                const obj = {
                    enabled: true,
                    port: 502,
                    endian: Endian.BigEndian,
                    description: 123
                };

                const result = deviceFromObject(obj, 'test.json');

                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.errors).toContain('ModbusDevice must have a valid description string');
                }
            });
        });

        describe('Invalid ModbusUnits', () => {
            test('should fail when unit has invalid unitId', () => {
                const obj = {
                    enabled: true,
                    port: 502,
                    endian: Endian.BigEndian,
                    modbusUnits: [
                        { unitId: 0 }
                    ]
                };

                const result = deviceFromObject(obj, 'test.json');

                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.errors.some(e => e.includes('ModbusUnit error'))).toBe(true);
                    expect(result.errors.some(e => e.includes('unitId must be between 1 and 254'))).toBe(true);
                }
            });

            test('should fail when unit contains invalid DataPoint', () => {
                const obj = {
                    enabled: true,
                    port: 502,
                    endian: Endian.BigEndian,
                    modbusUnits: [
                        {
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
                        }
                    ]
                };

                const result = deviceFromObject(obj, 'test.json');

                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.errors.some(e => e.includes('ModbusUnit error'))).toBe(true);
                    expect(result.errors.some(e => e.includes('DataPoint error'))).toBe(true);
                }
            });

            test('should fail when duplicate unit IDs exist', () => {
                const obj = {
                    enabled: true,
                    port: 502,
                    endian: Endian.BigEndian,
                    modbusUnits: [
                        { unitId: 1 },
                        { unitId: 1 }
                    ]
                };

                const result = deviceFromObject(obj, 'test.json');

                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.errors.some(e => e.includes('already exists'))).toBe(true);
                }
            });

            test('should fail when multiple units have validation errors', () => {
                const obj = {
                    enabled: true,
                    port: 502,
                    endian: Endian.BigEndian,
                    modbusUnits: [
                        { unitId: 0 },
                        { unitId: 255 }
                    ]
                };

                const result = deviceFromObject(obj, 'test.json');

                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.errors.length).toBeGreaterThan(1);
                }
            });
        });

        describe('Multiple Errors', () => {
            test('should accumulate multiple validation errors', () => {
                const obj = {
                    enabled: 'true',
                    port: -1,
                    endian: 'InvalidEndian'
                };

                const result = deviceFromObject(obj, '');

                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.errors.length).toBeGreaterThan(3);
                }
            });
        });

        describe('Round-trip Conversion', () => {
            test('should preserve all properties in round-trip conversion', () => {
                const originalDevice = new ModbusDevice({
                    filename: 'roundtrip.json',
                    enabled: true,
                    port: 5502,
                    endian: Endian.LittleEndian,
                    name: 'Round Trip Device',
                    vendor: 'Test Vendor',
                    description: 'Round trip test'
                });

                const unit = new ModbusUnit({ unitId: 42 });
                const dp = new DataPoint({
                    id: 'temp',
                    areas: [DataArea.InputRegister],
                    type: DataType.Float32,
                    address: 0,
                    accessMode: AccessMode.ReadOnly,
                    defaultValue: 20.5,
                    name: 'Temperature',
                    unit: '°C'
                });
                unit.addDataPoint(dp);
                originalDevice.addUnit(unit);

                const props = deviceToDeviceProps(originalDevice);
                const result = deviceFromObject(props, 'roundtrip.json');

                expect(result.success).toBe(true);
                if (result.success) {
                    const newDevice = result.value;
                    expect(newDevice.getFilename()).toBe(originalDevice.getFilename());
                    expect(newDevice.isEnabled()).toBe(originalDevice.isEnabled());
                    expect(newDevice.getPort()).toBe(originalDevice.getPort());
                    expect(newDevice.getEndian()).toBe(originalDevice.getEndian());
                    expect(newDevice.getName()).toBe(originalDevice.getName());
                    expect(newDevice.getVendor()).toBe(originalDevice.getVendor());
                    expect(newDevice.getDescription()).toBe(originalDevice.getDescription());
                    
                    const originalUnits = originalDevice.getAllUnits();
                    const newUnits = newDevice.getAllUnits();
                    expect(newUnits).toHaveLength(originalUnits.length);
                    expect(newUnits[0]!.getId()).toBe(originalUnits[0]!.getId());
                }
            });

            test('should preserve minimal device in round-trip conversion', () => {
                const originalDevice = new ModbusDevice({
                    filename: 'minimal.json',
                    enabled: false,
                    port: 502,
                    endian: Endian.BigEndian
                });

                const props = deviceToDeviceProps(originalDevice);
                const result = deviceFromObject(props, 'minimal.json');

                expect(result.success).toBe(true);
                if (result.success) {
                    expect(result.value.getFilename()).toBe('minimal.json');
                    expect(result.value.isEnabled()).toBe(false);
                    expect(result.value.getPort()).toBe(502);
                    expect(result.value.getEndian()).toBe(Endian.BigEndian);
                }
            });

            test('should preserve complex device with multiple units in round-trip', () => {
                const originalDevice = new ModbusDevice({
                    filename: 'complex.json',
                    enabled: true,
                    port: 5020,
                    endian: Endian.BigEndian,
                    name: 'Complex',
                    vendor: 'Vendor',
                    description: 'Desc'
                });

                const unit1 = new ModbusUnit({ unitId: 1 });
                unit1.addDataPoint(new DataPoint({
                    id: 'dp1',
                    areas: [DataArea.HoldingRegister],
                    type: DataType.Int16,
                    address: 100,
                    accessMode: AccessMode.ReadWrite
                }));

                const unit2 = new ModbusUnit({ unitId: 2 });
                unit2.addDataPoint(new DataPoint({
                    id: 'dp2',
                    areas: [DataArea.Coil],
                    type: DataType.Bool,
                    address: 0,
                    accessMode: AccessMode.ReadWrite
                }));

                originalDevice.addUnit(unit1);
                originalDevice.addUnit(unit2);

                const props = deviceToDeviceProps(originalDevice);
                const result = deviceFromObject(props, 'complex.json');

                expect(result.success).toBe(true);
                if (result.success) {
                    const newUnits = result.value.getAllUnits();
                    expect(newUnits).toHaveLength(2);
                    expect(newUnits[0]!.getAllDataPoints()).toHaveLength(1);
                    expect(newUnits[1]!.getAllDataPoints()).toHaveLength(1);
                }
            });
        });

        describe('Edge Cases', () => {
            test('should handle non-array modbusUnits property', () => {
                const obj = {
                    enabled: true,
                    port: 502,
                    endian: Endian.BigEndian,
                    modbusUnits: 'not an array'
                };

                const result = deviceFromObject(obj, 'test.json');

                // Should succeed but ignore invalid modbusUnits
                expect(result.success).toBe(true);
                if (result.success) {
                    expect(result.value.getAllUnits()).toHaveLength(0);
                }
            });
        });
    });
});
