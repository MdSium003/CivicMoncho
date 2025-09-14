import { useLanguage } from "@/contexts/LanguageContext";
import { Facebook, Twitter, Linkedin, Instagram } from "lucide-react";

export default function Footer() {
  const { t } = useLanguage();

  const quickLinks = [
    { labelBn: "আমাদের সম্পর্কে", labelEn: "About Us" },
    { labelBn: "গোপনীয়তা নীতি", labelEn: "Privacy Policy" },
    { labelBn: "সেবার শর্তাবলী", labelEn: "Terms of Service" },
    { labelBn: "যোগাযোগ", labelEn: "Contact" },
  ];

  const supportLinks = [
    { labelBn: "সহায়তা কেন্দ্র", labelEn: "Help Center" },
    { labelBn: "প্রশ্নোত্তর", labelEn: "FAQ" },
    { labelBn: "কমিউনিটি গাইডলাইন", labelEn: "Community Guidelines" },
    { labelBn: "সমস্যা রিপোর্ট করুন", labelEn: "Report Issue" },
  ];

  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold text-primary mb-4" data-testid="footer-logo">
              CivicMoncho
            </h3>
            <p className="text-muted-foreground mb-4" data-testid="footer-description">
              {t(
                "গণতান্ত্রিক অংশগ্রহণ ও স্বচ্ছ গভর্নেন্সের মাধ্যমে নাগরিকদের ক্ষমতায়ন।",
                "Empowering citizens through democratic participation and transparent governance."
              )}
            </p>
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="text-muted-foreground hover:text-primary transition-colors"
                data-testid="social-facebook"
              >
                <Facebook className="h-6 w-6" />
              </a>
              <a 
                href="#" 
                className="text-muted-foreground hover:text-primary transition-colors"
                data-testid="social-twitter"
              >
                <Twitter className="h-6 w-6" />
              </a>
              <a 
                href="#" 
                className="text-muted-foreground hover:text-primary transition-colors"
                data-testid="social-linkedin"
              >
                <Linkedin className="h-6 w-6" />
              </a>
              <a 
                href="#" 
                className="text-muted-foreground hover:text-primary transition-colors"
                data-testid="social-instagram"
              >
                <Instagram className="h-6 w-6" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-card-foreground mb-4">
              {t("দ্রুত লিংক", "Quick Links")}
            </h4>
            <ul className="space-y-2">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a 
                    href="#" 
                    className="text-muted-foreground hover:text-primary transition-colors"
                    data-testid={`quick-link-${index}`}
                  >
                    {t(link.labelBn, link.labelEn)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-semibold text-card-foreground mb-4">
              {t("সহায়তা", "Support")}
            </h4>
            <ul className="space-y-2">
              {supportLinks.map((link, index) => (
                <li key={index}>
                  <a 
                    href="#" 
                    className="text-muted-foreground hover:text-primary transition-colors"
                    data-testid={`support-link-${index}`}
                  >
                    {t(link.labelBn, link.labelEn)}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm" data-testid="copyright">
            {t(
              "© ২০২৫ CivicMoncho by Team DemocriTricks। সকল অধিকার সংরক্ষিত।",
              "© 2025 CivicMoncho by Team DemocriTricks. All rights reserved."
            )}
          </p>
          <p className="text-muted-foreground text-sm mt-2 md:mt-0" data-testid="made-with-love">
            {t("গণতন্ত্রের জন্য ❤️ দিয়ে তৈরি", "Made with ❤️ for democracy")}
          </p>
        </div>
      </div>
    </footer>
  );
}
