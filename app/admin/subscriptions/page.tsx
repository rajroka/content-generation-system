import { Card, CardContent } from "@/components/ui/card";

export default function AdminSubscriptionsPage() {
  return (
    <div className="p-6 max-w-6xl mx-auto min-h-screen">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">Subscriptions</h1>
        <p className="text-[12px] text-muted-foreground mt-1">Manage user billing and subscription plans.</p>
      </div>

      <Card className="border-none shadow-sm rounded-xl p-8 text-center bg-card flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-16 h-16 bg-[#0d7c8a]/10 text-[#0d7c8a] rounded-full flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-credit-card"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
        </div>
        <h3 className="text-lg font-bold text-foreground">Subscriptions Module Coming Soon</h3>
        <p className="text-sm text-muted-foreground mt-2 max-w-md">Integration with Stripe/billing provider for subscription management is currently under development.</p>
      </Card>
    </div>
  );
}
