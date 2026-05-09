import type { VcListItem } from '@vyracare/design-system';

export const PROCEEDINGS_STORAGE_KEY = 'vyracare_app_proceedings_mfe_catalog';

export interface AestheticProcedurePayload {
  name: string;
  category: string;
  code: string;
  targetArea: string;
  durationMinutes: number;
  sessionPrice: number;
  sessionCount: number;
  recoveryTime: string;
  description: string;
  active: boolean;
}

export interface AestheticProcedure extends AestheticProcedurePayload {
  id: string;
  createdAt: string;
}

export interface ProcedureCategorySummary {
  category: string;
  subtitle: string;
  items: VcListItem[];
}
