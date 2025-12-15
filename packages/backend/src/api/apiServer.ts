import express from "express";
import cors from "cors";
import {
  createDeviceRoute,
  deleteDeviceRoute,
  downloadDeviceRoute,
  getDeviceRoute,
  getDevicesRoute,
  startDeviceRoute,
  stopDeviceRoute,
  updateDeviceRoute,
  uploadTemplateRoute,
} from "./controllers/deviceController.js";
import {
  createUnitRoute,
  deleteUnitRoute,
  getUnitRoute,
  getUnitsRoute,
  updateUnitRoute,
} from "./controllers/unitController.js";
import {
  getDataPointsRoute,
  getDataPointRoute,
  deleteDataPointRoute,
  createDataPointRoute,
  updateDataPointRoute,
} from "./controllers/dataPointController.js";
import { getVersionRoute } from "./controllers/serverController.js";
import multer from "multer";

export function initializeApiServer() {
  const app = express();

  // Enable CORS for all routes
  app.use(cors());

  app.use(express.json());

  // Disable caching for API responses
  app.use("/api", (req, res, next) => {
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");
    next();
  });

  // Multer setup for file uploads to RAM.
  const upload = multer({ storage: multer.memoryStorage() });

  // Routes
  app.get("/api/v1/version", getVersionRoute);

  app.get("/api/v1/devices", getDevicesRoute);
  app.get("/api/v1/devices/:id", getDeviceRoute);
  app.get("/api/v1/devices/:id/download", downloadDeviceRoute);
  app.post("/api/v1/devices", createDeviceRoute);
  app.post("/api/v1/devices/:id/start", startDeviceRoute);
  app.post("/api/v1/devices/:id/stop", stopDeviceRoute);
  app.delete("/api/v1/devices/:id", deleteDeviceRoute);
  app.put("/api/v1/devices/:id", updateDeviceRoute);

  app.get("/api/v1/devices/:id/units", getUnitsRoute);
  app.get("/api/v1/devices/:id/units/:unitId", getUnitRoute);
  app.post("/api/v1/devices/:id/units", createUnitRoute);
  app.delete("/api/v1/devices/:id/units/:unitId", deleteUnitRoute);
  app.put("/api/v1/devices/:id/units/:unitId", updateUnitRoute);

  app.get("/api/v1/devices/:id/units/:unitId/dataPoints", getDataPointsRoute);
  app.get(
    "/api/v1/devices/:id/units/:unitId/dataPoints/:dataPointId",
    getDataPointRoute,
  );
  app.get(
    "/api/v1/devices/:id/units/:unitId/dataPoints/:dataPointId/value",
    getDataPointRoute,
  );
  app.post(
    "/api/v1/devices/:id/units/:unitId/dataPoints",
    createDataPointRoute,
  );
  app.delete(
    "/api/v1/devices/:id/units/:unitId/dataPoints/:dataPointId",
    deleteDataPointRoute,
  );
  app.put(
    "/api/v1/devices/:id/units/:unitId/dataPoints/:dataPointId",
    updateDataPointRoute,
  );

  app.get("/api/v1/templates", getDevicesRoute);
  app.post(
    "/api/v1/templates/upload",
    upload.single("file"),
    uploadTemplateRoute,
  );
  app.get("/api/v1/templates/:id", getDeviceRoute);
  app.get("/api/v1/templates/:id/download", downloadDeviceRoute);
  app.post("/api/v1/templates", createDeviceRoute);
  app.delete("/api/v1/templates/:id", deleteDeviceRoute);
  app.put("/api/v1/templates/:id", updateDeviceRoute);

  app.get("/api/v1/templates/:id/units", getUnitsRoute);
  app.get("/api/v1/templates/:id/units/:unitId", getUnitRoute);
  app.post("/api/v1/templates/:id/units", createUnitRoute);
  app.delete("/api/v1/templates/:id/units/:unitId", deleteUnitRoute);
  app.put("/api/v1/templates/:id/units/:unitId", updateUnitRoute);

  app.get("/api/v1/templates/:id/units/:unitId/dataPoints", getDataPointsRoute);
  app.get(
    "/api/v1/templates/:id/units/:unitId/dataPoints/:dataPointId",
    getDataPointRoute,
  );
  app.post(
    "/api/v1/templates/:id/units/:unitId/dataPoints",
    createDataPointRoute,
  );
  app.delete(
    "/api/v1/templates/:id/units/:unitId/dataPoints/:dataPointId",
    deleteDataPointRoute,
  );
  app.put(
    "/api/v1/templates/:id/units/:unitId/dataPoints/:dataPointId",
    updateDataPointRoute,
  );

  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}
