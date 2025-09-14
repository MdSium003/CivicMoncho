import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from "../contexts/LanguageContext";
import { Download, User, MapPin, Mail, Phone, Award, Calendar, Clock, Loader2 } from 'lucide-react';
import { apiGet, apiPost } from '@/lib/api';

// --- ADDED: Self-contained Button component to resolve import error ---
const Button = ({ children, className, variant, size, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'outline' | 'ghost' | 'default', size?: 'sm' | 'icon' | 'default' }) => {
  const baseStyle = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background";
  
  const sizeStyles = {
    default: "h-10 py-2 px-4",
    sm: "h-9 px-3 rounded-md",
    icon: "h-10 w-10",
  };

  const variantStyles = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    outline: "border border-input hover:bg-accent hover:text-accent-foreground",
  };

  const sizeClass = sizeStyles[size || 'default'];
  const variantClass = variantStyles[variant || 'default'];

  return (
    <button className={`${baseStyle} ${sizeClass} ${variantClass} ${className}`} {...props}>
      {children}
    </button>
  );
};


type SessionUser = {
  id: string;
  username: string;
  role: 'citizen' | 'governmental';
  firstName: string;
  lastName: string;
  idType: string;
  idNumber: string;
  building: string;
  floor: string | null;
  street: string;
  thana: string;
  city: string;
  postalCode: string;
  country: string;
  mobile: string;
} | null;

// Mock user data for a Bangladeshi person
const userProfile = {
  nameBn: "মোঃ আরিফুল ইসলাম",
  nameEn: "Md. Ariful Islam",
  nid: "19951234567890123",
  addressBn: "বাড়ি ১২৩, রোড ৪, সেক্টর ১০, উত্তরা, ঢাকা-১২৩০",
  addressEn: "House 123, Road 4, Sector 10, Uttara, Dhaka-1230",
  email: "ariful.islam.civic@example.com",
  phone: "01712345678",
};

// Types for finished events
type FinishedEvent = {
  event: {
    id: string;
    titleBn: string;
    titleEn: string;
    descriptionBn: string;
    descriptionEn: string;
    category: string;
    date: string;
    location: string;
    imageUrl: string;
  };
  participation: {
    id: string;
    eventId: string;
    userId: string;
    participationType: 'volunteer' | 'going';
    certificateGenerated: number;
    certificateUrl: string | null;
    createdAt: string;
  };
};

export default function MyProfile() {
  const { t } = useLanguage();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<SessionUser>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiGet<SessionUser>('/api/auth/me');
        if (!cancelled) setUser(data);
      } catch {
        navigate('/login');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [navigate]);

  // Fetch finished events
  const { data: finishedEvents, isLoading: eventsLoading, error: eventsError } = useQuery<FinishedEvent[]>({
    queryKey: ['/api/user/finished-events'],
    enabled: !!user,
  });

  // Debug logging
  useEffect(() => {
    if (finishedEvents) {
      console.log('Finished events:', finishedEvents);
    }
    if (eventsError) {
      console.error('Events error:', eventsError);
    }
  }, [finishedEvents, eventsError]);

  // Generate certificate mutation
  const generateCertificateMutation = useMutation({
    mutationFn: async (participationId: string) => {
      return await apiPost(`/api/user/generate-certificate/${participationId}`);
    },
    onSuccess: () => {
      // Refetch finished events to get updated certificate status
      queryClient.invalidateQueries({ queryKey: ['/api/user/finished-events'] });
    },
  });

  const handleGenerateCertificate = (participationId: string) => {
    generateCertificateMutation.mutate(participationId);
  };

  const handleDownloadCertificate = (participationId: string, eventTitle: string) => {
    const link = document.createElement('a');
    link.href = `/api/certificates/${participationId}.png`;
    link.target = '_blank';
    
    // Sanitize the event name to create a valid filename
    const fileName = `Certificate-${eventTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`;
    link.setAttribute('download', fileName);
    
    // Append to the DOM, trigger the click, and then remove it
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getParticipationTypeText = (type: string) => {
    switch (type) {
      case 'volunteer':
        return t('স্বেচ্ছাসেবক', 'Volunteer');
      case 'going':
        return t('অংশগ্রহণকারী', 'Participant');
      default:
        return type;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-muted-foreground">{t('লোড হচ্ছে…', 'Loading…')}</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="bg-background text-foreground min-h-screen">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <h1 className="text-3xl font-bold text-primary mb-6 border-b pb-4">
          {t("আমার প্রোফাইল", "My Profile")} — <span className="font-medium">{user.username}</span> <span className="text-xs ml-2 px-2 py-1 rounded bg-muted text-muted-foreground">{t(user.role === 'governmental' ? 'সরকারি' : 'সিটিজেন', user.role)}</span>
        </h1>

        {/* Profile Information Section */}
        <div className="bg-card p-6 rounded-lg shadow-md mb-8">
          <div className="flex flex-col sm:flex-row items-center">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4 sm:mb-0 sm:mr-6">
              <User className="w-12 h-12 text-muted-foreground" />
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-2xl font-semibold">{user.firstName} {user.lastName}</h2>
              <p className="text-muted-foreground">{t(`পরিচয়পত্র: ${user.idType.toUpperCase()} — ${user.idNumber}`, `ID: ${user.idType.toUpperCase()} — ${user.idNumber}`)}</p>
            </div>
          </div>
          <div className="mt-6 space-y-3 text-sm">
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-3 text-primary" />
              <span>{`${user.building}${user.floor ? ', ' + user.floor : ''}, ${user.street}, ${user.thana}, ${user.city} - ${user.postalCode}, ${user.country}`}</span>
            </div>
            <div className="flex items-center">
              <Mail className="w-4 h-4 mr-3 text-primary" />
              <span>{user.username}</span>
            </div>
            <div className="flex items-center">
              <Phone className="w-4 h-4 mr-3 text-primary" />
              <span>{user.mobile}</span>
            </div>
          </div>
        </div>

        {/* Finished Events Section */}
        <div>
          <h2 className="text-2xl font-bold text-primary mb-4 flex items-center">
             <Award className="w-6 h-6 mr-3"/>
            {t("সম্পন্ন ইভেন্টসমূহ", "Finished Events")}
          </h2>
          
          {eventsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span className="text-muted-foreground">{t('লোড হচ্ছে…', 'Loading…')}</span>
            </div>
          ) : finishedEvents && finishedEvents.length > 0 ? (
            <div className="space-y-4">
              {finishedEvents.map((finishedEvent) => (
                <div key={finishedEvent.participation.id} className="bg-card p-6 rounded-lg shadow-md border">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <img 
                          src={finishedEvent.event.imageUrl} 
                          alt={finishedEvent.event.titleEn}
                          className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                        />
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-card-foreground mb-2">
                            {t(finishedEvent.event.titleBn, finishedEvent.event.titleEn)}
                          </h3>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(finishedEvent.event.date)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              <span>{finishedEvent.event.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Award className="w-4 h-4" />
                              <span>{getParticipationTypeText(finishedEvent.participation.participationType)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-2">
                      {finishedEvent.participation.certificateGenerated ? (
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={() => handleDownloadCertificate(
                            finishedEvent.participation.id, 
                            finishedEvent.event.titleEn
                          )}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          {t("সার্টিফিকেট ডাউনলোড", "Download Certificate")}
                        </Button>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleGenerateCertificate(finishedEvent.participation.id)}
                          disabled={generateCertificateMutation.isPending}
                        >
                          {generateCertificateMutation.isPending ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              {t("জেনারেট হচ্ছে...", "Generating...")}
                            </>
                          ) : (
                            <>
                              <Clock className="w-4 h-4 mr-2" />
                              {t("সার্টিফিকেট তৈরি করুন", "Generate Certificate")}
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">{t("কোনো সম্পন্ন ইভেন্ট নেই", "No finished events yet")}</p>
              <p className="text-sm">{t("ইভেন্টে অংশগ্রহণ করুন এবং সার্টিফিকেট পান", "Participate in events to earn certificates")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

