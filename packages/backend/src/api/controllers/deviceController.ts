import { Request, Response } from "express";
import deviceManager, { templateManager } from "../../app.js";
import { ModbusDeviceDTO } from "../dto/ModbusDeviceDTO.js";
import { fromJSON, fromModbusDevice } from "../mapper/ModbusDeviceDTOMapper.js";
import { ModbusDevice } from "../../ModbusDevice.js";
import { ParseResult } from "../../types/ParseResult.js";

/**
 * Helper function to get a device by ID from request parameters.
 * Sends error response if device is not found.
 * @returns The device if found, undefined otherwise.
 */
export const getDeviceFromRequest = (req: Request, res: Response, template: boolean = false): ModbusDevice | undefined => {
    const deviceId = req.params.id;

    if (!deviceId) {
        res.status(400).json({ error: !template ? 'Device id parameter is required' : 'Template id parameter is required' });
        return undefined;
    }

    const device = !template ? deviceManager.getDevice(deviceId) : templateManager.getDevice(deviceId);
    if (!device) {
        res.status(404).json({ error: !template ? `Device with id ${deviceId} not found` : `Template with id ${deviceId} not found` });
        return undefined;
    }

    return device;
};

export const getDevicesRoute = (req: Request, res: Response) => {
    const devicesDTO: ModbusDeviceDTO[] = [];
    deviceManager.getDevices().map((device) => devicesDTO.push(fromModbusDevice(device)));

    res.json(devicesDTO);
};

export const getDeviceRoute = (req: Request, res: Response) => {
    const device = getDeviceFromRequest(req, res);
    if (!device) return;

    const deviceDTO = fromModbusDevice(device);
    res.json(deviceDTO);
}

export const createDeviceRoute = (req: Request, res: Response) => {
    const result: ParseResult<ModbusDeviceDTO> = fromJSON(req.body);
    if (!result.success) {
        res.status(400).json({ errors: result.errors });
        return;
    }

    const deviceDTO = result.value;
    if (deviceManager.hasDevice(deviceDTO.fileName)) {
        res.status(409).json({ error: `Device with id ${deviceDTO.fileName} already exists` });
        return;
    }

    const device = new ModbusDevice(
        deviceDTO.fileName, 
        deviceDTO.enabled, 
        deviceDTO.port, 
        deviceDTO.endian, 
        deviceDTO.name, 
        deviceDTO.vendor, 
        deviceDTO.description
    );

    const addResult = deviceManager.addDevice(device.getId(), device);
    if (!addResult) {
        res.status(500).json({ errors: "Failed to create the device with id ${deviceDTO.fileName}" });
        return;
    }

    deviceManager.saveDevice(device.getId());
    res.status(201).json(fromModbusDevice(device));
}

export const deleteDeviceRoute = (req: Request, res: Response) => {
    const device = getDeviceFromRequest(req, res);
    if (!device) return;

    deviceManager.deleteDevice(device.getId());
    res.status(204).send();
}