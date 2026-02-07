"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/spinner";
import {
  MapPin,
  Clock,
  DollarSign,
  Filter,
  ArrowUpDown,
  Navigation,
  Package,
} from "lucide-react";
import { formatCents, formatTimeAgo, calculateDriverEarnings } from "@/lib/utils";

const mockAvailableOrders = [
  {
    id: "ord_10",
    storeName: "Miller's Pharmacy",
    itemDescription: "Prescription medication, already paid for",
    storeAddress: "123 Main St",
    storeCity: "Detroit",
    storeState: "MI",
    deliveryCity: "Detroit",
    deliveryState: "MI",
    distanceMiles: 3.2,
    driverDistanceMiles: 0.8,
    offerAmountCents: 1200,
    status: "OPEN",
    createdAt: new Date(Date.now() - 600000).toISOString(),
  },
  {
    id: "ord_11",
    storeName: "Target",
    itemDescription: "Blue Nike running shoes, size 10",
    storeAddress: "456 Retail Dr",
    storeCity: "Detroit",
    storeState: "MI",
    deliveryCity: "Detroit",
    deliveryState: "MI",
    distanceMiles: 5.1,
    driverDistanceMiles: 2.3,
    offerAmountCents: 1800,
    status: "OPEN",
    createdAt: new Date(Date.now() - 1200000).toISOString(),
  },
  {
    id: "ord_12",
    storeName: "Costco",
    itemDescription: "Bulk water case and paper towels",
    storeAddress: "789 Warehouse Blvd",
    storeCity: "Detroit",
    storeState: "MI",
    deliveryCity: "Dearborn",
    deliveryState: "MI",
    distanceMiles: 8.7,
    driverDistanceMiles: 4.5,
    offerAmountCents: 2500,
    status: "OPEN",
    createdAt: new Date(Date.now() - 300000).toISOString(),
  },
];

type SortBy = "price" | "distance" | "newest";

export default function DrivePage() {
  const [sortBy, setSortBy] = useState<SortBy>("newest");
  const [maxDistance, setMaxDistance] = useState<number>(25);
  const [minPrice, setMinPrice] = useState<number>(0);
  const [showFilters, setShowFilters] = useState(false);

  const filteredOrders = mockAvailableOrders
    .filter((order) => order.distanceMiles <= maxDistance)
    .filter((order) => order.offerAmountCents >= minPrice * 100)
    .sort((a, b) => {
      switch (sortBy) {
        case "price":
          return b.offerAmountCents - a.offerAmountCents;
        case "distance":
          return a.driverDistanceMiles - b.driverDistanceMiles;
        case "newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        default:
          return 0;
      }
    });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-ink">Available Deliveries</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={14} className="mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {showFilters && (
        <Card className="mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted mb-1">
                Sort By
              </label>
              <div className="flex gap-1">
                {(["newest", "price", "distance"] as SortBy[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSortBy(s)}
                    className={`px-3 py-1.5 rounded-md text-xs transition-colors ${
                      sortBy === s
                        ? "bg-accent text-white"
                        : "bg-highlight text-muted hover:text-ink"
                    }`}
                  >
                    {s === "price" ? "Highest Price" : s === "distance" ? "Closest" : "Newest"}
                  </button>
                ))}
              </div>
            </div>
            <Input
              label="Max Distance (mi)"
              type="number"
              min={1}
              max={25}
              value={maxDistance}
              onChange={(e) => setMaxDistance(parseInt(e.target.value) || 25)}
            />
            <Input
              label="Min Price ($)"
              type="number"
              min={0}
              value={minPrice}
              onChange={(e) => setMinPrice(parseInt(e.target.value) || 0)}
            />
          </div>
        </Card>
      )}

      {filteredOrders.length === 0 ? (
        <EmptyState
          title="No deliveries available"
          description="Check back soon for new delivery requests in your area"
          icon={<Package size={32} />}
        />
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => (
            <Card key={order.id} hover>
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-ink">
                      {order.storeName}
                    </h3>
                    <Badge variant="accent">OPEN</Badge>
                  </div>
                  <p className="text-sm text-muted">{order.itemDescription}</p>
                  <div className="flex items-center gap-4 text-xs text-muted flex-wrap">
                    <span className="flex items-center gap-1">
                      <MapPin size={12} />
                      {order.storeCity}, {order.storeState}
                    </span>
                    <span className="flex items-center gap-1">
                      <Navigation size={12} />
                      {order.driverDistanceMiles.toFixed(1)} mi from you
                    </span>
                    <span className="flex items-center gap-1">
                      <ArrowUpDown size={12} />
                      {order.distanceMiles.toFixed(1)} mi delivery
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {formatTimeAgo(order.createdAt)}
                    </span>
                  </div>
                </div>
                <div className="text-right ml-4 space-y-2">
                  <div>
                    <span className="text-xl font-bold text-accent block">
                      {formatCents(order.offerAmountCents)}
                    </span>
                    <span className="text-xs text-muted">
                      You earn{" "}
                      {formatCents(
                        calculateDriverEarnings(order.offerAmountCents)
                      )}
                    </span>
                  </div>
                  <Button size="sm">Accept Delivery</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
