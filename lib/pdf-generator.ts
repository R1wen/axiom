import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface BankabilityData {
    score: number;
    grade: string;
    metrics: {
        averageRevenue: number;
        netMargin: number;
        marginPercent: number;
        growthRate: number;
        digitalRatio: number;
    };
    feedback: string[];
}

export function generateBankabilityPDF(data: BankabilityData, cooperativeName: string = "Ma Coopérative") {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // --- Header ---
    doc.setFillColor(24, 24, 27); // Zinc 900
    doc.rect(0, 0, pageWidth, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("AXIOM", 14, 20);

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Dossier de Solvabilité & Crédit", 14, 30);

    doc.setFontSize(10);
    doc.text(`Généré le: ${new Date().toLocaleDateString("fr-TG")}`, pageWidth - 14, 20, { align: "right" });
    doc.text(`Pour: ${cooperativeName}`, pageWidth - 14, 30, { align: "right" });

    // --- Scorecard Section ---
    let yPos = 55;

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("1. Score de Crédibilité", 14, yPos);

    yPos += 10;

    // Draw Score Box
    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(14, yPos, pageWidth - 28, 40, 3, 3, 'FD');

    doc.setFontSize(30);
    doc.setTextColor(
        data.score >= 80 ? 16 : data.score >= 60 ? 202 : 239, // R
        data.score >= 80 ? 185 : data.score >= 60 ? 138 : 68, // G
        data.score >= 80 ? 129 : data.score >= 60 ? 4 : 68    // B
    ); // Emerald / Yellow / Red
    doc.text(`${data.score}/100`, 25, yPos + 28);

    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text("Indice de Confiance", 25, yPos + 12);

    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text(`Grade: ${data.grade}`, pageWidth - 40, yPos + 25);

    yPos += 50;

    // --- Financial Metrics ---
    doc.setFontSize(14);
    doc.text("2. Indicateurs Financiers Clés", 14, yPos);
    yPos += 10;

    const currencyFormatter = new Intl.NumberFormat('fr-TG', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 });

    autoTable(doc, {
        startY: yPos,
        head: [['Indicateur', 'Valeur', 'Impact Bancaire']],
        body: [
            ['Revenu Mensuel Moyen', currencyFormatter.format(data.metrics.averageRevenue), 'Capacité de remboursement'],
            ['Marge Nette', currencyFormatter.format(data.metrics.netMargin) + ` (${data.metrics.marginPercent.toFixed(1)}%)`, 'Rentabilité réelle'],
            ['Digitalisation (Mobile Money)', `${(data.metrics.digitalRatio * 100).toFixed(0)}% des encaissements`, 'Traçabilité & Transparence'],
        ],
        theme: 'grid',
        headStyles: { fillColor: [24, 24, 27] },
        styles: { fontSize: 10, cellPadding: 5 },
    });

    // @ts-ignore
    yPos = doc.lastAutoTable.finalY + 20;

    // --- Recommendations ---
    doc.setFontSize(14);
    doc.text("3. Recommandations & Risques", 14, yPos);
    yPos += 10;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    data.feedback.forEach((item) => {
        doc.setTextColor(80, 80, 80);
        doc.text(`• ${item}`, 14, yPos);
        yPos += 8;
    });

    if (data.feedback.length === 0) {
        doc.text("• Aucun risque majeur identifié. Profil excellent.", 14, yPos);
    }

    // --- Footer ---
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("Ce document est généré automatiquement par AXIOM SaaS. Il certifie la véracité des données enregistrées.", 14, pageHeight - 10);

    doc.save(`AXIOM_Dossier_Credit_${new Date().toISOString().slice(0, 10)}.pdf`);
}
