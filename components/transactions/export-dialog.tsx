"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Loader2, FileSpreadsheet } from "lucide-react";
import { getTransactionsForExport } from "@/actions/transactions";

export function ExportDialog() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Default to current month
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const today = now.toISOString().split('T')[0];

    const [startDate, setStartDate] = useState(firstDay);
    const [endDate, setEndDate] = useState(today);

    const handleExport = async () => {
        setLoading(true);
        try {
            const result = await getTransactionsForExport(new Date(startDate), new Date(endDate));

            if (result.success && result.data && result.data.length > 0) {
                // Generate CSV
                const headers = Object.keys(result.data[0]);
                const csvContent = [
                    headers.join(","), // Header row
                    ...result.data.map(row =>
                        headers.map(header => {
                            const val = (row as any)[header];
                            // Escape quotes and wrap in quotes to handle commas
                            return `"${String(val).replace(/"/g, '""')}"`;
                        }).join(",")
                    )
                ].join("\n");

                // Download
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.setAttribute("href", url);
                link.setAttribute("download", `transactions_${startDate}_to_${endDate}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                setOpen(false);
            } else {
                alert("Aucune donnée trouvée pour cette période.");
            }
        } catch (error) {
            console.error("Export failed", error);
            alert("Erreur lors de l'export.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="border-zinc-800 text-zinc-300 hover:bg-zinc-800 gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    Exporter CSV
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100 sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Exporter les Transactions</DialogTitle>
                    <DialogDescription className="text-zinc-500">
                        Sélectionnez une période pour exporter vos données en format CSV (Excel).
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="start" className="text-right text-zinc-400">
                            Début
                        </Label>
                        <Input
                            id="start"
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="col-span-3 bg-zinc-900 border-zinc-800 text-zinc-100"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="end" className="text-right text-zinc-400">
                            Fin
                        </Label>
                        <Input
                            id="end"
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="col-span-3 bg-zinc-900 border-zinc-800 text-zinc-100"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setOpen(false)} className="text-zinc-400 hover:text-white">
                        Annuler
                    </Button>
                    <Button onClick={handleExport} disabled={loading} className="bg-emerald-500 hover:bg-emerald-600 text-black gap-2">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                        Télécharger
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
