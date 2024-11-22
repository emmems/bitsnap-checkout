export interface SingleProduct {
    id: string;
    ownerID: string;
    name: string;
    description: string | null;
    price: number;
    currency: string;
    metadata: unknown;
    image_url: string | null;

    availableQuantity?: number;

    isDeliverable?: boolean;

    recurring?: Recurring;
    createdAt?: number | null;
    updatedAt?: number | null;
    deletedAt?: number | null;
}

export interface Recurring {
    billingPeriod: BillingPeriod;
    trialDays?: number;
    subscriptionSchedule?: number;
}

export enum BillingPeriod {
    DAILY = "daily",
    WEEKLY = "weekly",
    MONTHLY = "monthly",
    QUARTERLY = "quarterly",
    SEMI_ANNUALLY = "semi-annually",
    ANNUALLY = "annually"
}
