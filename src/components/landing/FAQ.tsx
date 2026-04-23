import { motion } from 'framer-motion';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const faqs = [
  { q: 'Who can apply to the program?', a: 'Anyone running or planning to start a business is welcome to apply. We accept entrepreneurs at every stage — from idea to growth — across all sectors.' },
  { q: 'Is the program free?', a: 'Yes — the coaching program is completely free for selected participants. Our work is funded by partners, donors, and corporate sponsors who believe in our mission.' },
  { q: 'How long does the program last?', a: 'Most cohorts run for 6 months and are structured into multiple guided sessions, with optional follow-up support and alumni community access afterward.' },
  { q: 'What does it take to be a coach?', a: 'We look for professionals with at least 5 years of relevant experience, a passion for mentorship, and 3-5 hours per month to commit to your matched entrepreneur.' },
  { q: 'How are matches made?', a: 'Our team analyzes your goals, sector, and stage, then connects you with the most relevant coach or entrepreneur based on expertise alignment and availability.' },
  { q: 'Do you support entrepreneurs outside Africa?', a: 'Yes. While our roots are in Africa, we now serve entrepreneurs in 15+ countries across Africa, Asia, and beyond.' },
  { q: 'How can my company become a partner?', a: 'Reach out via the contact form below. We offer multiple partnership models including funding, expertise sharing, and co-branded programs.' },
];

export function FAQ() {
  return (
    <section id="faq" className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">FAQ</span>
            <h2 className="font-display text-4xl md:text-5xl font-black mt-3 mb-4 leading-tight">
              Questions, answered
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to know before joining the movement.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((f, i) => (
                <AccordionItem
                  key={i}
                  value={`item-${i}`}
                  className="bg-card border border-border rounded-2xl px-6 hover:border-primary/30 transition-colors data-[state=open]:border-primary/40 data-[state=open]:shadow-md"
                >
                  <AccordionTrigger className="text-left font-semibold text-base md:text-lg py-5 hover:no-underline">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
