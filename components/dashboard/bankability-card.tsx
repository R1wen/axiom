"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getBankabilityMetrics } from "@/actions/finance";
import { Loader2, TrendingUp, AlertTriangle, CheckCircle, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { generateBankabilityPDF } from "@/lib/pdf-generator";

type BankabilityData = {
    score: number;
    grade: string;
    feedback: string[];
    metrics: {
        averageRevenue: number;
        netMargin: number;
        marginPercent: number;
        growthRate: number;
        digitalRatio: number;
    };
};

export function BankabilityCard() {
    const [data, setData] = useState<BankabilityData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const res = await getBankabilityMetrics();
                if (res.success && res.score !== undefined) {
                    // @ts-ignore
                    setData(res as BankabilityData);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const handleDownload = () => {
        if (data) {
            generateBankabilityPDF(data, "Coopérative Espoir Agricole");
        }
    };

    if (loading) {
        return (
            <Card className="h-full border-zinc-800 bg-zinc-950/50 backdrop-blur-xl">
                <CardContent className="flex items-center justify-center h-full min-h-[300px]">
                    <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                </CardContent>
            </Card>
        );
    }

    if (!data) return null;

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-emerald-500";
        if (score >= 60) return "text-yellow-500";
        return "text-red-500";
    };

    const getScoreGradient = (score: number) => {
        if (score >= 80) return "from-emerald-500 to-emerald-700";
        if (score >= 60) return "from-yellow-500 to-yellow-700";
        return "from-red-500 to-red-700";
    };

    return (
        <Card className="h-full border bg-card shadow-sm hover:shadow-md transition-all duration-500 group relative overflow-hidden">
            {/* Background Glow - Subtle Gold/Emerald */}
            <div className={cn(
                "absolute -top-20 -right-20 w-40 h-40 rounded-full blur-[100px] opacity-10",
                data.score >= 70 ? "bg-emerald-500" : "bg-yellow-500"
            )} />

            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                            <span className="text-2xl">🏦</span>
                            Dossier Bancaire
                        </CardTitle>
                        <CardDescription className="text-zinc-500">
                            Éligibilité au financement
                        </CardDescription>
                    </div>
                    <Badge variant="outline" className={cn(
                        "text-lg font-bold px-3 py-1 border-2",
                        data.score >= 80 ? "border-emerald-500 text-emerald-600 bg-emerald-50" :
                            data.score >= 60 ? "border-yellow-500 text-yellow-600 bg-yellow-50" : "border-red-500 text-red-600 bg-red-50"
                    )}>
                        Grade {data.grade}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Score Gauge */}
                <div className="flex flex-col items-center justify-center py-4">
                    <div className="relative w-40 h-40 flex items-center justify-center">
                        {/* Circular Progress (CSS Hack for MVP) */}
                        <svg className="w-full h-full transform -rotate-90">
                            <circle
                                cx="80"
                                cy="80"
                                r="70"
                                stroke="currentColor"
                                strokeWidth="10"
                                fill="transparent"
                                className="text-zinc-100"
                            />
                            <circle
                                cx="80"
                                cy="80"
                                r="70"
                                stroke="currentColor"
                                strokeWidth="10"
                                fill="transparent"
                                strokeDasharray={440}
                                strokeDashoffset={440 - (440 * data.score) / 100}
                                className={cn(getScoreColor(data.score))}
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute flex flex-col items-center">
                            <span className={cn("text-4xl font-black", getScoreColor(data.score))}>
                                {data.score}
                            </span>
                            <span className="text-xs text-zinc-400 font-medium">/ 100</span>
                        </div>
                    </div>
                    <p className="mt-2 text-sm font-medium text-zinc-500 uppercase tracking-wider">
                        Score de Crédibilité
                    </p>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-100">
                        <div className="flex items-center gap-2 text-zinc-500 text-xs mb-1">
                            <TrendingUp className="w-3 h-3" /> Marge Nette
                        </div>
                        <div className={cn("text-lg font-bold", data.metrics.netMargin > 0 ? "text-emerald-600" : "text-red-600")}>
                            {data.metrics.marginPercent.toFixed(1)}%
                        </div>
                    </div>
                    <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-100">
                        <div className="flex items-center gap-2 text-zinc-500 text-xs mb-1">
                            <Smartphone className="w-3 h-3" /> Digitalisation
                        </div>
                        <div className="text-lg font-bold text-blue-600">
                            {(data.metrics.digitalRatio * 100).toFixed(0)}%
                        </div>
                    </div>
                </div>

                {/* Feedback Section */}
                <div className="space-y-2">
                    {data.feedback.map((msg, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm text-zinc-600 bg-zinc-50 p-2 rounded border border-zinc-100">
                            {msg.includes("Attention") || msg.includes("Améliorez") ? (
                                <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                            ) : (
                                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            )}
                            {msg}
                        </div>
                    ))}
                </div>

                <Button
                    className={cn(
                        "w-full text-white font-bold hover:opacity-90 transition-all shadow-sm",
                        data.score >= 0 ? "bg-emerald-600 hover:bg-emerald-700" : "bg-zinc-200 cursor-not-allowed text-zinc-400"
                    )}
                    disabled={data.score < 0}
                    onClick={handleDownload}
                >
                    {data.score >= 0 ? "📄 Télécharger Dossier Banque" : "🔒 Améliorez votre score"}
                </Button>
            </CardContent>
        </Card>
    );
}
