const defaultVersion = "1.5.1";
const defaultBuild = "202606261030";

export const appVersion = process.env.NEXT_PUBLIC_APP_VERSION || defaultVersion;
export const appBuild = process.env.NEXT_PUBLIC_APP_BUILD || defaultBuild;
export const appBuildLabel = `Build ${appBuild}`;

export const supportEmail = "ibbyautoworks@gmail.com";
export const appDisplayName = "Ibby Auto Works™";
export const copyrightNotice = "© 2026 Ibby Auto Works™. All rights reserved.";

export const footerLinks = {
  privacy: { label: "Privacy Policy", href: "https://github.com/IbbyAutoWorks/IbbyAutoWorks/blob/main/docs/privacy-policy.md" },
  terms: { label: "Terms of Service", href: "https://github.com/IbbyAutoWorks/IbbyAutoWorks/blob/main/docs/terms-of-service.md" },
  issues: { label: "Issues", href: "https://github.com/IbbyAutoWorks/IbbyAutoWorks/issues" },
  request: { label: "Request Feature", href: "https://github.com/IbbyAutoWorks/IbbyAutoWorks/issues" },
  contact: { label: "Contact", href: `mailto:${supportEmail}` }
};
