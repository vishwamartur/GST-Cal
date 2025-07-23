export interface GSTReturn {
  id: string;
  name: string;
  description: string;
  frequency: 'monthly' | 'quarterly' | 'annually';
  dueDate: number; // Day of month when due
  applicableFor: 'all' | 'regular' | 'composition' | 'nil';
  turnoverThreshold?: number;
}

export interface FilingDate {
  id: string;
  returnType: string;
  returnName: string;
  dueDate: Date;
  period: string;
  isOverdue: boolean;
  daysUntilDue: number;
}

export const GST_RETURNS: GSTReturn[] = [
  {
    id: 'gstr1',
    name: 'GSTR-1',
    description: 'Details of outward supplies of taxable goods and/or services effected',
    frequency: 'monthly',
    dueDate: 11,
    applicableFor: 'regular',
    turnoverThreshold: 150000000 // 1.5 crores
  },
  {
    id: 'gstr1_quarterly',
    name: 'GSTR-1 (Quarterly)',
    description: 'Quarterly GSTR-1 for small taxpayers',
    frequency: 'quarterly',
    dueDate: 11,
    applicableFor: 'regular',
    turnoverThreshold: 150000000
  },
  {
    id: 'gstr3b',
    name: 'GSTR-3B',
    description: 'Monthly return with summary of outward supplies, input tax credit and tax payment',
    frequency: 'monthly',
    dueDate: 20,
    applicableFor: 'regular'
  },
  {
    id: 'gstr4',
    name: 'GSTR-4',
    description: 'Return for composition taxpayers',
    frequency: 'quarterly',
    dueDate: 18,
    applicableFor: 'composition'
  },
  {
    id: 'gstr9',
    name: 'GSTR-9',
    description: 'Annual return',
    frequency: 'annually',
    dueDate: 31,
    applicableFor: 'regular'
  },
  {
    id: 'gstr9c',
    name: 'GSTR-9C',
    description: 'Reconciliation statement and certificate',
    frequency: 'annually',
    dueDate: 31,
    applicableFor: 'regular',
    turnoverThreshold: 200000000 // 2 crores
  }
];

export function getNextDueDate(returnInfo: GSTReturn, referenceDate: Date = new Date()): Date {
  const today = new Date(referenceDate);
  let dueDate: Date;

  switch (returnInfo.frequency) {
    case 'monthly':
      // For monthly returns, due date is in the following month
      dueDate = new Date(today.getFullYear(), today.getMonth() + 1, returnInfo.dueDate);
      
      // If we're past the due date for current month, move to next month
      const currentMonthDue = new Date(today.getFullYear(), today.getMonth(), returnInfo.dueDate);
      if (today > currentMonthDue) {
        dueDate = new Date(today.getFullYear(), today.getMonth() + 1, returnInfo.dueDate);
      } else {
        dueDate = currentMonthDue;
      }
      break;

    case 'quarterly':
      // Quarterly returns are due in Jan, Apr, Jul, Oct
      const quarterMonths = [0, 3, 6, 9]; // Jan, Apr, Jul, Oct
      const currentQuarter = Math.floor(today.getMonth() / 3);
      let nextQuarterMonth = quarterMonths[(currentQuarter + 1) % 4];
      let year = today.getFullYear();
      
      // If next quarter is in next year
      if (nextQuarterMonth <= today.getMonth()) {
        year += 1;
      }
      
      dueDate = new Date(year, nextQuarterMonth, returnInfo.dueDate);
      break;

    case 'annually':
      // Annual returns are typically due by Dec 31 of following year
      let annualYear = today.getFullYear();
      if (today.getMonth() >= 11 && today.getDate() > returnInfo.dueDate) {
        annualYear += 1;
      }
      dueDate = new Date(annualYear, 11, returnInfo.dueDate); // December
      break;

    default:
      dueDate = new Date(today.getFullYear(), today.getMonth() + 1, returnInfo.dueDate);
  }

  return dueDate;
}

export function getFilingPeriod(returnInfo: GSTReturn, dueDate: Date): string {
  switch (returnInfo.frequency) {
    case 'monthly':
      const prevMonth = new Date(dueDate.getFullYear(), dueDate.getMonth() - 1, 1);
      return prevMonth.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
    
    case 'quarterly':
      const quarter = Math.floor((dueDate.getMonth()) / 3) + 1;
      return `Q${quarter} ${dueDate.getFullYear()}`;
    
    case 'annually':
      return `FY ${dueDate.getFullYear() - 1}-${dueDate.getFullYear().toString().slice(-2)}`;
    
    default:
      return dueDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  }
}

export function getApplicableReturns(
  businessType: 'regular' | 'composition' | 'nil' = 'regular',
  annualTurnover: number = 0
): GSTReturn[] {
  return GST_RETURNS.filter(returnInfo => {
    // Check if applicable for business type
    if (returnInfo.applicableFor !== 'all' && returnInfo.applicableFor !== businessType) {
      return false;
    }

    // Check turnover threshold
    if (returnInfo.turnoverThreshold && annualTurnover < returnInfo.turnoverThreshold) {
      return false;
    }

    // Special logic for GSTR-1 frequency based on turnover
    if (returnInfo.id === 'gstr1' && annualTurnover <= 150000000) {
      return false; // Use quarterly GSTR-1 instead
    }
    if (returnInfo.id === 'gstr1_quarterly' && annualTurnover > 150000000) {
      return false; // Use monthly GSTR-1 instead
    }

    return true;
  });
}

export function getUpcomingFilingDates(
  businessType: 'regular' | 'composition' | 'nil' = 'regular',
  annualTurnover: number = 0,
  daysAhead: number = 90
): FilingDate[] {
  const applicableReturns = getApplicableReturns(businessType, annualTurnover);
  const today = new Date();
  const filingDates: FilingDate[] = [];

  applicableReturns.forEach(returnInfo => {
    // Get next few due dates
    for (let i = 0; i < (returnInfo.frequency === 'annually' ? 1 : 3); i++) {
      const referenceDate = new Date(today);
      referenceDate.setMonth(referenceDate.getMonth() + i * (returnInfo.frequency === 'monthly' ? 1 : 3));
      
      const dueDate = getNextDueDate(returnInfo, referenceDate);
      const daysDiff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff <= daysAhead && daysDiff >= -30) { // Include overdue up to 30 days
        filingDates.push({
          id: `${returnInfo.id}_${dueDate.getTime()}`,
          returnType: returnInfo.id,
          returnName: returnInfo.name,
          dueDate,
          period: getFilingPeriod(returnInfo, dueDate),
          isOverdue: daysDiff < 0,
          daysUntilDue: daysDiff
        });
      }
    }
  });

  // Sort by due date
  return filingDates.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
}

export function getDaysUntilDue(dueDate: Date): number {
  const today = new Date();
  return Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function isOverdue(dueDate: Date): boolean {
  return getDaysUntilDue(dueDate) < 0;
}
