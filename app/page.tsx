import Link from "next/link";
import fs from "node:fs";
import path from "node:path";

type DaycareRow = Record<string, string>;

function loadDaycares(): DaycareRow[] {
  const p = path.join(process.cwd(), "data", "daycares.json");
  if (!fs.existsSync(p)) return [];
  const raw = fs.readFileSync(p, "utf8");
  return JSON.parse(raw);
}

function slugify(s: string) {
  return (s || "")
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  MapPin, 
  Search, 
  ShieldCheck, 
  Sparkles, 
  Baby,
  ArrowRight
} from "lucide-react";

export default function HomePage() {
  const daycares = loadDaycares();
  
  // Get city counts
  const cityCounts = new Map<string, number>();
  daycares.forEach((d) => {
    const city = d["CITY"];
    if (city) {
      cityCounts.set(city, (cityCounts.get(city) || 0) + 1);
    }
  });
  
  // Sort by count and get top cities
  const topCities = Array.from(cityCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 24)
    .map(([city, count]) => ({ city, count, slug: slugify(city) }));

  return (
    <div className="flex min-h-screen flex-col">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-primary/10 px-6 py-24 sm:py-32">
        <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 opacity-10 pointer-events-none">
           <Sparkles className="h-64 w-64 text-primary" />
        </div>
        
        <div className="mx-auto max-w-4xl text-center relative z-10">
          <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm font-medium border-primary/20 text-primary-foreground bg-primary/80 backdrop-blur-sm shadow-sm">
             <Sparkles className="mr-2 h-4 w-4 text-accent" /> 
             The #1 Resource for Ohio Parents
          </Badge>
          
          <h1 className="font-serif text-5xl font-bold tracking-tight text-primary sm:text-6xl md:text-7xl">
            Finding Childcare <br className="hidden sm:block" />
            <span className="text-secondary-foreground">Should Be Simple.</span>
          </h1>
          
          <p className="mt-8 text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Browse <strong>{daycares.length.toLocaleString()}</strong> state-licensed daycares, preschools, and early learning centers across <strong>{cityCounts.size}</strong> Ohio cities.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="h-12 border-2 border-primary bg-primary px-8 text-lg font-medium text-primary-foreground hover:bg-primary/90 hover:shadow-lg transition-all w-full sm:w-auto" asChild>
              <Link href="/daycares">
                <Search className="mr-2 h-5 w-5" />
                Find a Daycare
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 text-lg font-medium border-2 text-primary hover:bg-primary/10 w-full sm:w-auto" asChild>
              <Link href="/about">
                Learn More
              </Link>
            </Button>
          </div>
          
          {/* Quick Stats Bar */}
          <div className="mt-16 grid grid-cols-2 gap-8 md:grid-cols-4 border-t border-primary/20 pt-8">
             <div className="flex flex-col items-center">
               <span className="text-3xl font-serif font-bold text-primary">{daycares.length.toLocaleString()}</span>
               <span className="text-sm text-muted-foreground font-medium uppercase tracking-wide">Programs</span>
             </div>
             <div className="flex flex-col items-center">
               <span className="text-3xl font-serif font-bold text-primary">{cityCounts.size}</span>
               <span className="text-sm text-muted-foreground font-medium uppercase tracking-wide">Cities</span>
             </div>
             <div className="flex flex-col items-center">
               <span className="text-3xl font-serif font-bold text-primary">100%</span>
               <span className="text-sm text-muted-foreground font-medium uppercase tracking-wide">Licensed</span>
             </div>
             <div className="flex flex-col items-center">
               <span className="text-3xl font-serif font-bold text-primary">Free</span>
               <span className="text-sm text-muted-foreground font-medium uppercase tracking-wide">For Parents</span>
             </div>
          </div>
        </div>
      </section>

      {/* FEATURES / VALUE PROP */}
      <section className="py-20 bg-card">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl font-bold text-primary mb-4">Why Parents Trust Us</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              We aggregate official state data to help you make informed decisions about your child&apos;s care.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-background border-none shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 rounded-full bg-secondary/20 flex items-center justify-center mb-4 text-secondary-foreground">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <CardTitle className="font-serif text-2xl text-primary">State Licensed</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Every program listed on Ohio Parent Hub is verified against state records. We only show licensed providers to ensure safety and quality standards.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-background border-none shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center mb-4 text-accent-foreground">
                  <MapPin className="h-6 w-6 text-yellow-600" />
                </div>
                <CardTitle className="font-serif text-2xl text-primary">Local Focus</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Search by city to find care right in your neighborhood. From Cleveland to Cincinnati, we cover every corner of the state.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-background border-none shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                  <Baby className="h-6 w-6 text-destructive" />
                </div>
                <CardTitle className="font-serif text-2xl text-primary">All Ages</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  From infant care to preschool and after-school programs. Filter by age group to find the perfect fit for your family&apos;s needs.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* BROWSE BY CITY */}
      <section id="browse-cities" className="py-24 px-6 bg-background">
         <div className="mx-auto max-w-6xl">
           <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
             <div>
               <Badge variant="outline" className="mb-4 border-primary/40 text-primary">Local Communities</Badge>
               <h2 className="font-serif text-4xl font-bold text-foreground">Explore Top Cities</h2>
             </div>
             <Button variant="outline" className="group" asChild>
               <Link href="/cities">
                 View All Cities <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
               </Link>
             </Button>
           </div>
           
           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {topCities.map(({ city, count, slug }) => (
              <Link key={city} href={`/daycares/${slug}`} className="group block h-full">
                <Card className="h-full border-primary/20 bg-card hover:border-primary/50 hover:shadow-md transition-all duration-200 group-hover:-translate-y-1">
                  <CardHeader className="p-5">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="rounded-full bg-primary/10 p-2 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <Badge variant="secondary" className="bg-secondary/20 text-secondary-foreground hover:bg-secondary/30">
                        {count}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg font-serif text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {city}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-5 pt-0">
                    <p className="text-xs text-muted-foreground">
                      View licensed programs &rarr;
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
           </div>
         </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
        {/* Abstract shapes/decoration */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-64 w-64 rounded-full bg-yellow-400/20 blur-3xl"></div>

        <div className="container mx-auto px-6 text-center relative z-10">
          <h2 className="font-serif text-4xl font-bold mb-6 sm:text-5xl">Ready to find the perfect care?</h2>
          <p className="text-primary-foreground/90 text-xl max-w-2xl mx-auto mb-10">
            Join thousands of Ohio parents who trust us to help them find safe, licensed childcare.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
             <Button size="lg" variant="secondary" className="text-lg h-14 px-8 font-semibold text-secondary-foreground shadow-lg hover:shadow-xl hover:bg-secondary/90" asChild>
                <Link href="/daycares">Start Your Search</Link>
             </Button>
          </div>
          <p className="mt-8 text-sm opacity-60">
            Are you a provider? <Link href="/contact" className="underline hover:text-white">Update your listing</Link>
          </p>
        </div>
      </section>
    </div>
  );
}
