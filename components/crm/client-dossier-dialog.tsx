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
            <DialogContent className="bg-card border text-foreground max-w-2xl">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center border border-border">
                            <User className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-bold flex items-center gap-2">
                                {clientName}
                                {profile && (
                                    <Badge variant="outline" className={cn(
                                        "ml-2 border-none",
                                        profile.vipStatus === 'GOLD' ? "bg-amber-100 text-amber-600" :
                                            profile.vipStatus === 'SILVER' ? "bg-zinc-100 text-zinc-600" :
                                                "bg-orange-100 text-orange-700"
                                    )}>
                                        <Trophy className="w-3 h-3 mr-1" />
                                        {profile.vipStatus}
                                    </Badge>
                                )}
                            </DialogTitle>
                            <DialogDescription className="text-muted-foreground">
                                Dossier Client & Analyse Comportementale
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {loading ? (
                    <div className="h-40 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : profile ? (
                    <div className="space-y-6 mt-4">
                        {/* Highlights Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-muted/30 p-4 rounded-lg border border-border">
                                <p className="text-xs text-muted-foreground mb-1">Total Dépensé</p>
                                <p className="text-xl font-bold text-emerald-600">
                                    {(profile.totalSpent / 1000).toFixed(0)}k FCFA
                                </p>
                            </div>
                            <div className="bg-muted/30 p-4 rounded-lg border border-border">
                                <p className="text-xs text-muted-foreground mb-1">Dernier Achat</p>
                                <p className="text-xl font-bold text-foreground">
                                    Il y a {profile.daysSinceLast}j
                                </p>
                            </div>
                            <div className={cn(
                                "p-4 rounded-lg border",
                                profile.churnRisk === 'HIGH' ? "bg-red-50 border-red-200" :
                                    profile.churnRisk === 'MEDIUM' ? "bg-yellow-50 border-yellow-200" :
                                        "bg-emerald-50 border-emerald-200"
                            )}>
                                <p className={cn("text-xs mb-1",
                                    profile.churnRisk === 'HIGH' ? "text-red-600" :
                                        profile.churnRisk === 'MEDIUM' ? "text-yellow-600" : "text-emerald-600"
                                )}>Risque de Départ (Churn)</p>
                                <div className="flex items-center gap-2">
                                    {profile.churnRisk === 'HIGH' && <AlertTriangle className="w-5 h-5 text-red-500" />}
                                    <p className={cn("text-xl font-bold",
                                        profile.churnRisk === 'HIGH' ? "text-red-600" :
                                            profile.churnRisk === 'MEDIUM' ? "text-yellow-600" : "text-emerald-600"
                                    )}>
                                        {profile.churnRisk}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Habits Section */}
                        <div className="space-y-3">
                            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">Habitudes</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex items-center gap-3 bg-muted/30 p-3 rounded border border-border">
                                    <ShoppingBag className="w-5 h-5 text-purple-500" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Produit Préféré</p>
                                        <p className="font-medium text-foreground">{profile.preferredProduct}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 bg-muted/30 p-3 rounded border border-border">
                                    <CreditCard className="w-5 h-5 text-blue-500" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Paiement Habituel</p>
                                        <p className="font-medium text-foreground">{profile.preferredPayment}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 bg-muted/30 p-3 rounded border border-border">
                                    <CalendarDays className="w-5 h-5 text-orange-500" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Fréquence d'achat</p>
                                        <p className="font-medium text-foreground">Tous les {profile.frequency} jours</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actionable Advice */}
                        {profile.churnRisk === 'HIGH' && (
                            <div className="bg-red-50 border border-red-200 p-4 rounded-lg flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                <div>
                                    <h5 className="font-bold text-red-700 text-sm">Action Recommandée</h5>
                                    <p className="text-sm text-red-600 mt-1">
                                        Ce client (VIP {profile.vipStatus}) n'est pas venu depuis {profile.daysSinceLast} jours (habituellement {profile.frequency}j).
                                        Appelez-le maintenant pour proposer une promotion sur le {profile.preferredProduct}.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-10 text-muted-foreground">
                        Impossible de charger le profil.
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
