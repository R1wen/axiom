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
    <div className="min-h-screen bg-background p-6 font-sans text-foreground">
      <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-primary flex items-center gap-2">
            AXIOM <span className="text-foreground text-2xl font-light opacity-60">| Financial Intelligence</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, Administrator. Here is your financial overview.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 text-sm text-muted-foreground bg-card px-3 py-1 rounded-full border shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            System Online
          </span>
          <span className="text-sm font-mono text-muted-foreground opacity-60">
            Updated: {new Date().toLocaleTimeString()}
          </span>
        </div>
      </header>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* KPIs Row */}
        <div className="lg:col-span-3">
          <KPICard
            label="Total Revenue"
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
            label="Total Expenses"
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
            label="Net Margin"
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
            label="Total Volume"
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
          <div className="h-[400px] rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Financial Trends
            </h3>
            <p className="text-muted-foreground mb-4">Revenue evolution over the last 30 days</p>
            <div className="h-[320px]">
              <FinancialTrendChart data={metrics.trendData} />
            </div>
          </div>

          {/* Secondary Charts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-[350px] rounded-xl border bg-card p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-bold text-foreground">
                Revenue by Product
              </h3>
              <div className="h-[270px]">
                <ProductSplitChart data={metrics.productDistribution} />
              </div>
            </div>
            <div className="h-[350px] rounded-xl border bg-card p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-bold text-foreground">
                Expense Distribution
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
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-bold text-foreground">
                Recent Transactions
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-50 bg-zinc-100 px-2 py-1 rounded-full">
                  Real-time
                </span>
                <Link href="/transactions" className="text-xs text-primary hover:text-amber-600 font-medium">
                  View All →
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
