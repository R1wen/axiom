"use client";

import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EditTransactionDialog } from "./edit-transaction-dialog";
import { deleteTransaction } from "@/actions/transactions";
import { useRouter } from "next/navigation";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Transaction {
    id: string;
    date: Date;
    clientName: string;
    product: any; // using any to avoid import complexity with enums in client comp if not strict
    quantity: number;
    unitPrice: number;
    totalAmount: number;
    status: any;
    paymentMethod: any;
    region: any;
}

interface TransactionDatatableProps {
    data: Transaction[];
}

export function TransactionDatatable({ data }: TransactionDatatableProps) {
    const router = useRouter();
    const [editingTx, setEditingTx] = useState<Transaction | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleEdit = (tx: Transaction) => {
        setEditingTx(tx);
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this transaction?")) {
            await deleteTransaction(id);
            router.refresh();
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "COMPLETED": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
            case "PENDING": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
            case "CANCELLED": return "bg-red-500/10 text-red-500 border-red-500/20";
            default: return "bg-zinc-500/10 text-zinc-500";
        }
    };

    return (
        <div className="rounded-md border border-zinc-800">
            <Table>
                <TableHeader className="bg-zinc-900/50">
                    <TableRow className="border-zinc-800 hover:bg-zinc-900/50">
                        <TableHead className="text-zinc-400">Date</TableHead>
                        <TableHead className="text-zinc-400">Client</TableHead>
                        <TableHead className="text-zinc-400">Produit</TableHead>
                        <TableHead className="text-right text-zinc-400">Montant</TableHead>
                        <TableHead className="text-center text-zinc-400">Statut</TableHead>
                        <TableHead className="text-right text-zinc-400">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((tx) => (
                        <TableRow key={tx.id} className="border-zinc-800 hover:bg-zinc-900/50">
                            <TableCell className="font-medium text-zinc-300">
                                {new Date(tx.date).toLocaleDateString("fr-TG")}
                            </TableCell>
                            <TableCell className="text-zinc-300">{tx.clientName}</TableCell>
                            <TableCell className="text-zinc-300">
                                <span className="px-2 py-1 rounded bg-zinc-800 text-xs font-mono">
                                    {tx.product}
                                </span>
                            </TableCell>
                            <TableCell className="text-right font-bold text-zinc-100 tabular-nums">
                                {tx.totalAmount.toLocaleString("fr-TG")} FCFA
                            </TableCell>
                            <TableCell className="text-center">
                                <Badge variant="outline" className={getStatusColor(tx.status)}>
                                    {tx.status}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0 text-zinc-400 hover:text-white">
                                            <span className="sr-only">Open menu</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="bg-zinc-950 border-zinc-800 text-zinc-200">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuItem onClick={() => handleEdit(tx)} className="cursor-pointer hover:bg-zinc-900 focus:bg-zinc-900">
                                            <Edit2 className="mr-2 h-4 w-4 text-blue-400" /> Modifier
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleDelete(tx.id)} className="cursor-pointer text-red-400 hover:bg-red-950/30 focus:bg-red-950/30">
                                            <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <EditTransactionDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                transaction={editingTx}
                onSuccess={() => {
                    router.refresh();
                }}
            />
        </div>
    );
}
