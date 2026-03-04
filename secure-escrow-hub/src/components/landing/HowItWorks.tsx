import { motion } from "framer-motion";
import { Upload, Handshake, BadgeCheck } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Buyer Creates Escrow",
    description: "Initiate a secure transaction by setting terms, amount, and counterparty details.",
  },
  {
    icon: Handshake,
    title: "Seller Fulfills Agreement",
    description: "The seller delivers goods or services as per the agreed milestones.",
  },
  {
    icon: BadgeCheck,
    title: "Funds Released Securely",
    description: "Once verified, funds are released instantly. Disputes are handled with transparency.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 bg-secondary/50">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Three simple steps to secure any digital transaction.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="card-fintech text-center relative"
            >
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                {index + 1}
              </div>
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5 mt-2">
                <step.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-lg font-semibold font-display text-foreground mb-2">{step.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
