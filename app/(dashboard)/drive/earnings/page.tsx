import { Card, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, Package, Star } from "lucide-react";
import { formatCents } from "@/lib/utils";

const mockStats = {
  totalEarnings: 234500,
  thisWeek: 45000,
  totalDeliveries: 47,
  averageRating: 4.8,
};

const mockRecentPayments = [
  {
    id: "pay_1",
    storeName: "Target",
    amount: 1530,
    date: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "pay_2",
    storeName: "CVS Pharmacy",
    amount: 680,
    date: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "pay_3",
    storeName: "Costco",
    amount: 2125,
    date: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
];

export default function EarningsPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold text-ink mb-6">Earnings</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <StatCard
          icon={<DollarSign size={16} />}
          label="Total Earnings"
          value={formatCents(mockStats.totalEarnings)}
        />
        <StatCard
          icon={<TrendingUp size={16} />}
          label="This Week"
          value={formatCents(mockStats.thisWeek)}
        />
        <StatCard
          icon={<Package size={16} />}
          label="Deliveries"
          value={mockStats.totalDeliveries.toString()}
        />
        <StatCard
          icon={<Star size={16} />}
          label="Rating"
          value={mockStats.averageRating.toFixed(1)}
        />
      </div>

      <Card>
        <CardTitle>Recent Payments</CardTitle>
        <div className="mt-4 space-y-3">
          {mockRecentPayments.map((payment) => (
            <div
              key={payment.id}
              className="flex items-center justify-between py-2 border-b border-border last:border-0"
            >
              <div>
                <p className="text-sm text-ink">{payment.storeName}</p>
                <p className="text-xs text-muted">
                  {new Date(payment.date).toLocaleDateString()}
                </p>
              </div>
              <span className="text-sm font-medium text-success">
                +{formatCents(payment.amount)}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-muted">{icon}</span>
        <span className="text-xs text-muted">{label}</span>
      </div>
      <span className="text-lg font-semibold text-ink">{value}</span>
    </Card>
  );
}
