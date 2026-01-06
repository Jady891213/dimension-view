
export type Scenario = 'Actual' | 'Budget' | 'Forecast' | 'Staging';
export type Version = 'V1' | 'V2' | 'Working' | 'Final';

export interface TimeRange {
  startYear: number;
  startPeriod: number; // 1-12
  endYear: number;
  endPeriod: number;
}

export interface DimensionNode {
  id: string;
  code: string;
  name: string;
  type: 'Total' | 'Member' | 'Leaf';
  children: DimensionNode[];
  validFrom: TimeRange;
  validTo: TimeRange;
  properties: Record<string, any>;
}

export interface AppContext {
  scenario: Scenario;
  version: Version;
  years: number[];
  periods: number[];
}

export interface HistoryEvent {
  id: string;
  timestamp: Date;
  action: string;
  user: string;
}
