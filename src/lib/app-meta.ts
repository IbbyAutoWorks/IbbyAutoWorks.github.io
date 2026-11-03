const defaultVersion = "1.6.0";
const defaultBuild = "202606261105";

export const appVersion = process.env.NEXT_PUBLIC_APP_VERSION || defaultVersion;
export const appBuild = process.env.NEXT_PUBLIC_APP_BUILD || defaultBuild;
export const appBuildLabel = `Build ${appBuild}`;

export const supportEmail = "ibbyautoworks@gmail.com";
export const appDisplayName = "Ibby Auto Works™";
export const copyrightNotice = "© 2026 Ibby Auto Works™. All rights reserved.";

export const footerLinks = {
  privacy: { label: "Privacy Policy", href: "/legal/privacy" },
  terms: { label: "Terms of Service", href: "/legal/terms" },
  issues: { label: "Report a problem", href: "/feedback" },
  request: { label: "Request a feature", href: "/feedback?type=feature" },
  contact: { label: "Contact", href: `mailto:${supportEmail}` }
};
