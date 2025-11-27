import { Request, Response } from "express";
import { getUnitFromRequest } from "./unitController.js";
import { DataPoint } from "../../DataPoint.js";
import { dataPointDTOFromObject, dataPointFromDTO, dataPointToDataPointDTO } from "../mapper/DataPointDTOMapper.js";
import { getDeviceFromRequest } from "./deviceController.js";
import deviceManager from "../../app.js";

/**
 * Helper function to get a DataPoint by ID from request parameters.
 * @param req Express request object.
 * @param res Express response object.
 * @returns The DataPoint if found, undefined otherwise.
 */
export const getDataPointFromRequest = (req: Request, res: Response): DataPoint | undefined => {
    // Retrieve unit.
    const unit = getUnitFromRequest(req, res);
    if (!unit) 
        return undefined;

    // Check for data point id parameter.
    if (!req.params.dataPointId) {
        res.status(400).json({ error: 'DataPoint id parameter is required' });
        return undefined;
    }

    // Retrieve data point.
    const dataPointId = req.params.dataPointId;
    const dataPoint = unit.getDataPoint(dataPointId);
    if (!dataPoint) {
        res.status(404).json({ error: `DataPoint with id ${dataPointId} not found in unit ${unit.getId()}` });
        return undefined;
    }

    return dataPoint;
}

/**
 * Retrieves all DataPoints of a ModbusUnit.
 * @param req Express request object.
 * @param res Express response object.
 */
export const getDataPointsRoute = (req: Request, res: Response) => {
    // Retrieve unit.
    const unit = getUnitFromRequest(req, res);
    if (!unit) 
        return;

    // Collect data point DTOs.
    const dataPoints = Array.from(unit.getAllDataPoints().map(dp => dataPointToDataPointDTO(dp)));

    res.json(dataPoints);
}

/**
 * Retrieves a DataPoint by ID.
 * @param req Express request object.
 * @param res Express response object.
 */
export const getDataPointRoute = (req: Request, res: Response) => {
    // Retrieve data point.
    const dataPoint = getDataPointFromRequest(req, res);
    if (!dataPoint) 
        return;

    // Convert to DTO.
    const dataPointDTO = dataPointToDataPointDTO(dataPoint);

    res.json(dataPointDTO);
}

/**
 * Creates a new DataPoint.
 * @param req Express request object.
 * @param res Express response object.
 */
export const createDataPointRoute = (req: Request, res: Response) => {
    // Retrieve unit.
    const unit = getUnitFromRequest(req, res);
    if (!unit) 
        return;

    // Retrieve device.
    const device = getDeviceFromRequest(req, res);
    if (!device) 
        return;

    // Parse data point DTO from request body.
    const parseResult = dataPointDTOFromObject(req.body);
    if (!parseResult.success) {
        res.status(400).json({ errors: parseResult.errors });
        return;
    }

    // Create DataPoint from DTO.
    const dpDTO = parseResult.value;
    const dataPoint: DataPoint= new DataPoint(dpDTO);  
    const result = unit.addDataPoint(dataPoint);
    if (!result.success) {
        res.status(400).json({ errors: result.errors });
        return;
    }

    // Save device in json file.
    deviceManager.saveDevice(device.getFilename());

    // Convert to DTO.
    const dto = dataPointToDataPointDTO(dataPoint);

    res.status(201).json(dto);
}

/**
 * Deletes a DataPoint.
 * @param req Express request object.
 * @param res Express response object.
 */
export const deleteDataPointRoute = (req: Request, res: Response) => {
    // Retrieve device.
    const device = getDeviceFromRequest(req, res);
    if (!device) 
        return;

    // Retrieve unit.
    const unit = getUnitFromRequest(req, res);
    if (!unit) 
        return;

    // Retrieve data point.
    const dataPoint = getDataPointFromRequest(req, res);
    if (!dataPoint) 
        return;

    // Delete data point.
    unit.deleteDataPoint(dataPoint.getId());

    // Save device in json file.
    deviceManager.saveDevice(device.getFilename());

    res.status(204).send();
}

/**
 * Updates an existing DataPoint by recreating it.
 * @param req Express request object.
 * @param res Express response object.
 */
export const updateDataPointRoute = (req: Request, res: Response) => {
    // Retrieve device.
    const device = getDeviceFromRequest(req, res);
    if (!device) 
        return;

    // Retrieve unit.
    const unit = getUnitFromRequest(req, res);
    if (!unit) 
        return;

    // Retrieve data point.
    const dataPoint = getDataPointFromRequest(req, res);
    if (!dataPoint) 
        return;

    // Parse data point DTO from request body.
    const parseResult = dataPointDTOFromObject(req.body);
    if (!parseResult.success) {
        res.status(400).json({ errors: parseResult.errors });
        return;
    }
    
    // Create new DataPoint with updated properties.
    const dpDTO = parseResult.value;
    const newDpResult = dataPointFromDTO(dpDTO);
    if (!newDpResult.success) {
        res.status(400).json({ errors: newDpResult.errors });
        return;
    }
    
    // Delete and recreate approach.
    const newDp = newDpResult.value;
    const deleteResult = unit.deleteDataPoint(dataPoint.getId());
    if (!deleteResult) {
        // Internal error
        res.status(500).json({ error: 'Failed to delete existing DataPoint for update' });
        return;
    }

    // Try to add the new DataPoint
    const addResult = unit.addDataPoint(newDp);
    if (!addResult.success) {
        // Re-add the old DataPoint to maintain state
        unit.addDataPoint(dataPoint);

        res.status(400).json({ errors: addResult.errors });
        return;
    }

    // Save device in json file.
    deviceManager.saveDevice(device.getFilename());

    // Retrieve updated DataPoint and convert to DTO.
    const updatedDataPoint = unit.getDataPoint(dataPoint.getId());
    const dto = dataPointToDataPointDTO(updatedDataPoint!);

    res.json(dto);
}