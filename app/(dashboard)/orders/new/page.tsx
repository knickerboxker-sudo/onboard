"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Store,
  Package,
  MapPin,
  DollarSign,
  ArrowLeft,
  ArrowRight,
  Check,
} from "lucide-react";
import { formatCents, calculateDriverEarnings } from "@/lib/utils";

const steps = [
  { id: 1, label: "Store Details", icon: Store },
  { id: 2, label: "Pickup Info", icon: Package },
  { id: 3, label: "Delivery", icon: MapPin },
  { id: 4, label: "Set Price", icon: DollarSign },
];

interface FormData {
  storeName: string;
  storeAddress: string;
  storeCity: string;
  storeState: string;
  storeZip: string;
  storeLatitude: number;
  storeLongitude: number;
  itemDescription: string;
  storeOrderId: string;
  pickupName: string;
  pickupInstructions: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryState: string;
  deliveryZip: string;
  deliveryLatitude: number;
  deliveryLongitude: number;
  deliveryInstructions: string;
  distanceMiles: number;
  offerAmountCents: number;
}

export default function NewOrderPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    storeName: "",
    storeAddress: "",
    storeCity: "",
    storeState: "",
    storeZip: "",
    storeLatitude: 42.3314,
    storeLongitude: -83.0458,
    itemDescription: "",
    storeOrderId: "",
    pickupName: "",
    pickupInstructions: "",
    deliveryAddress: "",
    deliveryCity: "",
    deliveryState: "",
    deliveryZip: "",
    deliveryLatitude: 42.3364,
    deliveryLongitude: -83.0508,
    deliveryInstructions: "",
    distanceMiles: 0,
    offerAmountCents: 1000,
  });

  const updateField = (field: keyof FormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.storeName && formData.storeAddress && formData.storeCity && formData.storeState && formData.storeZip && formData.itemDescription;
      case 2:
        return formData.storeOrderId && formData.pickupName;
      case 3:
        return formData.deliveryAddress && formData.deliveryCity && formData.deliveryState && formData.deliveryZip;
      case 4:
        return formData.offerAmountCents >= 500;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < 4) {
      if (currentStep === 3 && formData.distanceMiles === 0) {
        // Calculate approximate distance using Haversine formula
        const toRad = (deg: number) => (deg * Math.PI) / 180;
        const R = 3959; // Earth radius in miles
        const dLat = toRad(formData.deliveryLatitude - formData.storeLatitude);
        const dLon = toRad(formData.deliveryLongitude - formData.storeLongitude);
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(toRad(formData.storeLatitude)) *
            Math.cos(toRad(formData.deliveryLatitude)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const dist = Math.round(R * c * 10) / 10;
        updateField("distanceMiles", dist > 0 ? dist : 0.1);
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setSubmitted(true);
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto mt-16 text-center">
        <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
          <Check size={24} className="text-success" />
        </div>
        <h2 className="text-xl font-semibold text-ink mb-2">Order Posted</h2>
        <p className="text-muted mb-6">
          Your delivery request is now live. Drivers in the area will see your
          offer of {formatCents(formData.offerAmountCents)}.
        </p>
        <Button
          onClick={() => {
            setSubmitted(false);
            setCurrentStep(1);
            setFormData({
              ...formData,
              storeName: "",
              storeAddress: "",
              storeCity: "",
              storeState: "",
              storeZip: "",
              itemDescription: "",
              storeOrderId: "",
              pickupName: "",
              pickupInstructions: "",
              deliveryAddress: "",
              deliveryCity: "",
              deliveryState: "",
              deliveryZip: "",
              deliveryInstructions: "",
              distanceMiles: 0,
              offerAmountCents: 1000,
            });
          }}
          variant="secondary"
        >
          Post Another
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold text-ink mb-6">New Delivery Request</h1>

      <div className="flex items-center gap-2 mb-8">
        {steps.map((step) => {
          const Icon = step.icon;
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          return (
            <div key={step.id} className="flex items-center gap-2 flex-1">
              <div
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-md text-sm font-medium transition-colors",
                  isCurrent && "bg-accent text-white",
                  isCompleted && "bg-success/10 text-success",
                  !isCurrent && !isCompleted && "bg-card text-muted border border-border"
                )}
              >
                {isCompleted ? <Check size={14} /> : <Icon size={14} />}
              </div>
              <span
                className={cn(
                  "text-xs hidden sm:block",
                  isCurrent ? "text-ink" : "text-muted"
                )}
              >
                {step.label}
              </span>
              {step.id < 4 && (
                <div
                  className={cn(
                    "flex-1 h-px",
                    isCompleted ? "bg-success/30" : "bg-border"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      <Card>
        {currentStep === 1 && (
          <div className="space-y-4">
            <h2 className="text-base font-medium text-ink mb-4">
              Store Details
            </h2>
            <Input
              label="Store Name"
              placeholder="e.g., Target, CVS Pharmacy, Joe's Hardware"
              value={formData.storeName}
              onChange={(e) => updateField("storeName", e.target.value)}
            />
            <Input
              label="Store Address"
              placeholder="Street address"
              value={formData.storeAddress}
              onChange={(e) => updateField("storeAddress", e.target.value)}
            />
            <div className="grid grid-cols-3 gap-3">
              <Input
                label="City"
                placeholder="City"
                value={formData.storeCity}
                onChange={(e) => updateField("storeCity", e.target.value)}
              />
              <Input
                label="State"
                placeholder="State"
                value={formData.storeState}
                onChange={(e) => updateField("storeState", e.target.value)}
              />
              <Input
                label="ZIP"
                placeholder="ZIP"
                value={formData.storeZip}
                onChange={(e) => updateField("storeZip", e.target.value)}
              />
            </div>
            <Textarea
              label="What are you picking up?"
              placeholder="e.g., Blue Nike running shoes, size 10"
              value={formData.itemDescription}
              onChange={(e) => updateField("itemDescription", e.target.value)}
            />
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <h2 className="text-base font-medium text-ink mb-4">
              Pickup Information
            </h2>
            <Input
              label="Store Order / Confirmation Number"
              placeholder="e.g., 45782"
              value={formData.storeOrderId}
              onChange={(e) => updateField("storeOrderId", e.target.value)}
            />
            <Input
              label="Pickup Name (name on the order)"
              placeholder="e.g., Sarah Johnson"
              value={formData.pickupName}
              onChange={(e) => updateField("pickupName", e.target.value)}
            />
            <Textarea
              label="Special Pickup Instructions (optional)"
              placeholder="e.g., Go to the pharmacy counter, ask for prescription pickup"
              value={formData.pickupInstructions}
              onChange={(e) =>
                updateField("pickupInstructions", e.target.value)
              }
            />
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-4">
            <h2 className="text-base font-medium text-ink mb-4">
              Delivery Address
            </h2>
            <Input
              label="Delivery Address"
              placeholder="Street address"
              value={formData.deliveryAddress}
              onChange={(e) => updateField("deliveryAddress", e.target.value)}
            />
            <div className="grid grid-cols-3 gap-3">
              <Input
                label="City"
                placeholder="City"
                value={formData.deliveryCity}
                onChange={(e) => updateField("deliveryCity", e.target.value)}
              />
              <Input
                label="State"
                placeholder="State"
                value={formData.deliveryState}
                onChange={(e) => updateField("deliveryState", e.target.value)}
              />
              <Input
                label="ZIP"
                placeholder="ZIP"
                value={formData.deliveryZip}
                onChange={(e) => updateField("deliveryZip", e.target.value)}
              />
            </div>
            <Textarea
              label="Delivery Instructions (optional)"
              placeholder="e.g., Apartment 3B, gate code 1234"
              value={formData.deliveryInstructions}
              onChange={(e) =>
                updateField("deliveryInstructions", e.target.value)
              }
            />
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-6">
            <h2 className="text-base font-medium text-ink mb-4">
              Set Your Delivery Price
            </h2>

            <div>
              <label className="block text-sm font-medium text-muted mb-3">
                Delivery Offer
              </label>
              <input
                type="range"
                min={500}
                max={10000}
                step={100}
                value={formData.offerAmountCents}
                onChange={(e) =>
                  updateField("offerAmountCents", parseInt(e.target.value))
                }
                className="w-full accent-accent"
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-muted">$5.00</span>
                <span className="text-2xl font-bold text-accent">
                  {formatCents(formData.offerAmountCents)}
                </span>
                <span className="text-xs text-muted">$100.00</span>
              </div>

              <div className="mt-2">
                <Input
                  label="Or enter exact amount"
                  type="number"
                  min={5}
                  max={100}
                  step={0.5}
                  value={(formData.offerAmountCents / 100).toFixed(2)}
                  onChange={(e) => {
                    const cents = Math.round(parseFloat(e.target.value || "5") * 100);
                    if (cents >= 500 && cents <= 10000) {
                      updateField("offerAmountCents", cents);
                    }
                  }}
                />
              </div>
            </div>

            <div className="bg-highlight rounded-md p-4 space-y-3">
              <h3 className="text-sm font-medium text-ink">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">Store</span>
                  <span className="text-ink">{formData.storeName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Item</span>
                  <span className="text-ink truncate ml-4 max-w-[200px]">
                    {formData.itemDescription}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Distance</span>
                  <span className="text-ink">
                    {formData.distanceMiles.toFixed(1)} miles
                  </span>
                </div>
                {formData.distanceMiles > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted">Per-mile rate</span>
                    <span className="text-ink">
                      {formatCents(
                        Math.floor(
                          formData.offerAmountCents / formData.distanceMiles
                        )
                      )}
                      /mi
                    </span>
                  </div>
                )}
                <div className="border-t border-border pt-2 flex justify-between font-medium">
                  <span className="text-ink">Total</span>
                  <span className="text-accent">
                    {formatCents(formData.offerAmountCents)}
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted mt-2">
                You can increase this price later if no driver accepts.
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
          {currentStep > 1 ? (
            <Button
              variant="ghost"
              onClick={() => setCurrentStep(currentStep - 1)}
            >
              <ArrowLeft size={16} className="mr-2" />
              Back
            </Button>
          ) : (
            <div />
          )}

          {currentStep < 4 ? (
            <Button onClick={handleNext} disabled={!canProceed()}>
              Next
              <ArrowRight size={16} className="ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!canProceed() || submitting}
            >
              {submitting ? "Posting..." : "Post Delivery Request"}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
