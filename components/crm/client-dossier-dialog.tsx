"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { getClientProfile } from "@/actions/finance";
import { Loader2, User, Trophy, AlertTriangle, CalendarDays, ShoppingBag, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

type ClientProfile = {
    clientName: string;
    totalSpent: number;
    transactionCount: number;
    vipStatus: 'GOLD' | 'SILVER' | 'BRONZE';
    churnRisk: 'HIGH' | 'MEDIUM' | 'LOW';
    lastPurchase: Date;
    frequency: number;
    daysSinceLast: number;
    preferredProduct: string;
    preferredPayment: string;
    history: any[];
};

interface ClientDossierDialogProps {
    clientName: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ClientDossierDialog({ clientName, open, onOpenChange }: ClientDossierDialogProps) {
    const [profile, setProfile] = useState<ClientProfile | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && clientName) {
            setLoading(true);
            getClientProfile(clientName)
                .then(res => {
                    if (res.success && res.data) {
                        // @ts-ignore
                        setProfile(res.data);
                    }
                })
                .finally(() => setLoading(false));
        }
    }, [open, clientName]);

    if (!clientName) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100 max-w-2xl">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800">
                            <User className="w-6 h-6 text-zinc-400" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-bold flex items-center gap-2">
                                {clientName}
                                {profile && (
                                    <Badge variant="outline" className={cn(
                                        "ml-2 border-none",
                                        profile.vipStatus === 'GOLD' ? "bg-amber-500/20 text-amber-500" :
                                            profile.vipStatus === 'SILVER' ? "bg-zinc-400/20 text-zinc-300" :
                                                "bg-orange-700/20 text-orange-700"
                                    )}>
                                        <Trophy className="w-3 h-3 mr-1" />
                                        {profile.vipStatus}
                                    </Badge>
                                )}
                            </DialogTitle>
                            <DialogDescription className="text-zinc-500">
                                Dossier Client & Analyse Comportementale
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {loading ? (
                    <div className="h-40 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                    </div>
                ) : profile ? (
                    <div className="space-y-6 mt-4">
                        {/* Highlights Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-800">
                                <p className="text-xs text-zinc-500 mb-1">Total Dépensé</p>
                                <p className="text-xl font-bold text-emerald-400">
                                    {(profile.totalSpent / 1000).toFixed(0)}k FCFA
                                </p>
                            </div>
                            <div className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-800">
                                <p className="text-xs text-zinc-500 mb-1">Dernier Achat</p>
                                <p className="text-xl font-bold text-zinc-200">
                                    Il y a {profile.daysSinceLast}j
                                </p>
                            </div>
                            <div className={cn(
                                "p-4 rounded-lg border",
                                profile.churnRisk === 'HIGH' ? "bg-red-500/10 border-red-500/30" :
                                    profile.churnRisk === 'MEDIUM' ? "bg-yellow-500/10 border-yellow-500/30" :
                                        "bg-emerald-500/10 border-emerald-500/30"
                            )}>
                                <p className={cn("text-xs mb-1",
                                    profile.churnRisk === 'HIGH' ? "text-red-400" :
                                        profile.churnRisk === 'MEDIUM' ? "text-yellow-400" : "text-emerald-400"
                                )}>Risque de Départ (Churn)</p>
                                <div className="flex items-center gap-2">
                                    {profile.churnRisk === 'HIGH' && <AlertTriangle className="w-5 h-5 text-red-500" />}
                                    <p className={cn("text-xl font-bold",
                                        profile.churnRisk === 'HIGH' ? "text-red-500" :
                                            profile.churnRisk === 'MEDIUM' ? "text-yellow-500" : "text-emerald-500"
                                    )}>
                                        {profile.churnRisk}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Habits Section */}
                        <div className="space-y-3">
                            <h4 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Habitudes</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex items-center gap-3 bg-zinc-900/30 p-3 rounded border border-zinc-800/50">
                                    <ShoppingBag className="w-5 h-5 text-purple-400" />
                                    <div>
                                        <p className="text-xs text-zinc-500">Produit Préféré</p>
                                        <p className="font-medium text-zinc-200">{profile.preferredProduct}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 bg-zinc-900/30 p-3 rounded border border-zinc-800/50">
                                    <CreditCard className="w-5 h-5 text-blue-400" />
                                    <div>
                                        <p className="text-xs text-zinc-500">Paiement Habituel</p>
                                        <p className="font-medium text-zinc-200">{profile.preferredPayment}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 bg-zinc-900/30 p-3 rounded border border-zinc-800/50">
                                    <CalendarDays className="w-5 h-5 text-orange-400" />
                                    <div>
                                        <p className="text-xs text-zinc-500">Fréquence d'achat</p>
                                        <p className="font-medium text-zinc-200">Tous les {profile.frequency} jours</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actionable Advice */}
                        {profile.churnRisk === 'HIGH' && (
                            <div className="bg-red-950/30 border border-red-900/50 p-4 rounded-lg flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                <div>
                                    <h5 className="font-bold text-red-400 text-sm">Action Recommandée</h5>
                                    <p className="text-sm text-red-200/70 mt-1">
                                        Ce client (VIP {profile.vipStatus}) n'est pas venu depuis {profile.daysSinceLast} jours (habituellement {profile.frequency}j).
                                        Appelez-le maintenant pour proposer une promotion sur le {profile.preferredProduct}.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-10 text-zinc-500">
                        Impossible de charger le profil.
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
