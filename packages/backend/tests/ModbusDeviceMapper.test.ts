import { ModbusDevice } from '../src/ModbusDevice.js';
import { ModbusUnit } from '../src/ModbusUnit.js';
import { DataPoint } from '../src/DataPoint.js';
import { toJSON, fromJSON } from '../src/mapper/ModbusDeviceMapper.js';
import { AccessMode } from '../src/types/AccessMode.js';
import { DataArea } from '../src/types/DataArea.js';
import { DataType } from '../src/types/DataType.js';
import { Endian } from '../src/types/Endian.js';

describe('ModbusDeviceMapper', () => {

    describe('toJSON', () => {
        test('should serialize basic ModbusDevice without units', () => {
            const device = new ModbusDevice(
                'device1',
                false,
                502,
                Endian.BigEndian,
                'Test Device',
                'Test Vendor',
                'A test device'
            );

            const json = toJSON(device);

            expect(json).toEqual({
                id: 'device1',
                enabled: false,
                port: 502,
                endian: Endian.BigEndian,
                name: 'Test Device',
                vendor: 'Test Vendor',
                description: 'A test device',
                units: []
            });
        });

        test('should serialize enabled ModbusDevice', () => {
            const device = new ModbusDevice(
                'device1',
                true,
                502,
                Endian.BigEndian,
                'Test Device',
                'Test Vendor',
                'A test device'
            );

            const json = toJSON(device);

            expect((json as any).enabled).toBe(true);
        });

        test('should serialize ModbusDevice with little-endian', () => {
            const device = new ModbusDevice(
                'device1',
                false,
                502,
                Endian.LittleEndian,
                'Test Device',
                'Test Vendor',
                'A test device'
            );

            const json = toJSON(device);

            expect((json as any).endian).toBe(Endian.LittleEndian);
        });

        test('should serialize ModbusDevice with custom port', () => {
            const device = new ModbusDevice(
                'device1',
                false,
                5020,
                Endian.BigEndian,
                'Test Device',
                'Test Vendor',
                'A test device'
            );

            const json = toJSON(device);

            expect((json as any).port).toBe(5020);
        });

        test('should serialize ModbusDevice with single unit', () => {
            const device = new ModbusDevice(
                'device1',
                false,
                502,
                Endian.BigEndian,
                'Test Device',
                'Test Vendor',
                'A test device'
            );
            const unit = new ModbusUnit(1);
            device.addUnit(unit);

            const json = toJSON(device);

            expect((json as any).units).toHaveLength(1);
            expect((json as any).units[0].unitId).toBe(1);
        });

        test('should serialize ModbusDevice with multiple units', () => {
            const device = new ModbusDevice(
                'device1',
                false,
                502,
                Endian.BigEndian,
                'Test Device',
                'Test Vendor',
                'A test device'
            );
            const unit1 = new ModbusUnit(1);
            const unit2 = new ModbusUnit(2);
            const unit3 = new ModbusUnit(3);
            
            device.addUnit(unit1);
            device.addUnit(unit2);
            device.addUnit(unit3);

            const json = toJSON(device);

            expect((json as any).units).toHaveLength(3);
            expect((json as any).units[0].unitId).toBe(1);
            expect((json as any).units[1].unitId).toBe(2);
            expect((json as any).units[2].unitId).toBe(3);
        });

        test('should serialize ModbusDevice with units containing DataPoints', () => {
            const device = new ModbusDevice(
                'device1',
                false,
                502,
                Endian.BigEndian,
                'Test Device',
                'Test Vendor',
                'A test device'
            );
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
            device.addUnit(unit);

            const json = toJSON(device);

            expect((json as any).units[0].dataPoints).toHaveLength(1);
            expect((json as any).units[0].dataPoints[0].id).toBe('dp1');
            expect((json as any).units[0].dataPoints[0].address).toBe(100);
        });

        test('should serialize complete ModbusDevice with all features', () => {
            const device = new ModbusDevice(
                'plc1',
                true,
                5020,
                Endian.LittleEndian,
                'Industrial PLC',
                'Siemens',
                'S7-1200 Simulator'
            );

            const unit1 = new ModbusUnit(1);
            unit1.addDataPoint(new DataPoint({
                id: 'temp',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int16,
                address: 100,
                accessMode: AccessMode.ReadWrite,
                defaultValue: 25,
                name: 'Temperature',
                unit: '°C'
            }));

            const unit2 = new ModbusUnit(2);
            unit2.addDataPoint(new DataPoint({
                id: 'pressure',
                areas: [DataArea.InputRegister],
                type: DataType.Float32,
                address: 200,
                accessMode: AccessMode.ReadOnly,
                defaultValue: 101.325,
                name: 'Pressure',
                unit: 'kPa'
            }));

            device.addUnit(unit1);
            device.addUnit(unit2);

            const json = toJSON(device);

            expect((json as any).id).toBe('plc1');
            expect((json as any).enabled).toBe(true);
            expect((json as any).port).toBe(5020);
            expect((json as any).endian).toBe(Endian.LittleEndian);
            expect((json as any).name).toBe('Industrial PLC');
            expect((json as any).vendor).toBe('Siemens');
            expect((json as any).description).toBe('S7-1200 Simulator');
            expect((json as any).units).toHaveLength(2);
        });
    });

    describe('fromJSON', () => {
        test('should deserialize basic ModbusDevice without units', () => {
            const json = {
                id: 'device1',
                enabled: false,
                port: 502,
                endian: Endian.BigEndian,
                name: 'Test Device',
                vendor: 'Test Vendor',
                description: 'A test device',
                units: []
            };

            const result = fromJSON(json);

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.value.getId()).toBe('device1');
                expect(result.value.isEnabled()).toBe(false);
                expect(result.value.getPort()).toBe(502);
                expect(result.value.getEndian()).toBe(Endian.BigEndian);
                expect(result.value.getName()).toBe('Test Device');
                expect(result.value.getVendor()).toBe('Test Vendor');
                expect(result.value.getDescription()).toBe('A test device');
                expect(result.value.getAllUnits()).toHaveLength(0);
            }
        });

        test('should deserialize enabled ModbusDevice', () => {
            const json = {
                id: 'device1',
                enabled: true,
                port: 502,
                endian: Endian.BigEndian,
                name: 'Test Device',
                vendor: 'Test Vendor',
                description: 'A test device',
                units: []
            };

            const result = fromJSON(json);

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.value.isEnabled()).toBe(true);
            }
        });

        test('should deserialize ModbusDevice with little-endian', () => {
            const json = {
                id: 'device1',
                enabled: false,
                port: 502,
                endian: Endian.LittleEndian,
                name: 'Test Device',
                vendor: 'Test Vendor',
                description: 'A test device',
                units: []
            };

            const result = fromJSON(json);

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.value.getEndian()).toBe(Endian.LittleEndian);
            }
        });

        test('should deserialize ModbusDevice with single unit', () => {
            const json = {
                id: 'device1',
                enabled: false,
                port: 502,
                endian: Endian.BigEndian,
                name: 'Test Device',
                vendor: 'Test Vendor',
                description: 'A test device',
                units: [
                    {
                        unitId: 1,
                        dataPoints: []
                    }
                ]
            };

            const result = fromJSON(json);

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.value.getAllUnits()).toHaveLength(1);
                expect(result.value.hasUnit(1)).toBe(true);
            }
        });

        test('should deserialize ModbusDevice with multiple units', () => {
            const json = {
                id: 'device1',
                enabled: false,
                port: 502,
                endian: Endian.BigEndian,
                name: 'Test Device',
                vendor: 'Test Vendor',
                description: 'A test device',
                units: [
                    { unitId: 1, dataPoints: [] },
                    { unitId: 2, dataPoints: [] },
                    { unitId: 3, dataPoints: [] }
                ]
            };

            const result = fromJSON(json);

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.value.getAllUnits()).toHaveLength(3);
                expect(result.value.hasUnit(1)).toBe(true);
                expect(result.value.hasUnit(2)).toBe(true);
                expect(result.value.hasUnit(3)).toBe(true);
            }
        });

        test('should deserialize ModbusDevice with units containing DataPoints', () => {
            const json = {
                id: 'device1',
                enabled: false,
                port: 502,
                endian: Endian.BigEndian,
                name: 'Test Device',
                vendor: 'Test Vendor',
                description: 'A test device',
                units: [
                    {
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
                    }
                ]
            };

            const result = fromJSON(json);

            expect(result.success).toBe(true);
            if (result.success) {
                const unit = result.value.getUnit(1);
                expect(unit).toBeDefined();
                expect(unit?.getAllDataPoints()).toHaveLength(1);
                const dp = unit?.getDataPoint('dp1');
                expect(dp?.getValue()).toBe(1234);
            }
        });

        test('should fail when JSON is null', () => {
            const result = fromJSON(null);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.errors).toContain('Invalid JSON object for ModbusDevice');
            }
        });

        test('should fail when JSON is not an object', () => {
            const result = fromJSON('invalid');

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.errors).toContain('Invalid JSON object for ModbusDevice');
            }
        });

        test('should fail when id is missing', () => {
            const json = {
                enabled: false,
                port: 502,
                endian: Endian.BigEndian,
                name: 'Test Device',
                vendor: 'Test Vendor',
                description: 'A test device'
            };

            const result = fromJSON(json);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.errors).toContain('ModbusDevice must have a valid id string');
            }
        });

        test('should fail when id is empty string', () => {
            const json = {
                id: '',
                enabled: false,
                port: 502,
                endian: Endian.BigEndian,
                name: 'Test Device',
                vendor: 'Test Vendor',
                description: 'A test device'
            };

            const result = fromJSON(json);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.errors).toContain('ModbusDevice must have a valid id string');
            }
        });

        test('should fail when id is not a string', () => {
            const json = {
                id: 123,
                enabled: false,
                port: 502,
                endian: Endian.BigEndian,
                name: 'Test Device',
                vendor: 'Test Vendor',
                description: 'A test device'
            };

            const result = fromJSON(json);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.errors).toContain('ModbusDevice must have a valid id string');
            }
        });

        test('should fail when enabled is missing', () => {
            const json = {
                id: 'device1',
                port: 502,
                endian: Endian.BigEndian,
                name: 'Test Device',
                vendor: 'Test Vendor',
                description: 'A test device'
            };

            const result = fromJSON(json);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.errors).toContain('ModbusDevice must have a valid enabled boolean');
            }
        });

        test('should fail when enabled is not a boolean', () => {
            const json = {
                id: 'device1',
                enabled: 'true',
                port: 502,
                endian: Endian.BigEndian,
                name: 'Test Device',
                vendor: 'Test Vendor',
                description: 'A test device'
            };

            const result = fromJSON(json);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.errors).toContain('ModbusDevice must have a valid enabled boolean');
            }
        });

        test('should fail when port is missing', () => {
            const json = {
                id: 'device1',
                enabled: false,
                endian: Endian.BigEndian,
                name: 'Test Device',
                vendor: 'Test Vendor',
                description: 'A test device'
            };

            const result = fromJSON(json);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.errors).toContain('ModbusDevice must have a valid port number');
            }
        });

        test('should fail when port is not a number', () => {
            const json = {
                id: 'device1',
                enabled: false,
                port: '502',
                endian: Endian.BigEndian,
                name: 'Test Device',
                vendor: 'Test Vendor',
                description: 'A test device'
            };

            const result = fromJSON(json);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.errors).toContain('ModbusDevice must have a valid port number');
            }
        });

        test('should fail when endian is missing', () => {
            const json = {
                id: 'device1',
                enabled: false,
                port: 502,
                name: 'Test Device',
                vendor: 'Test Vendor',
                description: 'A test device'
            };

            const result = fromJSON(json);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.errors).toContain('ModbusDevice must have a valid endian string');
            }
        });

        test('should fail when endian is not a string', () => {
            const json = {
                id: 'device1',
                enabled: false,
                port: 502,
                endian: 1,
                name: 'Test Device',
                vendor: 'Test Vendor',
                description: 'A test device'
            };

            const result = fromJSON(json);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.errors).toContain('ModbusDevice must have a valid endian string');
            }
        });

        test('should fail when name is missing', () => {
            const json = {
                id: 'device1',
                enabled: false,
                port: 502,
                endian: Endian.BigEndian,
                vendor: 'Test Vendor',
                description: 'A test device'
            };

            const result = fromJSON(json);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.errors).toContain('ModbusDevice must have a valid name string');
            }
        });

        test('should fail when vendor is missing', () => {
            const json = {
                id: 'device1',
                enabled: false,
                port: 502,
                endian: Endian.BigEndian,
                name: 'Test Device',
                description: 'A test device'
            };

            const result = fromJSON(json);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.errors).toContain('ModbusDevice must have a valid vendor string');
            }
        });

        test('should fail when description is missing', () => {
            const json = {
                id: 'device1',
                enabled: false,
                port: 502,
                endian: Endian.BigEndian,
                name: 'Test Device',
                vendor: 'Test Vendor'
            };

            const result = fromJSON(json);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.errors).toContain('ModbusDevice must have a valid description string');
            }
        });

        test('should handle missing units field', () => {
            const json = {
                id: 'device1',
                enabled: false,
                port: 502,
                endian: Endian.BigEndian,
                name: 'Test Device',
                vendor: 'Test Vendor',
                description: 'A test device'
            };

            const result = fromJSON(json);

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.value.getAllUnits()).toHaveLength(0);
            }
        });

        test('should fail when units contains invalid unit JSON', () => {
            const json = {
                id: 'device1',
                enabled: false,
                port: 502,
                endian: Endian.BigEndian,
                name: 'Test Device',
                vendor: 'Test Vendor',
                description: 'A test device',
                units: [
                    {
                        unitId: 'invalid',
                        dataPoints: []
                    }
                ]
            };

            const result = fromJSON(json);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.errors.some(e => e.includes('ModbusUnit error:'))).toBe(true);
            }
        });

        test('should fail when duplicate unit IDs are present', () => {
            const json = {
                id: 'device1',
                enabled: false,
                port: 502,
                endian: Endian.BigEndian,
                name: 'Test Device',
                vendor: 'Test Vendor',
                description: 'A test device',
                units: [
                    { unitId: 1, dataPoints: [] },
                    { unitId: 1, dataPoints: [] }
                ]
            };

            const result = fromJSON(json);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.errors.some(e => e.includes('already exists'))).toBe(true);
            }
        });

        test('should collect multiple errors', () => {
            const json = {
                enabled: 'invalid',
                port: 'invalid',
                endian: 123,
                name: 123,
                vendor: null,
                description: false
            };

            const result = fromJSON(json);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.errors.length).toBeGreaterThan(1);
            }
        });

        test('should deserialize complete ModbusDevice with all features', () => {
            const json = {
                id: 'plc1',
                enabled: true,
                port: 5020,
                endian: Endian.LittleEndian,
                name: 'Industrial PLC',
                vendor: 'Siemens',
                description: 'S7-1200 Simulator',
                units: [
                    {
                        unitId: 1,
                        dataPoints: [
                            {
                                id: 'temp',
                                areas: [DataArea.HoldingRegister],
                                type: DataType.Int16,
                                address: 100,
                                accessMode: AccessMode.ReadWrite,
                                defaultValue: 25,
                                name: 'Temperature',
                                unit: '°C'
                            }
                        ]
                    },
                    {
                        unitId: 2,
                        dataPoints: [
                            {
                                id: 'pressure',
                                areas: [DataArea.InputRegister],
                                type: DataType.Float32,
                                address: 200,
                                accessMode: AccessMode.ReadOnly,
                                defaultValue: 101.325,
                                name: 'Pressure',
                                unit: 'kPa'
                            }
                        ]
                    }
                ]
            };

            const result = fromJSON(json);

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.value.getId()).toBe('plc1');
                expect(result.value.isEnabled()).toBe(true);
                expect(result.value.getPort()).toBe(5020);
                expect(result.value.getEndian()).toBe(Endian.LittleEndian);
                expect(result.value.getName()).toBe('Industrial PLC');
                expect(result.value.getVendor()).toBe('Siemens');
                expect(result.value.getDescription()).toBe('S7-1200 Simulator');
                expect(result.value.getAllUnits()).toHaveLength(2);
            }
        });
    });

    describe('Serialization Round-Trip', () => {
        test('should maintain basic device through round-trip', () => {
            const original = new ModbusDevice(
                'device1',
                false,
                502,
                Endian.BigEndian,
                'Test Device',
                'Test Vendor',
                'A test device'
            );

            const json = toJSON(original);
            const result = fromJSON(json);

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.value.getId()).toBe(original.getId());
                expect(result.value.isEnabled()).toBe(original.isEnabled());
                expect(result.value.getPort()).toBe(original.getPort());
                expect(result.value.getEndian()).toBe(original.getEndian());
                expect(result.value.getName()).toBe(original.getName());
                expect(result.value.getVendor()).toBe(original.getVendor());
                expect(result.value.getDescription()).toBe(original.getDescription());
                expect(result.value.getAllUnits()).toHaveLength(0);
            }
        });

        test('should maintain device with units through round-trip', () => {
            const original = new ModbusDevice(
                'device1',
                true,
                502,
                Endian.LittleEndian,
                'Test Device',
                'Test Vendor',
                'A test device'
            );
            const unit1 = new ModbusUnit(1);
            const unit2 = new ModbusUnit(2);
            original.addUnit(unit1);
            original.addUnit(unit2);

            const json = toJSON(original);
            const result = fromJSON(json);

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.value.getAllUnits()).toHaveLength(2);
                expect(result.value.hasUnit(1)).toBe(true);
                expect(result.value.hasUnit(2)).toBe(true);
            }
        });

        test('should maintain complete device configuration through round-trip', () => {
            const original = new ModbusDevice(
                'plc1',
                true,
                5020,
                Endian.LittleEndian,
                'Industrial PLC',
                'Siemens',
                'S7-1200 Simulator'
            );

            const unit1 = new ModbusUnit(1);
            unit1.addDataPoint(new DataPoint({
                id: 'temp',
                areas: [DataArea.HoldingRegister],
                type: DataType.Int16,
                address: 100,
                accessMode: AccessMode.ReadWrite,
                defaultValue: 25,
                name: 'Temperature',
                unit: '°C',
                simulation: { enabled: true, minValue: -40, maxValue: 85 }
            }));

            const unit2 = new ModbusUnit(2);
            unit2.addDataPoint(new DataPoint({
                id: 'pressure',
                areas: [DataArea.InputRegister],
                type: DataType.Float32,
                address: 200,
                accessMode: AccessMode.ReadOnly,
                defaultValue: 101.325,
                name: 'Pressure',
                unit: 'kPa'
            }));
            unit2.addDataPoint(new DataPoint({
                id: 'alarm',
                areas: [DataArea.Coil],
                type: DataType.Bool,
                address: 0,
                accessMode: AccessMode.ReadWrite,
                defaultValue: false
            }));

            original.addUnit(unit1);
            original.addUnit(unit2);

            const json = toJSON(original);
            const result = fromJSON(json);

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.value.getId()).toBe('plc1');
                expect(result.value.isEnabled()).toBe(true);
                expect(result.value.getPort()).toBe(5020);
                expect(result.value.getEndian()).toBe(Endian.LittleEndian);
                expect(result.value.getAllUnits()).toHaveLength(2);

                const restoredUnit1 = result.value.getUnit(1);
                expect(restoredUnit1?.getAllDataPoints()).toHaveLength(1);
                expect(restoredUnit1?.getDataPoint('temp')?.getValue()).toBe(25);

                const restoredUnit2 = result.value.getUnit(2);
                expect(restoredUnit2?.getAllDataPoints()).toHaveLength(2);
                expect(restoredUnit2?.getDataPoint('pressure')?.getValue()).toBeCloseTo(101.325, 3);
                expect(restoredUnit2?.getDataPoint('alarm')?.getValue()).toBe(false);
            }
        });

        test('should maintain ASCII DataPoints through round-trip', () => {
            const original = new ModbusDevice(
                'device1',
                false,
                502,
                Endian.BigEndian,
                'Test Device',
                'Test Vendor',
                'A test device'
            );
            const unit = new ModbusUnit(1);
            unit.addDataPoint(new DataPoint({
                id: 'ascii1',
                areas: [DataArea.HoldingRegister],
                type: DataType.ASCII,
                address: 100,
                accessMode: AccessMode.ReadWrite,
                length: 10,
                defaultValue: 'HELLO'
            }));
            original.addUnit(unit);

            const json = toJSON(original);
            const result = fromJSON(json);

            expect(result.success).toBe(true);
            if (result.success) {
                const restoredUnit = result.value.getUnit(1);
                const restoredDp = restoredUnit?.getDataPoint('ascii1');
                expect(restoredDp?.getLength()).toBe(10);
                expect(restoredDp?.getValue()).toBe('HELLO');
            }
        });
    });

});
