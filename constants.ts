
import { DimensionNode, Scenario, Version } from './types';

export const INITIAL_DIMENSION_TREE: DimensionNode[] = [
  {
    id: 'root-1',
    code: 'GROUP_TOTAL',
    name: '集团总部合并范围',
    type: 'Total',
    validFrom: { startYear: 2020, startPeriod: 1, endYear: 9999, endPeriod: 12 },
    validTo: { startYear: 9999, startPeriod: 12, endYear: 9999, endPeriod: 12 },
    children: [
      {
        id: 'node-2',
        code: 'CHINA_CORP',
        name: '大中华区事业部',
        type: 'Total',
        validFrom: { startYear: 2020, startPeriod: 1, endYear: 9999, endPeriod: 12 },
        validTo: { startYear: 9999, startPeriod: 12, endYear: 9999, endPeriod: 12 },
        children: [
          {
            id: 'node-3',
            code: 'BJ_OFFICE',
            name: '北京分公司 (长期有效)',
            type: 'Member',
            validFrom: { startYear: 2022, startPeriod: 1, endYear: 9999, endPeriod: 12 },
            validTo: { startYear: 9999, startPeriod: 12, endYear: 9999, endPeriod: 12 },
            children: [],
            properties: {}
          },
          {
            id: 'node-4',
            code: 'SH_OFFICE',
            name: '上海分公司 (2024年6月后注销)',
            type: 'Member',
            validFrom: { startYear: 2020, startPeriod: 1, endYear: 2024, endPeriod: 6 },
            validTo: { startYear: 2024, startPeriod: 6, endYear: 2024, endPeriod: 6 },
            children: [],
            properties: {}
          },
          {
            id: 'node-sz',
            code: 'SZ_R_D',
            name: '深圳研发中心 (2024年3月新设)',
            type: 'Member',
            validFrom: { startYear: 2024, startPeriod: 3, endYear: 9999, endPeriod: 12 },
            validTo: { startYear: 9999, startPeriod: 12, endYear: 9999, endPeriod: 12 },
            children: [],
            properties: {}
          }
        ],
        properties: {}
      },
      {
        id: 'node-5',
        code: 'EUROPE_DIV',
        name: '欧洲及海外事业部 (2025年起生效)',
        type: 'Total',
        validFrom: { startYear: 2025, startPeriod: 1, endYear: 9999, endPeriod: 12 },
        validTo: { startYear: 9999, startPeriod: 12, endYear: 9999, endPeriod: 12 },
        children: [
          {
            id: 'node-uk',
            code: 'UK_BR',
            name: '伦敦代表处',
            type: 'Member',
            validFrom: { startYear: 2024, startPeriod: 5, endYear: 9999, endPeriod: 12 },
            validTo: { startYear: 9999, startPeriod: 12, endYear: 9999, endPeriod: 12 },
            children: [],
            properties: {}
          }
        ],
        properties: {}
      }
    ],
    properties: {}
  }
];

export const SCENARIOS: Scenario[] = ['Actual', 'Budget', 'Forecast', 'Staging'];
export const VERSIONS: Version[] = ['V1', 'V2', 'Working', 'Final'];
export const YEARS = [2022, 2023, 2024, 2025, 2026];
export const PERIODS = Array.from({ length: 12 }, (_, i) => i + 1);
