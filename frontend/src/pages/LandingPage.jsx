import { useEffect, useState } from "react";
import api from "../lib/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Hero from "../components/Hero";
import { AboutSection, ServicesSection, WhySection, ProcessSection, FaqSection } from "../components/Sections";
import { PortfolioSection, TestimonialsSection, BlogPreview } from "../components/Portfolio";
import ContactSection from "../components/ContactSection";
import WhatsAppButton from "../components/WhatsAppButton";

export default function LandingPage() {
    const [data, setData] = useState({ stats: null, services: [], projects: [], testimonials: [], blog: [], settings: null });

    useEffect(() => {
        (async () => {
            try {
                const [stats, services, projects, testimonials, blog, settings] = await Promise.all([
                    api.get("/stats"),
                    api.get("/services"),
                    api.get("/projects"),
                    api.get("/testimonials"),
                    api.get("/blog"),
                    api.get("/settings"),
                ]);
                setData({
                    stats: stats.data,
                    services: services.data,
                    projects: projects.data,
                    testimonials: testimonials.data,
                    blog: blog.data,
                    settings: settings.data,
                });
            } catch (e) {
                console.error("Load data failed", e);
            }
        })();
    }, []);

    return (
        <div className="bg-background text-foreground">
            <Navbar />
            <main>
                <Hero stats={data.stats} />
                <AboutSection />
                <ServicesSection services={data.services} />
                <PortfolioSection projects={data.projects} />
                <WhySection />
                <ProcessSection />
                <TestimonialsSection testimonials={data.testimonials} />
                <BlogPreview posts={data.blog} />
                <FaqSection />
                <ContactSection settings={data.settings} services={data.services} />
            </main>
            <Footer settings={data.settings} />
            <WhatsAppButton phone={data.settings?.whatsapp} />
        </div>
    );
}
