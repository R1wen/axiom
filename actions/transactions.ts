"use server";

import { Status, ProductType, Region, PaymentMethod } from "../app/generated/prisma/client";
import prisma from "../lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Schema for updating transaction
const updateTransactionSchema = z.object({
    status: z.nativeEnum(Status).optional(),
    product: z.nativeEnum(ProductType).optional(),
    quantity: z.number().positive().optional(),
    unitPrice: z.number().positive().optional(),
    clientName: z.string().min(2).optional(),
});

export type UpdateTransactionData = z.infer<typeof updateTransactionSchema>;

export async function getTransactions({
    page = 1,
    limit = 20,
    search = "",
    status,
}: {
    page?: number;
    limit?: number;
    search?: string;
    status?: Status;
}) {
    try {
        const skip = (page - 1) * limit;

        const where: any = {};

        if (search) {
            where.OR = [
                { clientName: { contains: search } }, // MySQL is case-insensitive by default roughly, but for SQLite case matters. Prisma 'contains' usually maps to LIKE.
                // For better search, we might enabling Preview features, but 'contains' is safe for MVP.
            ];
        }

        if (status) {
            where.status = status;
        }

        const [transactions, total] = await Promise.all([
            prisma.transaction.findMany({
                where,
                skip,
                take: limit,
                orderBy: { date: "desc" },
            }),
            prisma.transaction.count({ where }),
        ]);

        return {
            success: true,
            data: transactions,
            metadata: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    } catch (error) {
        console.error("Failed to fetch transactions:", error);
        return { success: false, error: "Failed to fetch transactions" };
    }
}

export async function updateTransaction(id: string, data: UpdateTransactionData) {
    try {
        const validated = updateTransactionSchema.parse(data);

        // Calculate new total if quantity or price changes
        let updateData: any = { ...validated };

        // If updating qty/price, we need to recalculate totalAmount. 
        // Ideally we should fetch the existing transaction to get the other value if only one is updated.
        if (validated.quantity || validated.unitPrice) {
            const existing = await prisma.transaction.findUnique({ where: { id } });
            if (!existing) return { success: false, error: "Transaction not found" };

            const qty = validated.quantity || existing.quantity;
            const price = validated.unitPrice || existing.unitPrice;
            updateData.totalAmount = Math.round(qty * price * 100) / 100;
        }

        const transaction = await prisma.transaction.update({
            where: { id },
            data: updateData,
        });

        revalidatePath("/transactions");
        revalidatePath("/"); // Update dashboard too

        return { success: true, data: transaction };
    } catch (error) {
        console.error("Failed to update transaction:", error);
        return { success: false, error: "Failed to update transaction" };
    }
}

export async function deleteTransaction(id: string) {
    try {
        await prisma.transaction.delete({
            where: { id },
        });

        revalidatePath("/transactions");
        revalidatePath("/");

        return { success: true };
    } catch (error) {
        console.error("Failed to delete transaction:", error);
        return { success: false, error: "Failed to delete transaction" };
    }
}

export async function getTransactionsForExport(startDate: Date, endDate: Date) {
    try {
        const transactions = await prisma.transaction.findMany({
            where: {
                date: {
                    gte: startDate,
                    lte: endDate,
                },
                status: Status.COMPLETED, // Only export completed transactions? Or all? Usually accounting wants all or completed. Let's do all for history.
            },
            orderBy: { date: "desc" },
        });

        // Transform for CSV friendly format
        const data = transactions.map((t: { date: Date; clientName: string; product: ProductType; quantity: number; unitPrice: number; totalAmount: number; status: Status; paymentMethod: PaymentMethod; region: Region }) => ({
            Date: t.date.toISOString().split('T')[0],
            Client: t.clientName,
            Produit: t.product,
            "Quantité (kg)": t.quantity,
            "Prix Unitaire": t.unitPrice,
            "Total (FCFA)": t.totalAmount,
            Statut: t.status,
            "Méthode Paiement": t.paymentMethod,
            Région: t.region
        }));

        return { success: true, data };
    } catch (error) {
        console.error("Failed to fetch export data:", error);
        return { success: false, error: "Failed to fetch data" };
    }
}
