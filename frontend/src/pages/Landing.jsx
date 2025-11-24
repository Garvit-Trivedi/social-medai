import React from "react";
import { Link } from 'react-router-dom';
import demoVideo from "../assets/landin.mp4";
import rigth from "../assets/right-side-image.png";;

import "../App.css";

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#0b0f14] text-[#e6eef3] font-sans">
      

      {/* Top nav (simple) */}
      <header className="sticky top-0 z-20 backdrop-blur supports-[backdrop-filter]:bg-[#0b0f14]/70 border-b border-white/5">
  <div className="w-3xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">

    {/* Left: Logo */}
    <a href="#" className="  absolute left-8 text-2xl font-bold tracking-tight text-white hover:opacity-90">
      Pulse
    </a>

    {/* Center nav (desktop only) */}
    <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#9aa5b1]">
      <a href="#features" className="hover:text-white transition">Features</a>
      <a href="#how" className="hover:text-white transition">How it works</a>
      <a href="#pro" className="hover:text-white transition">Pulse Pro</a>
      <a href="#faq" className="hover:text-white transition">FAQ</a>
    </nav>

    {/* Right: Auth CTAs */}
    <div className="absolute right-8 flex items-center gap-2">
      <Link
        to="/login"
        className="rounded-lg border border-[#2a323a] px-4 py-2 text-sm font-semibold hover:bg-[#0f161b] focus:outline-none focus:ring-2 focus:ring-white/10"
      >
        Log in
      </Link>
      <Link
        to="/signup"
        className="rounded-lg bg-[#ff6b6b] px-4 py-2 text-sm font-semibold text-black shadow-md hover:opacity-90 transition focus:outline-none focus:ring-2 focus:ring-[#ff6b6b]/40"
      >
        Sign up
      </Link>
    </div>

  </div>
</header>
{/* Hero */}
<section id="hero" className="py-16 md:py-24 relative overflow-visible">
  <div className="max-w-6xl mx-auto px-4 md:px-6">
    <div className="grid md:grid-cols-2 gap-10 items-center">
      <div className="z-20">
        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight">
          Frame your moments — elegant, nocturnal, unforgettable.
        </h1>

        <h2 className="mt-4 text-lg md:text-xl text-[#c9d6df]">
          Pulse is a photo-first sanctuary for makers who prefer mood over noise. Share cinematic stills, luminous micro-clips and ephemeral stories that glow in the dark.
        </h2>

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <a
            href="#download"
            className="inline-flex justify-center items-center rounded-md bg-gradient-to-br from-[#b76bff] via-[#ff6b6b] to-[#ff9a8a] px-5 py-3 text-base font-semibold text-black shadow-lg transform transition hover:-translate-y-1 hover:scale-102 focus:outline-none focus:ring-2 focus:ring-[#b76bff]/40"
            aria-label="Download Pulse"
          >
            Get Pulse — It’s free
          </a>

          <button
            type="button"
            className="inline-flex justify-center items-center rounded-md border border-[#2a323a] px-5 py-3 text-base font-medium text-[#e6eef3] hover:bg-[#0f161b] focus:outline-none focus:ring-2 focus:ring-white/10 transition-transform hover:-translate-y-0.5"
            aria-label="Watch demo"
          >
            Watch the cinematic demo
          </button>
        </div>

        <p className="mt-3 text-xs text-[#9aa5b1]">
          iOS & Android • Ad-light feed • Creator-first monetization
        </p>

        <div className="mt-6 flex gap-4 text-sm text-[#9aa5b1]">
          <div className="flex flex-col">
            <span className="text-white font-bold">1M+</span>
            <span>Curators</span>
          </div>
          <div className="flex flex-col">
            <span className="text-white font-bold">4.7★</span>
            <span>Average love</span>
          </div>
          <div className="flex flex-col">
            <span className="text-white font-bold">99.99%</span>
            <span>Reliability</span>
          </div>
        </div>
      </div>

      <div className="relative z-10">
        {/* Purple horizontal wave behind image */}
        <svg
          className="absolute -left-8 -top-6 w-[140%] h-56 md:h-72 lg:h-80 opacity-60"
          viewBox="0 0 1200 200"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="purpleWave" x1="0" x2="1">
              <stop offset="0%" stopColor="#8a2be2" stopOpacity="0.85" />
              <stop offset="60%" stopColor="#b76bff" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#ff6b6b" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          <path
            d="M0,96 C150,160 350,0 600,64 C850,128 1000,32 1200,96 L1200 200 L0 200 Z"
            fill="url(#purpleWave)"
          />
        </svg>

        <div className="relative rounded-2xl p-4 bg-gradient-to-b from-[#0b1014]/80 to-[#071018]/70 border border-[#1a2229] shadow-2xl transform-gpu transition-transform hover:-translate-y-2 hover:scale-[1.01]">
          <div className="aspect-[9/16] rounded-xl bg-gradient-to-b from-black/30 to-black/60 overflow-hidden relative shadow-inner">
            {/* use inline style for background image to ensure compatibility */}
            <div
              className="absolute inset-0 opacity-80 transform transition-transform hover:scale-105 will-change-transform"
              aria-hidden="true"
              style={{
                backgroundImage: "url('/person.png')",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />

            {/* subtle frosted overlay and flair */}
            <div className="absolute inset-0 pointer-events-none">
              <div
                className="absolute -top-8 -right-10 w-36 h-36 rounded-full blur-3xl"
                style={{
                  background:
                    "radial-gradient(circle at 30% 30%, rgba(183,107,255,0.18), transparent 30%)",
                }}
              />
              <div className="absolute -bottom-6 left-4 w-28 h-2 rounded-full opacity-40 bg-gradient-to-r from-[#b76bff] to-[#ff6b6b]" />
            </div>

            <figcaption className="absolute bottom-4 left-4 right-4 text-sm text-[#e6eef3] bg-black/30 backdrop-blur rounded-md px-3 py-2 border border-[#1a2229]">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">Golden hour at Koda Beach</div>
                  <div className="text-xs text-[#c9d6df]">Maya R. — 3.2K likes • 98 comments</div>
                </div>
                <div className="inline-flex items-center gap-2">
                  <span className="text-xs text-[#ffd6c2] font-bold">Featured</span>
                  <button className="rounded-full bg-white/6 px-2 py-1 text-[11px] border border-white/6">Open</button>
                </div>
              </div>
            </figcaption>
          </div>
        </div>

        {/* floating mini-card */}
        <div className="absolute -left-6 -bottom-8 w-36 p-3 rounded-lg bg-[#071018] border border-[#152126] shadow-md transform rotate-2 hover:-rotate-1 transition-all">
          <div className="text-xs text-[#9aa5b1]">New Tools</div>
          <div className="text-sm font-semibold">Enhanced Editor</div>
        </div>
      </div>
    </div>
  </div>

  {/* decorative animated underline + motion styles */}
  <style>{`
    @media (prefers-reduced-motion: no-preference) {
      .hover\\:scale-102:hover { transform: scale(1.02); }
      .shadow-2xl { box-shadow: 0 12px 30px rgba(3,6,10,0.6); }
      .blur-3xl { filter: blur(28px); }
    }

    @keyframes waveShift { 0% { transform: translateX(0); } 50% { transform: translateX(-4%); } 100% { transform: translateX(0); } }
    svg[viewBox][aria-hidden] { animation: waveShift 8s ease-in-out infinite; }
  `}</style>
</section>


{/* Features - flip cards */}
<section id="features" className="py-12 md:py-16">
  <div className="max-w-6xl mx-auto px-4 md:px-6">
    <h2 className="text-2xl font-semibold">Features curated for creators who crave craft</h2>
    <p className="mt-2 text-[#c9d6df]">Every detail is designed to celebrate imagery — from effortless uploads to premium discovery.</p>

    <div className="mt-6 grid md:grid-cols-3 gap-6">
      {/* Card 1 - Gallery-grade feed */}
      <div className="relative group perspective-800 rounded-2xl p-6 bg-gradient-to-br from-[#071018] to-[#071428] border border-transparent shadow-lg hover:shadow-2xl transform-gpu transition hover:-translate-y-3">
        <div
          className="absolute -inset-px rounded-2xl bg-gradient-to-r from-[#b76bff]/40 via-[#ff6b6b]/30 to-[#ff9a8a]/10 opacity-0 group-hover:opacity-100 transition-opacity blur-lg"
          aria-hidden="true"
        />
        <div className="relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#b76bff] to-[#7bd389] flex items-center justify-center text-black font-bold shadow-sm transform transition-transform group-hover:scale-105">
              G
            </div>
            <div>
              <h3 className="text-xl font-semibold">Gallery-grade feed</h3>
              <p className="mt-2 text-[#c9d6df]">
                An immersive, edge-to-edge presentation with filmic aspect ratios — your portfolio, reframed as a curated exhibition.
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-xs text-[#9aa5b1]">Auto-enhanced previews • Tap to expand</div>
            <button className="rounded-md px-3 py-2 bg-[#ff6b6b] text-black font-medium text-sm hover:brightness-95 transition">Explore</button>
          </div>
        </div>

        {/* subtle tilt placeholder (safe no-op) */}
        <div className="absolute inset-0 rounded-2xl" onMouseMove={() => {}} aria-hidden="true" />
      </div>

      {/* Card 2 - Pro-level editor */}
      <div className="relative group perspective-800 rounded-2xl p-6 bg-gradient-to-br from-[#071018] to-[#071428] border border-transparent shadow-lg hover:shadow-2xl transform-gpu transition hover:-translate-y-3">
        <div
          className="absolute -inset-px rounded-2xl bg-gradient-to-r from-[#7bd389]/30 via-[#b76bff]/25 to-[#ff9a8a]/10 opacity-0 group-hover:opacity-100 transition-opacity blur-lg"
          aria-hidden="true"
        />
        <div className="relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#7bd389] to-[#2bd6c8] flex items-center justify-center text-black font-bold shadow-sm transform transition-transform group-hover:scale-105">
              E
            </div>
            <div>
              <h3 className="text-xl font-semibold">Pro-level editor</h3>
              <p className="mt-2 text-[#c9d6df]">
                Color grade like a director — film-stock presets, nondestructive edits, batch workflows and looped micro-clips for cinematic storytelling.
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-xs text-[#9aa5b1]">Presets • Batch edits • Smart auto-tone</div>
            <button className="rounded-md px-3 py-2 bg-[#7bd389] text-black font-medium text-sm hover:brightness-95 transition">Try</button>
          </div>
        </div>

        <div className="absolute inset-0 rounded-2xl" onMouseMove={() => {}} aria-hidden="true" />
      </div>

      {/* Card 3 - Creator-first tools */}
      <div className="relative group perspective-800 rounded-2xl p-6 bg-gradient-to-br from-[#071018] to-[#071428] border border-transparent shadow-lg hover:shadow-2xl transform-gpu transition hover:-translate-y-3">
        <div
          className="absolute -inset-px rounded-2xl bg-gradient-to-r from-[#ff9a8a]/30 via-[#b76bff]/25 to-[#7bd389]/10 opacity-0 group-hover:opacity-100 transition-opacity blur-lg"
          aria-hidden="true"
        />
        <div className="relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#ff9a8a] to-[#ff6b6b] flex items-center justify-center text-black font-bold shadow-sm transform transition-transform group-hover:scale-105">
              C
            </div>
            <div>
              <h3 className="text-xl font-semibold">Creator-first tools</h3>
              <p className="mt-2 text-[#c9d6df]">
                Transparent tipping, pinned collections, inviteable collaborators, and analytics that actually help you grow — not confuse you.
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-xs text-[#9aa5b1]">Analytics • Monetization • Collabs</div>
            <button className="rounded-md px-3 py-2 bg-[#b76bff] text-black font-medium text-sm hover:brightness-95 transition">Join</button>
          </div>
        </div>

        <div className="absolute inset-0 rounded-2xl" onMouseMove={() => {}} aria-hidden="true" />
      </div>
    </div>

    {/* decorative note */}
    <div className="mt-6 text-xs text-[#9aa5b1]">
      All features are handcrafted for creators — privacy-first defaults, low-compression delivery, and delightful micro-interactions.
    </div>
  </div>

  {/* small interactive CSS for perspective and subtle parallax */}
  <style>{`
    .perspective-800 { perspective: 800px; }
    .preserve-3d { transform-style: preserve-3d; }
    @media (prefers-reduced-motion: no-preference) {
      .hover\\:shadow-2xl:hover { box-shadow: 0 20px 40px rgba(2,6,12,0.6); }
    }
  `}</style>
</section>


<section className="py-16">
  {/* Heading + Quote */}
  <div className="text-center mb-10 px-4">
    <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
      Experience the Future in Motion
    </h2>
    <p className="text-gray-300 mt-3 text-lg md:text-xl max-w-2xl mx-auto">
      "Smooth. Fast. Powerful — your ideas deserve visuals that feel alive."
    </p>
  </div>

  {/* Video Section */}
  <div className="relative w-full max-w-none">

    {/* Background Wave */}
    <div className="absolute inset-0 -z-10 bg-gradient-to-b 
      from-purple-700/20 via-transparent to-red-700/20 
      blur-xl opacity-60">
    </div>

    {/* Full-width border section */}
    <div className="overflow-hidden border-t border-b border-[#1a2229]">
      <div className="relative">
        <video
          src={demoVideo}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-80 md:h-96 object-cover"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t 
          from-black/70 via-black/30 to-transparent 
          pointer-events-none">
        </div>
      </div>
    </div>

  </div>
</section>





      {/* Feature deep-dive */}
<section id="deep-dive" className="py-16 md:py-20">
  <div className="max-w-6xl mx-auto px-4 md:px-6 space-y-10">

    <h2 className="text-3xl md:text-4xl font-bold text-center bg-gradient-to-r from-purple-400 to-red-400 bg-clip-text text-transparent">
      Why You’ll Love Our Platform
    </h2>
    <p className="text-center text-[#c9d6df] max-w-2xl mx-auto">
      Designed with discovery, creativity and freedom at the core — everything feels smooth, fast and personal.
    </p>

    <div className="grid md:grid-cols-2 gap-8">

      {/* Card 1 */}
      <div className="bg-[#0f161b] p-6 rounded-2xl border border-[#1a2229] hover:border-purple-500 transition-all duration-300 hover:shadow-lg hover:shadow-purple-600/10">
        <h3 className="text-2xl font-semibold flex items-center gap-2">
          <span className="text-purple-400 text-3xl">✨</span>
          A feed built for discovery
        </h3>
        <p className="mt-3 text-[#c9d6df]">
          Posts you follow + new creators you’ll love — all balanced without chaotic algorithm loops. 
          A feed that feels healthy, not addictive.
        </p>
      </div>

      {/* Card 2 */}
      <div className="bg-[#0f161b] p-6 rounded-2xl border border-[#1a2229] hover:border-blue-500 transition-all duration-300 hover:shadow-lg hover:shadow-blue-600/10">
        <h3 className="text-2xl font-semibold flex items-center gap-2">
          <span className="text-blue-400 text-3xl">🎥</span>
          Moments — your story, your rules
        </h3>
        <p className="mt-3 text-[#c9d6df]">
          Share disappearing stories or save highlights. Autoplay clips blend smoothly in your feed —
          tap to unmute anytime.
        </p>
      </div>

      {/* Card 3 */}
      <div className="bg-[#0f161b] p-6 rounded-2xl border border-[#1a2229] hover:border-red-500 transition-all duration-300 hover:shadow-lg hover:shadow-red-600/10">
        <h3 className="text-2xl font-semibold flex items-center gap-2">
          <span className="text-red-400 text-3xl">💰</span>
          Monetize your craft
        </h3>
        <p className="mt-3 text-[#c9d6df]">
          Unlock tips, subscribers-only posts, pinned content and powerful analytics. 
          Clear payouts, creator-first rewards.
        </p>
      </div>

      {/* Card 4 */}
      <div className="bg-[#0f161b] p-6 rounded-2xl border border-[#1a2229] hover:border-purple-400 transition-all duration-300 hover:shadow-lg hover:shadow-purple-600/10">
        <h3 className="text-2xl font-semibold flex items-center gap-2">
          <span className="text-purple-300 text-3xl">🛡️</span>
          You control your presence
        </h3>
        <p className="mt-3 text-[#c9d6df]">
          Full control of your privacy, audience visibility and filters. 
          Lightning-fast reporting for a safe experience.
        </p>
      </div>

    </div>
  </div>
</section>


      {/* How it works */}
<section id="how" className="py-16 md:py-20">
  <div className="max-w-6xl mx-auto px-4 md:px-6">

    <h3 className="text-3xl md:text-4xl font-bold text-center bg-gradient-to-r from-purple-400 to-red-400 bg-clip-text text-transparent">
      How it works — Just 3 Steps
    </h3>

    <p className="text-center text-[#c9d6df] mt-2 mb-10">
      Start creating in minutes — simple, smooth and beautifully guided.
    </p>

    <div className="grid md:grid-cols-3 gap-10">

      {/* Step 1 */}
      <div className="bg-[#0f161b] rounded-2xl p-6 border border-[#1a2229] hover:border-purple-500 transition-all duration-300 hover:shadow-lg hover:shadow-purple-600/10 text-center">
        <div className="text-4xl mb-4">👤</div>
        <h4 className="text-xl font-semibold text-[#e6eef3]">Create Profile</h4>
        <p className="mt-2 text-[#c9d6df]">
          Choose your username, write a quick bio, and add 3 starter photos.
        </p>
      </div>

      {/* Step 2 */}
      <div className="bg-[#0f161b] rounded-2xl p-6 border border-[#1a2229] hover:border-blue-500 transition-all duration-300 hover:shadow-lg hover:shadow-blue-600/10 text-center">
        <div className="text-4xl mb-4">🎯</div>
        <h4 className="text-xl font-semibold text-[#e6eef3]">Follow Interests</h4>
        <p className="mt-2 text-[#c9d6df]">
          Pick 5 topics you love so we can tailor your Discover feed instantly.
        </p>
      </div>

      {/* Step 3 */}
      <div className="bg-[#0f161b] rounded-2xl p-6 border border-[#1a2229] hover:border-red-500 transition-all duration-300 hover:shadow-lg hover:shadow-red-600/10 text-center">
        <div className="text-4xl mb-4">📸</div>
        <h4 className="text-xl font-semibold text-[#e6eef3]">Post Your First Moment</h4>
        <p className="mt-2 text-[#c9d6df]">
          Use built-in editor tools or upload a clip from your camera roll.
        </p>
      </div>

    </div>

    <div className="mt-8 text-center">
      <a
        href="#download"
        className="inline-flex rounded-xl bg-[#ff6b6b] px-6 py-3 text-black font-semibold shadow-md hover:shadow-red-500/40 transition-all"
      >
        Start your profile
      </a>
    </div>

  </div>
</section>


     {/* Testimonials */}
<section id="testimonials" className="py-12 md:py-16">
  <div className="max-w-6xl mx-auto px-4 md:px-6">

    {/* Soft gradient header */}
    <h3 className="text-2xl font-semibold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-6">
      Loved by creators around the world
    </h3>

    <div className="grid md:grid-cols-3 gap-6">
      {[
        '“Pulse made posting polished photos effortless — my engagement doubled.” — Maya R., Photographer, NYC',
        '“Finally a dark-mode social app that keeps focus on visuals.” — Lars T., Filmmaker, Berlin',
        '“Creator tools are simple and fair. Tip feature actually works.” — Amara P., Content Creator, Lagos'
      ].map((q, i) => (
        <blockquote
          key={i}
          className="bg-[#0f161b] rounded-xl p-6 border border-[#1a2229] text-[#c9d6df] leading-relaxed 
                     hover:border-purple-600/40 hover:bg-[#151d23] transition shadow-md shadow-purple-900/5"
        >
          {q}
        </blockquote>
      ))}
    </div>

  </div>
</section>

{/* CTA Section */}
<section id="cta-variants" className="py-8 md:py-12">
  <div className="max-w-6xl mx-auto px-4 md:px-6">

    <h3 className="text-xl font-semibold mb-4 bg-gradient-to-r from-red-400 to-purple-400 bg-clip-text text-transparent">
      Start your journey today
    </h3>

    <div className="flex flex-col md:flex-row gap-3" aria-label="Primary calls to action">

      {/* Red Gradient CTA */}
      <a
        data-ab-variant="A"
        href="#download"
        className="rounded-md px-5 py-3 font-medium text-black 
                   bg-gradient-to-r from-red-500 to-orange-400 
                   hover:from-red-400 hover:to-orange-300 transition shadow-lg shadow-red-900/20"
      >
        Download Pulse — Free for a limited time
      </a>

      {/* Purple Edge CTA */}
      <a
        data-ab-variant="B"
        href="#download"
        className="rounded-md border px-5 py-3 font-medium text-white
                   border-purple-700/40 hover:bg-purple-900/20 transition"
      >
        Join creators sharing photos that look like film
      </a>

      {/* Blue Glow CTA */}
      <a
        data-ab-variant="C"
        href="#download"
        className="rounded-md border px-5 py-3 font-medium text-white
                   border-blue-600/40 hover:bg-blue-900/20 transition"
      >
        Join 1M+ nightly users — Get the app
      </a>

    </div>

    <p className="mt-2 text-xs text-[#9aa5b1]">Works best in Wi-Fi • 4.5★ average rating</p>
  </div>
</section>


{/* Download section */}
<section id="download" className="py-12 md:py-16 relative">

  {/* horizontal gradient wave */}
  <div className="absolute inset-0 -z-10 bg-gradient-to-r from-purple-800/30 via-red-700/20 to-blue-700/30 blur-2xl opacity-70" />

  <div className="max-w-6xl mx-auto px-4 md:px-6">

    <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
      Ready to join?
    </h3>

    <p className="mt-3 text-[#c9d6df] leading-relaxed">
      Get Pulse on the App Store or Google Play — import your camera roll instantly and keep your world private or public.
    </p>

    <div className="mt-6 flex gap-4 flex-wrap">

      {/* iOS Button */}
      <button className="rounded-md bg-gradient-to-r from-[#111] to-[#0b0b0b] px-5 py-3 text-white border border-white/10 hover:border-purple-500/40 transition shadow-lg shadow-purple-900/20">
        Available on the App Store
      </button>

      {/* Play Store */}
      <button className="rounded-md bg-gradient-to-r from-[#111] to-[#0b0b0b] px-5 py-3 text-white border border-white/10 hover:border-blue-500/40 transition shadow-lg shadow-blue-900/20">
        Get it on Google Play
      </button>

    </div>

    <p className="mt-3 text-xs text-[#9aa5b1]">Available on all devices • Sign-up under 30 seconds</p>
  </div>
</section>

{/* Analytics & trust signals */}
<section id="trust" className="py-8 relative">

  <div className="absolute inset-0 -z-10 bg-gradient-to-r from-blue-700/10 via-purple-800/10 to-red-700/10 blur-2xl opacity-70" />

  <div className="max-w-6xl mx-auto px-4 md:px-6 text-center">

    <p className="text-[#c9d6df] tracking-wide text-sm">
      <span className="text-purple-600 font-semibold text-xl">1M+ downloads</span> •
      <span className="text-blue-600 font-semibold text-xl"> 4.6 average rating</span> •
      <span className="text-red-400 font-semibold text-xl"> 99.99% uptime</span>
    </p>

  </div>
</section>

{/* Launch checklist */}
<section id="launch" className="py-12 md:py-16 relative">

  {/* Background gradient */}
  <div className="absolute inset-0 -z-10 bg-gradient-to-r from-purple-800/20 via-transparent to-blue-700/20 blur-2xl opacity-60" />

  <div className="max-w-7xl mx-auto px-4 md:px-6">

    {/* FIXED GRID → items aligned evenly */}
    <div className="grid md:grid-cols-2 gap-6 items-center">

      {/* Left: Waitlist */}
      <div className="bg-[#0f161b] rounded-xl p-8 border border-[#1a2229] 
                      hover:border-blue-500/40 transition shadow-lg shadow-blue-900/10 
                      h- flex flex-col justify-center">

        <h4 className="text-2xl font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Join the waitlist — be first to try Pulse
        </h4>

        <form className="mt-5 flex gap-3" onSubmit={(e) => e.preventDefault()}>
          <input
            id="email"
            type="email"
            required
            placeholder="you@example.com"
            className="flex-1 rounded-md bg-[#0b0f14] border border-[#2a323a] px-4 py-3 
                       placeholder:text-[#9aa5b1] focus:ring-2 focus:ring-purple-500/40 focus:outline-none"
          />

          <button className="rounded-md bg-gradient-to-r from-red-500 to-orange-400 text-black px-5 py-3 font-medium shadow-md shadow-red-900/20 hover:opacity-90 transition">
            Join waitlist
          </button>
        </form>

      </div>

      {/* Right: Image stays attached to right */}
      <div className="flex justify-end w-full">
        <div className="relative rounded-xl overflow-hidden shadow-xl border border-[#1a1f27]">

          {/* Gradient Glow */}
          <div className="absolute -inset-1 bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 opacity-40 blur-xl -z-10"></div>

          {/* Image */}
          <img
            src={rigth}
            alt="Preview"
            className="w-[380px] h-[420px] object-cover rounded-xl"
          />
        </div>
      </div>

    </div>
  </div>
</section>


      

      {/* FAQ */}
<section id="faq" className="py-12 md:py-16 relative">

  {/* Soft gradient waves in background */}
  <div className="absolute inset-0 -z-10 bg-gradient-to-b from-purple-900/10 via-transparent to-blue-900/10 blur-2xl opacity-70"></div>

  <div className="max-w-6xl mx-auto px-4 md:px-6">

    {/* Heading */}
    <h3 className="text-3xl font-semibold text-center 
                   bg-gradient-to-r from-purple-400 via-blue-400 to-red-400 
                   bg-clip-text text-transparent">
      Frequently Asked Questions
    </h3>

    <p className="text-center text-[#a8b3c1] mt-2">
      Quick answers to the most common questions.
    </p>

    <div className="mt-8 space-y-4">

      {/* FAQ ITEM */}
      {[
        {
          q: "Is Pulse free?",
          a: "Yes — core features are free. Creator tools and analytics are available via optional subscription."
        },
        {
          q: "Can I make my account private?",
          a: "Absolutely — toggle Private Account in settings and approve followers manually."
        },
        {
          q: "How do I report content?",
          a: "Tap the three-dot menu on any post → Report → choose reason. We review reports 24/7."
        },
        {
          q: "Are my photos compressed?",
          a: "We compress for fast delivery but prioritize quality. You can upload high-res images (recommended on Wi-Fi)."
        },
        {
          q: "Can I connect my Instagram/Twitter?",
          a: "Yes — link accounts in Settings to import contacts and posts."
        }
      ].map((item, i) => (
        <details
          key={i}
          className="group bg-[#0f161b] rounded-xl p-5 border border-[#1a2229] 
                     transition-all duration-300 cursor-pointer
                     hover:border-purple-500/40 hover:shadow-lg hover:shadow-purple-800/20"
        >
          <summary className="font-medium text-lg flex justify-between items-center 
                             text-white group-open:text-purple-300">
            {item.q}

            {/* Icon */}
            <span className="transition-transform duration-300 group-open:rotate-180 text-purple-300">
              ▼
            </span>
          </summary>

          <p className="mt-3 text-[#c9d6df] leading-relaxed">
            {item.a}
          </p>
        </details>
      ))}

    </div>
  </div>
</section>


      {/* Footer */}
      <footer className="mt-8 border-t border-[#1a2229] bg-[#0b0f14]">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-12">
          <div className="grid md:grid-cols-5 gap-6 text-sm">
            <div className="md:col-span-1">
              <div className="text-lg font-semibold">Pulse</div>
              <p className="mt-2 text-[#9aa5b1] text-xs">Your photos stay yours. We never sell personal data. See Privacy Policy.</p>
              <p className="mt-2 text-[#9aa5b1] text-xs">We use minimal cookies to improve performance and analytics. Manage settings.</p>
            </div>
            <div>
              <div className="font-medium">Product</div>
              <ul className="mt-2 space-y-1 text-[#c9d6df]">
                <li><a href="#features">Features</a></li>
                <li><a href="#pricing">Pricing</a></li>
                <li><a href="#download">Download</a></li>
              </ul>
            </div>
            <div>
              <div className="font-medium">Company</div>
              <ul className="mt-2 space-y-1 text-[#c9d6df]">
                <li><a href="#">About</a></li>
                <li><a href="#">Careers</a></li>
                <li><a href="#">Press</a></li>
              </ul>
            </div>
            <div>
              <div className="font-medium">Resources</div>
              <ul className="mt-2 space-y-1 text-[#c9d6df]">
                <li><a href="#">Blog</a></li>
                <li><a href="#">Help Center</a></li>
                <li><a href="#">Creators</a></li>
                <li><a href="#">Developers (API)</a></li>
              </ul>
            </div>
            <div>
              <div className="font-medium">Legal</div>
              <ul className="mt-2 space-y-1 text-[#c9d6df]">
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms of Service</a></li>
                <li><a href="#">Cookie Settings</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-[#9aa5b1]">
            <p>© 2025 Pulse Inc. All rights reserved.</p>
            <div className="flex gap-4">
              <span>1M+ downloads</span>
              <span>4.6 average rating</span>
              <span>99.99% uptime</span>
            </div>
          </div>

          <div className="mt-8">
            <div className="bg-[#0f161b] rounded-lg p-6 border border-[#1a2229] flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <div className="text-lg font-semibold">Ready to post your first moment?</div>
                <p className="text-[#c9d6df]">Download Pulse — Start for free</p>
              </div>
              <a href="#download" className="inline-flex rounded-md bg-[#ff6b6b] text-black px-5 py-3 font-medium">Get the app</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}





