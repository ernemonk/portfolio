import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { href: "/work", label: "Work" },
    { href: "/contact", label: "Contact" },
  ];

  const socialLinks = [
    {
      href: "https://github.com/ernemonk",
      label: "GitHub",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        </svg>
      ),
    },
    {
      href: "https://www.linkedin.com/in/ernesto-monge-873728132/",
      label: "LinkedIn",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.475-2.236-1.986-2.236-1.081 0-1.722.722-2.004 1.418-.103.249-.129.597-.129.946v5.441h-3.554s.05-8.836 0-9.759h3.554v1.381c.43-.664 1.199-1.61 2.919-1.61 2.135 0 3.734 1.39 3.734 4.375v5.613zM5.337 9.341c-1.144 0-1.915-.757-1.915-1.706 0-.968.77-1.71 1.958-1.71 1.187 0 1.915.742 1.937 1.71 0 .949-.75 1.706-1.98 1.706zm1.581 11.111H3.615V9.593h3.303v10.859zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
        </svg>
      ),
    },
    {
      href: "mailto:erne.monge.s@gmail.com",
      label: "Email",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
        </svg>
      ),
    },
  ];

  return (
    <footer className="relative mt-24 border-t border-neutral-800">
      <div className="container-max px-6 py-16">
        <div className="space-y-8">
          {/* Brand & Copyright */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="text-neutral-50 font-semibold text-lg tracking-tight">
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
            <div className="flex gap-3">
              {socialLinks.map(({ href, label, icon }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="text-neutral-400 hover:text-primary-400 transition-colors duration-300 p-2 hover:bg-primary-500/10 rounded-lg"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="gradient-line" />


        </div>
      </div>
    </footer>
  );
}
