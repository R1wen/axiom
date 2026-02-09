import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface KPICardProps {
    label: string;
    value: string;
    icon: LucideIcon;
    trend?: {
        value: number;
        isPositive: boolean;
    };
}

export function KPICard({ label, value, icon: Icon, trend }: KPICardProps) {
    return (
        <Card className="relative overflow-hidden border-white/[0.08] bg-white/[0.02] backdrop-blur-md p-6 hover:bg-white/[0.04] transition-colors">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-zinc-500 mb-2">{label}</p>
                    <h3 className="text-3xl font-mono font-bold text-zinc-200 tabular-nums tracking-tight">
                        {value}
                    </h3>

                    {trend && (
                        <div className="mt-3 flex items-center gap-1">
                            <span
                                className={`text-sm font-medium ${trend.isPositive ? "text-emerald-500" : "text-red-500"
                                    }`}
                            >
                                {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
                            </span>
                            <span className="text-xs text-zinc-500">vs last period</span>
                        </div>
                    )}
                </div>

                <div className="rounded-xl bg-white/[0.05] p-3">
                    <Icon className="h-6 w-6 text-indigo-500" />
                </div>
            </div>
        </Card>
    );
}
