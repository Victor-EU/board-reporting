import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const prisma = new PrismaClient();

interface SeedData {
  businessUnits: Array<{
    name: string;
    slug: string;
    displayOrder: number;
  }>;
  metrics: Array<{
    name: string;
    slug: string;
    category: string;
    isPercentage: boolean;
    displayOrder: number;
  }>;
  financialData: Array<{
    businessUnit: string;
    metric: string;
    year: number;
    month: number;
    value: number;
  }>;
}

async function main() {
  console.log('Starting database seed...');

  // Read seed data
  const seedDataPath = join(__dirname, '../../prisma/seed-data.json');
  const seedData: SeedData = JSON.parse(readFileSync(seedDataPath, 'utf-8'));

  // Clear existing data
  console.log('Clearing existing data...');
  await prisma.financialData.deleteMany();
  await prisma.budget.deleteMany();
  await prisma.businessUnit.deleteMany();
  await prisma.metric.deleteMany();

  // Create business units
  console.log('Creating business units...');
  const unitMap = new Map<string, string>();
  for (const unit of seedData.businessUnits) {
    const created = await prisma.businessUnit.create({
      data: unit,
    });
    unitMap.set(unit.slug, created.id);
  }

  // Create metrics
  console.log('Creating metrics...');
  const metricMap = new Map<string, string>();
  for (const metric of seedData.metrics) {
    const created = await prisma.metric.create({
      data: metric,
    });
    metricMap.set(metric.slug, created.id);
  }

  // Create financial data
  console.log('Creating financial data...');
  let actualCount = 0;
  let budgetCount = 0;

  for (const item of seedData.financialData) {
    const businessUnitId = unitMap.get(item.businessUnit);
    const metricId = metricMap.get(item.metric);

    if (!businessUnitId || !metricId) {
      console.warn(`Skipping: unit=${item.businessUnit}, metric=${item.metric}`);
      continue;
    }

    if (item.month === -1) {
      // Budget data
      await prisma.budget.create({
        data: {
          businessUnitId,
          metricId,
          year: item.year,
          month: 0, // FY budget
          value: item.value,
        },
      });
      budgetCount++;
    } else {
      // Actual data
      await prisma.financialData.create({
        data: {
          businessUnitId,
          metricId,
          year: item.year,
          month: item.month,
          value: item.value,
        },
      });
      actualCount++;
    }
  }

  console.log(`Seed complete!`);
  console.log(`  - Business Units: ${seedData.businessUnits.length}`);
  console.log(`  - Metrics: ${seedData.metrics.length}`);
  console.log(`  - Financial Data: ${actualCount}`);
  console.log(`  - Budget Data: ${budgetCount}`);
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
