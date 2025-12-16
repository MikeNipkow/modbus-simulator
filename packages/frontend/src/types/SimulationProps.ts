/**
 * SimulationProps interface defines the properties for simulation settings.
 */
export type SimulationProps = {
  enabled: boolean; // Indicates if the simulation is enabled.
  minValue: number | string; // The minimum value for the simulation range.
  maxValue: number | string; // The maximum value for the simulation range.
};
