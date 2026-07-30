import type { TransactionService } from "@/services/transaction.service";
import type { ServiceCatalogService } from "@/services/service-catalog.service";
import type { Transaction } from "@/types/database";
import { startOfDay } from "date-fns";

export type DashboardSummary = {
  revenue: number;
  expenses: number;
  profit: number;
  patronCount: number;
  averageSale: number;
  dailyNetRevenue: number;
  topServiceName: string | null;
  topServiceCount: number;
  serviceRevenue: { name: string; total: number }[];
};

export type DashboardSummaryParams = {
  from?: string;
  to?: string;
};

export const EMPTY_DASHBOARD_SUMMARY: DashboardSummary = {
  revenue: 0,
  expenses: 0,
  profit: 0,
  patronCount: 0,
  averageSale: 0,
  dailyNetRevenue: 0,
  topServiceName: null,
  topServiceCount: 0,
  serviceRevenue: [],
};

export class DashboardService {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly serviceCatalogService: ServiceCatalogService,
  ) {}

  async getSummary(
    businessId: string,
    params: DashboardSummaryParams = {},
  ): Promise<DashboardSummary> {
    const [transactions, services] = await Promise.all([
      this.transactionService.listByBusinessId(businessId, {
        fromDate: params.from,
        toDate: params.to,
      }),
      this.serviceCatalogService.listByBusinessId(businessId),
    ]);

    const serviceNames = new Map(services.map((s) => [s.id, s.name]));

    let revenue = 0;
    let expenses = 0;
    let patronCount = 0;
    const serviceTotals = new Map<string, number>();
    const todayStart = startOfDay(new Date()).toISOString();

    let dailyNetRevenue = 0;

    for (const tx of transactions) {
      if (tx.type === "INCOME") {
        revenue += Number(tx.total);
        patronCount += 1;
        if (tx.service_id) {
          const name = serviceNames.get(tx.service_id) ?? "Service";
          serviceTotals.set(name, (serviceTotals.get(name) ?? 0) + Number(tx.total));
        }
        if (tx.transaction_date >= todayStart) {
          dailyNetRevenue += Number(tx.total);
        }
      } else {
        expenses += Number(tx.total);
        if (tx.transaction_date >= todayStart) {
          dailyNetRevenue -= Number(tx.total);
        }
      }
    }

    const serviceRevenue = [...serviceTotals.entries()]
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total);

    const top = serviceRevenue[0];

    return {
      revenue,
      expenses,
      profit: revenue - expenses,
      patronCount,
      averageSale: patronCount > 0 ? revenue / patronCount : 0,
      dailyNetRevenue,
      topServiceName: top?.name ?? null,
      topServiceCount: serviceRevenue.length,
      serviceRevenue,
    };
  }
}

export function groupTransactionsByDay(transactions: Transaction[]) {
  const groups = new Map<string, Transaction[]>();
  for (const tx of transactions) {
    const key = tx.transaction_date.slice(0, 10);
    const list = groups.get(key) ?? [];
    list.push(tx);
    groups.set(key, list);
  }
  return [...groups.entries()].sort(([a], [b]) => b.localeCompare(a));
}
