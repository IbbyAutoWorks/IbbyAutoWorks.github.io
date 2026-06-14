import { appBuildLabel, appDisplayName, appVersion, copyrightNotice, footerLinks } from "@/lib/app-meta";

type FooterContext = "home" | "request" | "account" | "customer-settings" | "admin" | "admin-settings" | "service" | "service-settings";

type LinkDef = { label: string; href: string };

function linksForContext(context: FooterContext): LinkDef[] {
  if (context === "admin") return [];
  if (context === "admin-settings") return [footerLinks.issues];
  if (context === "service" || context === "service-settings") return [footerLinks.issues, footerLinks.request];
  if (context === "customer-settings") return [footerLinks.privacy, footerLinks.terms, footerLinks.issues, footerLinks.request, footerLinks.contact];
  return [footerLinks.privacy, footerLinks.terms, footerLinks.issues, footerLinks.request, footerLinks.contact];
}

export function SiteFooter({ context }: { context: FooterContext }) {
  const links = linksForContext(context);
  return (
    <footer className="site-footer" aria-label="Ibby Auto Works footer">
      <div className="footer-version" aria-label="Version and build">
        <strong>Version {appVersion}</strong>
        <span>{appBuildLabel}</span>
      </div>
      <nav className="footer-links" aria-label="Footer links">
        {links.map((link) => (
          <a href={link.href} key={link.label} target={link.href.startsWith("http") ? "_blank" : undefined} rel={link.href.startsWith("http") ? "noreferrer" : undefined}>{link.label}</a>
        ))}
      </nav>
      <div className="footer-brand">
        <strong>{appDisplayName}</strong>
        <span>{copyrightNotice}</span>
      </div>
    </footer>
  );
}
