import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/spinner";
import { MapPin, Clock, Navigation, Truck } from "lucide-react";
import { formatCents } from "@/lib/utils";

const mockActiveDeliveries: Array<{
  id: string;
  storeName: string;
  itemDescription: string;
  storeAddress: string;
  deliveryAddress: string;
  storeOrderId: string;
  pickupName: string;
  distanceMiles: number;
  offerAmountCents: number;
  driverEarningsCents: number;
  status: "ACCEPTED" | "PICKED_UP";
  acceptedAt: string;
}> = [
  {
    id: "ord_20",
    storeName: "Miller's Pharmacy",
    itemDescription: "Prescription medication",
    storeAddress: "123 Main St, Detroit, MI",
    deliveryAddress: "456 Business Blvd, Detroit, MI",
    storeOrderId: "45782",
    pickupName: "Sarah Johnson",
    distanceMiles: 3.2,
    offerAmountCents: 1200,
    driverEarningsCents: 1020,
    status: "ACCEPTED",
    acceptedAt: new Date(Date.now() - 600000).toISOString(),
  },
];

function getStatusLabel(status: string) {
  switch (status) {
    case "ACCEPTED":
      return "Navigate to Store";
    case "PICKED_UP":
      return "Navigate to Customer";
    default:
      return status;
  }
}

export default function ActiveDeliveriesPage() {
  const deliveries = mockActiveDeliveries;

  return (
    <div>
      <h1 className="text-xl font-semibold text-ink mb-6">
        Active Deliveries
      </h1>

      {deliveries.length === 0 ? (
        <EmptyState
          title="No active deliveries"
          description="Accept a delivery request to get started"
          icon={<Truck size={32} />}
        />
      ) : (
        <div className="space-y-3">
          {deliveries.map((delivery) => (
            <Card key={delivery.id}>
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium text-ink">
                        {delivery.storeName}
                      </h3>
                      <Badge variant="warning">
                        {delivery.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted mt-1">
                      {delivery.itemDescription}
                    </p>
                  </div>
                  <span className="text-lg font-semibold text-success">
                    {formatCents(delivery.driverEarningsCents)}
                  </span>
                </div>

                <div className="bg-highlight rounded-md p-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted">Order ID:</span>
                    <span className="text-ink font-medium">
                      {delivery.storeOrderId}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted">Pickup Name:</span>
                    <span className="text-ink font-medium">
                      {delivery.pickupName}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="space-y-1">
                    <span className="text-xs text-muted">Pickup</span>
                    <div className="flex items-center gap-1.5">
                      <MapPin size={14} className="text-accent shrink-0" />
                      <span className="text-ink">{delivery.storeAddress}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted">Delivery</span>
                    <div className="flex items-center gap-1.5">
                      <Navigation
                        size={14}
                        className="text-success shrink-0"
                      />
                      <span className="text-ink">
                        {delivery.deliveryAddress}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {delivery.status === "ACCEPTED" && (
                    <Button className="flex-1">Mark as Picked Up</Button>
                  )}
                  {delivery.status === "PICKED_UP" && (
                    <Button className="flex-1">Mark as Delivered</Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
