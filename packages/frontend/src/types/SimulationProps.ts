/**
 * SimulationProps interface defines the properties for simulation settings.
 */
export type SimulationProps = {
  enabled: boolean; // Indicates if the simulation is enabled.
  minValue: number | bigint; // The minimum value for the simulation range.
  maxValue: number | bigint; // The maximum value for the simulation range.
};
