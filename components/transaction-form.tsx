"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProductType, Region, PaymentMethod } from "@prisma/client";
import { createTransaction } from "@/actions/finance";
import { Plus } from "lucide-react";

export function TransactionForm() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        clientName: "",
        product: "" as ProductType | "",
        quantity: "",
        unitPrice: "",
        region: "" as Region | "",
        paymentMethod: "" as PaymentMethod | "",
        date: new Date().toISOString().split("T")[0],
    });

    const totalEstimate =
        formData.quantity && formData.unitPrice
            ? (parseFloat(formData.quantity) * parseFloat(formData.unitPrice)).toLocaleString("fr-TG")
            : "0";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await createTransaction({
                clientName: formData.clientName,
                product: formData.product as ProductType,
                quantity: parseFloat(formData.quantity),
                unitPrice: parseFloat(formData.unitPrice),
                region: formData.region as Region,
                paymentMethod: formData.paymentMethod as PaymentMethod,
                date: new Date(formData.date),
            });

            if (result.success) {
                setOpen(false);
                // Reset form
                setFormData({
                    clientName: "",
                    product: "",
                    quantity: "",
                    unitPrice: "",
                    region: "",
                    paymentMethod: "",
                    date: new Date().toISOString().split("T")[0],
                });
            }
        } catch (error) {
            console.error("Form submission error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    New Entry
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border text-foreground max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-foreground">New Transaction</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                        {/* Date */}
                        <div>
                            <Label htmlFor="date" className="text-muted-foreground">Date</Label>
                            <Input
                                id="date"
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="mt-2 bg-background border-input text-foreground"
                                required
                            />
                        </div>

                        {/* Client Name */}
                        <div>
                            <Label htmlFor="clientName" className="text-muted-foreground">Client Name</Label>
                            <Input
                                id="clientName"
                                value={formData.clientName}
                                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                                placeholder="e.g., Kokou Mensah"
                                className="mt-2 bg-background border-input text-foreground placeholder:text-muted-foreground"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Product */}
                        <div>
                            <Label htmlFor="product" className="text-muted-foreground">Product</Label>
                            <Select
                                value={formData.product}
                                onValueChange={(value) => setFormData({ ...formData, product: value as ProductType })}
                                required
                            >
                                <SelectTrigger className="mt-2 bg-background border-input text-foreground">
                                    <SelectValue placeholder="Select product" />
                                </SelectTrigger>
                                <SelectContent className="bg-popover border-border text-popover-foreground">
                                    {Object.values(ProductType).map((type) => (
                                        <SelectItem key={type} value={type}>
                                            {type.charAt(0) + type.slice(1).toLowerCase()}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Region */}
                        <div>
                            <Label htmlFor="region" className="text-muted-foreground">Region</Label>
                            <Select
                                value={formData.region}
                                onValueChange={(value) => setFormData({ ...formData, region: value as Region })}
                                required
                            >
                                <SelectTrigger className="mt-2 bg-background border-input text-foreground">
                                    <SelectValue placeholder="Select region" />
                                </SelectTrigger>
                                <SelectContent className="bg-popover border-border text-popover-foreground">
                                    {Object.values(Region).map((region) => (
                                        <SelectItem key={region} value={region}>
                                            {region}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Quantity */}
                        <div>
                            <Label htmlFor="quantity" className="text-muted-foreground">Quantity (kg)</Label>
                            <Input
                                id="quantity"
                                type="number"
                                step="0.01"
                                value={formData.quantity}
                                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                placeholder="0.00"
                                className="mt-2 bg-background border-input text-foreground font-mono placeholder:text-muted-foreground"
                                required
                            />
                        </div>

                        {/* Unit Price */}
                        <div>
                            <Label htmlFor="unitPrice" className="text-muted-foreground">Unit Price (FCFA)</Label>
                            <Input
                                id="unitPrice"
                                type="number"
                                step="0.01"
                                value={formData.unitPrice}
                                onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                                placeholder="0.00"
                                className="mt-2 bg-background border-input text-foreground font-mono placeholder:text-muted-foreground"
                                required
                            />
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div>
                        <Label htmlFor="paymentMethod" className="text-muted-foreground">Payment Method</Label>
                        <Select
                            value={formData.paymentMethod}
                            onValueChange={(value) => setFormData({ ...formData, paymentMethod: value as PaymentMethod })}
                            required
                        >
                            <SelectTrigger className="mt-2 bg-background border-input text-foreground">
                                <SelectValue placeholder="Select payment method" />
                            </SelectTrigger>
                            <SelectContent className="bg-popover border-border text-popover-foreground">
                                <SelectItem value={PaymentMethod.CASH}>Cash</SelectItem>
                                <SelectItem value={PaymentMethod.MOBILE_MONEY}>Mobile Money (Flooz/T-Money)</SelectItem>
                                <SelectItem value={PaymentMethod.BANK_TRANSFER}>Bank Transfer</SelectItem>
                                <SelectItem value={PaymentMethod.CHECK}>Check</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Total Estimate</span>
                            <span className="text-2xl font-mono font-bold text-primary tabular-nums">
                                {totalEstimate} FCFA
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-3 justify-end pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground"
                        >
                            {loading ? "Creating..." : "Create Transaction"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
