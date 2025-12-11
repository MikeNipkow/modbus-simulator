import { Request, Response } from "express";
import deviceManager, { templateManager } from "../../app.js";
import { ModbusDeviceDTO } from "../dto/ModbusDeviceDTO.js";
import { ModbusDevice } from "../../ModbusDevice.js";
import { ParseResult } from "../../types/enums/ParseResult.js";
import {
  deviceDTOFromObject,
  deviceFromDTO,
  deviceToDeviceDTO,
} from "../mapper/ModbusDeviceDTOMapper.js";
import { DeviceManager } from "../../DeviceManager.js";
import fs from "fs";

/**
 * Helper function to determine if the request is for a template.
 * @param req Express request object.
 * @returns True if the endpoint is for templates, false otherwise.
 */
export const isTemplateEndpoint = (req: Request): boolean => {
  const originalUrl = req.originalUrl;
  return originalUrl.startsWith("/api/v1/templates");
};

/**
 * Helper function to determine if the request is for a device.
 * @param req Express request object.
 * @returns True if the endpoint is for devices, false otherwise.
 */
export const isDeviceEndpoint = (req: Request): boolean => {
  const originalUrl = req.originalUrl;
  return originalUrl.startsWith("/api/v1/devices");
};

/**
 * Helper function to get the appropriate DeviceManager based on the API endpoint.
 * @param req Express request object.
 * @returns The corresponding DeviceManager or undefined if not found.
 */
export const getDeviceManagerByEndpoint = (
  req: Request,
): DeviceManager | undefined => {
  // Check if the endpoint is for templates.
  if (isTemplateEndpoint(req)) return templateManager;

  // Check if the endpoint is for devices.
  if (isDeviceEndpoint(req)) return deviceManager;

  return undefined;
};

/**
 * Helper function to get a device by ID from request parameters.
 * @param req Express request object.
 * @param res Express response object.
 * @param template Whether to get the device from the template manager.
 * @returns The device if found, undefined otherwise.
 */
export const getDeviceFromRequest = (
  req: Request,
  res: Response,
  template: boolean = false,
): ModbusDevice | undefined => {
  // Get appropriate device manager.
  const deviceManager = getDeviceManagerByEndpoint(req);
  if (!deviceManager) {
    res
      .status(500)
      .json({ errors: ["Failed to determine the appropriate device manager"] });
    return undefined;
  }

  // Check for device id parameter.
  const deviceId = req.params.id;
  if (!deviceId) {
    res.status(400).json({
      errors: [
        !template
          ? "Device id parameter is required"
          : "Template id parameter is required",
      ],
    });
    return undefined;
  }

  // Check if device exists.
  const device = deviceManager.getDevice(deviceId);
  if (!device) {
    res.status(404).json({
      errors: [
        !template
          ? `Device with id ${deviceId} not found`
          : `Template with id ${deviceId} not found`,
      ],
    });
    return undefined;
  }

  return device;
};

/**
 * Retrieves all devices.
 * @param req Express request object.
 * @param res Express response object.
 */
export const getDevicesRoute = (req: Request, res: Response) => {
  // Get appropriate device manager.
  const deviceManager = getDeviceManagerByEndpoint(req);
  if (!deviceManager) {
    res
      .status(500)
      .json({ errors: ["Failed to determine the appropriate device manager"] });
    return undefined;
  }

  // Collect device DTOs.
  const devicesDTO: ModbusDeviceDTO[] = [];
  deviceManager
    .getDevices()
    .map((device) =>
      devicesDTO.push(deviceToDeviceDTO(device, !isDeviceEndpoint(req))),
    );

  res.json(devicesDTO);
};

/**
 * Retrieves a device by ID.
 * @param req Express request object.
 * @param res Express response object.
 */
export const getDeviceRoute = (req: Request, res: Response) => {
  // Retrieve device.
  const device = getDeviceFromRequest(req, res);
  if (!device) return;

  // Convert to DTO.
  const deviceDTO = deviceToDeviceDTO(device, !isDeviceEndpoint(req));

  res.json(deviceDTO);
};

/**
 * Creates a new device.
 * @param req Express request object.
 * @param res Express response object.
 */
export const createDeviceRoute = (req: Request, res: Response) => {
  // Get appropriate device manager.
  const deviceManager = getDeviceManagerByEndpoint(req);
  if (!deviceManager) {
    res
      .status(500)
      .json({ errors: ["Failed to determine the appropriate device manager"] });
    return undefined;
  }

  // Parse device DTO from request body.
  const result: ParseResult<ModbusDeviceDTO> = deviceDTOFromObject(req.body);
  if (!result.success) {
    res.status(400).json({ errors: result.errors });
    return;
  }

  // Check for existing device.
  const deviceDTO = result.value;
  const filename = deviceDTO.filename;
  if (deviceManager.hasDevice(filename)) {
    res
      .status(409)
      .json({ errors: [`Device with id ${filename} already exists`] });
    return;
  }

  // Create new device.
  const device = new ModbusDevice(deviceDTO);
  const addResult = deviceManager.addDevice(filename, device);
  if (!addResult) {
    res
      .status(500)
      .json({ errors: `Failed to create the device with id ${filename}` });
    return;
  }

  // Save device in json file.
  deviceManager.saveDevice(device.getFilename());

  res.status(201).json(deviceToDeviceDTO(device, !isDeviceEndpoint(req)));
};

/**
 * Deletes a device.
 * @param req Express request object.
 * @param res Express response object.
 */
export const deleteDeviceRoute = (req: Request, res: Response) => {
  // Get appropriate device manager.
  const deviceManager = getDeviceManagerByEndpoint(req);
  if (!deviceManager) {
    res
      .status(500)
      .json({ errors: ["Failed to determine the appropriate device manager"] });
    return undefined;
  }

  // Check for device.
  const device = getDeviceFromRequest(req, res);
  if (!device) return;

  // Delete device.
  deviceManager.deleteDevice(device.getFilename());

  res.status(204).send();
};

/**
 * Updates a device by recreating it.
 * @param req Express request object.
 * @param res Express response object.
 */
export const updateDeviceRoute = async (req: Request, res: Response) => {
  // Get appropriate device manager.
  const deviceManager = getDeviceManagerByEndpoint(req);
  if (!deviceManager) {
    res
      .status(500)
      .json({ errors: ["Failed to determine the appropriate device manager"] });
    return undefined;
  }

  // Check for existing device.
  const device = getDeviceFromRequest(req, res);
  if (!device) return;

  // Parse new device DTO from request body.
  const parseResult = deviceDTOFromObject(req.body);
  if (!parseResult.success) {
    res.status(400).json({ errors: parseResult.errors });
    return;
  }

  // Try to parse new device from DTO.
  const newDeviceDTO = parseResult.value;
  const newDeviceResult = deviceFromDTO(newDeviceDTO);
  if (!newDeviceResult.success) {
    res.status(400).json({ errors: newDeviceResult.errors });
    return;
  }
  const newDevice = newDeviceResult.value;

  // Stop the old device modbus server.
  const wasRunning = device.isRunning();
  if (wasRunning) await device.stopServer();

  // Delete old device.
  const deleted = deviceManager.deleteDevice(device.getFilename());
  if (!deleted) {
    // Restart old device if it was running.
    if (wasRunning) await device.startServer();

    res.status(500).json({
      errors: [
        `Failed to delete existing device with id ${device.getFilename()}`,
      ],
    });
    return;
  }

  // Try to add new device.
  const addResult = deviceManager.addDevice(newDevice.getFilename(), newDevice);
  if (!addResult) {
    // Try to add the old device back.
    deviceManager.addDevice(device.getFilename(), device);
    if (wasRunning) await device.startServer();

    // Save old device.
    deviceManager.saveDevice(device.getFilename());

    res.status(500).json({
      errors: [`Failed to add new device with id ${newDevice.getFilename()}`],
    });
    return;
  }

  // Save new device and start server if enabled.
  deviceManager.saveDevice(newDevice.getFilename());
  if (newDevice.isEnabled() && !isTemplateEndpoint(req))
    await newDevice.startServer();

  res.status(200).json(deviceToDeviceDTO(newDevice, !isDeviceEndpoint(req)));
};

/**
 * Starts a device's Modbus server.
 * @param req Express request object.
 * @param res Express response object.
 */
export const startDeviceRoute = async (req: Request, res: Response) => {
  // Retrieve device.
  const device = getDeviceFromRequest(req, res);
  if (!device) return;

  // Start device server.
  const startResult = await device.enableServer();
  if (!startResult.success) {
    res.status(500).json({ errors: [startResult.message] });
    return;
  }

  // Save new device and start server if enabled.
  deviceManager.saveDevice(device.getFilename());

  res.status(200).json(deviceToDeviceDTO(device, false));
};

/**
 * Stops a device's Modbus server.
 * @param req Express request object.
 * @param res Express response object.
 */
export const stopDeviceRoute = async (req: Request, res: Response) => {
  // Retrieve device.
  const device = getDeviceFromRequest(req, res);
  if (!device) return;

  // Start device server.
  const stopResult = await device.disableServer();
  if (!stopResult.success) {
    res.status(500).json({ errors: [stopResult.message] });
    return;
  }

  // Save new device and start server if enabled.
  deviceManager.saveDevice(device.getFilename());

  res.status(200).json(deviceToDeviceDTO(device, false));
};

/**
 * Downloads the original JSON file of a device.
 * @param req Express request object.
 * @param res Express response object.
 */
export const downloadDeviceRoute = (req: Request, res: Response) => {
  // Get appropriate device manager.
  const deviceManager = getDeviceManagerByEndpoint(req);
  if (!deviceManager) {
    res
      .status(500)
      .json({ errors: ["Failed to determine the appropriate device manager"] });
    return undefined;
  }

  // Check for device.
  const device = getDeviceFromRequest(req, res);
  if (!device) return;

  // Get file path.
  const filename = device.getFilename();
  const filePath = deviceManager.getDeviceFile(filename);

  // Check if file exists.
  if (filePath === null || !fs.existsSync(filePath)) {
    res.status(404).json({ errors: [`File not found`] });
    return;
  }

  // Send file as download.
  res.download(filePath, filename, (err) => {
    if (err) res.status(500).json({ errors: ["Failed to download file"] });
  });
};
