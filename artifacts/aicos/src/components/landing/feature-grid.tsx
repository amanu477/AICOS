import { motion } from "framer-motion";
import { Zap, TrendingUp, Search, BarChart3, Clock, Lock } from "lucide-react";

const features = [
  {
    icon: TrendingUp,
    title: "Dynamic Pricing",
    description: "Automatically adjusts prices based on competitor stock, demand spikes, and your target margins."
  },
  {
    icon: Search,
    title: "SEO Optimization",
    description: "Rewrites product titles and descriptions to capture trending search terms before competitors do."
  },
  {
    icon: Zap,
    title: "Inventory Forecasting",
    description: "Predicts stockouts weeks in advance and drafts purchase orders for your approval."
  },
  {
    icon: BarChart3,
    title: "Competitor Analysis",
    description: "Monitors competing Shopify stores and alerts you when they launch promotions or drop prices."
  },
  {
    icon: Clock,
    title: "24/7 Operations",
    description: "Your AI employee never sleeps, taking action on market changes the moment they happen."
  },
  {
    icon: Lock,
    title: "Margin Protection",
    description: "Strict guardrails ensure the AI never makes a decision that drops below your minimum acceptable margin."
  }
];

export function FeatureGrid() {
  return (
    <section id="features" className="py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Capabilities of a 10-person team.
            <br /> Executed by one AI.
          </h2>
          <p className="text-lg text-muted-foreground">
            AICOS connects directly to your Shopify store and begins working immediately. No complex rules to configure.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="p-6 rounded-2xl border border-border/50 bg-card hover:border-primary/50 transition-colors group"
            >
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}