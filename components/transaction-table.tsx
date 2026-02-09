"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ProductType, Region, Status } from "@prisma/client";
import { ClientDossierDialog } from "@/components/crm/client-dossier-dialog";

interface Transaction {
    id: string;
    date: Date;
    clientName: string;
    product: ProductType;
    region: Region;
    totalAmount: number;
    status: Status;
}

interface TransactionTableProps {
    transactions: Transaction[];
}

export function TransactionTable({ transactions }: TransactionTableProps) {
    const [selectedClient, setSelectedClient] = useState<string | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    const handleRowClick = (clientName: string) => {
        setSelectedClient(clientName);
        setDialogOpen(true);
    };

    const getStatusColor = (status: Status) => {
        switch (status) {
            case Status.COMPLETED:
                return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
            case Status.PENDING:
                return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
            case Status.CANCELLED:
                return "bg-red-500/10 text-red-500 border-red-500/20";
        }
    };

    return (
        <div className="rounded-xl border border-white/[0.08] bg-zinc-900/40 backdrop-blur-md overflow-hidden">
            <Table>
                <TableHeader className="bg-zinc-950/50">
                    <TableRow className="border-white/[0.08] hover:bg-transparent">
                        <TableHead className="text-zinc-500 font-bold uppercase text-xs tracking-wider">Date</TableHead>
                        <TableHead className="text-zinc-500 font-bold uppercase text-xs tracking-wider">Client</TableHead>
                        <TableHead className="text-zinc-500 font-bold uppercase text-xs tracking-wider">Product</TableHead>
                        <TableHead className="text-zinc-500 font-bold uppercase text-xs tracking-wider">Region</TableHead>
                        <TableHead className="text-right text-zinc-500 font-bold uppercase text-xs tracking-wider">Amount</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {transactions.map((transaction) => (
                        <TableRow
                            key={transaction.id}
                            className="border-white/[0.08] hover:bg-white/[0.04] transition-colors cursor-pointer group"
                            onClick={() => handleRowClick(transaction.clientName)}
                        >
                            <TableCell className="text-zinc-400 text-sm font-medium">
                                {new Date(transaction.date).toLocaleDateString("fr-TG", {
                                    day: "numeric",
                                    month: "short",
                                })}
                            </TableCell>
                            <TableCell className="text-zinc-200 font-bold group-hover:text-emerald-400 transition-colors">
                                {transaction.clientName}
                            </TableCell>
                            <TableCell className="text-zinc-400 text-sm">
                                {transaction.product}
                            </TableCell>
                            <TableCell className="text-zinc-500 text-xs uppercase tracking-wide">
                                {transaction.region}
                            </TableCell>
                            <TableCell className="text-right">
                                <span className="font-bold text-zinc-200 tabular-nums">
                                    {(transaction.totalAmount).toLocaleString("fr-TG")}
                                </span>
                                <span className="ml-1 text-xs text-zinc-600">FCFA</span>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <ClientDossierDialog
                clientName={selectedClient}
                open={dialogOpen}
                onOpenChange={setDialogOpen}
            />
        </div>
    );
}
