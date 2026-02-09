import { getTransactions } from "@/actions/transactions";
import { TransactionDatatable } from "@/components/transactions/transaction-datatable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

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
        <div className="min-h-screen bg-[#09090b] p-6 font-sans text-zinc-100">
            <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Historique des Transactions</h1>
                    <p className="text-zinc-500">Gérez, modifiez et analysez vos flux financiers.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Link href="/">
                        <Button variant="outline" className="border-zinc-800 text-zinc-300 hover:bg-zinc-800">
                            ← Retour Tableau de Bord
                        </Button>
                    </Link>
                </div>
            </header>

            <div className="mb-6 flex gap-4">
                <form action={searchAction} className="flex gap-2 w-full max-w-md">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
                        <Input
                            name="query"
                            placeholder="Rechercher un client..."
                            defaultValue={query}
                            className="pl-9 bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-600"
                        />
                    </div>
                    <Button type="submit" className="bg-zinc-800 hover:bg-zinc-700 text-white">
                        Rechercher
                    </Button>
                </form>
            </div>

            {transactions && <TransactionDatatable data={transactions as any} />}

            {/* Pagination */}
            {metadata && (
                <div className="mt-6 flex justify-between items-center">
                    <p className="text-sm text-zinc-500">
                        Page {metadata.page} sur {metadata.totalPages} ({metadata.total} résultats)
                    </p>
                    <div className="flex gap-2">
                        <Link href={`/transactions?query=${query}&page=${Math.max(1, page - 1)}`}>
                            <Button
                                variant="outline"
                                disabled={page <= 1}
                                className="border-zinc-800 text-zinc-300 hover:bg-zinc-800 disabled:opacity-50"
                            >
                                Précédent
                            </Button>
                        </Link>
                        <Link href={`/transactions?query=${query}&page=${Math.min(metadata.totalPages, page + 1)}`}>
                            <Button
                                variant="outline"
                                disabled={page >= metadata.totalPages}
                                className="border-zinc-800 text-zinc-300 hover:bg-zinc-800 disabled:opacity-50"
                            >
                                Suivant
                            </Button>
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
