"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getInactivityMetrics } from "@/actions/finance";
import { AlertTriangle, Clock, MoveRight, Loader2, PackageX } from "lucide-react";
import { cn } from "@/lib/utils";

type StockData = {
    product: string;
    daysSinceLastSale: number;
    monthlyVolume: number;
    monthlyRevenue: number;
    status: 'CRITICAL' | 'SLOW' | 'ACTIVE';
};

export function StockAlertCard() {
    const [items, setItems] = useState<StockData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const res = await getInactivityMetrics();
                // @ts-ignore
                if (res.success && res.data) {
                    // @ts-ignore
                    setItems(res.data);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    // Filter only critical/slow items to show
    const alerts = items.filter(i => i.status !== 'ACTIVE');
    const criticalCount = alerts.filter(a => a.status === 'CRITICAL').length;

    if (loading) return (
        <Card className="h-full border-zinc-800 bg-zinc-950/50 backdrop-blur-xl flex items-center justify-center min-h-[300px]">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
        </Card>
    );

    return (
        <Card className="h-full border bg-card shadow-sm flex flex-col">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                            <span className="text-2xl">🚨</span>
                            Dead Stock
                        </CardTitle>
                        <CardDescription className="text-muted-foreground">
                            Cash Flow Alert
                        </CardDescription>
                    </div>
                    {criticalCount > 0 && (
                        <Badge className="bg-red-100 text-red-600 border border-red-200 animate-pulse">
                            {criticalCount} Critical Items
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {alerts.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                        <p>✅ All products are active.</p>
                    </div>
                ) : (
                    alerts.slice(0, 3).map((alert, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-lg border bg-card shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
                                    alert.status === 'CRITICAL' ? "bg-red-100" : "bg-yellow-100"
                                )}>
                                    <PackageX className={cn(
                                        "w-5 h-5",
                                        alert.status === 'CRITICAL' ? "text-red-600" : "text-yellow-600"
                                    )} />
                                </div>
                                <div>
                                    <p className="font-bold text-foreground">{alert.product}</p>
                                    <p className="text-xs text-muted-foreground">
                                        Last sale: <span className="font-mono font-medium text-foreground">{alert.daysSinceLastSale} days ago</span>
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-muted-foreground">Dormant Value</p>
                                <p className="font-bold text-red-600">
                                    {(alert.monthlyRevenue / 1000).toFixed(0)}k
                                </p>
                            </div>
                        </div>
                    ))
                )}
                {alerts.length > 0 && (
                    <div className="bg-red-50 p-3 rounded border border-red-100 text-xs text-red-700 font-medium">
                        💡 Insight: Run a promotion on these items to free up cash.
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
