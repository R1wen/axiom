"use server";

import { PrismaClient, Status, ProductType, Region, PaymentMethod } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const prisma = new PrismaClient();

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
