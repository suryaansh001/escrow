import { motion } from "framer-motion";
import { ShieldCheck, Fingerprint, Landmark, BadgeCheck } from "lucide-react";

const verifications = [
  { icon: Fingerprint, label: "Aadhaar Verified" },
  { icon: BadgeCheck, label: "PAN Verified" },
  { icon: Landmark, label: "Bank Verified" },
  { icon: ShieldCheck, label: "KYC Complete" },
];

const stats = [
  { value: "₹12.4Cr", label: "Secured in Escrow" },
  { value: "8,240+", label: "Transactions Completed" },
  { value: "99.7%", label: "Fraud Prevention Rate" },
];

const TrustSection = () => {
  return (
    <section className="py-24 bg-secondary/50">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground mb-4">
            Secure. Transparent. Verified.
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-wrap justify-center gap-4 mb-16"
        >
          {verifications.map((v) => (
            <div key={v.label} className="inline-flex items-center gap-2 rounded-full bg-accent/10 border border-accent/20 px-5 py-2.5">
              <v.icon className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium text-accent">{v.label}</span>
            </div>
          ))}
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-bold font-display text-primary mb-2">
                {stat.value}
              </div>
              <p className="text-muted-foreground text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
