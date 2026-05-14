import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUpRight, Award, Eye, Target, ShieldCheck, Hammer, Sparkles, Truck, Users, Trophy } from "lucide-react";
import { useI18n } from "../lib/contexts";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion";

const iconMap = { Trophy, Goal: Target, Dribbble: Target, CircleDot: Target, Volleyball: Target, Activity: Target, Sprout: Target, Layers: Target };

// ============ ABOUT ============
export function AboutSection() {
    const { t } = useI18n();
    return (
        <section id="about" className="relative py-24 lg:py-32 bg-background" data-testid="about-section">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="relative"
                    >
                        <div className="relative aspect-[4/5] rounded-3xl overflow-hidden">
                            <img
                                src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200"
                                alt="Sports construction"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0B132B]/40 to-transparent" />
                        </div>
                        <div className="absolute -bottom-6 -right-6 w-44 h-44 bg-emerald-brand rounded-2xl p-6 text-[#0B132B] hidden md:flex flex-col justify-end">
                            <div className="font-display text-5xl font-black">12+</div>
                            <div className="text-xs font-bold uppercase tracking-wider mt-1">Years Building Excellence</div>
                        </div>
                        <div className="absolute -top-6 -left-6 w-32 h-32 bg-orange-brand rounded-2xl p-5 text-white hidden md:flex flex-col justify-between rotate-3">
                            <Award className="w-8 h-8" />
                            <div className="text-xs font-bold leading-tight">FIFA · FIBA Certified Partner</div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="text-xs font-bold tracking-[0.25em] text-emerald-brand mb-4">{t.about.tag}</div>
                        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter leading-tight text-balance">
                            {t.about.title}
                        </h2>
                        <p className="mt-6 text-foreground/70 leading-relaxed text-base">{t.about.text}</p>

                        <div className="mt-8 space-y-5">
                            <div className="flex gap-4">
                                <div className="w-12 h-12 grid place-items-center rounded-xl bg-emerald-brand/15 text-emerald-brand flex-shrink-0">
                                    <Eye className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-display font-bold">{t.about.vision_title}</h4>
                                    <p className="text-sm text-foreground/65 mt-1">{t.about.vision}</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-12 h-12 grid place-items-center rounded-xl bg-orange-brand/15 text-orange-brand flex-shrink-0">
                                    <Target className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-display font-bold">{t.about.mission_title}</h4>
                                    <p className="text-sm text-foreground/65 mt-1">{t.about.mission}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

// ============ SERVICES ============
export function ServicesSection({ services }) {
    const { t } = useI18n();
    return (
        <section id="services" className="relative py-24 lg:py-32 bg-secondary/30" data-testid="services-section">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mb-16">
                    <div className="text-xs font-bold tracking-[0.25em] text-emerald-brand mb-4">{t.services.tag}</div>
                    <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter leading-tight text-balance">
                        {t.services.title}
                    </h2>
                    <p className="mt-5 text-foreground/65 text-base">{t.services.subtitle}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    {services.map((svc, i) => {
                        const Icon = iconMap[svc.icon] || Trophy;
                        return (
                            <motion.div
                                key={svc.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: (i % 4) * 0.08 }}
                                className="group relative overflow-hidden rounded-2xl bg-card border border-border hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500"
                                data-testid={`service-card-${svc.slug}`}
                            >
                                <div className="aspect-[4/3] overflow-hidden">
                                    <img src={svc.image} alt={svc.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B132B]/85 via-[#0B132B]/30 to-transparent" />
                                </div>
                                <div className="absolute top-4 left-4 w-11 h-11 grid place-items-center rounded-xl bg-emerald-brand text-[#0B132B]">
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div className="absolute bottom-0 inset-x-0 p-5 text-white">
                                    <div className="text-[10px] font-bold tracking-[0.2em] text-emerald-brand mb-2">{svc.starting_price}</div>
                                    <h3 className="font-display text-lg font-bold leading-tight">{svc.title}</h3>
                                    <p className="text-xs text-white/75 mt-1.5 line-clamp-2">{svc.short_desc}</p>
                                    <Link
                                        to={`/services/${svc.slug}`}
                                        className="inline-flex items-center gap-1 mt-3 text-xs font-bold text-emerald-brand hover:text-white transition-colors"
                                    >
                                        {t.services.cta_detail}
                                        <ArrowUpRight className="w-3.5 h-3.5" />
                                    </Link>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

// ============ WHY CHOOSE US ============
const whyIcons = [Users, ShieldCheck, Award, Target, Truck, Hammer];
export function WhySection() {
    const { t } = useI18n();
    return (
        <section className="relative py-24 lg:py-32 bg-background" data-testid="why-section">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mb-14">
                    <div className="text-xs font-bold tracking-[0.25em] text-emerald-brand mb-4">{t.why.tag}</div>
                    <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter leading-tight text-balance">{t.why.title}</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {t.why.items.map((item, i) => {
                        const Icon = whyIcons[i % whyIcons.length];
                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.06 }}
                                className="group relative bg-card border border-border rounded-2xl p-7 hover:border-emerald-brand/50 hover:shadow-lg transition-all"
                                data-testid={`why-card-${i}`}
                            >
                                <div className="w-12 h-12 grid place-items-center rounded-xl bg-emerald-brand/10 text-emerald-brand mb-5 group-hover:bg-emerald-brand group-hover:text-[#0B132B] transition-colors">
                                    <Icon className="w-5 h-5" />
                                </div>
                                <h3 className="font-display text-lg font-bold leading-tight">{item.title}</h3>
                                <p className="text-sm text-foreground/65 mt-2 leading-relaxed">{item.desc}</p>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

// ============ PROCESS ============
const processIcons = [Eye, Target, Truck, Hammer, Sparkles, ShieldCheck, Award];
export function ProcessSection() {
    const { t } = useI18n();
    return (
        <section id="process" className="relative py-24 lg:py-32 bg-[#0B132B] text-white overflow-hidden" data-testid="process-section">
            <div className="absolute inset-0 grain-overlay" />
            <div className="absolute top-1/3 right-1/4 w-96 h-96 rounded-full bg-emerald-brand/10 blur-3xl" />
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mb-16">
                    <div className="text-xs font-bold tracking-[0.25em] text-emerald-brand mb-4">{t.process.tag}</div>
                    <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter leading-tight text-balance">{t.process.title}</h2>
                    <p className="mt-5 text-white/65 text-base">{t.process.subtitle}</p>
                </div>
                <div className="relative">
                    <div className="absolute left-0 right-0 top-12 h-px bg-gradient-to-r from-transparent via-emerald-brand/40 to-transparent hidden md:block" />
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-6">
                        {t.process.steps.map((step, i) => {
                            const Icon = processIcons[i];
                            return (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.4, delay: i * 0.1 }}
                                    className="relative text-center"
                                    data-testid={`process-step-${i}`}
                                >
                                    <div className="relative mx-auto w-24 h-24 grid place-items-center rounded-full bg-gradient-to-br from-emerald-brand/15 to-transparent border border-emerald-brand/30">
                                        <div className="absolute inset-3 rounded-full bg-[#0B132B] border border-emerald-brand/50 grid place-items-center">
                                            <Icon className="w-7 h-7 text-emerald-brand" />
                                        </div>
                                    </div>
                                    <div className="mt-4 text-[10px] font-bold tracking-[0.2em] text-emerald-brand">STEP {String(i + 1).padStart(2, "0")}</div>
                                    <h4 className="mt-1 font-display font-bold">{step.title}</h4>
                                    <p className="text-xs text-white/55 mt-1.5 leading-relaxed">{step.desc}</p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}

// ============ FAQ ============
export function FaqSection() {
    const { t } = useI18n();
    return (
        <section id="faq" className="relative py-24 lg:py-32 bg-background" data-testid="faq-section">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-14">
                    <div className="text-xs font-bold tracking-[0.25em] text-emerald-brand mb-4">{t.faq.tag}</div>
                    <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter">{t.faq.title}</h2>
                </div>
                <Accordion type="single" collapsible className="space-y-3">
                    {t.faq.items.map((item, i) => (
                        <AccordionItem key={i} value={`item-${i}`} className="border border-border bg-card rounded-xl px-5 data-[state=open]:border-emerald-brand/50 data-[state=open]:shadow-lg">
                            <AccordionTrigger className="font-display font-bold text-left hover:no-underline py-5" data-testid={`faq-q-${i}`}>{item.q}</AccordionTrigger>
                            <AccordionContent className="text-foreground/70 leading-relaxed pb-5">{item.a}</AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </section>
    );
}
