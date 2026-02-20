import type { Metadata } from "next";
import PartnershipIdeasClient from "./PartnershipIdeasClient";

export const metadata: Metadata = {
  title: "Partnership Ideas for Small Businesses | Sortir",
  description:
    "Browse real partnership ideas for local businesses — gyms, cafés, freelancers, and more connecting to grow through referrals.",
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://sortir.app"}/partnership-ideas`,
  },
};

export default function PartnershipIdeasPage() {
  return <PartnershipIdeasClient />;
}
