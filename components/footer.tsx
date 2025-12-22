import { Logo } from "@/components/logo";

const footerLinks = {
    product: [
        { label: "Features", href: "#" },
        { label: "Pricing", href: "#" },
        { label: "API", href: "#" },
        { label: "Integrations", href: "#" },
    ],
    resources: [
        { label: "Documentation", href: "#" },
        { label: "Blog", href: "#" },
        { label: "Support", href: "#" },
        { label: "Status", href: "#" },
    ],
    legal: [
        { label: "Privacy Policy", href: "#" },
        { label: "Terms of Service", href: "#" },
        { label: "Cookie Policy", href: "#" },
    ],
};

const socialLinks = [
    {
        label: "Twitter",
        href: "#",
        icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
        ),
    },
    {
        label: "GitHub",
        href: "https://github.com/shubhams167",
        icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                />
            </svg>
        ),
    },
    {
        label: "LinkedIn",
        href: "#",
        icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
        ),
    },
];

interface FooterLinkGroupProps {
    title: string;
    links: { label: string; href: string }[];
}

function FooterLinkGroup({ title, links }: FooterLinkGroupProps) {
    return (
        <div>
            <h3 className="text-zinc-900 dark:text-white font-semibold mb-4">
                {title}
            </h3>
            <ul className="space-y-2">
                {links.map((link) => (
                    <li key={link.label}>
                        <a
                            href={link.href}
                            className="text-zinc-600 dark:text-zinc-400 hover:text-emerald-500 dark:hover:text-emerald-400 text-sm transition-colors"
                        >
                            {link.label}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export function Footer() {
    return (
        <footer className="relative z-10 border-t border-zinc-200 dark:border-white/5 bg-white/50 dark:bg-black/50 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="sm:col-span-2 lg:col-span-1">
                        <div className="mb-4">
                            <Logo size="sm" />
                        </div>
                        <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
                            Your intelligent companion for stock market analysis and portfolio
                            management.
                        </p>
                    </div>

                    <FooterLinkGroup title="Product" links={footerLinks.product} />
                    <FooterLinkGroup title="Resources" links={footerLinks.resources} />
                    <FooterLinkGroup title="Legal" links={footerLinks.legal} />
                </div>

                {/* Bottom bar */}
                <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-zinc-200 dark:border-white/5">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-zinc-500 text-sm text-center sm:text-left">
                            © {new Date().getFullYear()} Aura. All rights reserved.
                        </p>
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-zinc-500">Crafted with</span>
                            <svg
                                className="w-4 h-4 text-red-500"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                            </svg>
                            <span className="text-zinc-500">by</span>
                            <a
                                href="https://github.com/shubhams167"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 font-medium transition-colors"
                            >
                                Shubham Singh
                            </a>
                        </div>
                        <div className="flex items-center gap-4">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.label}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                                    aria-label={social.label}
                                >
                                    {social.icon}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
