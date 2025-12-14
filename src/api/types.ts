export interface Expense {
    id: number;
    description: string;
    amount: number;
    date: string;
    category?: {
        id: number;
        name: string;
    };
}

export interface AnalyticsSummary {
    total: number;
    byCategory: Record<string, number>;
    monthOverMonthChange: number;
}

export interface Forecast {
    predictedTotal: number;
    confidence: number;
}

export interface Budget {
    id: number;
    amount: number;
    month: string;
    category?: {
        id: number;
        name: string;
    };
}
