"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ProductType, Region, Status } from "@/app/generated/prisma/enums";
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
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <Table>
                <TableHeader className="bg-muted/50">
                    <TableRow className="hover:bg-transparent">
                        <TableHead className="text-muted-foreground font-bold uppercase text-xs tracking-wider">Date</TableHead>
                        <TableHead className="text-muted-foreground font-bold uppercase text-xs tracking-wider">Client</TableHead>
                        <TableHead className="text-muted-foreground font-bold uppercase text-xs tracking-wider">Product</TableHead>
                        <TableHead className="text-muted-foreground font-bold uppercase text-xs tracking-wider">Region</TableHead>
                        <TableHead className="text-right text-muted-foreground font-bold uppercase text-xs tracking-wider">Amount</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {transactions.map((transaction) => (
                        <TableRow
                            key={transaction.id}
                            className="hover:bg-muted/50 transition-colors cursor-pointer group"
                            onClick={() => handleRowClick(transaction.clientName)}
                        >
                            <TableCell className="text-muted-foreground text-sm font-medium">
                                {new Date(transaction.date).toLocaleDateString("en-US", {
                                    day: "numeric",
                                    month: "short",
                                })}
                            </TableCell>
                            <TableCell className="text-foreground font-bold group-hover:text-primary transition-colors">
                                {transaction.clientName}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                                {transaction.product}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-xs uppercase tracking-wide">
                                {transaction.region}
                            </TableCell>
                            <TableCell className="text-right">
                                <span className="font-bold text-foreground tabular-nums">
                                    {(transaction.totalAmount).toLocaleString("fr-TG")}
                                </span>
                                <span className="ml-1 text-xs text-muted-foreground">FCFA</span>
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
