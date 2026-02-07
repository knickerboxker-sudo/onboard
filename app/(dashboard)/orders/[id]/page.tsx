"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import {
  MapPin,
  Navigation,
  Clock,
  DollarSign,
  ArrowUp,
  Package,
  Check,
  Truck,
  Store,
} from "lucide-react";
import { formatCents, getStatusLabel, calculateDriverEarnings } from "@/lib/utils";

const mockOrder = {
  id: "ord_1",
  storeName: "Miller's Pharmacy",
  storeAddress: "123 Main St",
  storeCity: "Detroit",
  storeState: "MI",
  storeZip: "48201",
  storeLatitude: 42.3314,
  storeLongitude: -83.0458,
  itemDescription: "Prescription medication, already paid for",
  storeOrderId: "45782",
  pickupName: "Sarah Johnson",
  pickupInstructions: "Go to the pharmacy counter",
  deliveryAddress: "456 Business Blvd",
  deliveryCity: "Detroit",
  deliveryState: "MI",
  deliveryZip: "48202",
  deliveryLatitude: 42.3364,
  deliveryLongitude: -83.0508,
  deliveryInstructions: "Apartment 3B, gate code 1234",
  distanceMiles: 3.2,
  offerAmountCents: 1200,
  driverEarningsCents: 1020,
  status: "OPEN" as string,
  createdAt: new Date(Date.now() - 1800000).toISOString(),
  expiresAt: new Date(Date.now() + 79200000).toISOString(),
  driver: null as {
    name: string;
    driverProfile: { averageRating: number; totalDeliveries: number };
  } | null,
};

function getStatusVariant(status: string) {
  switch (status) {
    case "OPEN":
      return "accent" as const;
    case "ACCEPTED":
    case "PICKED_UP":
      return "warning" as const;
    case "DELIVERED":
      return "success" as const;
    default:
      return "default" as const;
  }
}

export default function OrderDetailPage() {
  const order = mockOrder;
  const [showIncreaseModal, setShowIncreaseModal] = useState(false);
  const [newAmount, setNewAmount] = useState(
    ((order.offerAmountCents + 200) / 100).toFixed(2)
  );

  const timeline = [
    {
      label: "Posted",
      time: order.createdAt,
      completed: true,
      icon: <Package size={14} />,
    },
    {
      label: "Accepted",
      time: null,
      completed: order.status !== "OPEN",
      icon: <Check size={14} />,
    },
    {
      label: "Picked Up",
      time: null,
      completed: ["PICKED_UP", "DELIVERED"].includes(order.status),
      icon: <Store size={14} />,
    },
    {
      label: "Delivered",
      time: null,
      completed: order.status === "DELIVERED",
      icon: <Truck size={14} />,
    },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-ink">Order Details</h1>
        <Badge variant={getStatusVariant(order.status)}>
          {getStatusLabel(order.status)}
        </Badge>
      </div>

      <div className="space-y-4">
        {/* Map placeholder */}
        <Card className="overflow-hidden">
          <div className="h-48 bg-highlight rounded-md flex items-center justify-center relative">
            <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-accent to-success" />
            <div className="relative text-center">
              <MapPin size={24} className="text-accent mx-auto mb-2" />
              <p className="text-sm text-muted">
                Map view - {order.distanceMiles.toFixed(1)} miles
              </p>
              <div className="flex items-center justify-center gap-4 mt-2">
                <span className="flex items-center gap-1 text-xs text-accent">
                  <MapPin size={10} /> Store
                </span>
                <span className="flex items-center gap-1 text-xs text-success">
                  <Navigation size={10} /> Delivery
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Timeline */}
        <Card>
          <div className="flex items-center justify-between">
            {timeline.map((step, i) => (
              <div key={step.label} className="flex items-center gap-2 flex-1">
                <div
                  className={`flex items-center justify-center w-7 h-7 rounded-full text-xs ${
                    step.completed
                      ? "bg-success/10 text-success"
                      : "bg-card-hover text-muted"
                  }`}
                >
                  {step.icon}
                </div>
                <span
                  className={`text-xs ${step.completed ? "text-ink" : "text-muted"}`}
                >
                  {step.label}
                </span>
                {i < timeline.length - 1 && (
                  <div
                    className={`flex-1 h-px ${step.completed ? "bg-success/30" : "bg-border"}`}
                  />
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Offer and increase */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm text-muted">Current Offer</span>
              <span className="text-2xl font-bold text-accent block">
                {formatCents(order.offerAmountCents)}
              </span>
              <span className="text-xs text-muted">
                Driver earns {formatCents(calculateDriverEarnings(order.offerAmountCents))}
              </span>
            </div>
            {order.status === "OPEN" && (
              <Button onClick={() => setShowIncreaseModal(true)}>
                <ArrowUp size={14} className="mr-2" />
                Increase Offer
              </Button>
            )}
          </div>
        </Card>

        {/* Order details */}
        <Card>
          <h3 className="text-sm font-medium text-ink mb-3">Pickup</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <Store size={14} className="text-accent mt-0.5 shrink-0" />
              <div>
                <span className="text-ink font-medium">{order.storeName}</span>
                <p className="text-muted">
                  {order.storeAddress}, {order.storeCity}, {order.storeState}{" "}
                  {order.storeZip}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Package size={14} className="text-muted mt-0.5 shrink-0" />
              <span className="text-muted">{order.itemDescription}</span>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-medium text-ink mb-3">Delivery</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <Navigation size={14} className="text-success mt-0.5 shrink-0" />
              <div>
                <p className="text-ink">
                  {order.deliveryAddress}, {order.deliveryCity},{" "}
                  {order.deliveryState} {order.deliveryZip}
                </p>
              </div>
            </div>
            {order.deliveryInstructions && (
              <p className="text-muted text-xs pl-6">
                {order.deliveryInstructions}
              </p>
            )}
          </div>
        </Card>

        {/* Driver info */}
        {order.driver && (
          <Card>
            <h3 className="text-sm font-medium text-ink mb-3">Your Driver</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-card-hover flex items-center justify-center">
                <Truck size={16} className="text-muted" />
              </div>
              <div>
                <span className="text-sm font-medium text-ink">
                  {order.driver.name}
                </span>
                <div className="flex items-center gap-2 text-xs text-muted">
                  <span>
                    {order.driver.driverProfile.averageRating.toFixed(1)} rating
                  </span>
                  <span>
                    {order.driver.driverProfile.totalDeliveries} deliveries
                  </span>
                </div>
              </div>
            </div>
          </Card>
        )}

        <div className="flex items-center gap-4 text-xs text-muted">
          <span className="flex items-center gap-1">
            <Clock size={12} />
            Posted {new Date(order.createdAt).toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={12} />
            Expires {new Date(order.expiresAt).toLocaleString()}
          </span>
        </div>
      </div>

      <Modal
        isOpen={showIncreaseModal}
        onClose={() => setShowIncreaseModal(false)}
        title="Increase Offer"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">Current offer</span>
            <span className="text-ink font-medium">
              {formatCents(order.offerAmountCents)}
            </span>
          </div>
          <Input
            label="New offer amount ($)"
            type="number"
            min={(order.offerAmountCents / 100 + 1).toFixed(2)}
            step="0.50"
            value={newAmount}
            onChange={(e) => setNewAmount(e.target.value)}
          />
          {parseFloat(newAmount) > order.offerAmountCents / 100 && (
            <div className="text-sm text-muted">
              Increase of{" "}
              <span className="text-accent font-medium">
                {formatCents(
                  Math.round(parseFloat(newAmount) * 100) - order.offerAmountCents
                )}
              </span>
            </div>
          )}
          <Button
            className="w-full"
            disabled={parseFloat(newAmount) <= order.offerAmountCents / 100}
          >
            Update Offer to ${parseFloat(newAmount).toFixed(2)}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
