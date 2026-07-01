import { useEffect, useRef, useState } from "react";
import { ClerkProvider, SignIn, SignUp, Show, useClerk } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { shadcn } from '@clerk/themes';
import { Switch, Route, useLocation, Redirect, Router as WouterRouter } from 'wouter';
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";

// Landing page components (import from their files)
import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { FeatureGrid } from "@/components/landing/feature-grid";
import { AiEmployee } from "@/components/landing/ai-employee";
import { HowItWorks } from "@/components/landing/how-it-works";
import { DashboardPreview } from "@/components/landing/dashboard-preview";
import { AutomationShowcase } from "@/components/landing/automation-showcase";
import { Pricing } from "@/components/landing/pricing";
import { Testimonials } from "@/components/landing/testimonials";
import { Faq } from "@/components/landing/faq";
import { Footer } from "@/components/landing/footer";

// Auth/onboarding pages (you will create these)
import { OnboardingPage } from "@/pages/onboarding";
import { ConnectShopifyPage } from "@/pages/connect-shopify";
import { DashboardPage } from "@/pages/dashboard";
import { ProductsPage } from "@/pages/products";
import { NovaPage } from "@/pages/nova";
import { DiscoveryPage } from "@/pages/discovery";

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
  ? publishableKeyFromHost(
      window.location.hostname,
      import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
    )
  : null;
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

// Build appearance matching the dark AICOS theme
// Color values must be CSS color strings, NOT hsl(var(...)) — use actual values
const clerkAppearance = {
  baseTheme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: "#ffffff",
    colorForeground: "#fafafa",
    colorMutedForeground: "#a1a1aa",
    colorDanger: "#ef4444",
    colorBackground: "#09090b",
    colorInput: "#18181b",
    colorInputForeground: "#fafafa",
    colorNeutral: "#27272a",
    fontFamily: "'Geist', sans-serif",
    borderRadius: "0.5rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-zinc-950 border border-zinc-800 rounded-2xl w-[440px] max-w-full overflow-hidden shadow-2xl",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-white font-semibold",
    headerSubtitle: "text-zinc-400",
    socialButtonsBlockButtonText: "text-white",
    formFieldLabel: "text-zinc-300",
    footerActionLink: "text-white hover:text-zinc-200",
    footerActionText: "text-zinc-500",
    dividerText: "text-zinc-600",
    identityPreviewEditButton: "text-white",
    formFieldSuccessText: "text-emerald-400",
    alertText: "text-white",
    logoBox: "flex justify-center py-2",
    logoImage: "h-8 w-auto",
    socialButtonsBlockButton: "border border-zinc-800 bg-zinc-900 hover:bg-zinc-800",
    formButtonPrimary: "bg-white text-black hover:bg-zinc-100",
    formFieldInput: "bg-zinc-900 border-zinc-700 text-white",
    footerAction: "bg-zinc-900 border-t border-zinc-800",
    dividerLine: "bg-zinc-800",
    alert: "bg-zinc-900 border-zinc-700",
    otpCodeFieldInput: "bg-zinc-900 border-zinc-700 text-white",
    formFieldRow: "",
    main: "",
  },
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60_000, gcTime: 5 * 60_000, retry: 2, refetchOnWindowFocus: false },
  },
});

function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main>
        <Hero />
        <FeatureGrid />
        <AiEmployee />
        <HowItWorks />
        <DashboardPreview />
        <AutomationShowcase />
        <Pricing />
        <Testimonials />
        <Faq />
      </main>
      <Footer />
    </div>
  );
}

function SignInPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
      <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
      <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
    </div>
  );
}

function HomeRedirect() {
  return (
    <>
      <Show when="signed-in"><Redirect to="/onboarding" /></Show>
      <Show when="signed-out"><LandingPage /></Show>
    </>
  );
}

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  return (
    <>
      <Show when="signed-in"><Component /></Show>
      <Show when="signed-out"><Redirect to="/" /></Show>
    </>
  );
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    const unsub = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) qc.clear();
      prevUserIdRef.current = userId;
    });
    return unsub;
  }, [addListener, qc]);
  return null;
}

function AppRoutes() {
  const [, setLocation] = useLocation();

  if (!clerkPubKey) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <LandingPage />
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <ClerkQueryClientCacheInvalidator />
          <Switch>
            <Route path="/" component={HomeRedirect} />
            <Route path="/sign-in/*?" component={SignInPage} />
            <Route path="/sign-up/*?" component={SignUpPage} />
            <Route path="/onboarding" component={() => <ProtectedRoute component={OnboardingPage} />} />
            <Route path="/connect-shopify" component={() => <ProtectedRoute component={ConnectShopifyPage} />} />
            <Route path="/dashboard" component={() => <ProtectedRoute component={DashboardPage} />} />
            <Route path="/dashboard/products" component={() => <ProtectedRoute component={ProductsPage} />} />
            <Route path="/dashboard/:rest*" component={() => <ProtectedRoute component={DashboardPage} />} />
            <Route path="/nova" component={() => <ProtectedRoute component={NovaPage} />} />
            <Route path="/discovery" component={() => <ProtectedRoute component={DiscoveryPage} />} />
          </Switch>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="aicos-theme">
      <WouterRouter base={basePath}>
        <AppRoutes />
      </WouterRouter>
    </ThemeProvider>
  );
}

export default App;