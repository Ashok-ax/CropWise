import Link from 'next/link';
import {
  Sprout,
  CloudSun,
  Brain,
  Calculator,
  LandPlot,
  BookOpen,
  Wallet,
  Bell,
  Layers,
  Droplets,
  ShieldCheck,
  Fish,
  Egg,
  Milk,
  ArrowRight,
  CheckCircle2,
  Quote,
  Leaf,
} from 'lucide-react';

import { PublicHeader } from '@/components/public/public-header';
import { PublicFooter } from '@/components/public/public-footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const features = [
  { icon: LandPlot, title: 'Your Farm, Digitized', desc: 'Land, soil, water, crops, animals — everything about your farm in one place, so every recommendation actually fits your reality.' },
  { icon: Brain, title: 'Crop Recommendations', desc: 'No black-box guessing. See exactly why a crop matches your soil, water and budget.' },
  { icon: Calculator, title: 'Test Before You Invest', desc: 'See what a crop switch actually costs and earns before you buy a single seed.' },
  { icon: CloudSun, title: 'Weather That Tells You What To Do', desc: 'Not just "rain tomorrow" — real farming advice for your crop, your stage, your risk.' },
  { icon: Wallet, title: 'Know Your Real Profit', desc: 'Track every expense and every rupee earned, per crop or per animal, with charts that make sense.' },
  { icon: Bell, title: "Today's Farm", desc: 'One list, every morning: what needs watering, what needs vaccinating, what deadline is coming.' },
  { icon: Brain, title: 'CropWise AI', desc: 'Ask a real question, get a real answer — one that already knows your soil, water and crops.' },
  { icon: ShieldCheck, title: 'Government Schemes, Simplified', desc: 'Real schemes, real eligibility rules, real sources — no more guessing what you qualify for.' },
];

const farmingCategories = [
  { icon: Sprout, label: 'Crops', desc: 'Cereals, pulses, oilseeds, cash crops' },
  { icon: Leaf, label: 'Vegetables & Fruits', desc: 'Tomato, onion, banana, mango' },
  { icon: Milk, label: 'Dairy', desc: 'Cattle, buffalo, milk production' },
  { icon: Egg, label: 'Poultry', desc: 'Layers, broilers, egg production' },
  { icon: Layers, label: 'Livestock', desc: 'Goats, sheep, cattle, pigs' },
  { icon: Fish, label: 'Fisheries', desc: 'Ponds, fish species, water quality' },
  { icon: Droplets, label: 'Irrigation', desc: 'Drip, sprinkler, canal, rainfed' },
  { icon: LandPlot, label: 'Mixed Farming', desc: 'Run multiple activities together' },
];

const steps = [
  { num: '01', title: 'Register & onboard', desc: 'A 4-step guided flow captures your farming type, land, soil, water and budget.' },
  { num: '02', title: 'Build your farm', desc: 'Add crops, animals, poultry or fish ponds. Edit anytime from My Farm.' },
  { num: '03', title: 'Get recommendations', desc: 'Receive crop matches, weather advice, reminders and Today\'s Farm actions.' },
  { num: '04', title: 'Decide & track', desc: 'Use the Simulator to compare options, then track expenses and profit.' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />

      {/* Hero */}
      <section className="relative overflow-hidden bg-hero-pattern">
        <div className="absolute inset-0 bg-grid-pattern opacity-60" />
        <div className="container relative mx-auto px-4 py-16 md:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="animate-slide-up">
              <Badge variant="secondary" className="mb-4 gap-1.5">
                <Leaf size={14} /> Built for every kind of farmer
              </Badge>
              <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-foreground text-balance sm:text-5xl lg:text-6xl">
                Stop guessing{' '}
                <span className="text-primary">what to plant.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg text-muted-foreground text-balance">
                See what your soil, water, and budget can actually grow — before you spend
                a single rupee. CropWise turns your farm&apos;s real data into decisions you can trust.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="gap-2">
                  <Link href="/register">Start Your Farm Journey <ArrowRight size={18} /></Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/#features">Explore CropWise</Link>
                </Button>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-primary" /> Free to start</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-primary" /> Works on mobile</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-primary" /> Your data stays private</span>
              </div>
            </div>

            <div className="relative animate-fade-in">
              <div className="grid grid-cols-2 gap-4">
                <Card className="col-span-2 border-primary/20 bg-primary/5">
                  <CardContent className="flex items-center gap-4 p-5">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                      <CloudSun size={24} />
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">Weather Today</p>
                      <p className="text-xs text-muted-foreground">Rain expected tomorrow. Consider postponing irrigation.</p>
                    </div>
                    <Badge className="bg-warning/15 text-warning-foreground">Action</Badge>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-5">
                    <Sprout className="mb-2 text-primary" size={20} />
                    <p className="text-xs text-muted-foreground">Crop stage</p>
                    <p className="text-sm font-semibold text-foreground">Flowering</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-5">
                    <Wallet className="mb-2 text-primary" size={20} />
                    <p className="text-xs text-muted-foreground">Net profit (est.)</p>
                    <p className="text-sm font-semibold text-success">+ Rs 18,500</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-5">
                    <Bell className="mb-2 text-primary" size={20} />
                    <p className="text-xs text-muted-foreground">Reminder</p>
                    <p className="text-sm font-semibold text-foreground">Cow vaccination</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-5">
                    <Brain className="mb-2 text-primary" size={20} />
                    <p className="text-xs text-muted-foreground">CropWise AI</p>
                    <p className="text-sm font-semibold text-foreground">Ask anything</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What is CropWise */}
      <section className="border-y border-border bg-muted/20 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Most farming apps just give you information.
            </h2>
            <p className="mt-4 text-lg text-muted-foreground text-balance">
              CropWise looks at your actual land — your soil test, your water source, your
              budget — and tells you what will really work for you. Whether you grow rice,
              raise cattle, or run fish ponds, it&apos;s your farm&apos;s real numbers driving every
              recommendation, not generic advice.
            </p>
          </div>
          <div className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-3">
            {[
              { icon: Brain, title: 'Decision-first', desc: 'Recommendations and simulators, not just articles.' },
              { icon: ShieldCheck, title: 'Transparent', desc: 'Estimates are clearly labeled. Sources shown.' },
              { icon: Layers, title: 'Multi-activity', desc: 'Crops + dairy + poultry + fish under one account.' },
            ].map((c) => (
              <Card key={c.title}>
                <CardContent className="p-6 text-center">
                  <c.icon className="mx-auto mb-3 text-primary" size={28} />
                  <h3 className="font-semibold text-foreground">{c.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{c.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">From confused to confident in 4 steps</h2>
            <p className="mt-4 text-muted-foreground">No jargon, no guesswork — just your farm's real data working for you.</p>
          </div>
          <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-4">
            {steps.map((s) => (
              <Card key={s.num} className="relative">
                <CardContent className="p-6">
                  <span className="font-display text-3xl font-bold text-primary/30">{s.num}</span>
                  <h3 className="mt-2 font-semibold text-foreground">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-y border-border bg-muted/20 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">What you get on Day One</h2>
            <p className="mt-4 text-muted-foreground">No waiting, no setup fees — everything below is ready the moment you sign up.</p>
          </div>
          <div className="mx-auto mt-12 grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <Card key={f.title} className="transition-shadow hover:shadow-md">
                <CardContent className="p-6">
                  <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <f.icon size={22} />
                  </span>
                  <h3 className="font-semibold text-foreground">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Farming categories */}
      <section id="farming" className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Farming Activities We Support</h2>
            <p className="mt-4 text-muted-foreground">One platform, every kind of farm.</p>
          </div>
          <div className="mx-auto mt-12 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {farmingCategories.map((c) => (
              <Card key={c.label} className="text-center">
                <CardContent className="p-6">
                  <c.icon className="mx-auto mb-3 text-primary" size={26} />
                  <h3 className="font-semibold text-foreground">{c.label}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{c.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* AI assistant */}
      <section id="ai-assistant" className="border-y border-border bg-muted/20 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <Badge variant="secondary" className="mb-4"><Brain size={14} className="mr-1" /> CropWise AI</Badge>
              <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Ask CropWise AI anything</h2>
              <p className="mt-4 text-muted-foreground">
                The assistant understands your farm context — soil, water, crops, animals — and
                answers in plain language. It uses retrieval-augmented generation from trusted
                agricultural knowledge, and clearly flags uncertainty.
              </p>
              <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2"><CheckCircle2 size={18} className="shrink-0 text-primary" /> Uses your farm profile as context</li>
                <li className="flex gap-2"><CheckCircle2 size={18} className="shrink-0 text-primary" /> Suggests &quot;possible issue&quot; instead of definitive diagnosis</li>
                <li className="flex gap-2"><CheckCircle2 size={18} className="shrink-0 text-primary" /> Recommends consulting professionals for medical/veterinary issues</li>
                <li className="flex gap-2"><CheckCircle2 size={18} className="shrink-0 text-primary" /> All financial figures labeled as estimates</li>
              </ul>
            </div>
            <Card className="border-primary/20">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="ml-auto max-w-[80%] rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground">
                    I have 2 acres of red soil and limited water. What can I grow?
                  </div>
                  <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-muted px-4 py-2.5 text-sm text-foreground">
                    Based on your red soil and limited water, groundnut, Bengal gram and mango
                    are strong matches — all are low-water crops suited to red/sandy soils.
                    Groundnut: est. investment Rs 22,000/ac, est. revenue Rs 50,000/ac (medium risk).
                    Would you like a full comparison in the Farm Simulator?
                  </div>
                  <p className="text-right text-xs text-muted-foreground">CropWise AI — guidance, not guaranteed advice</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Farm Simulator */}
      <section id="simulator" className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <Card className="order-2 lg:order-1">
              <CardHeader>
                <CardTitle className="text-base">Compare options — example</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-4 gap-2 rounded-lg bg-muted/50 p-3 text-xs font-medium text-muted-foreground">
                  <span>Crop</span><span>Investment</span><span>Revenue</span><span>Risk</span>
                </div>
                {[
                  { crop: 'Cotton', inv: 'Rs 35k', rev: 'Rs 80k', risk: 'High', riskClass: 'text-destructive' },
                  { crop: 'Groundnut', inv: 'Rs 22k', rev: 'Rs 50k', risk: 'Medium', riskClass: 'text-warning' },
                  { crop: 'Bengal Gram', inv: 'Rs 16k', rev: 'Rs 42k', risk: 'Low', riskClass: 'text-success' },
                ].map((r) => (
                  <div key={r.crop} className="grid grid-cols-4 gap-2 rounded-lg p-3 text-sm hover:bg-muted/40">
                    <span className="font-medium text-foreground">{r.crop}</span>
                    <span className="text-muted-foreground">{r.inv}/ac</span>
                    <span className="text-muted-foreground">{r.rev}/ac</span>
                    <span className={r.riskClass}>{r.risk}</span>
                  </div>
                ))}
                <p className="pt-2 text-xs text-muted-foreground">All values are estimates based on available data. Not guaranteed.</p>
              </CardContent>
            </Card>
            <div className="order-1 lg:order-2">
              <Badge variant="secondary" className="mb-4"><Calculator size={14} className="mr-1" /> Unique feature</Badge>
              <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Farm Simulator</h2>
              <p className="mt-4 text-muted-foreground">
                Enter your land, soil, water and budget. The simulator compares multiple farming
                options side by side — investment, revenue, profit, water need and risk. Run
                What-If scenarios: what if rainfall drops? what if fertilizer prices rise? what if
                market price falls?
              </p>
              <p className="mt-4 text-sm font-medium text-foreground">Results are clearly labeled as estimates, not guarantees.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Today's farm */}
      <section className="border-y border-border bg-muted/20 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <Badge variant="secondary" className="mb-4"><Bell size={14} className="mr-1" /> Daily action center</Badge>
              <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Today on My Farm</h2>
              <p className="mt-4 text-muted-foreground">
                A personalized daily digest that combines weather, crop stage, irrigation,
                fertilizer schedule, reminders, animal care and government deadlines into
                actionable cards — so you know exactly what to do today.
              </p>
            </div>
            <div className="space-y-3">
              {[
                { icon: CloudSun, title: 'Rain expected tomorrow', desc: 'Consider reviewing irrigation plans.', tone: 'warning' },
                { icon: Sprout, title: 'Crop entering flowering stage', desc: 'Check crop-specific management guidance.', tone: 'primary' },
                { icon: Bell, title: 'Cow vaccination reminder', desc: 'Due tomorrow.', tone: 'primary' },
                { icon: ShieldCheck, title: 'Govt. scheme deadline', desc: 'PM-KISAN verification pending.', tone: 'warning' },
              ].map((c, i) => (
                <Card key={i}>
                  <CardContent className="flex items-center gap-4 p-4">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <c.icon size={20} />
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">{c.title}</p>
                      <p className="text-xs text-muted-foreground">{c.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Government schemes */}
      <section id="schemes" className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Government Schemes</h2>
            <p className="mt-4 text-muted-foreground">Real schemes, verified sources, clear eligibility.</p>
          </div>
          <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-3">
            {[
              { name: 'PM-KISAN', desc: 'Income support of Rs 6,000/year for small & marginal farmers.', tag: 'Income support' },
              { name: 'PMFBY', desc: 'Subsidized crop insurance against natural calamities & pests.', tag: 'Insurance' },
              { name: 'Soil Health Card', desc: 'Free soil testing with fertilizer recommendations every 2 years.', tag: 'Soil health' },
            ].map((s) => (
              <Card key={s.name}>
                <CardContent className="p-6">
                  <Badge variant="secondary">{s.tag}</Badge>
                  <h3 className="mt-3 font-semibold text-foreground">{s.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="mx-auto mt-6 max-w-2xl text-center text-xs text-muted-foreground">
            Information should be verified with the official government source before applying.
          </p>
        </div>
      </section>

      {/* Testimonials (clearly labeled sample) */}
      <section className="border-y border-border bg-muted/20 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Sample Farmer Stories</h2>
            <p className="mt-4 text-muted-foreground">These are illustrative sample stories, not real testimonials.</p>
          </div>
          <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-3">
            {[
              { name: 'Ramesh, Tamil Nadu', quote: 'The Simulator helped me switch from cotton to groundnut and save water without losing income.', activity: 'Crop farmer' },
              { name: 'Sunita, Maharashtra', quote: 'Tracking milk production and expenses in one app finally showed me my real profit per cow.', activity: 'Dairy farmer' },
              { name: 'Bhaskar, Andhra Pradesh', quote: 'CropWise AI suggested a possible pest issue early. My local vet confirmed it.', activity: 'Mixed farmer' },
            ].map((t) => (
              <Card key={t.name}>
                <CardContent className="p-6">
                  <Quote className="mb-3 text-primary/40" size={24} />
                  <p className="text-sm text-foreground">&ldquo;{t.quote}&rdquo;</p>
                  <div className="mt-4 border-t border-border pt-3">
                    <p className="text-sm font-semibold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.activity} — sample content</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <Card className="overflow-hidden border-primary/30 bg-gradient-to-br from-primary/10 via-accent/5 to-background">
            <CardContent className="p-10 text-center md:p-16">
              <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Your next season starts with better data
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-muted-foreground text-balance">
                Stop guessing, start knowing. It's free to start and works on any phone —
                no fancy equipment needed.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Button asChild size="lg" className="gap-2">
                  <Link href="/register">Register now <ArrowRight size={18} /></Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/login">I already have an account</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}