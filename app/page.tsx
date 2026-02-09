import { getDashboardMetrics } from "@/actions/finance";
import { KPICard } from "@/components/ui/kpi-card";
import { FinancialTrendChart } from "@/components/charts/financial-trend-chart";
import { ProductSplitChart } from "@/components/charts/product-split-chart";
import { ExpenseDistributionChart } from "@/components/charts/expense-distribution-chart";
import { TransactionTable } from "@/components/transaction-table";
import { TransactionForm } from "@/components/transaction-form";
import { BankabilityCard } from "@/components/dashboard/bankability-card";
import { StockAlertCard } from "@/components/dashboard/stock-alert-card";
import { DollarSign, Package, TrendingUp, Wallet } from "lucide-react";
import Link from "next/link";

export default async function Home() {
  const metrics = await getDashboardMetrics();

  // Format numbers for display
  const formattedRevenue = metrics.totalRevenue.toLocaleString("fr-TG");
  const formattedExpenses = metrics.totalExpenses.toLocaleString("fr-TG");
  const formattedMargin = metrics.netMargin.toLocaleString("fr-TG");
  const formattedVolume = `${(metrics.totalVolume / 1000).toFixed(1)}`;

  return (
    <div className="min-h-screen bg-[#09090b] p-6 font-sans">
      {/* Header */}
      <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-transparent tracking-tight bg-linear-to-r from-white to-zinc-500 bg-clip-text">
            AXIOM
          </h1>
          <p className="mt-1 text-sm text-zinc-500 font-medium">
            Intelligence Financière pour Coopératives
          </p>
        </div>

        <TransactionForm />
      </header>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* KPIs Row */}
        <div className="lg:col-span-3">
          <KPICard
            label="Chiffre d'Affaires"
            value={`${formattedRevenue} FCFA`}
            icon={DollarSign}
            trend={{
              value: Number(metrics.revenueGrowth.toFixed(1)),
              isPositive: metrics.revenueGrowth >= 0
            }}
          />
        </div>

        <div className="lg:col-span-3">
          <KPICard
            label="Dépenses Totales"
            value={`${formattedExpenses} FCFA`}
            icon={Wallet}
            trend={{
              value: Number(metrics.expenseGrowth.toFixed(1)),
              isPositive: metrics.expenseGrowth >= 0
            }}
          />
        </div>

        <div className="lg:col-span-3">
          <KPICard
            label="Marge Nette"
            value={`${formattedMargin} FCFA`}
            icon={TrendingUp}
            trend={{
              value: Number(metrics.marginGrowth.toFixed(1)),
              isPositive: metrics.marginGrowth >= 0
            }}
          />
        </div>

        <div className="lg:col-span-3">
          <KPICard
            label="Volume Vendu"
            value={`${formattedVolume} Tonnes`}
            icon={Package}
            trend={{
              value: Number(metrics.volumeGrowth.toFixed(1)),
              isPositive: metrics.volumeGrowth >= 0
            }}
          />
        </div>

        {/* Middle Section: Main Charts & Bankability (Visual Focus) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Revenue Trend - Primary Chart */}
          <div className="h-[400px] rounded-xl border border-white/[0.08] bg-zinc-900/40 backdrop-blur-md p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-bold text-zinc-100 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              Tendance des Revenus
            </h3>
            <div className="h-[320px]">
              <FinancialTrendChart data={metrics.trendData} />
            </div>
          </div>

          {/* Secondary Charts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-[350px] rounded-xl border border-white/[0.08] bg-zinc-900/40 backdrop-blur-md p-6">
              <h3 className="mb-4 text-lg font-bold text-zinc-100">
                Répartition Produits
              </h3>
              <div className="h-[270px]">
                <ProductSplitChart data={metrics.productDistribution} />
              </div>
            </div>
            <div className="h-[350px] rounded-xl border border-white/[0.08] bg-zinc-900/40 backdrop-blur-md p-6">
              <h3 className="mb-4 text-lg font-bold text-zinc-100">
                Structure des Coûts
              </h3>
              <div className="h-[270px]">
                <ExpenseDistributionChart data={metrics.expenseDistribution} />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Bankability Strategy & Recent Activity */}
        <div className="lg:col-span-4 space-y-6">
          {/* High Value Feature: Bankability */}
          <div>
            <BankabilityCard />
          </div>

          {/* Dead Stock Alert */}
          <div>
            <StockAlertCard />
          </div>

          {/* Recent Transactions */}
          <div className="rounded-xl border border-white/[0.08] bg-zinc-900/40 backdrop-blur-md overflow-hidden">
            <div className="p-4 border-b border-white/[0.08] flex items-center justify-between">
              <h3 className="font-bold text-zinc-100">
                Dernières Transactions
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-1 rounded-full">
                  Temps réel
                </span>
                <Link href="/transactions" className="text-xs text-emerald-500 hover:text-emerald-400 font-medium">
                  Voir Tout →
                </Link>
              </div>
            </div>
            <div className="p-0">
              <TransactionTable transactions={metrics.recentTransactions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
