import { getDashboardMetrics } from "@/actions/finance";
import { KPICard } from "@/components/ui/kpi-card";
import { FinancialTrendChart } from "@/components/charts/financial-trend-chart";
import { ProductSplitChart } from "@/components/charts/product-split-chart";
import { ExpenseDistributionChart } from "@/components/charts/expense-distribution-chart";
import { TransactionTable } from "@/components/transaction-table";
import { TransactionForm } from "@/components/transaction-form";
import { DollarSign, Package, TrendingUp, Wallet } from "lucide-react";

export default async function Home() {
  const metrics = await getDashboardMetrics();

  // Format numbers for display
  const formattedRevenue = metrics.totalRevenue.toLocaleString("fr-TG");
  const formattedExpenses = metrics.totalExpenses.toLocaleString("fr-TG");
  const formattedMargin = metrics.netMargin.toLocaleString("fr-TG");
  const formattedVolume = `${(metrics.totalVolume / 1000).toFixed(1)}`;

  return (
    <div className="min-h-screen bg-[#09090b] p-6">
      {/* Header */}
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-zinc-100 tracking-tight">
            AXIOM
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Financial Intelligence Platform
          </p>
        </div>

        <TransactionForm />
      </header>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* KPIs Row */}
        <div className="lg:col-span-3">
          <KPICard
            label="Total Revenue"
            value={`${formattedRevenue} FCFA`}
            icon={DollarSign}
          />
        </div>

        <div className="lg:col-span-3">
          <KPICard
            label="Total Expenses"
            value={`${formattedExpenses} FCFA`}
            icon={Wallet}
          />
        </div>

        <div className="lg:col-span-3">
          <KPICard
            label="Net Profit"
            value={`${formattedMargin} FCFA`}
            icon={TrendingUp}
          />
        </div>

        <div className="lg:col-span-3">
          <KPICard
            label="Total Volume"
            value={`${formattedVolume} Tons`}
            icon={Package}
          />
        </div>

        {/* Charts Row */}
        <div className="lg:col-span-8">
          <div className="h-[400px] rounded-lg border border-white/[0.08] bg-white/[0.02] backdrop-blur-md p-6">
            <h3 className="mb-4 text-lg font-semibold text-zinc-200">
              Revenue Trend
            </h3>
            <div className="h-[320px]">
              <FinancialTrendChart data={metrics.trendData} />
            </div>
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="h-[400px] rounded-lg border border-white/[0.08] bg-white/[0.02] backdrop-blur-md p-6">
            <h3 className="mb-4 text-lg font-semibold text-zinc-200">
              Product Split
            </h3>
            <div className="h-[320px]">
              <ProductSplitChart data={metrics.productDistribution} />
            </div>
          </div>
        </div>

        {/* Cost Structure & Transactions */}
        <div className="lg:col-span-4">
          <div className="h-[400px] rounded-lg border border-white/[0.08] bg-white/[0.02] backdrop-blur-md p-6">
            <h3 className="mb-4 text-lg font-semibold text-zinc-200">
              Cost Structure
            </h3>
            <div className="h-[320px]">
              <ExpenseDistributionChart data={metrics.expenseDistribution} />
            </div>
          </div>
        </div>

        <div className="lg:col-span-8">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-zinc-200">
              Recent Transactions
            </h3>
            <span className="text-sm text-zinc-500">
              Last {metrics.recentTransactions.length} entries
            </span>
          </div>
          <TransactionTable transactions={metrics.recentTransactions} />
        </div>
      </div>
    </div>
  );
}
