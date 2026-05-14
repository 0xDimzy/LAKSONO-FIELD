import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

export default function WhatsAppButton({ phone = "6281234567890", message = "Halo, saya tertarik dengan jasa Laksono Kontraktor." }) {
    const href = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    return (
        <motion.a
            href={href}
            target="_blank"
            rel="noreferrer"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1.2, type: "spring" }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            className="fixed bottom-6 right-6 z-40 group"
            data-testid="whatsapp-floating"
            aria-label="WhatsApp"
        >
            <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-30" />
            <span className="relative grid place-items-center w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-2xl shadow-emerald-500/50 text-white">
                <MessageCircle className="w-7 h-7" fill="currentColor" />
            </span>
            <span className="absolute right-full top-1/2 -translate-y-1/2 mr-3 px-3 py-1.5 rounded-full bg-foreground text-background text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                Chat WhatsApp
            </span>
        </motion.a>
    );
}
