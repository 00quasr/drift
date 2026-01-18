'use client'

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowRight, Users, Calendar, MapPin, TrendingUp, Music, Radio } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from 'next/link'
import Image from 'next/image'
import { H1, H2, H3 } from "@/components/ui/typography"
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid"
import DisplayCards from "@/components/ui/display-cards"

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemFadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
}

interface FeatureProps {
  title: string;
  description: string;
  image: string;
  index: number;
}

const Feature = ({ title, description, image, index }: FeatureProps) => {
  return (
    <div
      className={cn(
        "flex flex-col relative group/feature border-white/20 overflow-hidden",
        "border-b sm:border-r",
        "sm:last:border-r-0 lg:last:border-r lg:border-r",
        (index === 0 || index === 2) && "sm:border-l",
        index === 0 && "lg:border-l",
        index < 2 && "sm:border-b",
        index < 4 && "lg:border-b"
      )}
    >
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 p-4 sm:p-6 lg:p-10 min-h-[200px] sm:min-h-[250px] lg:min-h-[300px] flex flex-col justify-end">
        <div className="text-base sm:text-lg font-bold mb-2">
          <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-neutral-700 group-hover/feature:bg-white transition-all duration-200 origin-center" />
          <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block text-white uppercase tracking-wider">
            {title}
          </span>
        </div>
        <p className="text-xs sm:text-sm text-neutral-300 uppercase tracking-wide leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};

export default function HomePage() {
  // Base Supabase storage URL for assets
  const storageUrl = "https://jwxlskzmmdrwrlljtfdi.supabase.co/storage/v1/object/public/logoassets"

  const features = [
    {
      title: "VENUE DISCOVERY",
      description: "FIND UNDERGROUND SPACES AND HIDDEN GEMS",
      image: `${storageUrl}/__krk_nightclub_atmosphere_--seed_3916890346_--sref_791149260_cb8a7863-e34f-4278-9c4a-1d4158010788_2.png`
    },
    {
      title: "EVENT TRACKING",
      description: "NEVER MISS A SHOW WITH REAL-TIME UPDATES",
      image: `${storageUrl}/__krk_nightclub_atmosphere_--seed_3916890346_--sref_791149260_cb8a7863-e34f-4278-9c4a-1d4158010788_1.png`
    },
    {
      title: "ARTIST PROFILES",
      description: "DISCOVER NEW TALENT AND FOLLOW FAVORITES",
      image: `${storageUrl}/__krk_nightclub_atmosphere_--seed_3916890346_--sref_791149260_cb8a7863-e34f-4278-9c4a-1d4158010788_0.png`
    },
    {
      title: "COMMUNITY HUB",
      description: "CONNECT WITH LIKE-MINDED MUSIC LOVERS",
      image: `${storageUrl}/__krk_nightclub_atmosphere_--seed_3916890346_--sref_754301869_77bf5d76-2688-44fe-b44a-8f858cd0fc59_3.png`
    },
  ];

  const platformFeatures = [
    {
      Icon: MapPin,
      name: "Venue Discovery",
      description: "Find underground clubs, warehouses, and hidden electronic music venues in your city and around the world.",
      href: "/venues",
      cta: "Explore Venues",
      background: <div className="absolute inset-0 bg-neutral-900/50" />,
      className: "lg:row-start-1 lg:row-end-4 lg:col-start-2 lg:col-end-3",
    },
    {
      Icon: Calendar,
      name: "Event Tracking",
      description: "Never miss a show. Get real-time updates on upcoming events, lineup changes, and ticket releases.",
      href: "/events",
      cta: "View Events",
      background: <div className="absolute inset-0 bg-neutral-900/50" />,
      className: "lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-3",
    },
    {
      Icon: Music,
      name: "Artist Profiles",
      description: "Discover emerging talent, follow your favorite DJs, and explore their complete discography.",
      href: "/artists",
      cta: "Browse Artists",
      background: <div className="absolute inset-0 bg-neutral-900/50" />,
      className: "lg:col-start-1 lg:col-end-2 lg:row-start-3 lg:row-end-4",
    },
    {
      Icon: Users,
      name: "Community Network",
      description: "Connect with fellow music enthusiasts, share experiences, and build your underground network.",
      href: "/explore",
      cta: "Join Community",
      background: <div className="absolute inset-0 bg-neutral-900/50" />,
      className: "lg:col-start-3 lg:col-end-3 lg:row-start-1 lg:row-end-2",
    },
    {
      Icon: TrendingUp,
      name: "Real-Time Updates",
      description: "Stay ahead with live venue updates, trending events, and breaking news from the electronic music scene.",
      href: "/explore",
      cta: "See What's Trending",
      background: <div className="absolute inset-0 bg-neutral-900/50" />,
      className: "lg:col-start-3 lg:col-end-3 lg:row-start-2 lg:row-end-4",
    },
  ];

  const useCaseCards = [
    {
      icon: <Music className="size-4 text-white" />,
      title: "For Artists",
      description: "Build your following and showcase your sound",
      date: "Create Profile",
      iconClassName: "text-white",
      titleClassName: "text-white",
      className: "[grid-area:stack] hover:-translate-y-10 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-white/10 before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-black/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
    },
    {
      icon: <Radio className="size-4 text-white" />,
      title: "For Promoters",
      description: "Reach the right audience for your events",
      date: "Post Event",
      iconClassName: "text-white",
      titleClassName: "text-white",
      className: "[grid-area:stack] translate-x-16 translate-y-10 hover:-translate-y-1 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-white/10 before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-black/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
    },
    {
      icon: <MapPin className="size-4 text-white" />,
      title: "For Venues",
      description: "Fill your space with passionate fans",
      date: "List Venue",
      iconClassName: "text-white",
      titleClassName: "text-white",
      className: "[grid-area:stack] translate-x-32 translate-y-20 hover:translate-y-10",
    },
  ];

  const stats = [
    { label: "ACTIVE VENUES", value: "500+", icon: MapPin },
    { label: "MONTHLY EVENTS", value: "1,000+", icon: Calendar },
    { label: "ARTISTS", value: "2,500+", icon: Music },
    { label: "COMMUNITY MEMBERS", value: "10K+", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="w-full py-12 sm:py-16 lg:py-32 bg-black">
          <div className="container mx-auto max-w-6xl px-4 sm:px-6">
            <div className="relative border border-white/20 bg-black/50 p-6 sm:p-8 lg:p-16 overflow-hidden">
              {/* Background Image */}
              <div className="absolute inset-0">
                <Image
                  src={`${storageUrl}/__krk_Late_night_underground_afterparty_dark_moody_void_atmos_6997a096-236d-4a2a-b441-60ffa9c5f813_0.png`}
                  alt="Underground electronic music scene"
                  fill
                  className="object-cover"
                  priority
                  sizes="100vw"
                />
                <div className="absolute inset-0 bg-black/40" />
              </div>

              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                className="relative z-10 flex flex-col justify-center space-y-8"
              >
                <div className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                  >
                    <H1 variant="display" className="leading-tight">
                      UNDERGROUND
                      <br />
                      ELECTRONIC
                      <br />
                      MUSIC PLATFORM
                    </H1>
                  </motion.div>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.4 }}
                    className="max-w-[600px] text-neutral-300 text-sm sm:text-base lg:text-lg uppercase tracking-wide leading-relaxed"
                  >
                    DISCOVER VENUES, EVENTS, AND ARTISTS IN THE ELECTRONIC MUSIC SCENE. CONNECT WITH THE UNDERGROUND COMMUNITY.
                  </motion.p>
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.6 }}
                  className="flex flex-col gap-4 sm:flex-row"
                >
                  <Link href="/explore">
                    <Button size="lg" className="w-full sm:w-auto bg-white text-black hover:bg-neutral-200 uppercase tracking-wider group px-8 py-6 text-base">
                      GET STARTED
                      <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                  <Link href="/events">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto bg-transparent border-white/20 text-white hover:bg-white hover:text-black uppercase tracking-wider px-8 py-6 text-base">
                      EXPLORE PLATFORM
                    </Button>
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats Section - Neutral Background */}
        <section className="w-full py-12 sm:py-16 lg:py-24 bg-neutral-950">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="container mx-auto max-w-6xl px-4 sm:px-6"
          >
            <div className="border border-white/10 p-8 lg:p-16 bg-neutral-900/30">
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="grid grid-cols-2 lg:grid-cols-4 gap-12"
              >
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <motion.div
                      key={index}
                      variants={itemFadeIn}
                      className="text-center space-y-3"
                    >
                      <div className="text-4xl lg:text-6xl font-bold text-white mb-2">{stat.value}</div>
                      <div className="text-xs lg:text-sm text-white/50 uppercase tracking-wider font-medium">{stat.label}</div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* Platform Features with Bento Grid - Black Background */}
        <section className="w-full py-12 sm:py-16 lg:py-24 bg-black">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="container mx-auto max-w-6xl px-4 sm:px-6"
          >
            <div className="text-center mb-12 lg:mb-20">
              <H2 variant="display" className="mb-6">
                PLATFORM FEATURES
              </H2>
              <p className="text-white/50 uppercase tracking-wider text-xs lg:text-sm max-w-2xl mx-auto font-medium">
                Everything you need to navigate the underground electronic music scene
              </p>
            </div>
            <BentoGrid className="lg:grid-rows-3">
              {platformFeatures.map((feature) => (
                <BentoCard key={feature.name} {...feature} />
              ))}
            </BentoGrid>
          </motion.div>
        </section>

        {/* How It Works Section - Neutral Background */}
        <section className="w-full py-12 sm:py-16 lg:py-24 bg-neutral-950">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="container mx-auto max-w-6xl px-4 sm:px-6"
          >
            <div className="text-center mb-12 lg:mb-20">
              <H2 variant="display" className="mb-6">
                HOW IT WORKS
              </H2>
              <p className="text-white/50 uppercase tracking-wider text-xs lg:text-sm max-w-2xl mx-auto font-medium">
                Get started in three simple steps
              </p>
            </div>
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {[
                {
                  step: "01",
                  title: "CREATE YOUR PROFILE",
                  description: "Sign up and tell us about your role in the electronic music scene - artist, promoter, venue owner, or fan.",
                },
                {
                  step: "02",
                  title: "EXPLORE & CONNECT",
                  description: "Browse venues, discover events, follow artists, and connect with the underground community.",
                },
                {
                  step: "03",
                  title: "ENGAGE & GROW",
                  description: "Attend events, share experiences, build your network, and help grow the scene.",
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  variants={itemFadeIn}
                  className="border border-white/10 p-8 relative overflow-hidden group hover:border-white/20 transition-colors bg-neutral-900/30"
                >
                  <div className="absolute top-6 right-6 text-7xl font-bold text-white/5 group-hover:text-white/10 transition-colors">
                    {item.step}
                  </div>
                  <div className="relative z-10 space-y-4">
                    <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white/50 text-sm font-bold">
                      {item.step}
                    </div>
                    <H3 variant="display" className="text-white text-xl">
                      {item.title}
                    </H3>
                    <p className="text-white/50 uppercase tracking-wide text-xs leading-relaxed font-medium">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* Use Cases with Display Cards - Black Background */}
        <section className="w-full pt-12 sm:pt-16 lg:pt-24 pb-32 sm:pb-40 lg:pb-48 bg-black">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="container mx-auto max-w-6xl px-4 sm:px-6"
          >
            <div className="text-center mb-12 lg:mb-20">
              <H2 variant="display" className="mb-6">
                WHO IS IT FOR?
              </H2>
              <p className="text-white/50 uppercase tracking-wider text-xs lg:text-sm max-w-2xl mx-auto font-medium">
                Built for every role in the electronic music ecosystem
              </p>
            </div>
            <div className="flex justify-center">
              <DisplayCards cards={useCaseCards} />
            </div>
          </motion.div>
        </section>

        {/* Features Section - Neutral Background */}
        <section id="features" className="w-full py-12 sm:py-16 lg:py-24 bg-neutral-950">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="container mx-auto max-w-6xl px-4 sm:px-6"
          >
            <div className="text-center mb-12 lg:mb-20">
              <H2 variant="display" className="mb-6">
                CORE FEATURES
              </H2>
            </div>
            <div className="border border-white/10">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 relative z-10 max-w-7xl mx-auto">
                {features.map((feature, index) => (
                  <Feature key={feature.title} {...feature} index={index} />
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        {/* Detailed User Roles Section - Black Background */}
        <section id="users" className="w-full py-12 sm:py-16 lg:py-24 bg-black">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="container mx-auto max-w-6xl px-4 sm:px-6"
          >
            <div className="relative border border-white/10 overflow-hidden">
              {/* Background Image */}
              <div className="absolute inset-0">
                <Image
                  src={`${storageUrl}/__krk_Grainy_black_and_white_photo_taken_inside_a_small_rave_ve_5315cf53-a741-4e87-9649-b7f334bcade6.png`}
                  alt="Electronic music community"
                  fill
                  className="object-cover"
                  sizes="100vw"
                />
                <div className="absolute inset-0 bg-black/60" />
              </div>

              <div className="relative z-10 p-6 sm:p-8 lg:p-16">
                <div className="text-center mb-12 lg:mb-20">
                  <H2 variant="display" className="mb-6">
                    FOR EVERYONE
                  </H2>
                  <p className="text-white/70 font-medium tracking-wider uppercase text-xs sm:text-sm lg:text-base leading-relaxed max-w-3xl mx-auto">
                    Built for all members of the electronic music ecosystem
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {[
                    {
                      title: "ARTISTS",
                      description: "Showcase your sound, build your following, connect with venues and promoters, and track your performance history.",
                    },
                    {
                      title: "PROMOTERS",
                      description: "Reach your target audience efficiently, promote events to engaged fans, and grow your brand in the scene.",
                    },
                    {
                      title: "VENUES",
                      description: "Fill your space with the right crowd, list venue details, and connect with quality promoters.",
                    },
                    {
                      title: "FANS",
                      description: "Discover your next favorite artist, find the best underground venues, and never miss a show.",
                    },
                  ].map((userType, index) => {
                    return (
                      <div
                        key={index}
                        className="border border-white/20 p-8 bg-black/60 backdrop-blur-sm hover:bg-black/70 transition-all group"
                      >
                        <H3 variant="display" className="mb-4 text-white text-xl">{userType.title}</H3>
                        <p className="text-white/50 text-xs uppercase tracking-wide leading-relaxed font-medium">
                          {userType.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Why Choose Drift Section - Neutral Background */}
        <section className="w-full py-12 sm:py-16 lg:py-24 bg-neutral-950">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="container mx-auto max-w-6xl px-4 sm:px-6"
          >
            <div className="text-center mb-12 lg:mb-20">
              <H2 variant="display" className="mb-6">
                WHY CHOOSE DRIFT
              </H2>
              <p className="text-white/50 uppercase tracking-wider text-xs lg:text-sm max-w-2xl mx-auto font-medium">
                The premier platform for underground electronic music
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: "TRUSTED COMMUNITY",
                  description: "Verified venues, authentic artists, and real events. Our moderation ensures quality across the platform.",
                },
                {
                  title: "REAL-TIME UPDATES",
                  description: "Never miss a beat. Get instant notifications for new events, venue openings, and artist announcements.",
                },
                {
                  title: "GROWING NETWORK",
                  description: "Join thousands of electronic music enthusiasts building the future of the underground scene.",
                },
              ].map((item, index) => {
                return (
                  <div
                    key={index}
                    className="border border-white/10 p-8 text-center group hover:border-white/20 transition-colors bg-neutral-900/30"
                  >
                    <H3 variant="display" className="mb-4 text-white text-xl">
                      {item.title}
                    </H3>
                    <p className="text-white/50 uppercase tracking-wide text-xs leading-relaxed font-medium">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </section>

        {/* CTA Section - Black Background */}
        <section id="contact" className="w-full py-12 sm:py-16 lg:py-32 bg-black">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="container mx-auto max-w-6xl px-4 sm:px-6"
          >
            <div className="relative border border-white/10 overflow-hidden">
              {/* Background Image */}
              <div className="absolute inset-0">
                <Image
                  src={`${storageUrl}/__krk_Grainy_black_and_white_photo_taken_inside_a_small_rave_ve_5ff6646a-7807-4389-a910-fba604cbdcdc.png`}
                  alt="Join the movement"
                  fill
                  className="object-cover"
                  sizes="100vw"
                />
                <div className="absolute inset-0 bg-black/60" />
              </div>

              <div className="relative z-10 flex flex-col items-center justify-center space-y-10 text-center py-16 sm:py-24 lg:py-40 px-6 sm:px-8 lg:px-12">
                <div className="space-y-6">
                  <H2 variant="display" className="leading-tight">
                    JOIN THE MOVEMENT
                  </H2>
                  <p className="mx-auto max-w-[700px] text-neutral-300 text-sm lg:text-lg uppercase tracking-wide leading-relaxed">
                    Become part of the underground electronic music community
                  </p>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row">
                  <Link href="/auth/signup">
                    <Button size="lg" className="w-full sm:w-auto bg-white text-black hover:bg-neutral-200 uppercase tracking-wider group px-8 py-6 text-base">
                      START NOW
                      <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                  <Link href="/explore">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto bg-transparent border-white/20 text-white hover:bg-white hover:text-black uppercase tracking-wider px-8 py-6 text-base">
                      EXPLORE PLATFORM
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </section>
      </main>
    </div>
  )
}
