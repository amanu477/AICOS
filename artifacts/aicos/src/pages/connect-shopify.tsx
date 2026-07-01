import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Hexagon, Lock, ShieldCheck, CreditCard, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";

export function ConnectShopifyPage() {
  const [, setLocation] = useLocation();
  const [storeUrl, setStoreUrl] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const handleConnect = () => {
    if (!storeUrl.trim()) return;
    
    setStatus("loading");
    
    // Simulate API call and redirect
    setTimeout(() => {
      setStatus("success");
      setTimeout(() => {
        setLocation("/dashboard");
      }, 1500);
    }, 2000);
  };

  return (
    <div className="min-h-[100dvh] bg-zinc-950 text-zinc-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl text-center">
        
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center mb-8"
        >
          <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center mb-6 shadow-xl">
            <Hexagon className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Connect your Shopify store
          </h1>
          <p className="text-lg text-zinc-400">
            AICOS needs to connect to your Shopify store to analyze your data and start automating tasks.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl mb-8 text-left relative overflow-hidden"
        >
          {/* Steps visualization */}
          <div className="flex justify-between items-center mb-10 relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-zinc-800 z-0"></div>
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold mb-2">
                1
              </div>
              <span className="text-sm font-medium">Authorize</span>
            </div>
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 font-semibold mb-2">
                2
              </div>
              <span className="text-sm font-medium text-zinc-500">Sync Data</span>
            </div>
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 font-semibold mb-2">
                3
              </div>
              <span className="text-sm font-medium text-zinc-500">Grow</span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {status === "idle" && (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
              >
                <div className="space-y-4">
                  <label className="text-sm font-medium text-zinc-300">Your Shopify store URL</label>
                  <div className="flex items-stretch rounded-lg overflow-hidden border border-zinc-700 bg-zinc-950 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
                    <input 
                      type="text"
                      value={storeUrl}
                      onChange={(e) => setStoreUrl(e.target.value)}
                      placeholder="your-store-name"
                      className="flex-1 bg-transparent border-none focus:ring-0 px-4 py-4 text-white outline-none"
                      data-testid="input-shopify-connect-url"
                    />
                    <div className="bg-zinc-900 border-l border-zinc-700 px-4 flex items-center text-zinc-400 font-medium select-none">
                      .myshopify.com
                    </div>
                  </div>
                  
                  <Button 
                    size="lg" 
                    className="w-full py-6 text-lg mt-4" 
                    disabled={!storeUrl.trim()}
                    onClick={handleConnect}
                    data-testid="button-connect-shopify"
                  >
                    Connect Store
                  </Button>
                  
                  <p className="text-center text-sm text-zinc-500 mt-4">
                    We'll redirect you to Shopify to authorize the connection. Takes 30 seconds.
                  </p>
                </div>
              </motion.div>
            )}

            {status === "loading" && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
                className="flex flex-col items-center justify-center py-12"
              >
                <div className="w-12 h-12 border-4 border-zinc-800 border-t-primary rounded-full animate-spin mb-6"></div>
                <h3 className="text-xl font-medium mb-2">Connecting to Shopify...</h3>
                <p className="text-zinc-400">Authenticating with your store.</p>
              </motion.div>
            )}

            {status === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-12"
              >
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Connected!</h3>
                <p className="text-zinc-400">Setting up your AI employee...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap justify-center gap-6 text-sm font-medium text-zinc-500 mb-12"
        >
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            256-bit Encryption
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            Official Shopify Partner
          </div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            No Credit Card Required
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Button 
            variant="link" 
            className="text-zinc-400 hover:text-white"
            onClick={() => setLocation("/dashboard")}
            data-testid="link-do-later"
          >
            I'll do this later <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </motion.div>

      </div>
    </div>
  );
}