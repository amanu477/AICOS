import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Hexagon, ArrowLeft, Shirt, Laptop, Leaf, Sparkles, Trophy, Coffee, Diamond, MoreHorizontal, TrendingUp, Clock, Search, Target, Settings, Eye } from "lucide-react";
import { useUser } from "@clerk/react";
import { useLocation } from "wouter";

const COUNTRIES = [
  "United States", "United Kingdom", "Canada", "Australia", "Germany", 
  "France", "Italy", "Spain", "Netherlands", "Brazil", 
  "India", "Mexico", "Japan", "South Korea", "China", 
  "Singapore", "Sweden", "Switzerland", "Norway", "Denmark", 
  "Finland", "New Zealand", "Ireland", "Austria", "Belgium", 
  "Portugal", "Poland", "United Arab Emirates", "South Africa", "Israel"
];

const NICHES = [
  { id: "fashion", label: "Fashion", icon: Shirt },
  { id: "electronics", label: "Electronics", icon: Laptop },
  { id: "home", label: "Home & Garden", icon: Leaf },
  { id: "beauty", label: "Beauty", icon: Sparkles },
  { id: "sports", label: "Sports", icon: Trophy },
  { id: "food", label: "Food", icon: Coffee },
  { id: "jewelry", label: "Jewelry", icon: Diamond },
  { id: "other", label: "Other", icon: MoreHorizontal },
];

const GOALS = [
  { id: "revenue", label: "Increase Revenue", icon: TrendingUp },
  { id: "time", label: "Save Time", icon: Clock },
  { id: "products", label: "Find Better Products", icon: Search },
  { id: "seo", label: "Improve SEO", icon: Target },
  { id: "tasks", label: "Automate Tasks", icon: Settings },
  { id: "competitors", label: "Monitor Competitors", icon: Eye },
];

const REVENUE_TIERS = [
  { id: "tier0", label: "Just starting ($0)" },
  { id: "tier1", label: "Early stage ($1 - $10K)" },
  { id: "tier2", label: "Growing ($10K - $50K)" },
  { id: "tier3", label: "Established ($50K - $200K)" },
  { id: "tier4", label: "Scaling ($200K+)" },
];

const CUSTOMER_TAGS = [
  "Gen Z", "Millennials", "Gen X", "Baby Boomers", 
  "Small Businesses", "Enterprises", "Gift Buyers", 
  "Athletes", "Parents", "Students"
];

const EXPERIENCE_LEVELS = [
  { id: "exp0", label: "Just getting started" },
  { id: "exp1", label: "Less than 1 year" },
  { id: "exp2", label: "1-3 years" },
  { id: "exp3", label: "3+ years" },
];

export function OnboardingPage() {
  const { user } = useUser();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<Record<string, any>>({});

  useEffect(() => {
    const savedStep = localStorage.getItem("aicos_onboarding_step");
    const savedAnswers = localStorage.getItem("aicos_onboarding");
    
    if (savedStep) setStep(parseInt(savedStep, 10));
    if (savedAnswers) setAnswers(JSON.parse(savedAnswers));
  }, []);

  const updateAnswers = (key: string, value: any) => {
    const newAnswers = { ...answers, [key]: value };
    setAnswers(newAnswers);
    localStorage.setItem("aicos_onboarding", JSON.stringify(newAnswers));
  };

  const nextStep = () => {
    const next = step + 1;
    setStep(next);
    localStorage.setItem("aicos_onboarding_step", next.toString());
  };

  const prevStep = () => {
    const prev = Math.max(1, step - 1);
    setStep(prev);
    localStorage.setItem("aicos_onboarding_step", prev.toString());
  };

  const finishOnboarding = () => {
    setLocation("/connect-shopify");
  };

  const slideVariants = {
    enter: { x: 50, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -50, opacity: 0 }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">What's your business name?</h2>
              <p className="text-muted-foreground text-sm">This is how you'll appear on the platform</p>
            </div>
            <Input 
              value={answers.businessName || ""} 
              onChange={(e) => updateAnswers("businessName", e.target.value)}
              placeholder="e.g. Acme Clothing Co."
              className="text-lg py-6"
              autoFocus
              data-testid="input-business-name"
            />
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">What would you like to name your AICOS store?</h2>
            </div>
            <Input 
              value={answers.storeName || ""} 
              onChange={(e) => updateAnswers("storeName", e.target.value)}
              placeholder="e.g. My Fashion Store"
              className="text-lg py-6"
              autoFocus
              data-testid="input-store-name"
            />
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">What's your Shopify store URL?</h2>
              <p className="text-muted-foreground text-sm">We'll use this to connect your store</p>
            </div>
            <div className="flex items-center space-x-2">
              <Input 
                value={answers.shopifyUrl || ""} 
                onChange={(e) => updateAnswers("shopifyUrl", e.target.value)}
                placeholder="your-store-name"
                className="text-lg py-6"
                autoFocus
                data-testid="input-shopify-url"
              />
              <span className="text-muted-foreground font-medium bg-zinc-900 px-4 py-3 rounded-md border border-zinc-800">
                .myshopify.com
              </span>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">Where is your business based?</h2>
            </div>
            <Select 
              value={answers.country} 
              onValueChange={(val) => updateAnswers("country", val)}
            >
              <SelectTrigger className="text-lg py-6" data-testid="select-country">
                <SelectValue placeholder="Select a country" />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      case 5:
        return (
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold mb-4">What does your store sell?</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {NICHES.map(niche => {
                const Icon = niche.icon;
                const isSelected = answers.niche === niche.id;
                return (
                  <button
                    key={niche.id}
                    onClick={() => updateAnswers("niche", niche.id)}
                    data-testid={`card-niche-${niche.id}`}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
                      isSelected ? "border-primary bg-primary/10" : "border-border hover:border-zinc-500 bg-zinc-900/50"
                    }`}
                  >
                    <Icon className={`w-8 h-8 mb-2 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                    <span className={`text-sm font-medium ${isSelected ? "text-primary" : "text-foreground"}`}>{niche.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">What are you hoping to achieve with AICOS?</h2>
              <p className="text-muted-foreground text-sm">Select up to 3</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {GOALS.map(goal => {
                const Icon = goal.icon;
                const selected = answers.goals || [];
                const isSelected = selected.includes(goal.id);
                return (
                  <button
                    key={goal.id}
                    onClick={() => {
                      if (isSelected) {
                        updateAnswers("goals", selected.filter((id: string) => id !== goal.id));
                      } else if (selected.length < 3) {
                        updateAnswers("goals", [...selected, goal.id]);
                      }
                    }}
                    data-testid={`card-goal-${goal.id}`}
                    className={`flex items-center p-4 rounded-xl border transition-all text-left ${
                      isSelected ? "border-primary bg-primary/10" : "border-border hover:border-zinc-500 bg-zinc-900/50"
                    } ${!isSelected && selected.length >= 3 ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <Icon className={`w-5 h-5 mr-3 shrink-0 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                    <span className={`text-sm font-medium ${isSelected ? "text-primary" : "text-foreground"}`}>{goal.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      case 7:
        return (
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold mb-4">What's your current monthly revenue?</h2>
            </div>
            <div className="space-y-2">
              {REVENUE_TIERS.map(tier => {
                const isSelected = answers.revenue === tier.id;
                return (
                  <button
                    key={tier.id}
                    onClick={() => updateAnswers("revenue", tier.id)}
                    data-testid={`card-revenue-${tier.id}`}
                    className={`w-full flex items-center p-4 rounded-xl border transition-all text-left ${
                      isSelected ? "border-primary bg-primary/10" : "border-border hover:border-zinc-500 bg-zinc-900/50"
                    }`}
                  >
                    <span className={`text-sm font-medium ${isSelected ? "text-primary" : "text-foreground"}`}>{tier.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      case 8:
        return (
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">Who are your target customers?</h2>
              <p className="text-muted-foreground text-sm">Select up to 3</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {CUSTOMER_TAGS.map(tag => {
                const selected = answers.customers || [];
                const isSelected = selected.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => {
                      if (isSelected) {
                        updateAnswers("customers", selected.filter((t: string) => t !== tag));
                      } else if (selected.length < 3) {
                        updateAnswers("customers", [...selected, tag]);
                      }
                    }}
                    data-testid={`tag-customer-${tag.replace(/\s+/g, '-').toLowerCase()}`}
                    className={`px-4 py-2 rounded-full border transition-all text-sm font-medium ${
                      isSelected ? "border-primary bg-primary text-primary-foreground" : "border-border bg-zinc-900 hover:bg-zinc-800 text-foreground"
                    } ${!isSelected && selected.length >= 3 ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>
        );
      case 9:
        return (
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold mb-4">How long have you been running your Shopify store?</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {EXPERIENCE_LEVELS.map(exp => {
                const isSelected = answers.experience === exp.id;
                return (
                  <button
                    key={exp.id}
                    onClick={() => updateAnswers("experience", exp.id)}
                    data-testid={`card-exp-${exp.id}`}
                    className={`flex items-center justify-center p-4 rounded-xl border transition-all ${
                      isSelected ? "border-primary bg-primary/10" : "border-border hover:border-zinc-500 bg-zinc-900/50"
                    }`}
                  >
                    <span className={`text-sm font-medium text-center ${isSelected ? "text-primary" : "text-foreground"}`}>{exp.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      case 10:
        return (
          <div className="space-y-6 text-center">
            <div className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-6">
              <Hexagon className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-3xl font-bold">Ready to connect your store</h2>
            <p className="text-muted-foreground">
              Thanks {user?.firstName || "there"}! We've customized your AICOS experience.
            </p>
            
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-left mt-8 max-w-sm mx-auto">
              <div className="flex justify-between items-center border-b border-zinc-800 pb-3 mb-3">
                <span className="text-zinc-400">Business</span>
                <span className="font-medium text-white">{answers.businessName || "Not set"}</span>
              </div>
              <div className="flex justify-between items-center border-b border-zinc-800 pb-3 mb-3">
                <span className="text-zinc-400">Store Name</span>
                <span className="font-medium text-white">{answers.storeName || "Not set"}</span>
              </div>
              <div className="flex justify-between items-center border-b border-zinc-800 pb-3 mb-3">
                <span className="text-zinc-400">Shopify URL</span>
                <span className="font-medium text-white">{answers.shopifyUrl ? `${answers.shopifyUrl}.myshopify.com` : "Not set"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Country</span>
                <span className="font-medium text-white">{answers.country || "Not set"}</span>
              </div>
            </div>

            <Button size="lg" className="w-full mt-8 py-6 text-lg" onClick={finishOnboarding} data-testid="button-connect-store-summary">
              Connect Your Shopify Store
            </Button>
          </div>
        );
    }
  };

  const isNextDisabled = () => {
    switch (step) {
      case 1: return !answers.businessName?.trim();
      case 2: return !answers.storeName?.trim();
      case 3: return !answers.shopifyUrl?.trim();
      case 4: return !answers.country;
      case 5: return !answers.niche;
      case 6: return !answers.goals || answers.goals.length === 0;
      case 7: return !answers.revenue;
      case 8: return !answers.customers || answers.customers.length === 0;
      case 9: return !answers.experience;
      default: return false;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex font-sans text-zinc-50">
      {/* Left Panel */}
      <div className="hidden md:flex flex-col w-[40%] bg-zinc-900 border-r border-zinc-800 p-8 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-30 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-primary/20 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-zinc-500/20 blur-[100px] rounded-full" />
        </div>

        <div className="flex items-center gap-2 mb-12 relative z-10">
          <Hexagon className="h-8 w-8 text-primary" />
          <span className="font-bold text-xl tracking-tight">AICOS</span>
        </div>

        <div className="flex-1 flex flex-col justify-center relative z-10">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <h1 className="text-4xl font-bold leading-tight">
              Your AI Commerce<br />Employee
            </h1>
            <p className="text-zinc-400 text-lg">
              We're setting up your workspace. Just a few questions to tailor AICOS to your business.
            </p>

            {step > 1 && step < 10 && (
              <div className="mt-12 space-y-4">
                <div className="bg-zinc-950/50 border border-zinc-800/50 p-4 rounded-xl flex items-center gap-4 backdrop-blur-sm">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-zinc-400">Projected Revenue Lift</p>
                    <p className="font-semibold text-white">+23%</p>
                  </div>
                </div>
                
                <div className="bg-zinc-950/50 border border-zinc-800/50 p-4 rounded-xl flex items-center gap-4 backdrop-blur-sm">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <Target className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-zinc-400">SEO Optimization Score</p>
                    <p className="font-semibold text-white">94/100</p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex flex-col items-center justify-center relative p-6">
        {step < 10 && (
          <div className="absolute top-0 left-0 w-full p-6">
            <div className="max-w-xl mx-auto w-full">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {step > 1 && (
                    <Button variant="ghost" size="sm" onClick={prevStep} className="text-zinc-400 hover:text-white" data-testid="button-back">
                      <ArrowLeft className="w-4 h-4 mr-1" /> Back
                    </Button>
                  )}
                </div>
                <div className="text-sm font-medium text-zinc-400">Step {step} of 9</div>
              </div>
              <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-primary"
                  initial={{ width: `${((step - 1) / 9) * 100}%` }}
                  animate={{ width: `${(step / 9) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          </div>
        )}

        <div className="w-full max-w-lg mt-12 md:mt-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="w-full"
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>

          {step < 10 && (
            <div className="mt-8 pt-8">
              <Button 
                size="lg" 
                className="w-full py-6 text-lg" 
                onClick={nextStep}
                disabled={isNextDisabled()}
                data-testid="button-continue"
              >
                Continue
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}