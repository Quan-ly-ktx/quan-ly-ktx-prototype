export type MonthlyMovement = { month: number; moveIn: number; moveOut: number };
export type BedDistribution = {
  status: "AVAILABLE" | "OCCUPIED" | "MAINTENANCE";
  label: string;
  count: number;
  percentage: number;
};
export type MonthlyRevenue = { month: number; expected: number; collected: number };
export type MonthlyExpense = { month: number; amount: number };

export type YearDashboardDemoData = {
  movements: MonthlyMovement[];
  revenues: MonthlyRevenue[];
  expenses: MonthlyExpense[];
};

export const DEMO_BED_DISTRIBUTION: BedDistribution[] = [
  { status: "OCCUPIED", label: "Đang ở (OCCUPIED)", count: 42, percentage: 75 },
  { status: "AVAILABLE", label: "Sẵn sàng (AVAILABLE)", count: 10, percentage: 18 },
  { status: "MAINTENANCE", label: "Bảo trì (MAINTENANCE)", count: 4, percentage: 7 },
];

export const DEMO_YEARS = [2026, 2025];

export const DEMO_DASHBOARD_DATA: Record<number, YearDashboardDemoData> = {
  2026: {
    movements: [
      { month: 1, moveIn: 12, moveOut: 2 },
      { month: 2, moveIn: 15, moveOut: 3 },
      { month: 3, moveIn: 8, moveOut: 4 },
      { month: 4, moveIn: 6, moveOut: 5 },
      { month: 5, moveIn: 9, moveOut: 3 },
      { month: 6, moveIn: 18, moveOut: 12 },
      { month: 7, moveIn: 22, moveOut: 14 },
      { month: 8, moveIn: 30, moveOut: 8 },
      { month: 9, moveIn: 35, moveOut: 6 },
      { month: 10, moveIn: 14, moveOut: 4 },
      { month: 11, moveIn: 10, moveOut: 3 },
      { month: 12, moveIn: 7, moveOut: 5 },
    ],
    revenues: [
      { month: 1, expected: 65000000, collected: 62000000 },
      { month: 2, expected: 68000000, collected: 66500000 },
      { month: 3, expected: 70000000, collected: 69000000 },
      { month: 4, expected: 70000000, collected: 68000000 },
      { month: 5, expected: 72000000, collected: 71000000 },
      { month: 6, expected: 75000000, collected: 73500000 },
      { month: 7, expected: 78000000, collected: 76000000 },
      { month: 8, expected: 82000000, collected: 81000000 },
      { month: 9, expected: 85000000, collected: 83500000 },
      { month: 10, expected: 85000000, collected: 84000000 },
      { month: 11, expected: 84000000, collected: 80500000 },
      { month: 12, expected: 84000000, collected: 79000000 },
    ],
    expenses: [
      { month: 1, amount: 24000000 },
      { month: 2, amount: 26500000 },
      { month: 3, amount: 23000000 },
      { month: 4, amount: 22500000 },
      { month: 5, amount: 27000000 },
      { month: 6, amount: 29500000 },
      { month: 7, amount: 31000000 },
      { month: 8, amount: 28000000 },
      { month: 9, amount: 32500000 },
      { month: 10, amount: 29000000 },
      { month: 11, amount: 27500000 },
      { month: 12, amount: 26000000 },
    ],
  },
  2025: {
    movements: [
      { month: 1, moveIn: 10, moveOut: 3 },
      { month: 2, moveIn: 12, moveOut: 2 },
      { month: 3, moveIn: 7, moveOut: 4 },
      { month: 4, moveIn: 5, moveOut: 4 },
      { month: 5, moveIn: 8, moveOut: 3 },
      { month: 6, moveIn: 15, moveOut: 10 },
      { month: 7, moveIn: 18, moveOut: 11 },
      { month: 8, moveIn: 25, moveOut: 7 },
      { month: 9, moveIn: 28, moveOut: 5 },
      { month: 10, moveIn: 12, moveOut: 3 },
      { month: 11, moveIn: 9, moveOut: 3 },
      { month: 12, moveIn: 6, moveOut: 4 },
    ],
    revenues: [
      { month: 1, expected: 52000000, collected: 50000000 },
      { month: 2, expected: 54000000, collected: 53000000 },
      { month: 3, expected: 55000000, collected: 54000000 },
      { month: 4, expected: 55000000, collected: 53500000 },
      { month: 5, expected: 56000000, collected: 55000000 },
      { month: 6, expected: 58000000, collected: 57000000 },
      { month: 7, expected: 60000000, collected: 58500000 },
      { month: 8, expected: 62000000, collected: 61000000 },
      { month: 9, expected: 64000000, collected: 63000000 },
      { month: 10, expected: 64000000, collected: 63200000 },
      { month: 11, expected: 63000000, collected: 61000000 },
      { month: 12, expected: 63000000, collected: 60500000 },
    ],
    expenses: [
      { month: 1, amount: 19000000 },
      { month: 2, amount: 20500000 },
      { month: 3, amount: 18500000 },
      { month: 4, amount: 18000000 },
      { month: 5, amount: 21000000 },
      { month: 6, amount: 22500000 },
      { month: 7, amount: 24000000 },
      { month: 8, amount: 22000000 },
      { month: 9, amount: 25000000 },
      { month: 10, amount: 23000000 },
      { month: 11, amount: 21500000 },
      { month: 12, amount: 20000000 },
    ],
  },
};
