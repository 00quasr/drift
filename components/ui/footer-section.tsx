'use client';
import React from 'react';
import type { ComponentProps, ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';

interface FooterLink {
    title: string;
    href: string;
    icon?: React.ComponentType<{ className?: string }>;
}

interface FooterSection {
    label: string;
    links: FooterLink[];
}

const footerLinks: FooterSection[] = [
    {
        label: 'Platform',
        links: [
            { title: 'Explore', href: '/explore' },
            { title: 'Events', href: '/events' },
            { title: 'Artists', href: '/artists' },
            { title: 'Venues', href: '/venues' },
        ],
    },
    {
        label: 'Community',
        links: [
            { title: 'About', href: '/about' },
            { title: 'Support', href: '/support' },
            { title: 'Privacy Policy', href: '/privacy' },
            { title: 'Terms of Service', href: '/terms' },
        ],
    },
    {
        label: 'Creators',
        links: [
            { title: 'Artist Profile', href: '/artist-profile' },
            { title: 'Manage Events', href: '/events/manage' },
            { title: 'My Venue', href: '/my-venue' },
            { title: 'Dashboard', href: '/dashboard' },
        ],
    },
    {
        label: 'Connect',
        links: [
            { title: 'Facebook', href: '#' },
            { title: 'Instagram', href: '#' },
            { title: 'YouTube', href: '#' },
            { title: 'LinkedIn', href: '#' },
        ],
    },
];

export function Footer() {
    return (
        <footer className="md:rounded-t-6xl relative w-full max-w-6xl mx-auto flex flex-col items-center justify-center rounded-t-4xl border-t border-white/20 bg-[radial-gradient(35%_128px_at_50%_0%,theme(backgroundColor.white/8%),transparent)] px-6 py-12 lg:py-16">
            <div className="bg-white/20 absolute top-0 right-1/2 left-1/2 h-px w-1/3 -translate-x-1/2 -translate-y-1/2 rounded-full blur" />

            <div className="grid w-full gap-8 xl:grid-cols-3 xl:gap-8">
                <AnimatedContainer className="space-y-4">
                    <div className="flex items-center space-x-3">
                        <span className="text-2xl font-bold tracking-wider uppercase text-white">DRIFT</span>
                    </div>
                    <p className="text-white/60 mt-8 text-sm md:mt-0 font-bold tracking-wider uppercase">
                        THE UNDERGROUND ELECTRONIC MUSIC PLATFORM
                    </p>
                    <p className="text-white/40 text-xs font-bold tracking-widest uppercase">
                        © {new Date().getFullYear()} DRIFT. ALL RIGHTS RESERVED.
                    </p>
                </AnimatedContainer>

                <div className="mt-10 grid grid-cols-2 gap-8 md:grid-cols-4 xl:col-span-2 xl:mt-0">
                    {footerLinks.map((section, index) => (
                        <AnimatedContainer key={section.label} delay={0.1 + index * 0.1}>
                            <div className="mb-10 md:mb-0">
                                <h3 className="text-white font-bold tracking-widest uppercase text-xs mb-4">{section.label}</h3>
                                <ul className="text-white/60 mt-4 space-y-3 text-sm">
                                    {section.links.map((link) => (
                                        <li key={link.title}>
                                            <a
                                                href={link.href}
                                                className="hover:text-white inline-flex items-center transition-all duration-300 font-bold tracking-wider uppercase hover:tracking-widest"
                                            >
                                                {link.title}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </AnimatedContainer>
                    ))}
                </div>
            </div>
        </footer>
    );
};

type ViewAnimationProps = {
    delay?: number;
    className?: ComponentProps<typeof motion.div>['className'];
    children: ReactNode;
};

function AnimatedContainer({ className, delay = 0.1, children }: ViewAnimationProps) {
    const shouldReduceMotion = useReducedMotion();

    if (shouldReduceMotion) {
        return <div className={className}>{children}</div>;
    }

    return (
        <motion.div
            initial={{ filter: 'blur(4px)', translateY: -8, opacity: 0 }}
            whileInView={{ filter: 'blur(0px)', translateY: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay, duration: 0.8 }}
            className={className}
        >
            {children}
        </motion.div>
    );
};