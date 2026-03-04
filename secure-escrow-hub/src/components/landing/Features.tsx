import { motion } from "framer-motion";
import { ShieldCheck, UserCheck, AlertTriangle, Milestone, Activity, Scale } from "lucide-react";

const features = [
  { icon: ShieldCheck, title: "Risk-Based Protection Engine", description: "Dynamic risk scoring adapts to each transaction's unique profile in real time." },
  { icon: UserCheck, title: "KYC-Based Trust Scoring", description: "Verified identities build trust scores that unlock lower fees and faster releases." },
  { icon: AlertTriangle, title: "Fraud Likelihood Multiplier", description: "AI-powered fraud detection multiplies risk signals to catch suspicious patterns." },
  { icon: Milestone, title: "Milestone-Based Escrow", description: "Break large transactions into milestones for progressive, secure fund releases." },
  { icon: Activity, title: "Real-Time Status Tracking", description: "Live transaction monitoring with instant notifications at every stage." },
  { icon: Scale, title: "Dispute Resolution Module", description: "Fair, transparent dispute handling with evidence review and arbitration." },
];

const Features = () => {
  return (
    <section className="py-24">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground mb-4">
            Built for Trust & Security
          </h2>
          <p className="text-muted-foreground text-lg max-w-lg mx-auto">
            Enterprise-grade features designed to protect every transaction.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className="card-fintech group"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-base font-semibold font-display text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
