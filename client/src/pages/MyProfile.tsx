import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useLanguage } from "../contexts/LanguageContext";
import { Download, User, MapPin, Mail, Phone, Award } from 'lucide-react';

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

// Mock event data
const eventsWorked = [
  {
    id: 1,
    nameBn: "বৃক্ষরোপণ কর্মসূচি ২০২২",
    nameEn: "Tree Plantation Program 2022",
  },
  {
    id: 2,
    nameBn: "קהילה ניקיון כונן",
    nameEn: "Community Cleanup Drive",
  },
  {
    id: 3,
    nameBn: "বিনামূল্যে স্বাস্থ্য পরীক্ষা ক্যাম্প",
    nameEn: "Free Health Check-up Camp",
  },
];

export default function MyProfile() {
  const { t } = useLanguage();
  const [, navigate] = useLocation();
  const [user, setUser] = useState<SessionUser>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (res.status === 401) {
          navigate('/login');
          return;
        }
        const data = await res.json();
        if (!cancelled) setUser(data);
      } catch {
        navigate('/login');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [navigate]);

  const handleDownload = (eventName: string) => {
    const certificateUrl = '/certificate.jpg';
    const link = document.createElement('a');
    link.href = certificateUrl;
    
    // Sanitize the event name to create a valid filename
    const fileName = `Certificate-${eventName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.jpeg`;
    link.setAttribute('download', fileName);
    
    // Append to the DOM, trigger the click, and then remove it
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

        {/* Events Worked Section */}
        <div>
          <h2 className="text-2xl font-bold text-primary mb-4 flex items-center">
             <Award className="w-6 h-6 mr-3"/>
            {t("যেসব ইভেন্টে কাজ করেছি", "Events Worked")}
          </h2>
          <div className="space-y-4">
            {eventsWorked.map((event) => (
              <div key={event.id} className="bg-card p-4 rounded-lg shadow-md flex justify-between items-center">
                <p className="font-medium">{t(event.nameBn, event.nameEn)}</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDownload(t(event.nameBn, event.nameEn))}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {t("সার্টিফিকেট ডাউনলোড", "Download Certificate")}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

