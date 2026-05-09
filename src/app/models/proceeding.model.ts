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
