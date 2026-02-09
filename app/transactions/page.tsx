import { getTransactions } from "@/actions/transactions";
import { TransactionDatatable } from "@/components/transactions/transaction-datatable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ExportDialog } from "@/components/transactions/export-dialog";

export default async function TransactionsPage({
    searchParams,
}: {
    searchParams: { page?: string; query?: string; };
}) {
    const page = Number(searchParams?.page) || 1;
    const query = searchParams?.query || "";

    const { data: transactions, metadata } = await getTransactions({
        page,
        limit: 20,
        search: query,
    });

    async function searchAction(formData: FormData) {
        "use server";
        const q = formData.get("query");
        redirect(`/transactions?query=${q}&page=1`);
    }

    return (
        <div className="min-h-screen bg-background p-6 font-sans text-foreground">
            <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-primary">Transaction History</h1>
                    <p className="text-muted-foreground">Manage, edit, and analyze your financial flows.</p>
                </div>
                <div className="flex items-center gap-2">
                    <ExportDialog />
                    <Link href="/">
                        <Button variant="outline" className="border-border text-foreground hover:bg-muted">
                            ← Back to Dashboard
                        </Button>
                    </Link>
                </div>
            </header>

            <div className="mb-6 flex gap-4">
                <form action={searchAction} className="flex gap-2 w-full max-w-md">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            name="query"
                            placeholder="Search for a client..."
                            defaultValue={query}
                            className="pl-9 bg-card border-input text-foreground placeholder:text-muted-foreground"
                        />
                    </div>
                    <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                        Search
                    </Button>
                </form>
            </div>

            {transactions && <TransactionDatatable data={transactions as any} />}

            {/* Pagination */}
            {metadata && (
                <div className="mt-6 flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">
                        Page {metadata.page} of {metadata.totalPages} ({metadata.total} results)
                    </p>
                    <div className="flex gap-2">
                        <Link href={`/transactions?query=${query}&page=${Math.max(1, page - 1)}`}>
                            <Button
                                variant="outline"
                                disabled={page <= 1}
                                className="border-border text-foreground hover:bg-muted disabled:opacity-50"
                            >
                                Previous
                            </Button>
                        </Link>
                        <Link href={`/transactions?query=${query}&page=${Math.min(metadata.totalPages, page + 1)}`}>
                            <Button
                                variant="outline"
                                disabled={page >= metadata.totalPages}
                                className="border-border text-foreground hover:bg-muted disabled:opacity-50"
                            >
                                Next
                            </Button>
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
