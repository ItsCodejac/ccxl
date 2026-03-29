import { z } from 'zod';

export const PolicyRuleSchema = z.object({
  type: z.enum(['require', 'deny', 'enforce']),
  target: z.string(),
  value: z.string(),
  message: z.string().optional(),
});

export const BaseConfigSchema = z.object({
  name: z.string(),
  source: z.string(),
  version: z.string(),
  policies: z.array(PolicyRuleSchema),
});

export type PolicyRule = z.infer<typeof PolicyRuleSchema>;
export type BaseConfig = z.infer<typeof BaseConfigSchema>;

export interface PolicyViolation {
  rule: PolicyRule;
  message: string;
}

export interface GovernanceReport {
  compliant: boolean;
  violations: PolicyViolation[];
  policies: number;
}
