import { motion } from "framer-motion";

const testimonials = [
  {
    quote: "AICOS caught a competitor's weekend flash sale and adjusted our prices dynamically. We maintained volume while protecting margin. It paid for itself in one Saturday.",
    author: "Sarah Jenkins",
    role: "Founder, Peak Athletics",
    metric: "+24% Weekend Revenue"
  },
  {
    quote: "I used to spend 10 hours a week analyzing inventory and writing POs. Now I get a notification, review the AI's drafted order, click approve, and go back to building my brand.",
    author: "David Chen",
    role: "Director of Ops, Lumina Home",
    metric: "10hrs/wk Saved"
  },
  {
    quote: "The SEO optimizations alone are staggering. It noticed a trending aesthetic on TikTok, rewrote our product descriptions to match, and our organic traffic spiked 40%.",
    author: "Elena Rodriguez",
    role: "CMO, Velvet & Stone",
    metric: "+40% Organic Traffic"
  }
];

export function Testimonials() {
  return (
    <section className="py-24 bg-background overflow-hidden relative">
      <div className="absolute top-1/2 left-0 w-full h-[500px] -translate-y-1/2 bg-primary/5 blur-[120px] rounded-full pointer-events-none"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Trusted by the fastest growing merchants
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="p-8 rounded-2xl bg-card border border-border flex flex-col"
            >
              <div className="mb-6 inline-block px-3 py-1 rounded bg-primary/10 text-primary text-sm font-semibold">
                {testimonial.metric}
              </div>
              <p className="text-lg text-foreground/90 italic leading-relaxed mb-8 flex-1">
                "{testimonial.quote}"
              </p>
              <div>
                <div className="font-semibold text-foreground">{testimonial.author}</div>
                <div className="text-sm text-muted-foreground">{testimonial.role}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}