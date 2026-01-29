-- CreateTable
CREATE TABLE IF NOT EXISTS "BusinessUnit" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BusinessUnit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Metric" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "isPercentage" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Metric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "FinancialData" (
    "id" TEXT NOT NULL,
    "businessUnitId" TEXT NOT NULL,
    "metricId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinancialData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Budget" (
    "id" TEXT NOT NULL,
    "businessUnitId" TEXT NOT NULL,
    "metricId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Budget_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "BusinessUnit_name_key" ON "BusinessUnit"("name");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "BusinessUnit_slug_key" ON "BusinessUnit"("slug");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Metric_name_key" ON "Metric"("name");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Metric_slug_key" ON "Metric"("slug");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "FinancialData_businessUnitId_idx" ON "FinancialData"("businessUnitId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "FinancialData_year_month_idx" ON "FinancialData"("year", "month");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "FinancialData_businessUnitId_metricId_year_month_key" ON "FinancialData"("businessUnitId", "metricId", "year", "month");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Budget_businessUnitId_idx" ON "Budget"("businessUnitId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Budget_year_idx" ON "Budget"("year");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Budget_businessUnitId_metricId_year_month_key" ON "Budget"("businessUnitId", "metricId", "year", "month");

-- AddForeignKey
ALTER TABLE "FinancialData" ADD CONSTRAINT "FinancialData_businessUnitId_fkey" FOREIGN KEY ("businessUnitId") REFERENCES "BusinessUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialData" ADD CONSTRAINT "FinancialData_metricId_fkey" FOREIGN KEY ("metricId") REFERENCES "Metric"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_businessUnitId_fkey" FOREIGN KEY ("businessUnitId") REFERENCES "BusinessUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_metricId_fkey" FOREIGN KEY ("metricId") REFERENCES "Metric"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
