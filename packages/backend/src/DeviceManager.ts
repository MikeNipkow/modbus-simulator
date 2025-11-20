import path from "path";
import { toJSON as deviceToJSON, fromJSON as deviceFromJSON } from "./mapper/ModbusDeviceMapper.js";
import { ModbusDevice } from "./ModbusDevice.js";
import * as fs from "fs";
import { ParseResult } from "./types/ParseResult.js";

export class DeviceManager {

    // Directory where the devices are stored.
    private readonly deviceDir: string;

    // Loaded devices.
    private devices: Map<string, ModbusDevice> = new Map(); // <filename, ModbusDevice>

    constructor(deviceDir: string) {
        // Ensure directory exist.
        if (!fs.existsSync(deviceDir))
            throw new Error(`Device directory "${deviceDir}" does not exist`);

        this.deviceDir = deviceDir;
    }

    public hasDevice(filename: string): boolean {
        return this.devices.has(filename);
    }

    public getDevice(filename: string): ModbusDevice | undefined {
        return this.devices.get(filename);
    }

    public addDevice(filename: string, device: ModbusDevice): boolean {
        if (this.hasDevice(filename))
            return false;

        this.devices.set(filename, device);
        return true;
    }

    public deleteDevice(filename: string): boolean {
        const device = this.getDevice(filename);
        if (!device)
            return false;

        if (device.isRunning())
            device.stopServer();

        this.devices.delete(filename);
        fs.rmSync(path.join(this.deviceDir, filename));
        return true;
    }

    public saveDevice(filename: string): boolean {
        const device = this.getDevice(filename);
        if (!device)
            return false;

        // Serialize device to JSON.
        const json = deviceToJSON(device);

        const filePath = path.join(this.deviceDir, filename);
        fs.writeFileSync(filePath, JSON.stringify(json, null, 2), { encoding: 'utf-8', flag: 'w' });

        return true;
    }

    public async stopAllServers(saveState: boolean = false): Promise<void> {
        for (const device of this.devices.values()) {
            if (device.isRunning()) {
                device.stopAllSimulations(false);
                device.stopServer(saveState);
            }
        }
    }

    public async loadDevices(startServer: boolean = false): Promise<string[]> {
        // Array to hold any errors and messages encountered during loading.
        const messages: string[] = [];

        // Check if directory exists.
        if (!fs.existsSync(this.deviceDir)) {
            messages.push(`Failed to load devices: Directory "${this.deviceDir}" does not exist`);
            return messages;
        }

        // Clear existing devices.
        if (this.devices.size > 0) {
            await this.stopAllServers();
            this.devices.clear();
        }

        // Read all files in the directory.
        const files = fs.readdirSync(this.deviceDir);

        // Process each file.
        for (const file of files) {
            // Get full file path.
            const filePath = path.join(this.deviceDir, file);

            // Check if it's a file and has a .json extension.
            if (fs.statSync(filePath).isFile() && path.extname(file).toLowerCase() === ".json") {
                messages.push('----------------------------------------------------------------');
                messages.push(`Loading file: ${file}`);
                messages.push('');

                // Read file content.
                const data = fs.readFileSync(filePath, 'utf8');

                // Try to parse file content as JSON object.
                let json;
                try {
                    json = JSON.parse(data);
                } catch (error) {
                    messages.push(`Failed to parse JSON file: ${filePath}`);
                    continue;
                }
                
                // Deserialize JSON object into ModbusDevice instance.
                const result: ParseResult<ModbusDevice> = deviceFromJSON(json);

                // Check for deserialization errors.
                if (!result.success) {
                    messages.push(`Errors occurred while parsing ${file}:`);
                    result.errors.forEach(err => messages.push(` - ${err}`));
                    continue;
                }

                // Add device to the appropriate map.
                const device = result.value;
                this.devices.set(file, device);

                const datapointCount = device.getAllUnits().reduce((sum, unit) => sum + unit.getAllDataPoints().length, 0);

                messages.push(`Successfully loaded device from file: ${file}`);
                messages.push(' - Device Name: '    + device.getName());
                messages.push(' - Units: '          + device.getAllUnits().length);
                messages.push(' - Data Points: '    + datapointCount);
                messages.push('');

                // Enable simulation if configured.
                device.startAllEnabledSimulations();

                // Start the Modbus server if requested.
                if (startServer && device.isEnabled()) {
                    const { success, message } = await device.startServer();
                    messages.push(message);
                }
                messages.push('----------------------------------------------------------------');
            }
        }

        // Ensure messages are always returned, even if no files are processed
        return messages;
    }

    getDevices(): ModbusDevice[] {
        return Array.from(this.devices.values());
    }

}