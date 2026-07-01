import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const tiers = [
  {
    name: "Starter",
    price: "29",
    description: "For emerging stores looking to automate the basics.",
    features: [
      "Daily competitor price monitoring (up to 3 competitors)",
      "Basic SEO title optimizations",
      "Low stock alerts",
      "Weekly performance digest",
      "Email support"
    ],
    cta: "Start Free Trial",
    popular: false
  },
  {
    name: "Growth",
    price: "79",
    description: "For scaling merchants who need real-time competitive advantages.",
    features: [
      "Real-time dynamic pricing automation",
      "Unlimited competitor monitoring",
      "Full catalog SEO generation",
      "Automated PO drafting",
      "Priority slack support",
      "Custom margin guardrails"
    ],
    cta: "Start Free Trial",
    popular: true
  },
  {
    name: "Pro",
    price: "199",
    description: "The full power of an AI commerce operations team.",
    features: [
      "Everything in Growth",
      "Predictive demand forecasting",
      "Multi-store support",
      "Custom brand voice training",
      "API access",
      "Dedicated account manager",
      "Onboarding specialist"
    ],
    cta: "Start Free Trial",
    popular: false
  }
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-zinc-50 dark:bg-zinc-900/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Hire an AI employee for a fraction of the cost
          </h2>
          <p className="text-lg text-muted-foreground">
            Simple, transparent pricing. No hidden fees. Cancel anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {tiers.map((tier, index) => (
            <div 
              key={index}
              className={`relative flex flex-col p-8 rounded-2xl border ${
                tier.popular 
                  ? "bg-card border-primary shadow-xl scale-105 z-10" 
                  : "bg-background border-border"
              }`}
            >
              {tier.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full uppercase tracking-wide">
                  Most Popular
                </div>
              )}
              
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-2">{tier.name}</h3>
                <p className="text-sm text-muted-foreground mb-6 h-10">{tier.description}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">${tier.price}</span>
                  <span className="text-muted-foreground">/mo</span>
                </div>
              </div>
              
              <div className="flex-1 space-y-4 mb-8">
                {tier.features.map((feature, fIndex) => (
                  <div key={fIndex} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary shrink-0" />
                    <span className="text-sm text-foreground/80">{feature}</span>
                  </div>
                ))}
              </div>
              
              <Button 
                variant={tier.popular ? "default" : "outline"} 
                className="w-full"
                data-testid={`button-pricing-${tier.name.toLowerCase()}`}
              >
                {tier.cta}
              </Button>
            </div>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-4">Need something more custom? High volume merchant?</p>
          <Button variant="ghost" data-testid="button-pricing-enterprise">
            Contact Sales for Enterprise
          </Button>
        </div>
      </div>
    </section>
  );
}