import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(join(__dirname, '../client')));
}

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get dashboard summary (KPI cards)
app.get('/api/dashboard', async (_req, res) => {
  try {
    // Get Group metrics for 2025 and 2024 for comparison
    const businessUnits = await prisma.businessUnit.findMany({
      orderBy: { displayOrder: 'asc' },
    });

    const metrics = await prisma.metric.findMany({
      orderBy: { displayOrder: 'asc' },
    });

    // Get 2025 data for Group
    const groupUnit = businessUnits.find((u) => u.slug === 'group');
    if (!groupUnit) {
      return res.status(404).json({ error: 'Group unit not found' });
    }

    const currentYearData = await prisma.financialData.findMany({
      where: {
        businessUnitId: groupUnit.id,
        year: 2025,
        month: 0, // FY
      },
      include: { metric: true },
    });

    const priorYearData = await prisma.financialData.findMany({
      where: {
        businessUnitId: groupUnit.id,
        year: 2024,
        month: 0,
      },
      include: { metric: true },
    });

    const budgetData = await prisma.budget.findMany({
      where: {
        businessUnitId: groupUnit.id,
        year: 2025,
      },
      include: { metric: true },
    });

    // Build KPI summary
    const kpis = metrics.map((metric) => {
      const current = currentYearData.find((d) => d.metricId === metric.id);
      const prior = priorYearData.find((d) => d.metricId === metric.id);
      const budget = budgetData.find((d) => d.metricId === metric.id);

      const currentValue = current?.value ?? 0;
      const priorValue = prior?.value ?? 0;
      const budgetValue = budget?.value ?? 0;

      const yoyChange = priorValue !== 0 ? (currentValue - priorValue) / Math.abs(priorValue) : 0;
      const vsBudget = budgetValue !== 0 ? (currentValue - budgetValue) / Math.abs(budgetValue) : 0;

      return {
        metric: metric.name,
        slug: metric.slug,
        category: metric.category,
        isPercentage: metric.isPercentage,
        current: currentValue,
        prior: priorValue,
        budget: budgetValue,
        yoyChange,
        vsBudget,
      };
    });

    res.json({
      year: 2025,
      businessUnit: 'Group',
      kpis,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get comparison table data (matches Excel layout)
app.get('/api/comparison', async (_req, res) => {
  try {
    const businessUnits = await prisma.businessUnit.findMany({
      orderBy: { displayOrder: 'asc' },
    });

    const metrics = await prisma.metric.findMany({
      orderBy: { displayOrder: 'asc' },
    });

    const allData = await prisma.financialData.findMany({
      where: { month: 0 },
      include: { businessUnit: true, metric: true },
    });

    const budgets = await prisma.budget.findMany({
      where: { year: 2025 },
      include: { businessUnit: true, metric: true },
    });

    // Structure data by unit
    const comparison = businessUnits.map((unit) => {
      const unitData = allData.filter((d) => d.businessUnitId === unit.id);
      const unitBudget = budgets.filter((b) => b.businessUnitId === unit.id);

      const rows = metrics.map((metric) => {
        const y2023 = unitData.find((d) => d.metricId === metric.id && d.year === 2023)?.value ?? null;
        const y2024 = unitData.find((d) => d.metricId === metric.id && d.year === 2024)?.value ?? null;
        const y2025 = unitData.find((d) => d.metricId === metric.id && d.year === 2025)?.value ?? null;
        const budget = unitBudget.find((b) => b.metricId === metric.id)?.value ?? null;

        const yoy = y2024 && y2025 && y2024 !== 0 ? (y2025 - y2024) / Math.abs(y2024) : null;
        const vsBudget = budget && y2025 && budget !== 0 ? (y2025 - budget) / Math.abs(budget) : null;

        return {
          metric: metric.name,
          slug: metric.slug,
          isPercentage: metric.isPercentage,
          y2023,
          y2024,
          y2025,
          yoy,
          budget,
          vsBudget,
        };
      });

      return {
        unit: unit.name,
        slug: unit.slug,
        rows,
      };
    });

    res.json({ comparison });
  } catch (error) {
    console.error('Comparison error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all business units
app.get('/api/units', async (_req, res) => {
  try {
    const units = await prisma.businessUnit.findMany({
      orderBy: { displayOrder: 'asc' },
    });
    res.json({ units });
  } catch (error) {
    console.error('Units error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get metrics list
app.get('/api/metrics', async (_req, res) => {
  try {
    const metrics = await prisma.metric.findMany({
      orderBy: { displayOrder: 'asc' },
    });
    res.json({ metrics });
  } catch (error) {
    console.error('Metrics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Catch-all for SPA in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (_req, res) => {
    res.sendFile(join(__dirname, '../client/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
