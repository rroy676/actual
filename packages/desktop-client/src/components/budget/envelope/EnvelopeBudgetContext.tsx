import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';

import * as monthUtils from '@actual-app/core/shared/months';

type EnvelopeBudgetContextDefinition = {
  summaryCollapsed: boolean;
  onBudgetAction: (month: string, action: string, arg?: unknown) => void;
  onToggleSummaryCollapse: () => void;
  currentMonth: string;
  ccPaymentCategories: Map<string, string>;
};

const EnvelopeBudgetContext = createContext<EnvelopeBudgetContextDefinition>({
  summaryCollapsed: false,
  onBudgetAction: () => {
    throw new Error('Unitialised context method called: onBudgetAction');
  },
  onToggleSummaryCollapse: () => {
    throw new Error(
      'Unitialised context method called: onToggleSummaryCollapse',
    );
  },
  currentMonth: 'unknown',
  ccPaymentCategories: new Map(),
});

type EnvelopeBudgetProviderProps = Omit<
  EnvelopeBudgetContextDefinition,
  'currentMonth'
> & {
  children: ReactNode;
};
export function EnvelopeBudgetProvider({
  summaryCollapsed,
  onBudgetAction,
  onToggleSummaryCollapse,
  ccPaymentCategories,
  children,
}: EnvelopeBudgetProviderProps) {
  const currentMonth = monthUtils.currentMonth();

  return (
    <EnvelopeBudgetContext.Provider
      value={{
        currentMonth,
        summaryCollapsed,
        onBudgetAction,
        onToggleSummaryCollapse,
        ccPaymentCategories,
      }}
    >
      {children}
    </EnvelopeBudgetContext.Provider>
  );
}

export function useEnvelopeBudget() {
  return useContext(EnvelopeBudgetContext);
}
