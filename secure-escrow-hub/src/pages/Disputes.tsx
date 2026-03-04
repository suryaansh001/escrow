import { motion } from "framer-motion";
import { MessageCircle, Upload, Clock, AlertTriangle, Shield, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DashboardLayout from "@/components/layout/DashboardLayout";

const messages = [
  { from: "buyer", text: "The delivered product doesn't match the agreed specifications.", time: "2:30 PM" },
  { from: "seller", text: "I have shipped the exact product as described. Please check the packaging again.", time: "3:15 PM" },
  { from: "admin", text: "Both parties please upload supporting evidence. Review in progress.", time: "4:00 PM" },
];

const DisputePage = () => {
  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Button asChild variant="ghost" size="sm" className="rounded-xl">
            <Link to="/dashboard"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold font-display text-foreground">Dispute - TXN-004</h1>
            <p className="text-muted-foreground text-sm">Vikram Singh vs. Arjun Mehta</p>
          </div>
          <span className="ml-auto status-badge bg-destructive/10 text-destructive">Under Review</span>
        </div>

        {/* Timeline */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-fintech mb-6">
          <h3 className="text-sm font-semibold font-display text-foreground mb-3">Status</h3>
          <div className="flex items-center gap-2 text-xs">
            {["Raised", "Evidence Submitted", "Under Review", "Resolved"].map((s, i) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${
                  i < 3 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}>{i + 1}</div>
                <span className={i < 3 ? "text-foreground font-medium" : "text-muted-foreground"}>{s}</span>
                {i < 3 && <div className={`flex-1 h-px ${i < 2 ? "bg-primary/40" : "bg-border"}`} />}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Chat */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card-fintech mb-6">
          <h3 className="text-base font-semibold font-display text-foreground mb-4">Discussion</h3>
          <div className="space-y-4 mb-6 max-h-80 overflow-y-auto">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.from === "buyer" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[70%] rounded-2xl px-4 py-3 text-sm ${
                  msg.from === "buyer" ? "bg-primary text-primary-foreground"
                    : msg.from === "admin" ? "bg-accent/10 border border-accent/20 text-foreground"
                    : "bg-muted text-foreground"
                }`}>
                  <p className="text-xs font-medium mb-1 opacity-70 capitalize">{msg.from}</p>
                  <p>{msg.text}</p>
                  <p className="text-[10px] mt-1 opacity-50">{msg.time}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input placeholder="Type a message..." className="rounded-xl flex-1" />
            <Button variant="outline" size="sm" className="rounded-xl shrink-0">
              <Upload className="h-4 w-4" />
            </Button>
            <Button size="sm" className="rounded-xl">Send</Button>
          </div>
        </motion.div>

        <Button variant="outline" className="rounded-xl text-destructive hover:text-destructive">
          <AlertTriangle className="mr-2 h-4 w-4" /> Escalate to Admin
        </Button>
      </div>
    </DashboardLayout>
  );
};

export default DisputePage;
