"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateTransaction } from "@/actions/transactions";
import { Status, ProductType } from "@prisma/client";
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
            <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100">
                <DialogHeader>
                    <DialogTitle>Modifier Transaction</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-2">
                        <Label>Client</Label>
                        <Input value={transaction.clientName} disabled className="bg-zinc-900 border-zinc-800" />
                    </div>

                    <div className="grid gap-2">
                        <Label>Produit</Label>
                        <Input value={transaction.product} disabled className="bg-zinc-900 border-zinc-800" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Quantité (kg)</Label>
                            <Input
                                type="number"
                                value={formData.quantity}
                                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                                className="bg-zinc-900 border-zinc-800"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Prix Unitaire</Label>
                            <Input
                                type="number"
                                value={formData.unitPrice}
                                onChange={(e) => setFormData({ ...formData, unitPrice: Number(e.target.value) })}
                                className="bg-zinc-900 border-zinc-800"
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label>Statut</Label>
                        <Select
                            value={formData.status}
                            onValueChange={(val) => setFormData({ ...formData, status: val as Status })}
                        >
                            <SelectTrigger className="bg-zinc-900 border-zinc-800">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-zinc-800">
                                <SelectItem value={Status.PENDING}>En Attente</SelectItem>
                                <SelectItem value={Status.COMPLETED}>Complété</SelectItem>
                                <SelectItem value={Status.CANCELLED}>Annulé</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                            Annuler
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-emerald-500 hover:bg-emerald-600 text-black">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Enregistrer
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
