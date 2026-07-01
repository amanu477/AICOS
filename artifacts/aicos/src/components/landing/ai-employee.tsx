import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function AiEmployee() {
  return (
    <section className="py-24 bg-zinc-950 text-zinc-50 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 leading-tight">
              Stop logging into dashboards.<br /> Start reading reports.
            </h2>
            <p className="text-xl text-zinc-400 mb-8 leading-relaxed">
              Software requires you to log in, look at graphs, figure out what they mean, and then take action. 
              <br /><br />
              An employee looks at the data, takes the action, and tells you what they did. AICOS is the latter.
            </p>
            
            <div className="flex items-center gap-4 text-zinc-300">
              <div className="flex -space-x-4">
                <Avatar className="border-2 border-zinc-950 w-12 h-12">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <Avatar className="border-2 border-zinc-950 w-12 h-12">
                  <AvatarImage src="https://github.com/vercel.png" />
                  <AvatarFallback>VC</AvatarFallback>
                </Avatar>
              </div>
              <p className="text-sm font-medium">Joined by 2,000+ top Shopify merchants</p>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full"></div>
            <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-zinc-800">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-primary font-bold">AI</span>
                </div>
                <div>
                  <h4 className="font-semibold text-zinc-100">Daily Update</h4>
                  <p className="text-xs text-zinc-500">Today at 8:00 AM</p>
                </div>
              </div>
              
              <div className="space-y-4 text-sm text-zinc-300">
                <p>Morning! Here's what I handled while you were asleep:</p>
                <ul className="space-y-3 pl-2">
                  <li className="flex gap-3">
                    <span className="text-green-500">✓</span>
                    <span>Raised price of <strong>Linen Bed Sheets</strong> by 5% because competitor 'SleepWell' sold out.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-500">✓</span>
                    <span>Rewrote 12 product descriptions to target the trending keyword "sustainable summer bedding".</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-yellow-500">!</span>
                    <span>Drafted a PO for <strong>Ceramic Mugs</strong> - we'll stock out in 14 days at current velocity. Ready for review.</span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}