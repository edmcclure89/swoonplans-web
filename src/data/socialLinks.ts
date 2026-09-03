import type { ComponentType, SVGProps } from 'react';
import { FaInstagram, FaTiktok, FaFacebookF, FaLinkedinIn, FaYoutube } from 'react-icons/fa6';

// react-icons ships its own IconBaseProps, which does not resolve className
// cleanly against the React 19 types. Typing the icons as plain SVG components
// keeps the call sites (<Icon className="w-4 h-4" />) correct and type-safe.
export type SocialLink = {
  label: string;
  href: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
};

export const socialLinks: SocialLink[] = [
  { label: 'Instagram', href: 'https://www.instagram.com/swoon_plans/', Icon: FaInstagram },
  { label: 'TikTok', href: 'https://www.tiktok.com/@swoon_plans', Icon: FaTiktok },
  { label: 'Facebook', href: 'https://www.facebook.com/profile.php?id=61592905060139', Icon: FaFacebookF },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/137294183/', Icon: FaLinkedinIn },
  { label: 'YouTube', href: 'https://www.youtube.com/@SwoonPlans', Icon: FaYoutube },
];
