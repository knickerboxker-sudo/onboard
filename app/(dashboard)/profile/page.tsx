import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Car, Shield, Star, MapPin } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold text-ink mb-6">Profile</h1>

      <div className="space-y-4">
        <Card>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-card-hover flex items-center justify-center">
              <User size={20} className="text-muted" />
            </div>
            <div className="flex-1">
              <h2 className="text-base font-medium text-ink">Sarah Johnson</h2>
              <p className="text-sm text-muted">sarah@example.com</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="success">Verified</Badge>
                <Badge>Customer</Badge>
              </div>
            </div>
            <Button variant="secondary" size="sm">
              Edit
            </Button>
          </div>
        </Card>

        <Card>
          <CardTitle>Driver Application</CardTitle>
          <p className="text-sm text-muted mt-2 mb-4">
            Become a driver and start earning by delivering items in your area.
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Shield size={16} className="text-muted" />
              <span className="text-muted">Background check</span>
              <Badge variant="default">Not started</Badge>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Car size={16} className="text-muted" />
              <span className="text-muted">Vehicle information</span>
              <Badge variant="default">Not submitted</Badge>
            </div>
          </div>
          <Button className="mt-4" size="sm">
            Apply to Drive
          </Button>
        </Card>

        <Card>
          <CardTitle>Statistics</CardTitle>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <span className="text-2xl font-semibold text-ink">5</span>
              <p className="text-xs text-muted">Orders placed</p>
            </div>
            <div>
              <span className="text-2xl font-semibold text-ink">4.9</span>
              <p className="text-xs text-muted">Average rating</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
