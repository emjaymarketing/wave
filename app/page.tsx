import { AuthButton } from "@/components/auth-button";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Image from "next/image";

async function AuthRedirect() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (roleData?.role === "admin") {
      redirect("/admin");
    } else if (roleData?.role === "client") {
      redirect("/client");
    }
  }

  return null;
}

export default function Home() {
  return (
    <>
      <Suspense fallback={null}>
        <AuthRedirect />
      </Suspense>
      <div className="min-h-screen bg-white text-black">
        <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-black/5 z-50">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="flex items-center">
                <Image
                  src="/wave-logo.png"
                  alt="Wave"
                  width={150}
                  height={50}
                  priority
                />
              </Link>
              <Suspense>
                <AuthButton />
              </Suspense>
            </div>
          </div>
        </nav>

        <main className="pt-16">
          <section className="px-6 lg:px-8 py-24 lg:py-32">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-5xl lg:text-7xl font-semibold tracking-tight leading-tight mb-6 text-black animate-fade-in">
                Marketing that delivers.
                <br />
                <span className="[color:#FFDBAB]">Every time.</span>
              </h1>
              <div className="mt-16 w-full max-w-4xl mx-auto">
                <video autoPlay loop muted playsInline className="w-full">
                  <source src="/wave-vid.mp4" type="video/mp4" />
                </video>
              </div>
              <p className="text-xl lg:text-2xl text-black/60 mb-12 max-w-2xl mx-auto leading-relaxed">
                Wave removes the friction from marketing execution. Clear
                processes, fast timelines, and consistently high standards.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-black hover:bg-black/90 text-white px-8 py-6 text-lg h-auto"
                >
                  See How We Work
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-black/20 hover:bg-black/5 px-8 py-6 text-lg h-auto"
                >
                  Start With a First Project
                </Button>
              </div>
            </div>
          </section>

          <section className="px-6 lg:px-8 py-20 lg:py-28 bg-[#ACD1F8]/10">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl lg:text-5xl font-semibold tracking-tight mb-8 text-center text-black">
                Most marketing feels harder than it should.
              </h2>
              <div className="space-y-6 text-lg lg:text-xl text-black/70 leading-relaxed">
                <p>
                  Quality varies project to project. Timelines stretch without
                  explanation. Too many handoffs create confusion about who owns
                  what.
                </p>
                <p>
                  You need work that's polished, on time, and predictable. Not
                  another vendor relationship that requires constant management.
                </p>
              </div>
            </div>
          </section>

          <section className="px-6 lg:px-8 py-20 lg:py-28">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl lg:text-5xl font-semibold tracking-tight mb-16 text-center text-black">
                A process you can count on.
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                <Card className="p-8 border-black/10 hover:border-[#ACD1F8] transition-colors bg-white">
                  <div className="w-12 h-12 rounded-full bg-[#ACD1F8] mb-6 flex items-center justify-center text-xl font-semibold">
                    1
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-black">
                    Structured Intake
                  </h3>
                  <p className="text-black/60 leading-relaxed">
                    We capture everything upfront. No guessing, no
                    back-and-forth.
                  </p>
                </Card>
                <Card className="p-8 border-black/10 hover:border-[#ACD1F8] transition-colors bg-white">
                  <div className="w-12 h-12 rounded-full bg-[#ACD1F8] mb-6 flex items-center justify-center text-xl font-semibold">
                    2
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-black">
                    Clear Scope
                  </h3>
                  <p className="text-black/60 leading-relaxed">
                    You know exactly what you're getting and when it arrives.
                  </p>
                </Card>
                <Card className="p-8 border-black/10 hover:border-[#ACD1F8] transition-colors bg-white">
                  <div className="w-12 h-12 rounded-full bg-[#ACD1F8] mb-6 flex items-center justify-center text-xl font-semibold">
                    3
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-black">
                    Fast Execution
                  </h3>
                  <p className="text-black/60 leading-relaxed">
                    We move quickly without cutting corners. Quality at speed.
                  </p>
                </Card>
                <Card className="p-8 border-black/10 hover:border-[#ACD1F8] transition-colors bg-white">
                  <div className="w-12 h-12 rounded-full bg-[#ACD1F8] mb-6 flex items-center justify-center text-xl font-semibold">
                    4
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-black">
                    Predictable Reviews
                  </h3>
                  <p className="text-black/60 leading-relaxed">
                    Tight feedback loops. You always know what's next.
                  </p>
                </Card>
              </div>
            </div>
          </section>

          <section className="px-6 lg:px-8 py-20 lg:py-28 bg-black text-white">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl lg:text-5xl font-semibold tracking-tight mb-16 text-center text-white">
                What we deliver.
              </h2>
              <div className="grid md:grid-cols-2 gap-12">
                <div>
                  <h3 className="text-2xl font-semibold mb-4 text-white">
                    Brand & Visual Systems
                  </h3>
                  <p className="text-white/70 leading-relaxed text-lg">
                    Cohesive identities that feel modern and intentional. Built
                    to scale across every touchpoint.
                  </p>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold mb-4 text-white">
                    Paid Media Creative
                  </h3>
                  <p className="text-white/70 leading-relaxed text-lg">
                    Static and video assets designed to perform. Optimized for
                    platforms, built for results.
                  </p>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold mb-4 text-white">
                    Landing Pages & Campaign Assets
                  </h3>
                  <p className="text-white/70 leading-relaxed text-lg">
                    High-converting pages and supporting materials. Clean
                    design, clear messaging, fast delivery.
                  </p>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold mb-4 text-white">
                    Ongoing Optimization
                  </h3>
                  <p className="text-white/70 leading-relaxed text-lg">
                    Continuous iteration based on performance. Your marketing
                    gets better over time.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="px-6 lg:px-8 py-20 lg:py-28">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl lg:text-5xl font-semibold tracking-tight mb-12 text-center text-black">
                Built for speed and quality.
              </h2>
              <div className="space-y-8 text-lg lg:text-xl text-black/70 leading-relaxed">
                <p>
                  Most agencies choose between fast or good. Wave delivers both.
                </p>
                <p>
                  We use modern workflows, tight feedback loops, and high
                  internal standards to move quickly without sacrificing polish.
                  Every deliverable reflects the same level of care and
                  attention.
                </p>
                <p>
                  You get work that looks intentional, arrives on time, and
                  performs from day one.
                </p>
              </div>
            </div>
          </section>

          <section className="px-6 lg:px-8 py-20 lg:py-28 bg-[#FFDBAB]/20">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl lg:text-5xl font-semibold tracking-tight mb-16 text-center text-black">
                Why clients choose Wave.
              </h2>
              <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
                <div className="flex gap-4">
                  <div className="w-2 h-2 rounded-full bg-black mt-2 flex-shrink-0"></div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-black">
                      Clear Communication
                    </h3>
                    <p className="text-black/60 leading-relaxed">
                      You always know where things stand. No surprises, no
                      guessing.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-2 h-2 rounded-full bg-black mt-2 flex-shrink-0"></div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-black">
                      Consistent Results
                    </h3>
                    <p className="text-black/60 leading-relaxed">
                      Every project meets the same high bar. Repeatability you
                      can trust.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-2 h-2 rounded-full bg-black mt-2 flex-shrink-0"></div>
                  <div>
                    <h3 className="text-xl font-semibold mb-3 text-black">
                      Reliable Timelines
                    </h3>
                    <p className="text-black/60 leading-relaxed">
                      We commit to dates and deliver. Your calendar stays
                      predictable.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-2 h-2 rounded-full bg-black mt-2 flex-shrink-0"></div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-black">
                      Polished Work
                    </h3>
                    <p className="text-black/60 leading-relaxed">
                      Everything we ship looks intentional and feels premium.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="px-6 lg:px-8 py-20 lg:py-28">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight mb-12 text-center text-black">
                What clients say.
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                <Card className="p-8 border-black/10 bg-white">
                  <p className="text-lg text-black/70 leading-relaxed mb-6">
                    "Wave delivered exactly what we needed, on time and without
                    drama. It's rare to find a partner this reliable."
                  </p>
                  <div className="text-sm font-semibold text-black">
                    Sarah Chen
                  </div>
                  <div className="text-sm text-black/50">
                    VP Marketing, Series B SaaS
                  </div>
                </Card>
                <Card className="p-8 border-black/10 bg-white">
                  <p className="text-lg text-black/70 leading-relaxed mb-6">
                    "Finally, a team that understands speed and quality aren't
                    mutually exclusive. The work speaks for itself."
                  </p>
                  <div className="text-sm font-semibold text-black">
                    Marcus Rodriguez
                  </div>
                  <div className="text-sm text-black/50">
                    Founder, Growth-Stage Startup
                  </div>
                </Card>
                <Card className="p-8 border-black/10 bg-white">
                  <p className="text-lg text-black/70 leading-relaxed mb-6">
                    "Wave made our rebrand feel effortless. Clear process,
                    beautiful output, zero stress."
                  </p>
                  <div className="text-sm font-semibold text-black">
                    Emily Watson
                  </div>
                  <div className="text-sm text-black/50">
                    CMO, Established Brand
                  </div>
                </Card>
                <Card className="p-8 border-black/10 bg-white">
                  <p className="text-lg text-black/70 leading-relaxed mb-6">
                    "We've worked with a lot of agencies. Wave is the first one
                    that actually does what they say they'll do."
                  </p>
                  <div className="text-sm font-semibold text-black">
                    David Park
                  </div>
                  <div className="text-sm text-black/50">
                    Head of Growth, Tech Company
                  </div>
                </Card>
              </div>
            </div>
          </section>

          <section className="px-6 lg:px-8 py-24 lg:py-32 bg-[#ACD1F8]">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-4xl lg:text-6xl font-semibold tracking-tight mb-6 text-black">
                Ready to work with a team that has their act together?
              </h2>
              <p className="text-xl lg:text-2xl text-black/70 mb-12 leading-relaxed">
                Start with a single project. See how we work. No long-term
                commitment required.
              </p>
              <Button
                size="lg"
                className="bg-black hover:bg-black/90 text-white px-10 py-7 text-lg h-auto"
              >
                Let's Talk About Your Project
              </Button>
            </div>
          </section>

          <footer className="px-6 lg:px-8 py-12 border-t border-black/10">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
              <Link href="/" className="flex items-center">
                <Image src="/wave-logo.png" alt="Wave" width={80} height={28} />
              </Link>
              <div className="flex items-center gap-8 text-sm text-black/60">
                <Link
                  href="/privacy"
                  className="hover:text-black transition-colors"
                >
                  Privacy
                </Link>
                <Link
                  href="/terms"
                  className="hover:text-black transition-colors"
                >
                  Terms
                </Link>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </>
  );
}
