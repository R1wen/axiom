"use server";

import { PrismaClient, ProductType, Region, PaymentMethod, Status, ExpenseCategory } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const prisma = new PrismaClient();

// Types for dashboard metrics
export type DashboardMetrics = {
    totalRevenue: number;
    totalVolume: number;
    transactionCount: number;
    avgBasketSize: number;
    productDistribution: Array<{
        product: ProductType;
        revenue: number;
        volume: number;
    }>;
    regionDistribution: Array<{
        region: Region;
        revenue: number;
        count: number;
    }>;
    recentTransactions: Array<{
        id: string;
        date: Date;
        clientName: string;
        product: ProductType;
        region: Region;
        totalAmount: number;
        status: Status;
    }>;
    trendData: Array<{
        date: string;
        revenue: number;
    }>;
    // P&L Metrics
    totalExpenses: number;
    netMargin: number;
    marginPercentage: number;
    expenseDistribution: Array<{
        category: ExpenseCategory;
        amount: number;
    }>;
    // Growth metrics vs last 30 days
    revenueGrowth: number;
    volumeGrowth: number;
    expenseGrowth: number;
    marginGrowth: number;
};

/**
 * Get comprehensive dashboard metrics
 * Uses parallel queries with Promise.all for optimal performance
 */
export async function getDashboardMetrics(): Promise<DashboardMetrics> {
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(now.getDate() - 60);

    // Parallel execution for performance 
    const [
        transactions,
        productAggregates,
        regionAggregates,
        recentTransactions,
        expenseAggregates,
        totalExpensesAgg,
        currentPeriodMetrics,
        previousPeriodMetrics,
        currentPeriodExpenses,
        previousPeriodExpenses
    ] = await Promise.all([
        // Get all completed transactions
        prisma.transaction.findMany({
            where: { status: Status.COMPLETED },
        }),

        // Group by product
        prisma.transaction.groupBy({
            by: ["product"],
            where: { status: Status.COMPLETED },
            _sum: {
                totalAmount: true,
                quantity: true,
            },
        }),

        // Group by region
        prisma.transaction.groupBy({
            by: ["region"],
            where: { status: Status.COMPLETED },
            _sum: {
                totalAmount: true,
            },
            _count: true,
        }),

        // Get latest 5 transactions
        prisma.transaction.findMany({
            orderBy: { date: "desc" },
            take: 5,
            select: {
                id: true,
                date: true,
                clientName: true,
                product: true,
                region: true,
                totalAmount: true,
                status: true,
            },
        }),

        // Group expenses by category
        prisma.expense.groupBy({
            by: ["category"],
            _sum: { amount: true },
        }),

        // Get total expenses
        prisma.expense.aggregate({
            _sum: { amount: true }
        }),

        // Current Period Revenue/Volume (Last 30 days)
        prisma.transaction.aggregate({
            where: { status: Status.COMPLETED, date: { gte: thirtyDaysAgo } },
            _sum: { totalAmount: true, quantity: true }
        }),

        // Previous Period Revenue/Volume (60-30 days ago)
        prisma.transaction.aggregate({
            where: { status: Status.COMPLETED, date: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
            _sum: { totalAmount: true, quantity: true }
        }),

        // Current Period Expenses
        prisma.expense.aggregate({
            where: { date: { gte: thirtyDaysAgo } },
            _sum: { amount: true }
        }),

        // Previous Period Expenses
        prisma.expense.aggregate({
            where: { date: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
            _sum: { amount: true }
        })
    ]);

    // Calculate totals
    const totalRevenue = transactions.reduce((sum, t) => sum + t.totalAmount, 0);
    const totalVolume = transactions.reduce((sum, t) => sum + t.quantity, 0);
    const transactionCount = transactions.length;
    const avgBasketSize = transactionCount > 0 ? totalRevenue / transactionCount : 0;

    // Expense metrics
    const totalExpenses = totalExpensesAgg._sum.amount || 0;
    const netMargin = totalRevenue - totalExpenses;
    const marginPercentage = totalRevenue > 0 ? (netMargin / totalRevenue) * 100 : 0;

    // Growth Calculations
    const calculateGrowth = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
    };

    const curRev = currentPeriodMetrics._sum.totalAmount || 0;
    const prevRev = previousPeriodMetrics._sum.totalAmount || 0;
    const revenueGrowth = calculateGrowth(curRev, prevRev);

    const curVol = currentPeriodMetrics._sum.quantity || 0;
    const prevVol = previousPeriodMetrics._sum.quantity || 0;
    const volumeGrowth = calculateGrowth(curVol, prevVol);

    const curExp = currentPeriodExpenses._sum.amount || 0;
    const prevExp = previousPeriodExpenses._sum.amount || 0;
    const expenseGrowth = calculateGrowth(curExp, prevExp);

    const curMargin = curRev - curExp;
    const prevMargin = prevRev - prevExp;
    // For margin growth, if previous is negative, the standard formula is tricky.
    // Simple approach: (Curr - Prev) / abs(Prev)
    const marginGrowth = prevMargin !== 0
        ? ((curMargin - prevMargin) / Math.abs(prevMargin)) * 100
        : (curMargin > 0 ? 100 : 0);

    // Map product distribution
    const productDistribution = productAggregates.map((agg) => ({
        product: agg.product,
        revenue: agg._sum.totalAmount || 0,
        volume: agg._sum.quantity || 0,
    }));

    // Map region distribution
    const regionDistribution = regionAggregates.map((agg) => ({
        region: agg.region,
        revenue: agg._sum.totalAmount || 0,
        count: agg._count,
    }));

    // Map expense distribution
    const expenseDistribution = expenseAggregates.map(agg => ({
        category: agg.category,
        amount: agg._sum.amount || 0
    })).sort((a, b) => b.amount - a.amount);

    // Calculate trend data (group by day for the last 30 days)
    // const thirtyDaysAgo = new Date(); // Already defined
    // thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30); // Already defined

    const recentTrans = transactions.filter((t) => t.date >= thirtyDaysAgo);
    const trendMap = new Map<string, number>();

    recentTrans.forEach((t) => {
        const dateKey = t.date.toISOString().split("T")[0];
        trendMap.set(dateKey, (trendMap.get(dateKey) || 0) + t.totalAmount);
    });

    const trendData = Array.from(trendMap.entries())
        .map(([date, revenue]) => ({ date, revenue }))
        .sort((a, b) => a.date.localeCompare(b.date));

    return {
        totalRevenue,
        totalVolume,
        transactionCount,
        avgBasketSize,
        productDistribution,
        regionDistribution,
        recentTransactions,
        trendData,
        totalExpenses,
        netMargin,
        marginPercentage,
        expenseDistribution,
        revenueGrowth,
        volumeGrowth,
        expenseGrowth,
        marginGrowth
    };
}

// Validation schema for transaction creation
const transactionSchema = z.object({
    clientName: z.string().min(2, "Client name must be at least 2 characters"),
    product: z.nativeEnum(ProductType),
    quantity: z.number().positive("Quantity must be positive"),
    unitPrice: z.number().positive("Unit price must be positive"),
    region: z.nativeEnum(Region),
    paymentMethod: z.nativeEnum(PaymentMethod),
    date: z.date(),
});

export type TransactionFormData = z.infer<typeof transactionSchema>;

/**
 * Create a new transaction
 * Server-side validation and totalAmount calculation
 */
export async function createTransaction(data: TransactionFormData) {
    try {
        // Validate input
        const validated = transactionSchema.parse(data);

        // Server-side calculation of totalAmount (security: never trust client)
        const totalAmount = Math.round(validated.quantity * validated.unitPrice * 100) / 100;

        // Create transaction
        const transaction = await prisma.transaction.create({
            data: {
                ...validated,
                totalAmount,
                status: Status.COMPLETED,
            },
        });

        // Revalidate the homepage to show updated data
        revalidatePath("/");

        return {
            success: true,
            transaction,
        };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return {
                success: false,
                errors: error.issues,
            };
        }

        console.error("Failed to create transaction:", error);
        return {
            success: false,
            error: "Failed to create transaction",
        };
    }
}

export async function getBankabilityMetrics() {
    try {
        const now = new Date();
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(now.getMonth() - 6);

        // 1. Get Monthly Revenue for the last 6 months
        const transactions = await prisma.transaction.findMany({
            where: {
                date: { gte: sixMonthsAgo },
                status: 'COMPLETED'
            }
        });

        // Group by month
        const monthlyRevenue: Record<string, number> = {};
        transactions.forEach(t => {
            const month = t.date.toISOString().slice(0, 7); // YYYY-MM
            monthlyRevenue[month] = (monthlyRevenue[month] || 0) + t.totalAmount;
        });

        const revenues = Object.values(monthlyRevenue);
        const averageRevenue = revenues.length > 0 ? revenues.reduce((a, b) => a + b, 0) / revenues.length : 0;

        // Calculate Revenue Consistency (Variance)
        // Lower variance = better consistency = higher score
        let variance = 0;
        if (revenues.length > 0) {
            variance = revenues.reduce((sum, rev) => sum + Math.pow(rev - averageRevenue, 2), 0) / revenues.length;
        }
        // Normalize variance score (0-40 points)
        // Heuristic: intense variance penalizes score.
        // If CV (Coefficient of Variation) < 0.2, score is max.
        const stdDev = Math.sqrt(variance);
        const cv = averageRevenue > 0 ? stdDev / averageRevenue : 1;
        let consistencyScore = 40;
        if (cv > 0.2) consistencyScore = Math.max(0, 40 - (cv - 0.2) * 100);

        // 2. Get Net Margin
        const expenses = await prisma.expense.findMany({
            where: { date: { gte: sixMonthsAgo } }
        });
        const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
        const totalRevenue = transactions.reduce((sum, t) => sum + t.totalAmount, 0);
        const netMargin = totalRevenue - totalExpenses;
        const marginPercent = totalRevenue > 0 ? (netMargin / totalRevenue) * 100 : 0;

        // Margin Score (0-40 points)
        // > 20% margin = 40 points
        // < 0% margin = 0 points
        let marginScore = 0;
        if (marginPercent >= 20) marginScore = 40;
        else if (marginPercent > 0) marginScore = (marginPercent / 20) * 40;

        // 3. Digital Footprint (Mobile Money usage) (0-20 points)
        const mobileMoneyTransactions = transactions.filter(t => t.paymentMethod === 'MOBILE_MONEY').length;
        const digitalRatio = transactions.length > 0 ? mobileMoneyTransactions / transactions.length : 0;
        const digitalScore = digitalRatio * 20;

        // Total Score
        const totalScore = Math.round(consistencyScore + marginScore + digitalScore);

        return {
            success: true,
            score: totalScore,
            metrics: {
                averageRevenue,
                netMargin,
                marginPercent,
                growthRate: 0, // Todo: calculate month-over-month growth
                digitalRatio
            },
            grade: totalScore >= 80 ? 'A' : totalScore >= 60 ? 'B' : totalScore >= 40 ? 'C' : 'D',
            feedback: getFeedback(totalScore, marginPercent, cv)
        };

    } catch (error) {
        console.error('Failed to calculate bankability:', error);
        return { success: false, error: 'Failed to calculate bankability' };
    }
}

function getFeedback(score: number, margin: number, cv: number): string[] {
    const feedback = [];
    if (score >= 70) feedback.push("Excellent profil pour un crédit bancaire.");
    if (margin < 10) feedback.push("Attention : Vos marges sont faibles. Réduisez les coûts.");
    if (cv > 0.3) feedback.push("Revenus trop irréguliers. Sécurisez des contrats fixes.");
    if (score < 50) feedback.push("Améliorez votre traçabilité numérique (Mobile Money).");
    return feedback;
}

export async function getInactivityMetrics() {
    try {
        const now = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);

        // 1. Get all products and their last transaction date
        const products = Object.values(ProductType);
        const inactivityData = [];

        for (const product of products) {
            // Find last sale date
            const lastSale = await prisma.transaction.findFirst({
                where: {
                    product,
                    status: 'COMPLETED'
                },
                orderBy: {
                    date: 'desc'
                }
            });

            // Calculate velocity (volume sold in last 30 days)
            const recentSales = await prisma.transaction.aggregate({
                where: {
                    product,
                    status: 'COMPLETED',
                    date: { gte: thirtyDaysAgo }
                },
                _sum: {
                    quantity: true,
                    totalAmount: true
                }
            });

            const daysSinceLastSale = lastSale
                ? Math.floor((now.getTime() - lastSale.date.getTime()) / (1000 * 60 * 60 * 24))
                : 999; // Never sold

            // Determine status
            let status: 'CRITICAL' | 'SLOW' | 'ACTIVE' = 'ACTIVE';
            if (daysSinceLastSale > 14) status = 'CRITICAL';
            else if (daysSinceLastSale > 7) status = 'SLOW';

            inactivityData.push({
                product,
                daysSinceLastSale,
                monthlyVolume: recentSales._sum.quantity || 0,
                monthlyRevenue: recentSales._sum.totalAmount || 0,
                status
            });
        }

        // Sort by urgency (Critical first)
        inactivityData.sort((a, b) => b.daysSinceLastSale - a.daysSinceLastSale);

        return {
            success: true,
            data: inactivityData
        };

    } catch (error) {
        console.error('Failed to calculate inactivity metrics:', error);
        return { success: false, error: 'Failed to calculate metrics' };
    }
}

export async function getClientProfile(clientName: string) {
    try {
        const transactions = await prisma.transaction.findMany({
            where: { clientName, status: 'COMPLETED' },
            orderBy: { date: 'desc' }
        });

        if (transactions.length === 0) return { success: false, error: 'Client not found' };

        // Metrics
        const totalSpent = transactions.reduce((sum, t) => sum + t.totalAmount, 0);
        const lastPurchase = transactions[0].date;
        const firstPurchase = transactions[transactions.length - 1].date;

        // Calculate frequency
        const daysActive = (lastPurchase.getTime() - firstPurchase.getTime()) / (1000 * 60 * 60 * 24);
        const frequency = transactions.length > 1 ? Math.round(daysActive / (transactions.length - 1)) : 0; // Avg days between visits

        // Determine VIP Status
        let vipStatus: 'GOLD' | 'SILVER' | 'BRONZE' = 'BRONZE';
        if (totalSpent > 1000000) vipStatus = 'GOLD';
        else if (totalSpent > 500000) vipStatus = 'SILVER';

        // Churn Risk
        const daysSinceLast = Math.floor((new Date().getTime() - lastPurchase.getTime()) / (1000 * 60 * 60 * 24));
        let churnRisk: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
        if (frequency > 0 && daysSinceLast > frequency * 2) churnRisk = 'HIGH';
        else if (frequency > 0 && daysSinceLast > frequency * 1.5) churnRisk = 'MEDIUM';

        // Preferred Product & Payment
        const products: Record<string, number> = {};
        const payments: Record<string, number> = {};
        transactions.forEach(t => {
            products[t.product] = (products[t.product] || 0) + 1;
            payments[t.paymentMethod] = (payments[t.paymentMethod] || 0) + 1;
        });
        const preferredProduct = Object.keys(products).reduce((a, b) => products[a] > products[b] ? a : b);
        const preferredPayment = Object.keys(payments).reduce((a, b) => payments[a] > payments[b] ? a : b);

        return {
            success: true,
            data: {
                clientName,
                totalSpent,
                transactionCount: transactions.length,
                vipStatus,
                churnRisk,
                lastPurchase,
                frequency,
                daysSinceLast,
                preferredProduct,
                preferredPayment,
                history: transactions.slice(0, 5) // Last 5 transactions
            }
        };

    } catch (error) {
        console.error('Failed to get client profile:', error);
        return { success: false, error: 'Failed' };
    }
}
