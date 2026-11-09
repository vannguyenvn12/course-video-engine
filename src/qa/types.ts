export type LintSeverity = 'error' | 'warn';

export type LintIssue = {
  rule: string;
  severity: LintSeverity;
  message: string;
  hint?: string;
  dataId?: string;
};

export type LintReport = {
  ok: boolean;
  issues: LintIssue[];
};
