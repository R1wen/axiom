import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ProductType, Region, Status } from "@prisma/client";

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
    const getStatusColor = (status: Status) => {
        switch (status) {
            case Status.COMPLETED:
                return "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20";
            case Status.PENDING:
                return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20";
            case Status.CANCELLED:
                return "bg-red-500/10 text-red-500 hover:bg-red-500/20";
        }
    };

    return (
        <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] backdrop-blur-md overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="border-white/[0.08] hover:bg-transparent">
                        <TableHead className="text-zinc-500 font-medium">Date</TableHead>
                        <TableHead className="text-zinc-500 font-medium">Client</TableHead>
                        <TableHead className="text-zinc-500 font-medium">Product</TableHead>
                        <TableHead className="text-zinc-500 font-medium">Region</TableHead>
                        <TableHead className="text-right text-zinc-500 font-medium">Amount</TableHead>
                        <TableHead className="text-center text-zinc-500 font-medium">Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {transactions.map((transaction) => (
                        <TableRow
                            key={transaction.id}
                            className="border-white/[0.08] hover:bg-white/[0.04] transition-colors"
                        >
                            <TableCell className="text-zinc-400 text-sm">
                                {new Date(transaction.date).toLocaleDateString("fr-TG", {
                                    month: "short",
                                    day: "numeric",
                                })}
                            </TableCell>
                            <TableCell className="text-zinc-200 font-medium">
                                {transaction.clientName}
                            </TableCell>
                            <TableCell className="text-zinc-400 text-sm">
                                {transaction.product.charAt(0) + transaction.product.slice(1).toLowerCase()}
                            </TableCell>
                            <TableCell className="text-zinc-400 text-sm">
                                {transaction.region}
                            </TableCell>
                            <TableCell className="text-right">
                                <span className="font-mono font-semibold text-zinc-200 tabular-nums">
                                    {transaction.totalAmount.toLocaleString("fr-TG")}
                                </span>
                                <span className="ml-1 text-xs text-zinc-500">FCFA</span>
                            </TableCell>
                            <TableCell className="text-center">
                                <Badge className={getStatusColor(transaction.status)} variant="outline">
                                    {transaction.status}
                                </Badge>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
