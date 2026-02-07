import Link from "next/link";
import {
  ArrowRight,
  MapPin,
  DollarSign,
  Truck,
  Shield,
  Clock,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-base">
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="text-lg font-semibold text-ink">sortir</span>
          <div className="flex items-center gap-3">
            <Link href="/orders/active">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/orders/new">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-4 pt-24 pb-20">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold text-ink leading-tight">
            Get anything delivered
            <br />
            from <span className="text-accent">any store</span>
          </h1>
          <p className="mt-5 text-lg text-muted max-w-lg">
            Place your order at any store, set your delivery price, and a nearby
            driver will pick it up and bring it to you. Simple, transparent,
            on your terms.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/orders/new">
              <Button size="lg">
                Post a Delivery
                <ArrowRight size={16} className="ml-2" />
              </Button>
            </Link>
            <Link href="/drive">
              <Button variant="secondary" size="lg">
                Start Driving
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-card/50">
        <div className="max-w-6xl mx-auto px-4 py-20">
          <h2 className="text-xl font-semibold text-ink mb-10">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StepCard
              step={1}
              icon={<MapPin size={20} />}
              title="Place your order"
              description="Order from any store, get a confirmation number, then post on sortir with your delivery details and set your price."
            />
            <StepCard
              step={2}
              icon={<DollarSign size={20} />}
              title="Set your price"
              description="You decide what the delivery is worth. If no one accepts, increase your offer until a driver takes it."
            />
            <StepCard
              step={3}
              icon={<Truck size={20} />}
              title="Get it delivered"
              description="A verified driver picks up your order and delivers it to your door. Track everything in real-time."
            />
          </div>
        </div>
      </section>

      <section className="border-t border-border">
        <div className="max-w-6xl mx-auto px-4 py-20">
          <h2 className="text-xl font-semibold text-ink mb-10">
            Why sortir
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Shield size={18} />}
              title="Any store, anywhere"
              description="No partner stores needed. If you can place an order there, we can deliver from there."
            />
            <FeatureCard
              icon={<DollarSign size={18} />}
              title="You set the price"
              description="Reverse auction model. The market decides the delivery fee, not an algorithm."
            />
            <FeatureCard
              icon={<Clock size={18} />}
              title="Real-time tracking"
              description="Watch your driver in real-time from pickup to delivery. Always know where your order is."
            />
            <FeatureCard
              icon={<Shield size={18} />}
              title="Verified drivers"
              description="Every driver passes a background check. Your delivery is in safe hands."
            />
            <FeatureCard
              icon={<Star size={18} />}
              title="Rated and reviewed"
              description="Both customers and drivers are rated. Quality is maintained by the community."
            />
            <FeatureCard
              icon={<Truck size={18} />}
              title="Secure payments"
              description="Funds are held in escrow until delivery is confirmed. No risk for either party."
            />
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-card/50">
        <div className="max-w-6xl mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-semibold text-ink mb-3">
            Ready to get started?
          </h2>
          <p className="text-muted mb-8 max-w-md mx-auto">
            Whether you need something delivered or want to earn money driving,
            sortir connects you with your community.
          </p>
          <div className="flex justify-center gap-3">
            <Link href="/orders/new">
              <Button size="lg">Post a Delivery</Button>
            </Link>
            <Link href="/drive">
              <Button variant="secondary" size="lg">
                Become a Driver
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-sm text-muted">sortir</span>
          <div className="flex items-center gap-6">
            <Link href="/orders/new" className="text-sm text-muted hover:text-ink transition-colors">
              Post a Delivery
            </Link>
            <Link href="/drive" className="text-sm text-muted hover:text-ink transition-colors">
              Drive
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function StepCard({
  step,
  icon,
  title,
  description,
}: {
  step: number;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="flex items-center justify-center w-8 h-8 rounded-md bg-accent/10 text-accent text-sm font-medium">
          {step}
        </span>
        <span className="text-muted">{icon}</span>
      </div>
      <h3 className="text-base font-medium text-ink">{title}</h3>
      <p className="text-sm text-muted leading-relaxed">{description}</p>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-card rounded-md border border-border p-5 space-y-2">
      <div className="text-accent">{icon}</div>
      <h3 className="text-sm font-medium text-ink">{title}</h3>
      <p className="text-sm text-muted leading-relaxed">{description}</p>
    </div>
  );
}
