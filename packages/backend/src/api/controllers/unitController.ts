import { Request, Response } from "express";
import {
  getDeviceFromRequest,
  getDeviceManagerByEndpoint,
} from "./deviceController.js";
import {
  modbusUnitFromDTO,
  unitDTOFromObject,
  unitToUnitDTO,
} from "../mapper/ModbusUnitDTOMapper.js";
import { ModbusUnitDTO } from "../dto/ModbusUnitDTO.js";
import { ModbusUnit } from "../../ModbusUnit.js";

/**
 * Helper function to get a ModbusUnit by ID from request parameters.
 * @param req Express request object.
 * @param res Express response object.
 * @returns The ModbusUnit if found, undefined otherwise.
 */
export const getUnitFromRequest = (
  req: Request,
  res: Response,
): ModbusUnit | undefined => {
  // Retrieve device.
  const device = getDeviceFromRequest(req, res);
  if (!device) return undefined;

  // Check for unit id parameter.
  if (!req.params.unitId) {
    res.status(400).json({ errors: ["Unit id parameter is required"] });
    return undefined;
  }

  // Parse unit id.
  const unitId = parseInt(req.params.unitId, 10);
  if (isNaN(unitId) || unitId < 1 || unitId > 254) {
    res
      .status(400)
      .json({ errors: ["Unit id must be a valid number between 1 and 254"] });
    return undefined;
  }

  // Retrieve unit.
  const unit = device.getUnit(unitId);
  if (!unit) {
    res.status(404).json({
      errors: [
        `Unit with id ${unitId} not found in device ${device.getFilename()}`,
      ],
    });
    return undefined;
  }

  return unit;
};

/**
 * Retrieves all units of a device.
 * @param req Express request object.
 * @param res Express response object.
 */
export const getUnitsRoute = (req: Request, res: Response) => {
  // Retrieve device.
  const device = getDeviceFromRequest(req, res);
  if (!device) return;

  // Collect unit DTOs.
  const unitsDTO: ModbusUnitDTO[] = [];
  device.getAllUnits().forEach((unit) => unitsDTO.push(unitToUnitDTO(unit)));

  res.json(unitsDTO);
};

/**
 * Retrieves a specific unit of a device.
 * @param req Express request object.
 * @param res Express response object.
 */
export const getUnitRoute = (req: Request, res: Response) => {
  // Retrieve unit.
  const unit = getUnitFromRequest(req, res);
  if (!unit) return;

  // Convert to DTO.
  const unitDTO = unitToUnitDTO(unit);

  res.json(unitDTO);
};

/**
 * Creates a new unit in a device.
 * @param req Express request object.
 * @param res Express response object.
 */
export const createUnitRoute = (req: Request, res: Response) => {
  // Get appropriate device manager.
  const deviceManager = getDeviceManagerByEndpoint(req);
  if (!deviceManager) {
    res
      .status(500)
      .json({ errors: ["Failed to determine the appropriate device manager"] });
    return undefined;
  }

  // Retrieve device.
  const device = getDeviceFromRequest(req, res);
  if (!device) return;

  // Parse unit id from request body.
  const unitId = req.body.id;
  if (unitId === undefined || unitId === null) {
    res.status(400).json({ errors: ["Unit id is required"] });
    return;
  }

  // Validate unit id.
  if (
    typeof unitId !== "number" ||
    isNaN(unitId) ||
    unitId < 1 ||
    unitId > 254
  ) {
    res
      .status(400)
      .json({ errors: ["Unit id must be a valid number between 1 and 254"] });
    return;
  }

  // Check if unit already exists.
  if (device.hasUnit(unitId)) {
    res.status(409).json({
      errors: [
        `Unit with id ${unitId} already exists in device ${device.getFilename()}`,
      ],
    });
    return;
  }

  // Create and add new unit.
  const unit = new ModbusUnit({ unitId });
  device.addUnit(unit);

  // Save device in json file.
  deviceManager.saveDevice(device.getFilename());

  // Convert to DTO.
  const unitDTO = unitToUnitDTO(unit);

  res.status(201).json(unitDTO);
};

/**
 * Deletes a unit from a device.
 * @param req Express request object.
 * @param res Express response object.
 */
export const deleteUnitRoute = (req: Request, res: Response) => {
  // Get appropriate device manager.
  const deviceManager = getDeviceManagerByEndpoint(req);
  if (!deviceManager) {
    res
      .status(500)
      .json({ errors: ["Failed to determine the appropriate device manager"] });
    return undefined;
  }

  // Retrieve device.
  const device = getDeviceFromRequest(req, res);
  if (!device) return;

  // Retrieve unit.
  const unit = getUnitFromRequest(req, res);
  if (!unit) return;

  // Delete unit.
  device.deleteUnit(unit.getId());

  // Save device in json file.
  deviceManager.saveDevice(device.getFilename());

  res.status(204).send();
};

/**
 * Updates an existing unit in a device by recreating it.
 * @param req Express request object.
 * @param res Express response object.
 */
export const updateUnitRoute = (req: Request, res: Response) => {
  // Get appropriate device manager.
  const deviceManager = getDeviceManagerByEndpoint(req);
  if (!deviceManager) {
    res
      .status(500)
      .json({ errors: ["Failed to determine the appropriate device manager"] });
    return undefined;
  }

  // Retrieve device.
  const device = getDeviceFromRequest(req, res);
  if (!device) return;

  // Retrieve unit.
  const unit = getUnitFromRequest(req, res);
  if (!unit) return;

  // Parse unit DTO from request body.
  const parseResult = unitDTOFromObject(req.body);
  if (!parseResult.success) {
    res.status(400).json({ errors: parseResult.errors });
    return;
  }

  // Try to parse new unit from DTO.
  const unitDTO = parseResult.value;
  const newUnitResult = modbusUnitFromDTO(unitDTO);
  if (!newUnitResult.success) {
    res.status(400).json({ errors: newUnitResult.errors });
    return;
  }

  // Delete existing unit and replace with new one.
  if (!device.deleteUnit(unit.getId())) {
    res.status(500).json({
      errors: [`Failed to delete existing unit with id ${unit.getId()}`],
    });
    return;
  }

  // Try to add new unit.
  const newUnit = newUnitResult.value;
  const addResult = device.addUnit(newUnit);
  if (!addResult) {
    // Restore old unit.
    device.addUnit(unit);

    res
      .status(500)
      .json({ errors: [`Failed to add new unit with id ${newUnit.getId()}`] });
    return;
  }

  // Save device in json file.
  deviceManager.saveDevice(device.getFilename());

  res.json(unitToUnitDTO(newUnit));
};
