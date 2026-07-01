import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Connect Your Store",
    description: "Securely link your Shopify account with one click. AICOS instantly ingests your catalog, historical sales, and inventory data."
  },
  {
    number: "02",
    title: "Set Your Guardrails",
    description: "Define your minimum acceptable margins, preferred suppliers, and brand voice guidelines. AICOS operates strictly within these boundaries."
  },
  {
    number: "03",
    title: "Watch It Work",
    description: "Step back. Your AI employee begins optimizing prices, rewriting SEO, and drafting purchase orders immediately."
  }
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-zinc-50 dark:bg-zinc-900/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Onboarding takes 5 minutes.
          </h2>
          <p className="text-lg text-muted-foreground">
            No complex workflows to build. No prompt engineering. Just connect and go.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connecting line for desktop */}
          <div className="hidden md:block absolute top-8 left-[10%] right-[10%] h-[2px] bg-border z-0"></div>
          
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="relative z-10 flex flex-col items-center text-center group"
            >
              <div className="w-16 h-16 rounded-full bg-background border-4 border-background shadow-md flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-xl font-bold text-primary">{step.number}</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
              <p className="text-muted-foreground max-w-xs">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}