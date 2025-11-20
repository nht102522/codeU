import React from "react";
import { footerLinks, socialIcon } from "../constants";
import codeuLogo from "../assets/images/codeuLogo.png";

const Footer = () => {
  return (
    <footer className="bg-blue-200 mt-20 py-16">
      <div className="max-w-[1440px] mx-auto px-8 text-center">
        <div className="flex justify-center gap-12 mb-8 text-lg">
          {footerLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="hover:text-blue-600 transition"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex justify-center gap-6 mb-8">
          {socialIcon.map((s) => (
            <a key={s.label} href="#" aria-label={s.label}>
              <img src={s.iconUrl} alt={s.label} className="w-10 h-10" />
            </a>
          ))}
        </div>

        <div className="flex justify-center items-center gap-2 mb-4">
          <img src={codeuLogo} alt="CodeU Logo" className="h-8" />
          <span className="text-2xl font-bold">CODEU</span>
        </div>
        <p className="text-gray-600">2025 CodeU Team, Drexel University</p>
      </div>
    </footer>
  );
};

export default Footer;
