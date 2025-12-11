import { Request, Response } from "express";

/**
 * Get the version of the backend software.
 * @param req Express request object.
 * @param res Express response object.
 */
export const getVersionRoute = (req: Request, res: Response) => {
  var version = process.env.npm_package_version;
  return res.json(version);
};
