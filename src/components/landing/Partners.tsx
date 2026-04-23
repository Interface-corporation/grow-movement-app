import { motion } from 'framer-motion';

const partners = [
  { name: 'MasterCard Foundation', desc: 'Funds our flagship coaching program reaching 500+ entrepreneurs annually.' },
  { name: 'Google for Startups', desc: 'Provides cloud credits and tech mentorship to our growth-stage cohort.' },
  { name: 'GIZ', desc: 'Strategic partner for capacity building across East Africa and the Sahel.' },
  { name: 'African Development Bank', desc: 'Co-investor in our entrepreneurs through follow-on financing.' },
  { name: 'Stanford Seed', desc: 'Curriculum partner sharing world-class business frameworks.' },
  { name: 'UNDP', desc: 'Supports our women entrepreneurship initiatives across 8 countries.' },
  { name: 'BCG', desc: 'Provides pro-bono strategy consulting to our top-performing ventures.' },
  { name: 'Acumen', desc: 'Co-designs our impact measurement framework for social enterprises.' },
];

export function Partners() {
  return (
    <section id="partners" className="py-24 md:py-32 bg-secondary/40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14 max-w-2xl mx-auto"
        >
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Our Partners</span>
          <h2 className="font-display text-4xl md:text-5xl font-black mt-3 mb-4 leading-tight">
            Trusted by global leaders
          </h2>
          <p className="text-lg text-muted-foreground">
            We partner with the world's most impactful organizations to multiply our reach.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {partners.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="group relative bg-card rounded-2xl border border-border p-6 aspect-[4/3] flex items-center justify-center text-center hover:border-primary/40 hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
            >
              {/* Logo placeholder */}
              <div className="transition-all duration-300 group-hover:opacity-0 group-hover:scale-90">
                <div className="font-display text-lg md:text-xl font-bold text-foreground/60 group-hover:text-foreground">
                  {p.name}
                </div>
              </div>
              {/* Hover description */}
              <div className="absolute inset-0 bg-grow-navy text-white p-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div>
                  <div className="font-display font-bold text-sm md:text-base mb-2 text-primary">{p.name}</div>
                  <p className="text-xs md:text-sm text-white/80 leading-relaxed">{p.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
