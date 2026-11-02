import { LandingView, listPublicPlans } from "@/features/landing";

export default async function HomePage() {
  const plans = await listPublicPlans();
  return <LandingView plans={plans.items} />;
}
