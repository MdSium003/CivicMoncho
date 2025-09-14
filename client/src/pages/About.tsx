import { useQuery } from "@tanstack/react-query";
import { AboutUs } from "@shared/schema";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Target, Eye, Heart, Mail, User, Facebook, Github } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DeveloperCardProps {
  name: string;
  role: string;
  email: string;
  avatar: string;
  description: string;
  githubUrl: string;
  facebookUrl: string;
}

const DeveloperCard = ({ name, role, email, avatar, description, githubUrl, facebookUrl }: DeveloperCardProps) => {
  // Construct the Gmail compose URL
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}`;

  return (
    <div 
      className="relative group rounded-2xl shadow-2xl overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 ease-in-out h-96 bg-cover bg-center"
      style={{ backgroundImage: `url(${avatar})` }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent group-hover:from-black/90 transition-all duration-300"></div>
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white flex flex-col justify-end h-full">
        <div>
          <h3 className="text-3xl font-bold">{name}</h3>
          <p className="text-purple-300 font-semibold mb-2">{role}</p>
          <p className="text-gray-200 mb-4 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-0 group-hover:h-auto">
            {description}
          </p>
          <div className="flex items-center justify-between mt-4">
            <a
              href={gmailUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-black bg-white hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-white transition duration-300"
            >
              <Mail className="h-4 w-4 mr-2" />
              Contact
            </a>
            <div className="flex space-x-3">
                <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white transition-colors"><Github size={20} /></a>
                <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white transition-colors"><Facebook size={20} /></a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function About() {
  const { t, language } = useLanguage();

  const { data: about, isLoading } = useQuery<AboutUs | null>({
    queryKey: ["/api/about"],
  });

  if (isLoading) {
    return (
      <main className="flex-1 py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Skeleton className="h-12 w-96 mx-auto mb-4" />
            <Skeleton className="h-6 w-2/3 mx-auto" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="overflow-hidden border-none shadow-lg bg-transparent">
                <Skeleton className="w-full h-64 rounded-t-lg" />
                <CardContent className="p-6 bg-gray-900 text-white rounded-b-lg -mt-12 relative z-10">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-3" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-5/6 mb-4" />
                  <div className="flex items-center justify-between mt-4">
                    <Skeleton className="h-10 w-24" />
                    <div className="flex space-x-3">
                      <Skeleton className="h-5 w-5" />
                      <Skeleton className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    );
  }

  // Default content if no data from database
  const defaultAbout = {
    titleBn: "আমাদের সম্পর্কে",
    titleEn: "About Us",
    contentBn: "CivicMoncho হল একটি উদ্ভাবনী নাগরিক সেবা প্ল্যাটফর্ম যা গণতান্ত্রিক অংশগ্রহণ ও স্বচ্ছ গভর্নেন্সের মাধ্যমে নাগরিকদের ক্ষমতায়ন করে। আমাদের লক্ষ্য হল সরকারি সেবাগুলোকে আরও সহজলভ্য, স্বচ্ছ এবং নাগরিক-কেন্দ্রিক করা।",
    contentEn: "CivicMoncho is an innovative civic service platform that empowers citizens through democratic participation and transparent governance. Our goal is to make government services more accessible, transparent, and citizen-centric.",
    missionBn: "গণতান্ত্রিক অংশগ্রহণ ও স্বচ্ছ গভর্নেন্সের মাধ্যমে নাগরিকদের ক্ষমতায়ন করা এবং সরকারি সেবাগুলোকে আরও সহজলভ্য ও কার্যকর করা।",
    missionEn: "To empower citizens through democratic participation and transparent governance, making government services more accessible and effective.",
    visionBn: "একটি ডিজিটাল বাংলাদেশ যেখানে প্রতিটি নাগরিকের কণ্ঠস্বর শোনা যায় এবং তাদের চাহিদা পূরণ করা হয়।",
    visionEn: "A digital Bangladesh where every citizen's voice is heard and their needs are met.",
    valuesBn: "স্বচ্ছতা, জবাবদিহিতা, অংশগ্রহণ, উদ্ভাবন এবং নাগরিক সেবার প্রতি প্রতিশ্রুতি।",
    valuesEn: "Transparency, accountability, participation, innovation, and commitment to citizen service.",
    imageUrl: "https://placehold.co/800x400/cccccc/000000?text=About+CivicMoncho"
  };

  const aboutData = about || defaultAbout;

  // Team members data
  const teamMembers = [
    {
      name: "Mohammad Sium",
      role: "CSE, BUET",
      email: "mdsium2004@gmail.com",
      avatar: "/sium.jpg",
      githubUrl: "https://github.com/MdSium003",
      facebookUrl: "https://www.facebook.com/Md.Sium.0003",
      description: "Mohammad is the creative mind behind the user interface, focusing on creating a seamless and engaging user experience."
    },
    {
      name: "Mahdiat Tarannum", 
      role: "CSE, BUET",
      email: "mahdiat.tarannum@gmail.com",
      avatar: "/mahdiat.jpg",
      githubUrl: "https://github.com/mahdiat-tarannum",
      facebookUrl: "https://www.facebook.com/mahdiat.tt",
      description: "Mahdiat shapes the product's look and feel, ensuring every interaction is both beautiful and functional."
    },
    {
      name: "Rafsan Jani",
      role: "CSE, BUET", 
      email: "rafsan.jani@gmail.com",
      avatar: "/rafsan.jpg",
      githubUrl: "https://github.com/rafsan-jani",
      facebookUrl: "https://www.facebook.com/rafsanjbi",
      description: "Rafsan defines the product's strategic direction, ensuring it solves real-world problems and achieves commercial success."
    }
  ];


  return (
    <main className="flex-1 py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4" data-testid="about-page-title">
            {language === "bn" ? aboutData.titleBn : aboutData.titleEn}
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto" data-testid="about-page-subtitle">
            {language === "bn" ? aboutData.contentBn : aboutData.contentEn}
          </p>
        </div>

        {/* Main Content - 2 horizontal parts: image left, 3 cards right */}
        <div className="grid md:grid-cols-2 gap-8 mb-16 h-96">
          {/* CivicMoncho Image - Takes left half */}
          <div className="md:col-span-1">
            <Card className="h-full">
              <CardContent className="p-0 h-full">
                <img 
                  src="/civic.jpg" 
                  alt={language === "bn" ? aboutData.titleBn : aboutData.titleEn}
                  className="w-full h-full object-cover rounded-lg"
                  data-testid="about-image"
                />
              </CardContent>
            </Card>
          </div>

          {/* Right side - 3 vertical cards */}
          <div className="md:col-span-1 grid grid-rows-3 gap-4 h-full">
            {/* Mission */}
            <Card className="h-full">
              <CardContent className="p-4 h-full flex flex-col justify-center">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {t("মিশন", "Mission")}
                  </h3>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed" data-testid="about-mission">
                  {language === "bn" ? aboutData.missionBn : aboutData.missionEn}
                </p>
              </CardContent>
            </Card>

            {/* Vision */}
            <Card className="h-full">
              <CardContent className="p-4 h-full flex flex-col justify-center">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-3">
                    <Eye className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {t("ভিশন", "Vision")}
                  </h3>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed" data-testid="about-vision">
                  {language === "bn" ? aboutData.visionBn : aboutData.visionEn}
                </p>
              </CardContent>
            </Card>

            {/* Values */}
            <Card className="h-full">
              <CardContent className="p-4 h-full flex flex-col justify-center">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center mr-3">
                    <Heart className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {t("মূল্যবোধ", "Values")}
                  </h3>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed" data-testid="about-values">
                  {language === "bn" ? aboutData.valuesBn : aboutData.valuesEn}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Team Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-8" data-testid="team-title">
            {t("আমাদের দল", "Our Team")}
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            {t(
              "আমাদের নিবেদিত দল যারা এই প্ল্যাটফর্মটিকে সম্ভব করেছেন।",
              "Our dedicated team who made this platform possible."
            )}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {teamMembers.map((member, index) => (
            <DeveloperCard
              key={index}
              name={member.name}
              role={member.role}
              email={member.email}
              avatar={member.avatar}
              description={member.description}
              githubUrl={member.githubUrl}
              facebookUrl={member.facebookUrl}
            />
          ))}
        </div>

        {/* Features Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8" data-testid="features-title">
            {t("আমাদের বৈশিষ্ট্য", "Our Features")}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                titleBn: "প্রকল্প ট্র্যাকিং",
                titleEn: "Project Tracking",
                descriptionBn: "সরকারি প্রকল্পগুলোর অগ্রগতি সরাসরি দেখুন",
                descriptionEn: "Track government projects in real-time"
              },
              {
                titleBn: "ইভেন্ট অংশগ্রহণ",
                titleEn: "Event Participation",
                descriptionBn: "স্থানীয় ইভেন্ট ও কার্যক্রমে অংশ নিন",
                descriptionEn: "Participate in local events and activities"
              },
              {
                titleBn: "আলোচনা ফোরাম",
                titleEn: "Discussion Forum",
                descriptionBn: "সম্প্রদায়ের সাথে মতবিনিময় করুন",
                descriptionEn: "Engage in community discussions"
              },
              {
                titleBn: "পরিষেবা কেন্দ্র",
                titleEn: "Service Locator",
                descriptionBn: "নিকটবর্তী সরকারি সেবা খুঁজুন",
                descriptionEn: "Find nearby government services"
              },
              {
                titleBn: "তথ্য কেন্দ্র",
                titleEn: "Information Desk",
                descriptionBn: "প্রয়োজনীয় তথ্য ও নির্দেশিকা পান",
                descriptionEn: "Access essential information and guidelines"
              },
              {
                titleBn: "স্বচ্ছতা",
                titleEn: "Transparency",
                descriptionBn: "সরকারি কার্যক্রমের স্বচ্ছতা নিশ্চিত করুন",
                descriptionEn: "Ensure transparency in government operations"
              }
            ].map((feature, index) => (
              <Card key={index}>
                <CardContent className="p-6 text-center">
                  <h3 className="text-lg font-semibold mb-2" data-testid={`feature-title-${index}`}>
                    {t(feature.titleBn, feature.titleEn)}
                  </h3>
                  <p className="text-muted-foreground text-sm" data-testid={`feature-description-${index}`}>
                    {t(feature.descriptionBn, feature.descriptionEn)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-primary text-primary-foreground rounded-xl p-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4" data-testid="cta-title">
            {t("আমাদের সাথে যোগ দিন", "Join Us")}
          </h2>
          <p className="text-lg mb-6 opacity-90" data-testid="cta-description">
            {t(
              "একটি উন্নত বাংলাদেশ গড়তে আমাদের সাথে অংশ নিন।",
              "Be part of building a better Bangladesh."
            )}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/register" 
              className="bg-accent text-accent-foreground hover:bg-accent/90 px-8 py-3 rounded-lg font-semibold transition-all hover:scale-105"
              data-testid="register-button"
            >
              {t("নিবন্ধন করুন", "Register Now")}
            </a>
            <a 
              href="/contact" 
              className="border border-accent text-accent hover:bg-accent hover:text-accent-foreground px-8 py-3 rounded-lg font-semibold transition-all hover:scale-105"
              data-testid="contact-button"
            >
              {t("যোগাযোগ করুন", "Contact Us")}
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
