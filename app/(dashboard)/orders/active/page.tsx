import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/spinner";
import { Package, Plus, MapPin, Clock } from "lucide-react";
import Link from "next/link";
import { formatCents } from "@/lib/utils";

const mockOrders = [
  {
    id: "ord_1",
    storeName: "Target",
    itemDescription: "Blue Nike running shoes, size 10",
    storeAddress: "123 Main St",
    storeCity: "Detroit",
    storeState: "MI",
    deliveryAddress: "456 Business Blvd",
    deliveryCity: "Detroit",
    deliveryState: "MI",
    distanceMiles: 3.2,
    offerAmountCents: 1200,
    status: "OPEN" as const,
    createdAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: "ord_2",
    storeName: "CVS Pharmacy",
    itemDescription: "Prescription medication",
    storeAddress: "789 Health Ave",
    storeCity: "Detroit",
    storeState: "MI",
    deliveryAddress: "456 Business Blvd",
    deliveryCity: "Detroit",
    deliveryState: "MI",
    distanceMiles: 1.8,
    offerAmountCents: 800,
    status: "PICKED_UP" as const,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
];

function getStatusVariant(status: string) {
  switch (status) {
    case "OPEN":
      return "accent" as const;
    case "ACCEPTED":
    case "PICKED_UP":
      return "warning" as const;
    case "DELIVERED":
      return "success" as const;
    case "CANCELLED":
    case "EXPIRED":
      return "danger" as const;
    default:
      return "default" as const;
  }
}

export default function ActiveOrdersPage() {
  const orders = mockOrders;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-ink">My Orders</h1>
        <Link href="/orders/new">
          <Button size="sm">
            <Plus size={16} className="mr-2" />
            New Order
          </Button>
        </Link>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          title="No active orders"
          description="Post a delivery request to get started"
          icon={<Package size={32} />}
          action={
            <Link href="/orders/new">
              <Button>Post a Delivery</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Card key={order.id} hover>
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
                  <span className="text-lg font-semibold text-accent">
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
