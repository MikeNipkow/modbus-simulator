import { Request, Response } from "express";

/**
 * Get the version of the backend software.
 * @param req Express request object.
 * @param res Express response object.
 */
export const getVersionRoute = (req: Request, res: Response) => {
  const version = "1.0.0";
  return res.json(version);
};
