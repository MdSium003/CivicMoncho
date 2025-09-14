import { useQuery } from "@tanstack/react-query";
import { ContactInfo } from "@shared/schema";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, Mail, Globe, Clock, Facebook, Twitter, Linkedin, Instagram } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiPost } from "@/lib/api";

export default function Contact() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: contact, isLoading } = useQuery<ContactInfo | null>({
    queryKey: ["/api/contact"],
  });

  // Default contact info if no data from database
  const defaultContact = {
    titleBn: "যোগাযোগ",
    titleEn: "Contact Us",
    addressBn: "ধানমন্ডি, ঢাকা-১২০৫, বাংলাদেশ",
    addressEn: "Dhanmondi, Dhaka-1205, Bangladesh",
    phone: "+880 1234 567890",
    email: "info@civicmoncho.gov.bd",
    website: "www.civicmoncho.gov.bd",
    officeHoursBn: "রবিবার - বৃহস্পতিবার: সকাল ৯টা - বিকাল ৫টা",
    officeHoursEn: "Sunday - Thursday: 9:00 AM - 5:00 PM",
    mapEmbed: null,
    socialMedia: JSON.stringify({
      facebook: "https://facebook.com/civicmoncho",
      twitter: "https://twitter.com/civicmoncho",
      linkedin: "https://linkedin.com/company/civicmoncho",
      instagram: "https://instagram.com/civicmoncho"
    })
  };

  const contactData = contact || defaultContact;
  const socialMedia = contactData.socialMedia ? JSON.parse(contactData.socialMedia) : {};

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await apiPost('/api/contact/submit', formData);
      
      toast({
        title: t('বার্তা পাঠানো হয়েছে', 'Message Sent'),
        description: t('আপনার বার্তা সফলভাবে পাঠানো হয়েছে।', 'Your message has been sent successfully.'),
      });
      
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      console.error('Contact form submission error:', error);
      toast({
        title: t('ত্রুটি', 'Error'),
        description: error instanceof Error ? error.message : t('বার্তা পাঠাতে ব্যর্থ। আবার চেষ্টা করুন।', 'Failed to send message. Please try again.'),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <main className="flex-1 py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Skeleton className="h-12 w-96 mx-auto mb-4" />
            <Skeleton className="h-6 w-2/3 mx-auto" />
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <Skeleton className="h-64 w-full" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4" data-testid="contact-page-title">
            {language === "bn" ? contactData.titleBn : contactData.titleEn}
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto" data-testid="contact-page-subtitle">
            {t(
              "আমাদের সাথে যোগাযোগ করুন। আমরা আপনার প্রশ্ন ও পরামর্শের জন্য এখানে আছি।",
              "Get in touch with us. We're here to answer your questions and provide guidance."
            )}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            {/* Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="w-5 h-5 text-primary mr-2" />
                  {t("ঠিকানা", "Address")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground" data-testid="contact-address">
                  {language === "bn" ? contactData.addressBn : contactData.addressEn}
                </p>
              </CardContent>
            </Card>

            {/* Phone */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Phone className="w-5 h-5 text-primary mr-2" />
                  {t("ফোন", "Phone")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <a 
                  href={`tel:${contactData.phone}`}
                  className="text-muted-foreground hover:text-primary transition-colors"
                  data-testid="contact-phone"
                >
                  {contactData.phone}
                </a>
              </CardContent>
            </Card>

            {/* Email */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="w-5 h-5 text-primary mr-2" />
                  {t("ইমেইল", "Email")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <a 
                  href={`mailto:${contactData.email}`}
                  className="text-muted-foreground hover:text-primary transition-colors"
                  data-testid="contact-email"
                >
                  {contactData.email}
                </a>
              </CardContent>
            </Card>

            {/* Website */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="w-5 h-5 text-primary mr-2" />
                  {t("ওয়েবসাইট", "Website")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <a 
                  href={`https://${contactData.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  data-testid="contact-website"
                >
                  {contactData.website}
                </a>
              </CardContent>
            </Card>

            {/* Office Hours */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 text-primary mr-2" />
                  {t("অফিস সময়", "Office Hours")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground" data-testid="contact-hours">
                  {language === "bn" ? contactData.officeHoursBn : contactData.officeHoursEn}
                </p>
              </CardContent>
            </Card>

            {/* Social Media */}
            <Card>
              <CardHeader>
                <CardTitle>{t("সামাজিক যোগাযোগ", "Social Media")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-4">
                  {socialMedia.facebook && (
                    <a 
                      href={socialMedia.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                      data-testid="social-facebook"
                    >
                      <Facebook className="w-6 h-6" />
                    </a>
                  )}
                  {socialMedia.twitter && (
                    <a 
                      href={socialMedia.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                      data-testid="social-twitter"
                    >
                      <Twitter className="w-6 h-6" />
                    </a>
                  )}
                  {socialMedia.linkedin && (
                    <a 
                      href={socialMedia.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                      data-testid="social-linkedin"
                    >
                      <Linkedin className="w-6 h-6" />
                    </a>
                  )}
                  {socialMedia.instagram && (
                    <a 
                      href={socialMedia.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                      data-testid="social-instagram"
                    >
                      <Instagram className="w-6 h-6" />
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>{t("আমাদের সাথে যোগাযোগ করুন", "Get in Touch")}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-2">
                      {t("নাম", "Name")} *
                    </label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder={t("আপনার নাম লিখুন", "Enter your name")}
                      data-testid="contact-form-name"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">
                      {t("ইমেইল", "Email")} *
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder={t("আপনার ইমেইল লিখুন", "Enter your email")}
                      data-testid="contact-form-email"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium mb-2">
                      {t("বিষয়", "Subject")} *
                    </label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      placeholder={t("বার্তার বিষয় লিখুন", "Enter message subject")}
                      data-testid="contact-form-subject"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-2">
                      {t("বার্তা", "Message")} *
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={5}
                      placeholder={t("আপনার বার্তা লিখুন", "Enter your message")}
                      data-testid="contact-form-message"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isSubmitting}
                    data-testid="contact-form-submit"
                  >
                    {isSubmitting 
                      ? t('পাঠানো হচ্ছে...', 'Sending...') 
                      : t('বার্তা পাঠান', 'Send Message')
                    }
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Map Section */}
        {contactData.mapEmbed && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-center mb-8" data-testid="map-title">
              {t("আমাদের অবস্থান", "Our Location")}
            </h2>
            <div 
              className="w-full h-96 rounded-lg overflow-hidden"
              dangerouslySetInnerHTML={{ __html: contactData.mapEmbed }}
              data-testid="contact-map"
            />
          </div>
        )}
      </div>
    </main>
  );
}
