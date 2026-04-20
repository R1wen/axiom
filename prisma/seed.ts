import { ProductType, Region, PaymentMethod, Status, ExpenseCategory } from '../app/generated/prisma/enums';
import prisma from '../lib/prisma';

// Realistic Togolese client names
const TOGO_NAMES = [
    'Kokou Mensah', 'Afi Dzigbodi', 'Edem Agbomadji', 'Akossiwa Koffi',
    'Yao Attiogbe', 'Ama Adotevi', 'Koffi Agbokou', 'Abla Ahossi',
    'Kossi Ablavi', 'Sena Dossou', 'Ayele Akakpo', 'Mawuli Tossou',
    'Dzifa Amegah', 'Selom Akoumey', 'Amavi Adjovi', 'Koku Amedome'
];

// Product pricing in FCFA (representative of Togo market)
const PRODUCT_PRICES = {
    [ProductType.SOYBEAN]: { min: 300, max: 400 },    // High value
    [ProductType.MAIZE]: { min: 150, max: 200 },      // High volume, lower price
    [ProductType.RICE]: { min: 250, max: 350 },
    [ProductType.SORGHUM]: { min: 140, max: 190 },
    [ProductType.YAM]: { min: 200, max: 280 },
    [ProductType.CASSAVA]: { min: 100, max: 150 },
    [ProductType.BEANS]: { min: 280, max: 380 },
    [ProductType.GROUNDNUT]: { min: 320, max: 420 }
};

// Realistic quantity ranges in kg
const QUANTITY_RANGES = {
    small: { min: 50, max: 200 },
    medium: { min: 200, max: 500 },
    large: { min: 500, max: 1500 }
};

function randomElement<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number, decimals: number = 2): number {
    const value = Math.random() * (max - min) + min;
    return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

// Generate a date within the last 6 months, weighted toward recent dates
// Generate a date within the last 90 days (3 months)
// Generate a date within the last 90 days (3 months)
function generateRecentDate(): Date {
    const now = new Date();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setDate(now.getDate() - 90);
    const timeRange = now.getTime() - threeMonthsAgo.getTime();
    const randomTime = Math.random() * timeRange;
    return new Date(threeMonthsAgo.getTime() + randomTime);
}

async function seed() {
    console.log('🌱 Starting seed...');

    // Clear existing data
    await prisma.transaction.deleteMany({});
    await prisma.expense.deleteMany({});
    console.log('🗑️  Cleared existing transactions and expenses');

    const transactions = [];
    const products = Object.values(ProductType);
    const regions = Object.values(Region);
    const paymentMethods = Object.values(PaymentMethod);

    // Generate 200 realistic transactions
    for (let i = 0; i < 200; i++) {
        const product = randomElement(products);
        const region = randomElement([Region.SAVANES, Region.MARITIME, Region.PLATEAUX]); // Focus on main agricultural regions

        // Determine quantity size (bias toward medium)
        const sizeRoll = Math.random();
        let quantityRange;
        if (sizeRoll < 0.2) {
            quantityRange = QUANTITY_RANGES.small;
        } else if (sizeRoll < 0.8) {
            quantityRange = QUANTITY_RANGES.medium;
        } else {
            quantityRange = QUANTITY_RANGES.large;
        }

        const quantity = randomFloat(quantityRange.min, quantityRange.max, 2);
        const priceRange = PRODUCT_PRICES[product];
        const unitPrice = randomFloat(priceRange.min, priceRange.max, 2);
        const totalAmount = Math.round(quantity * unitPrice * 100) / 100;

        // Payment method distribution: 40% MOBILE_MONEY, 40% CASH, 20% others
        let paymentMethod;
        const paymentRoll = Math.random();
        if (paymentRoll < 0.4) {
            paymentMethod = PaymentMethod.MOBILE_MONEY;
        } else if (paymentRoll < 0.8) {
            paymentMethod = PaymentMethod.CASH;
        } else {
            paymentMethod = randomElement([PaymentMethod.BANK_TRANSFER, PaymentMethod.CHECK]);
        }

        // Most transactions are completed, few pending
        const status = Math.random() < 0.95 ? Status.COMPLETED : Status.PENDING;

        transactions.push({
            clientName: randomElement(TOGO_NAMES),
            product,
            quantity,
            unitPrice,
            totalAmount,
            region,
            paymentMethod,
            status,
            date: generateRecentDate(),
        });
    }

    // Sort by date (oldest first) for realistic chronological order
    transactions.sort((a, b) => a.date.getTime() - b.date.getTime());

    // Insert all transactions
    for (const transaction of transactions) {
        await prisma.transaction.create({
            data: transaction,
        });
    }

    console.log(`✅ Created ${transactions.length} transactions`);

    // Create Expenses
    const expenses = [];
    const expenseCategories = Object.values(ExpenseCategory);

    // Generate 30 realistic expenses
    for (let i = 0; i < 30; i++) {
        const category = randomElement(expenseCategories);
        const date = generateRecentDate();

        let amount = 0;
        let description = "";

        // Tailor amount and description based on category
        switch (category) {
            case ExpenseCategory.INPUTS:
                amount = randomFloat(50000, 500000, 0);
                description = randomElement(["Achat Semences Maïs", "Engrais NPK", "Pesticides Bio", "Semences Soja"]);
                break;
            case ExpenseCategory.LABOR:
                amount = randomFloat(20000, 150000, 0);
                description = randomElement(["Paiement récolteurs", "Sarclage", "Main d'oeuvre semis", "Journaliers chargement"]);
                break;
            case ExpenseCategory.LOGISTICS:
                amount = randomFloat(40000, 300000, 0);
                description = randomElement(["Transport vers Lomé", "Location camion", "Frais stockage magasin", "Carburant logistique"]);
                break;
            case ExpenseCategory.EQUIPMENT:
                amount = randomFloat(100000, 1000000, 0);
                description = randomElement(["Maintenance Tracteur", "Achat nouveaux sacs", "Réparation balance", "Location moissonneuse"]);
                break;
            case ExpenseCategory.ADMIN:
                amount = randomFloat(10000, 100000, 0);
                description = randomElement(["Frais bureau", "Communication/Internet", "Fournitures diverses", "Electricité entrepôt"]);
                break;
            case ExpenseCategory.TAXES:
                amount = randomFloat(5000, 50000, 0);
                description = randomElement(["Taxe communale", "Taxe de marché", "Patente"]);
                break;
        }

        expenses.push({
            category,
            amount,
            description,
            date,
            region: Math.random() > 0.3 ? randomElement(Object.values(Region)) : null, // 70% have region
            product: (category === ExpenseCategory.INPUTS || category === ExpenseCategory.LABOR) && Math.random() > 0.3 ? randomElement(Object.values(ProductType)) : null // Inputs/Labor often linked to product
        });
    }

    // Insert Expenses
    for (const expense of expenses) {
        await prisma.expense.create({
            data: expense,
        });
    }

    console.log(`✅ Created ${expenses.length} expenses`);

    const totalRevenue = transactions.reduce((sum, t) => sum + t.totalAmount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const netMargin = totalRevenue - totalExpenses;

    console.log('\n📊 Financial Summary:');
    console.log(`   Total Revenue:  ${totalRevenue.toLocaleString('fr-TG')} FCFA`);
    console.log(`   Total Expenses: ${totalExpenses.toLocaleString('fr-TG')} FCFA`);
    console.log(`   Net Profit:     ${netMargin.toLocaleString('fr-TG')} FCFA`);
    console.log(`   Margin %:       ${((netMargin / totalRevenue) * 100).toFixed(1)}%`);
    console.log('\n✨ Seed completed successfully!');
}

seed()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    });
