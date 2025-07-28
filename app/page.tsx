'use client'

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from 'next/link'
import Image from 'next/image'

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
      image: `${storageUrl}/pawel-czerwinski-V558Lx_ji6I-unsplash.jpg`
    },
    {
      title: "EVENT TRACKING",
      description: "NEVER MISS A SHOW WITH REAL-TIME UPDATES",
      image: `${storageUrl}/pawel-czerwinski-TLzxYiyXw1o-unsplash(1).jpg`
    },
    {
      title: "ARTIST PROFILES",
      description: "DISCOVER NEW TALENT AND FOLLOW FAVORITES",
      image: `${storageUrl}/pawel-czerwinski-uGd6aKkvHnk-unsplash.jpg`
    },
    {
      title: "COMMUNITY HUB",
      description: "CONNECT WITH LIKE-MINDED MUSIC LOVERS",
      image: `${storageUrl}/pawel-czerwinski-YAtspJ-HV2E-unsplash.jpg`
    },
  ];

  const userTypes = [
    {
      title: "ARTISTS",
      description: "SHOWCASE YOUR SOUND AND BUILD YOUR FOLLOWING",
    },
    {
      title: "PROMOTERS",
      description: "REACH YOUR TARGET AUDIENCE EFFICIENTLY",
    },
    {
      title: "VENUES",
      description: "FILL YOUR SPACE WITH THE RIGHT CROWD",
    },
    {
      title: "FANS",
      description: "DISCOVER YOUR NEXT FAVORITE ARTIST",
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="w-full py-12 sm:py-16 lg:py-24 xl:py-32">
          <div className="container mx-auto max-w-6xl px-4 sm:px-6">
            <div className="relative border border-white/20 bg-black/50 p-6 sm:p-8 lg:p-12 overflow-hidden">
              {/* Background Image */}
              <div className="absolute inset-0">
                <Image
                  src={`${storageUrl}/kajetan-sumila-GcHBIKRGWcM-unsplash.jpg`}
                  alt="Underground electronic music scene"
                  fill
                  className="object-cover"
                  priority
                  sizes="100vw"
                />
                <div className="absolute inset-0 bg-black/20" />
              </div>

              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                className="relative z-10 flex flex-col justify-center space-y-6 sm:space-y-8"
              >
                <div className="space-y-4 sm:space-y-6">
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-wider uppercase leading-tight"
                  >
                    UNDERGROUND
                    <br />
                    ELECTRONIC
                    <br />
                    MUSIC PLATFORM
                  </motion.h1>
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
                  className="flex flex-col gap-3 sm:gap-4 sm:flex-row"
                >
                  <Link href="/explore" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full sm:w-auto bg-white text-black hover:bg-neutral-200 uppercase tracking-wider group px-6 py-3 text-sm sm:text-base">
                      GET STARTED
                      <motion.span
                        initial={{ x: 0 }}
                        whileHover={{ x: 5 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </motion.span>
                    </Button>
                  </Link>
                  <Link href="/events" className="w-full sm:w-auto">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto bg-transparent border-white/20 text-white hover:bg-white hover:text-black uppercase tracking-wider px-6 py-3 text-sm sm:text-base">
                      EXPLORE PLATFORM
                    </Button>
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 sm:py-16 lg:py-24">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="container mx-auto max-w-6xl px-4 sm:px-6"
          >
            <div className="border border-white/20">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 relative z-10 max-w-7xl mx-auto">
                {features.map((feature, index) => (
                  <Feature key={feature.title} {...feature} index={index} />
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        {/* User Types Section */}
        <section id="users" className="w-full py-12 sm:py-16 lg:py-24">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="container mx-auto max-w-6xl px-4 sm:px-6"
          >
            <div className="relative border border-white/20 overflow-hidden">
              {/* Background Image */}
              <div className="absolute inset-0">
                <Image
                  src={`${storageUrl}/geronimo-giqueaux-NAMBG-gRR7U-unsplash.jpg`}
                  alt="Electronic music community"
                  fill
                  className="object-cover"
                  sizes="100vw"
                />
                <div className="absolute inset-0 bg-black/15" />
              </div>

              <div className="relative z-10 p-6 sm:p-8 lg:p-12">
                <div className="text-center mb-8 sm:mb-12 lg:mb-16">
                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-widest uppercase mb-4 sm:mb-6"
                  >
                    FOR EVERYONE
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="text-white/80 font-bold tracking-wider uppercase text-sm sm:text-base lg:text-lg leading-relaxed"
                  >
                    BUILT FOR ALL MEMBERS OF THE ELECTRONIC MUSIC ECOSYSTEM
                  </motion.p>
                </div>

                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
                >
                  {userTypes.map((userType, index) => (
                    <motion.div
                      key={index}
                      variants={itemFadeIn}
                      className="border border-white/20 p-4 sm:p-6 lg:p-8 bg-black/30"
                    >
                      <h3 className="text-lg sm:text-xl font-bold tracking-widest uppercase mb-3 sm:mb-4 text-white">{userType.title}</h3>
                      <p className="text-white/70 text-xs sm:text-sm uppercase tracking-wide leading-relaxed">{userType.description}</p>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* CTA Section */}
        <section id="contact" className="w-full py-12 sm:py-16 lg:py-24">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="container mx-auto max-w-6xl px-4 sm:px-6"
          >
            <div className="relative border border-white/20 overflow-hidden">
              {/* Background Image */}
              <div className="absolute inset-0">
                <Image
                  src={`${storageUrl}/philip-oroni-yiPpgTV0Sbs-unsplash.jpg`}
                  alt="Join the movement"
                  fill
                  className="object-cover"
                  sizes="100vw"
                />
                <div className="absolute inset-0 bg-black/20" />
              </div>

              <div className="relative z-10 flex flex-col items-center justify-center space-y-6 sm:space-y-8 text-center py-12 sm:py-16 lg:py-24 px-6 sm:px-8 lg:px-12">
                <div className="space-y-4 sm:space-y-6">
                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-wider uppercase leading-tight"
                  >
                    JOIN THE MOVEMENT
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="mx-auto max-w-[600px] text-neutral-300 text-sm sm:text-base lg:text-lg uppercase tracking-wide leading-relaxed"
                  >
                    BECOME PART OF THE UNDERGROUND ELECTRONIC MUSIC COMMUNITY
                  </motion.p>
                </div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.6 }}
                  className="flex flex-col gap-3 sm:gap-4 sm:flex-row w-full sm:w-auto"
                >
                  <Link href="/auth/signup" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full sm:w-auto bg-white text-black hover:bg-neutral-200 uppercase tracking-wider group px-6 py-3 text-sm sm:text-base">
                      START NOW
                      <motion.span
                        initial={{ x: 0 }}
                        whileHover={{ x: 5 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </motion.span>
                    </Button>
                  </Link>
                  <Link href="/explore" className="w-full sm:w-auto">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto bg-transparent border-white/20 text-white hover:bg-white hover:text-black uppercase tracking-wider px-6 py-3 text-sm sm:text-base">
                      LEARN MORE
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </section>
      </main>
    </div>
  )
}
