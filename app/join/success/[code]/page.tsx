import { redirect } from "next/navigation";

export default function JoinSuccessPage() {
  redirect("/auth");
}
