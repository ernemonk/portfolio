import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { href: "/work", label: "Work" },
    { href: "/contact", label: "Contact" },
    { href: "/privacy", label: "Privacy" },
  ];

  const socialLinks = [
    { href: "https://github.com/ernemonk", label: "GitHub", icon: "⊕" },
    { href: "https://linkedin.com/in/ernesto-monge", label: "LinkedIn", icon: "🔗" },
    { href: "mailto:ernesto@example.com", label: "Email", icon: "✉" },
  ];

  return (
    <footer className="relative mt-24 border-t border-neutral-800">
      <div className="container-max px-6 py-16">
        <div className="space-y-8">
          {/* Brand & Copyright */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="text-neutral-50 font-bold text-lg tracking-tight">
                EM<span className="text-primary-400">.</span>
              </span>
              <span className="text-neutral-500 text-xs font-medium">
                © {currentYear}
              </span>
            </div>
            <p className="text-sm text-neutral-500">
              Lead Full Stack Engineer. Building enterprise systems & real products.
            </p>
          </div>

          {/* Links & Social */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            {/* Navigation Links */}
            <div className="flex gap-8">
              {footerLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-neutral-400 hover:text-primary-400 transition-colors duration-300 font-medium"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Social Icons */}
            <div className="flex gap-4">
              {socialLinks.map(({ href, label, icon }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="text-neutral-400 hover:text-primary-400 transition-colors duration-300 p-2 hover:bg-primary-500/10 rounded-lg text-lg"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="gradient-line" />

          {/* Legal */}
          <div className="text-xs text-neutral-600 space-y-1">
            <p>Designed & built by Ernesto Monge. Built with Next.js, Tailwind CSS, and Firebase.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
