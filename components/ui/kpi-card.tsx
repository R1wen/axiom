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
        <Card className="relative overflow-hidden border bg-card p-6 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-zinc-500 mb-2">{label}</p>
                    <h3 className="text-3xl font-mono font-bold text-foreground tabular-nums tracking-tight">
                        {value}
                    </h3>

                    {trend && (
                        <div className="mt-3 flex items-center gap-1">
                            <span
                                className={`text-sm font-medium ${trend.isPositive ? "text-emerald-600" : "text-red-600"
                                    }`}
                            >
                                {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
                            </span>
                            <span className="text-xs text-zinc-400">vs last period</span>
                        </div>
                    )}
                </div>

                <div className="rounded-xl bg-primary/10 p-3">
                    <Icon className="h-6 w-6 text-primary" />
                </div>
            </div>
        </Card>
    );
}
