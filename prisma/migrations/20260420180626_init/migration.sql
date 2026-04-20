-- CreateTable
CREATE TABLE `Transaction` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `date` DATETIME(3) NOT NULL,
    `clientName` VARCHAR(191) NOT NULL,
    `product` ENUM('MAIZE', 'SOYBEAN', 'RICE', 'SORGHUM', 'YAM', 'CASSAVA', 'BEANS', 'GROUNDNUT') NOT NULL,
    `quantity` DOUBLE NOT NULL,
    `unitPrice` DOUBLE NOT NULL,
    `totalAmount` DOUBLE NOT NULL,
    `region` ENUM('MARITIME', 'PLATEAUX', 'CENTRALE', 'KARA', 'SAVANES') NOT NULL,
    `paymentMethod` ENUM('CASH', 'MOBILE_MONEY', 'BANK_TRANSFER', 'CHECK') NOT NULL,
    `status` ENUM('COMPLETED', 'PENDING', 'CANCELLED') NOT NULL DEFAULT 'COMPLETED',

    INDEX `Transaction_date_idx`(`date`),
    INDEX `Transaction_region_idx`(`region`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Expense` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `date` DATETIME(3) NOT NULL,
    `category` ENUM('INPUTS', 'LABOR', 'LOGISTICS', 'EQUIPMENT', 'ADMIN', 'TAXES') NOT NULL,
    `amount` DOUBLE NOT NULL,
    `description` VARCHAR(191) NULL,
    `region` ENUM('MARITIME', 'PLATEAUX', 'CENTRALE', 'KARA', 'SAVANES') NULL,
    `product` ENUM('MAIZE', 'SOYBEAN', 'RICE', 'SORGHUM', 'YAM', 'CASSAVA', 'BEANS', 'GROUNDNUT') NULL,

    INDEX `Expense_date_idx`(`date`),
    INDEX `Expense_category_idx`(`category`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
