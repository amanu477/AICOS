import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Does AICOS actually make changes to my store automatically?",
    answer: "Yes, but only within the exact guardrails you define. For example, you can tell it 'never drop prices below 30% margin' or 'require manual approval for purchase orders over $5,000'. You have total control over its autonomy."
  },
  {
    question: "How long does it take to set up?",
    answer: "Connecting your Shopify store takes one click. The AI then spends about 15-30 minutes analyzing your historical data, after which it is fully operational. You don't need to build workflows or write prompts."
  },
  {
    question: "Will it mess up my brand voice?",
    answer: "No. During onboarding, AICOS analyzes your existing product descriptions and content to learn your brand voice. It writes SEO updates and content exactly as you or your copywriter would."
  },
  {
    question: "What if it makes a mistake?",
    answer: "Every action AICOS takes is logged in the dashboard. You can instantly revert any change with a single click. Furthermore, the strict margin and brand guardrails prevent critical errors."
  },
  {
    question: "Does it work with platforms other than Shopify?",
    answer: "Currently, AICOS is exclusively built for Shopify and Shopify Plus to ensure the deepest, most reliable integration possible."
  }
];

export function Faq() {
  return (
    <section id="faq" className="py-24 bg-zinc-50 dark:bg-zinc-900/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight mb-4">Frequently Asked Questions</h2>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="bg-background border border-border rounded-lg px-6">
              <AccordionTrigger className="text-left font-medium hover:no-underline hover:text-primary transition-colors">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}