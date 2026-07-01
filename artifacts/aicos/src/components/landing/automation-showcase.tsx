import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const scenarios = [
  {
    title: "Scenario 1: Competitor Flash Sale",
    trigger: "Competitor 'Urban Style' drops prices by 20%",
    reaction: "AICOS immediately analyzes your margin limits. It matches the price drop on high-margin items to stay competitive, while maintaining prices on low-margin items to protect profitability."
  },
  {
    title: "Scenario 2: Viral TikTok Trend",
    trigger: "A product in your niche starts trending on TikTok",
    reaction: "AICOS detects the search volume spike. It instantly rewrites your product titles and descriptions to include the trending keywords, pushing you to the top of search results before competitors react."
  },
  {
    title: "Scenario 3: Looming Stockout",
    trigger: "Sales velocity for 'Linen Shirts' suddenly doubles",
    reaction: "AICOS calculates that you will stock out in 12 days instead of 30. It automatically drafts a purchase order based on supplier lead times and emails it to you for one-click approval."
  }
];

export function AutomationShowcase() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
              Reactions in milliseconds.<br />Not hours.
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Human teams can't monitor every competitor, trend, and inventory level 24/7. When market conditions shift, AICOS acts instantly, turning missed opportunities into captured revenue.
            </p>
            
            <div className="space-y-8">
              {scenarios.map((scenario, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.15 }}
                  className="relative pl-6 border-l-2 border-border"
                >
                  <div className="absolute w-3 h-3 bg-primary rounded-full -left-[7px] top-2"></div>
                  <h4 className="font-semibold text-foreground mb-2">{scenario.title}</h4>
                  <div className="bg-muted/50 p-3 rounded-md mb-3 text-sm border border-border">
                    <span className="font-medium text-foreground">Trigger: </span>
                    <span className="text-muted-foreground">{scenario.trigger}</span>
                  </div>
                  <div className="flex gap-2">
                    <ArrowRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <p className="text-sm text-foreground/80 leading-relaxed">{scenario.reaction}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <Button className="mt-10" data-testid="button-showcase-demo">See More Scenarios</Button>
          </div>
          
          <div className="relative lg:h-[600px] flex items-center justify-center">
            {/* Abstract representation of data processing */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"></div>
            
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
              className="relative w-full max-w-md aspect-square border border-dashed border-primary/20 rounded-full flex items-center justify-center"
            >
              <div className="absolute w-3/4 h-3/4 border border-border rounded-full flex items-center justify-center">
                <div className="absolute w-1/2 h-1/2 bg-primary/10 blur-2xl rounded-full"></div>
                <div className="w-16 h-16 bg-primary rounded-full shadow-[0_0_40px_rgba(var(--primary),0.5)] flex items-center justify-center">
                  <span className="text-primary-foreground font-bold font-mono">AI</span>
                </div>
              </div>
              
              {/* Orbital nodes */}
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="absolute inset-0" style={{ transform: `rotate(${i * 90}deg)` }}>
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-card border border-primary/50 rounded-full flex items-center justify-center shadow-lg">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                  </div>
                </div>
              ))}
            </motion.div>
            
            {/* Floating info cards */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-10 right-10 bg-background/80 backdrop-blur-md border border-border p-3 rounded-lg shadow-xl text-xs"
            >
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-3 h-3 text-green-500" />
                <span className="font-medium">Price Optimized</span>
              </div>
              <span className="text-muted-foreground">+12% margin captured</span>
            </motion.div>
            
            <motion.div 
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-20 left-0 bg-background/80 backdrop-blur-md border border-border p-3 rounded-lg shadow-xl text-xs"
            >
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-3 h-3 text-green-500" />
                <span className="font-medium">SEO Updated</span>
              </div>
              <span className="text-muted-foreground">Ranked #1 for "summer fit"</span>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}