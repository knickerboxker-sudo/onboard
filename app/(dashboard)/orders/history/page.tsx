import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/spinner";
import { History, MapPin, Clock } from "lucide-react";
import { formatCents } from "@/lib/utils";

const mockHistory = [
  {
    id: "ord_3",
    storeName: "Costco",
    itemDescription: "Bulk paper towels and water",
    storeCity: "Detroit",
    storeState: "MI",
    deliveryCity: "Detroit",
    deliveryState: "MI",
    distanceMiles: 5.4,
    offerAmountCents: 1500,
    status: "DELIVERED" as const,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    deliveredAt: new Date(Date.now() - 86400000 * 3 + 3600000).toISOString(),
  },
  {
    id: "ord_4",
    storeName: "Best Buy",
    itemDescription: "USB-C cable, 6ft",
    storeCity: "Detroit",
    storeState: "MI",
    deliveryCity: "Detroit",
    deliveryState: "MI",
    distanceMiles: 2.1,
    offerAmountCents: 700,
    status: "CANCELLED" as const,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    cancelledAt: new Date(Date.now() - 86400000 * 5 + 1800000).toISOString(),
  },
];

function getStatusVariant(status: string) {
  switch (status) {
    case "DELIVERED":
      return "success" as const;
    case "CANCELLED":
    case "EXPIRED":
      return "danger" as const;
    default:
      return "default" as const;
  }
}

export default function OrderHistoryPage() {
  const orders = mockHistory;

  return (
    <div>
      <h1 className="text-xl font-semibold text-ink mb-6">Order History</h1>

      {orders.length === 0 ? (
        <EmptyState
          title="No past orders"
          description="Your completed and cancelled orders will appear here"
          icon={<History size={32} />}
        />
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Card key={order.id}>
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-ink">
                      {order.storeName}
                    </h3>
                    <Badge variant={getStatusVariant(order.status)}>
                      {order.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted">{order.itemDescription}</p>
                  <div className="flex items-center gap-4 text-xs text-muted">
                    <span className="flex items-center gap-1">
                      <MapPin size={12} />
                      {order.distanceMiles.toFixed(1)} mi
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-semibold text-ink">
                    {formatCents(order.offerAmountCents)}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
