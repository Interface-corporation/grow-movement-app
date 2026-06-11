import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, Phone, Send, Loader2, User, QrCode, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAutoSave } from '@/hooks/useAutoSave';

const initial = { name: '', email: '', organisation: '', subject: '', message: '' };

const EMAIL = 'violet@growmovement.org';
const QR_URL = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=10&data=${encodeURIComponent('mailto:' + EMAIL)}`;

export default function Contact() {
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { clearAutoSave } = useAutoSave('contact_page_form', form, setForm);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const mailto = `mailto:${EMAIL}?subject=${encodeURIComponent(form.subject || 'Enquiry from Grow Movement website')}&body=${encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\nOrganisation: ${form.organisation}\n\n${form.message}`)}`;
    window.location.href = mailto;
    await new Promise(r => setTimeout(r, 600));
    toast({ title: 'Opening your email client', description: "We'll be in touch within 1-2 business days." });
    setForm(initial); clearAutoSave(); setLoading(false);
  };

  return (
    <div className="bg-background text-foreground">
      {/* Hero */}
<section className="relative min-h-[75vh] flex items-center justify-center overflow-hidden text-white">

  {/* Background image */}
  <motion.div
    className="absolute inset-0"
    initial={{ scale: 1.05 }}
    animate={{
      scale: [1.05, 1.12, 1.05],
      x: [0, -20, 0],
      y: [0, -10, 0],
    }}
    transition={{
      duration: 30,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  >
    <img
      src="/images/growContact2.png"
      alt="Grow Movement"
      className="w-full h-full object-cover"
    />
  </motion.div>

  {/* Main cinematic overlay */}
  <div
    className="absolute inset-0"
    style={{
      background: `
        radial-gradient(
          circle at center,
          rgba(11,31,58,0.35) 0%,
          rgba(11,31,58,0.55) 45%,
          rgba(11,31,58,0.78) 100%
        )
      `,
    }}
  />

  {/* Bottom fade */}
  <div className="absolute inset-0 bg-gradient-to-t from-grow-navy/85 via-grow-navy/20 to-grow-navy/40" />

  {/* Ambient animated light */}
  <motion.div
    className="absolute w-[700px] h-[700px] rounded-full blur-3xl"
    style={{
      background:
        "radial-gradient(circle, rgba(255,193,108,0.20), transparent 70%)",
      top: "-200px",
      right: "-150px",
    }}
    animate={{
      scale: [1, 1.15, 1],
      x: [0, 30, 0],
      y: [0, -20, 0],
    }}
    transition={{
      duration: 16,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  />

  {/* Coral glow */}
  <motion.div
    className="absolute w-[500px] h-[500px] rounded-full blur-3xl"
    style={{
      background:
        "radial-gradient(circle, rgba(239,109,88,0.18), transparent 70%)",
      bottom: "-150px",
      left: "-100px",
    }}
    animate={{
      scale: [1, 1.25, 1],
      rotate: [0, 20, 0],
    }}
    transition={{
      duration: 20,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  />

  {/* Content */}
  <div className="container mx-auto px-6 lg:px-8 relative z-10 max-w-4xl text-center">

    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.9,
        ease: "easeOut",
      }}
    >
      <span className="text-sm font-semibold tracking-[0.35em] text-grow-gold uppercase">
        Contact
      </span>

      <h1
        className="font-display text-5xl md:text-7xl font-bold mt-6 text-grow-cream mb-6 leading-tight"
        style={{
          textShadow:
            "0 4px 30px rgba(0,0,0,0.45)",
        }}
      >
        Get in touch
      </h1>

      <p
        className="text-lg md:text-2xl text-white/90 leading-relaxed max-w-3xl mx-auto"
        style={{
          textShadow:
            "0 2px 20px rgba(0,0,0,0.4)",
        }}
      >
        Get in touch to discuss partnership, volunteering,
        mentoring, sponsorship, grant-making, investment,
        or entrepreneur support opportunities.
      </p>
    </motion.div>

  </div>

</section>

      {/* Contact info + form */}
      <section className="py-20">
        <div className="container mx-auto px-6 lg:px-8 max-w-6xl">
          <div className="grid lg:grid-cols-5 gap-10">
            {/* Info card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6 }}
              className="lg:col-span-2 bg-card border border-border rounded-3xl p-8 shadow-lg h-fit"
            >
              <div className="flex items-center gap-3 mb-1">
                <User className="h-5 w-5 text-grow-coral" />
                <span className="text-xs font-semibold uppercase tracking-widest text-grow-coral">Primary contact</span>
              </div>
              <h3 className="font-display text-2xl font-bold mb-1">Violet Busingye</h3>
              <p className="text-muted-foreground mb-6">Co-Founder, Grow Movement</p>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-grow-coral mt-0.5 shrink-0" />
                  <a href={`mailto:${EMAIL}`} className="text-sm hover:text-primary break-all">{EMAIL}</a>
                </li>
                <li className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-grow-teal mt-0.5 shrink-0" />
                  <a href="tel:+447943592369" className="text-sm hover:text-primary">+44 (0) 7943 592 369</a>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-grow-gold mt-0.5 shrink-0" />
                  <span className="text-sm leading-relaxed">86–90 Paul Street<br />London, England EC2A 4NE<br />United Kingdom</span>
                </li>
              </ul>

              <div className="border-t border-border pt-6">
                <div className="flex items-center gap-2 mb-3">
                  <QrCode className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Scan to email</span>
                </div>
                <div className="flex items-center gap-4">
                  <img src={QR_URL} alt={`QR code to email ${EMAIL}`} className="w-28 h-28 rounded-lg border border-border bg-white p-1" loading="lazy" />
                  <a href={`mailto:${EMAIL}`} className="text-sm text-primary hover:underline inline-flex items-center gap-1">
                    Open email <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Form */}
            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}
              className="lg:col-span-3 bg-card border border-border rounded-3xl p-8 md:p-10 shadow-lg space-y-5"
            >
              <h2 className="font-display text-2xl md:text-3xl font-bold">Send an enquiry</h2>
              <p className="text-muted-foreground text-sm -mt-2">We typically respond within 1–2 business days.</p>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="mb-1.5 block">Full name *</Label>
                  <Input id="name" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="email" className="mb-1.5 block">Email *</Label>
                  <Input id="email" type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                </div>
              </div>
              <div>
                <Label htmlFor="org" className="mb-1.5 block">Organisation</Label>
                <Input id="org" value={form.organisation} onChange={e => setForm({ ...form, organisation: e.target.value })} placeholder="Company, foundation, university..." />
              </div>
              <div>
                <Label htmlFor="subject" className="mb-1.5 block">Subject *</Label>
                <Input id="subject" required value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="Partnership, volunteering, sponsorship..." />
              </div>
              <div>
                <Label htmlFor="message" className="mb-1.5 block">Message *</Label>
                <Textarea id="message" required rows={6} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="Tell us about your interest in working with Grow Movement..." />
              </div>
              <Button type="submit" disabled={loading} size="lg" className="w-full bg-grow-coral hover:bg-grow-coral/90 text-white">
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</> : <><Send className="mr-2 h-4 w-4" /> Send enquiry</>}
              </Button>
            </motion.form>
          </div>
        </div>
      </section>

      {/* Closing message */}
      {/* <section className="py-24 bg-gradient-to-br from-grow-navy via-grow-navy to-grow-coral/40 text-white relative overflow-hidden">
        <motion.div
          className="absolute top-10 left-1/3 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ background: 'radial-gradient(circle, var(--grow-gold), transparent 70%)' }}
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }} transition={{ duration: 18, repeat: Infinity }}
        />
        <div className="container mx-auto px-6 lg:px-8 max-w-4xl text-center relative z-10">
          <motion.p
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9 }}
            className="font-display text-3xl md:text-5xl font-bold leading-tight"
          >
            Together, we don't  fund businesses.
            <br />
            <span className="bg-gradient-to-r from-grow-coral via-grow-gold to-white bg-clip-text text-transparent">
              We unlock potential, strengthen communities,
            </span>
            <br /> and empower the next generation of women entrepreneurs across Africa and Asia.
          </motion.p>
        </div>
      </section> */}
    </div>
  );
}
