"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getInactivityMetrics } from "@/actions/finance";
import { AlertTriangle, Clock, MoveRight, Loader2 } from "lucide-react";
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

    if (loading) return (
        <Card className="h-full border-zinc-800 bg-zinc-950/50 backdrop-blur-xl flex items-center justify-center min-h-[300px]">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
        </Card>
    );

    if (alerts.length === 0) return (
        <Card className="h-full border bg-card shadow-sm flex flex-col justify-center">
            <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                    <Clock className="w-5 h-5 text-emerald-600" />
                    Rotation des Stocks
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center h-40 text-zinc-500">
                <p>Aucun stock dormant détecté.</p>
                <p className="text-sm">Tout circule bien ! 🚀</p>
            </CardContent>
        </Card>
    );

    return (
        <Card className="border-red-200 bg-red-50/50 shadow-sm relative overflow-hidden">
            {/* Pulse Animation for Critical Alert */}
            <div className="absolute top-0 right-0 p-3">
                <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
            </div>

            <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold text-red-900 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    Alerte Stock Dormant
                </CardTitle>
                <CardDescription className="text-red-700">
                    Ces produits ne se vendent pas assez vite.
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
                {alerts.slice(0, 3).map((item) => (
                    <div key={item.product} className="flex items-center justify-between bg-white p-3 rounded-lg border border-red-100 shadow-sm">
                        <div>
                            <p className="font-bold text-zinc-900">{item.product}</p>
                            <p className="text-xs text-zinc-500">
                                Dernier vente : il y a <span className="text-red-600 font-bold">{item.daysSinceLastSale} jours</span>
                            </p>
                        </div>
                        <Badge variant="outline" className={cn(
                            "border-red-200 text-red-600 bg-red-50"
                        )}>
                            Critique
                        </Badge>
                    </div>
                ))}

                {alerts.length > 3 && (
                    <div className="text-center text-xs text-zinc-500 mt-2">
                        + {alerts.length - 3} autres produits lents
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
