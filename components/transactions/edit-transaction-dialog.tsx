"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateTransaction } from "@/actions/transactions";
import { Status, ProductType } from "@/app/generated/prisma/enums";
import { Loader2 } from "lucide-react";

interface EditTransactionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    transaction: {
        id: string;
        clientName: string;
        product: ProductType;
        quantity: number;
        unitPrice: number;
        status: Status;
    } | null;
    onSuccess?: () => void;
}

export function EditTransactionDialog({ open, onOpenChange, transaction, onSuccess }: EditTransactionDialogProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        status: transaction?.status || Status.PENDING,
        quantity: transaction?.quantity || 0,
        unitPrice: transaction?.unitPrice || 0,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!transaction) return;

        setLoading(true);
        try {
            const res = await updateTransaction(transaction.id, {
                status: formData.status,
                quantity: Number(formData.quantity),
                unitPrice: Number(formData.unitPrice),
            });

            if (res.success) {
                onOpenChange(false);
                if (onSuccess) onSuccess();
            } else {
                alert("Failed to update transaction");
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    if (!transaction) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-card border text-foreground">
                <DialogHeader>
                    <DialogTitle>Edit Transaction</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-2">
                        <Label>Client</Label>
                        <Input value={transaction.clientName} disabled className="bg-muted border-input" />
                    </div>

                    <div className="grid gap-2">
                        <Label>Product</Label>
                        <Input value={transaction.product} disabled className="bg-muted border-input" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Quantity (kg)</Label>
                            <Input
                                type="number"
                                value={formData.quantity}
                                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                                className="bg-card border-input"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Unit Price</Label>
                            <Input
                                type="number"
                                value={formData.unitPrice}
                                onChange={(e) => setFormData({ ...formData, unitPrice: Number(e.target.value) })}
                                className="bg-card border-input"
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label>Status</Label>
                        <Select
                            value={formData.status}
                            onValueChange={(val) => setFormData({ ...formData, status: val as Status })}
                        >
                            <SelectTrigger className="bg-card border-input">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-card border-input">
                                <SelectItem value={Status.PENDING}>Pending</SelectItem>
                                <SelectItem value={Status.COMPLETED}>Completed</SelectItem>
                                <SelectItem value={Status.CANCELLED}>Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
