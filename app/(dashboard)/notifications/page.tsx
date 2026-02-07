import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/spinner";
import { Bell, Package, DollarSign, Star, Check } from "lucide-react";

const mockNotifications = [
  {
    id: "notif_1",
    type: "order_accepted",
    message: "Tom accepted your delivery from Miller's Pharmacy",
    orderId: "ord_20",
    read: false,
    createdAt: new Date(Date.now() - 600000).toISOString(),
  },
  {
    id: "notif_2",
    type: "order_picked_up",
    message: "Tom picked up your order, on the way!",
    orderId: "ord_20",
    read: false,
    createdAt: new Date(Date.now() - 300000).toISOString(),
  },
  {
    id: "notif_3",
    type: "payment_received",
    message: "You earned $10.20 for delivery from Target",
    orderId: "ord_15",
    read: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "notif_4",
    type: "rating_received",
    message: "You received a 5-star rating from Sarah",
    orderId: "ord_15",
    read: true,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

function getNotifIcon(type: string) {
  switch (type) {
    case "order_accepted":
    case "order_picked_up":
      return <Package size={16} />;
    case "payment_received":
      return <DollarSign size={16} />;
    case "rating_received":
      return <Star size={16} />;
    default:
      return <Bell size={16} />;
  }
}

export default function NotificationsPage() {
  const notifications = mockNotifications;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-ink">Notifications</h1>
        <button className="text-sm text-accent hover:text-accent-hover transition-colors">
          Mark all as read
        </button>
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          title="No notifications"
          description="You're all caught up"
          icon={<Bell size={32} />}
        />
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => (
            <Card
              key={notif.id}
              className={notif.read ? "opacity-60" : ""}
              hover
            >
              <div className="flex items-start gap-3">
                <div
                  className={`mt-0.5 ${notif.read ? "text-muted" : "text-accent"}`}
                >
                  {getNotifIcon(notif.type)}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-ink">{notif.message}</p>
                  <p className="text-xs text-muted mt-1">
                    {new Date(notif.createdAt).toLocaleString()}
                  </p>
                </div>
                {!notif.read && (
                  <div className="w-2 h-2 rounded-full bg-accent mt-2" />
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
