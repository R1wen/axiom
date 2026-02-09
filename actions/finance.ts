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
};

/**
 * Get comprehensive dashboard metrics
 * Uses parallel queries with Promise.all for optimal performance
 */
export async function getDashboardMetrics(): Promise<DashboardMetrics> {
    // Parallel execution for performance 
    const [
        transactions,
        productAggregates,
        regionAggregates,
        recentTransactions,
        expenseAggregates,
        totalExpensesAgg
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
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

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
        expenseDistribution
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
