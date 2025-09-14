import { useState } from 'react';
import { useLocation } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Register() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // State for all form fields
  const [formData, setFormData] = useState({
    role: 'citizen',
    firstName: '',
    lastName: '',
    idType: 'nid', // 'nid' or 'birthCert'
    idNumber: '',
    building: '',
    floor: '',
    street: '',
    thana: '',
    city: '',
    postalCode: '',
    country: 'Bangladesh',
    email: '',
    mobile: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };
  
  const handleIdTypeChange = (type: 'nid' | 'birthCert') => {
    setFormData(prev => ({ ...prev, idType: type }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: formData.role,
          username: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          idType: formData.idType,
          idNumber: formData.idNumber,
          building: formData.building,
          floor: formData.floor,
          street: formData.street,
          thana: formData.thana,
          city: formData.city,
          postalCode: formData.postalCode,
          country: formData.country,
          mobile: formData.mobile,
        })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Registration failed');
      }
      toast({
        title: t('রেজিস্ট্রেশন জমা হয়েছে', 'Registration submitted'),
        description: t('আপনার রেজিস্ট্রেশন জমা হয়েছে। ৭২ ঘন্টার মধ্যে অনুমোদন সম্পন্ন হবে।', 'Your registration has been submitted. Approval will be completed within 72 hours.'),
      });
      setTimeout(() => setLocation('/login'), 1600);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      toast({
        title: t('ত্রুটি', 'Error'),
        description: err.message || t('রেজিস্ট্রেশন ব্যর্থ হয়েছে', 'Registration failed'),
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 flex items-center justify-center bg-background py-16">
      <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">{t('অ্যাকাউন্ট তৈরি করুন', 'Create an Account')}</CardTitle>
            <CardDescription>
              {t('কমিউনিটিতে যোগ দিতে ফর্মটি পূরণ করুন', 'Fill out the form to join the community')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              {/* Role selector */}
              <div className="space-y-3 rounded-md border p-4">
                <Label>{t('ব্যবহারকারীর ধরন', 'User Type')}</Label>
                <div className="relative flex w-full rounded-lg bg-muted p-1">
                    <button type="button" onClick={() => setFormData(prev => ({ ...prev, role: 'citizen' }))} className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${formData.role === 'citizen' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}>
                        {t('সিটিজেন', 'Citizen')}
                    </button>
                    <button type="button" onClick={() => setFormData(prev => ({ ...prev, role: 'governmental' }))} className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${formData.role === 'governmental' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}>
                        {t('সরকারি', 'Governmental')}
                    </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">{t('নামের প্রথম অংশ', 'First Name')}</Label>
                  <Input id="firstName" placeholder={t('যেমনঃ রহিম', 'e.g., John')} required onChange={handleChange} value={formData.firstName} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">{t('নামের শেষাংশ', 'Last Name')}</Label>
                  <Input id="lastName" placeholder={t('যেমনঃ আহমেদ', 'e.g., Doe')} required onChange={handleChange} value={formData.lastName} />
                </div>
              </div>

              {/* Custom Slider for ID Type */}
              <div className="space-y-3 rounded-md border p-4">
                <Label>{t('পরিচয়পত্র', 'Identification')}</Label>
                <div className="relative flex w-full rounded-lg bg-muted p-1">
                    <button type="button" onClick={() => handleIdTypeChange('nid')} className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${formData.idType === 'nid' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}>
                        {t('জাতীয় পরিচয়পত্র', 'National ID')}
                    </button>
                    <button type="button" onClick={() => handleIdTypeChange('birthCert')} className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${formData.idType === 'birthCert' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}>
                        {t('জন্ম সনদ', 'Birth Certificate')}
                    </button>
                </div>
                <Input 
                    id="idNumber" 
                    placeholder={formData.idType === 'nid' 
                        ? t('আপনার এনআইডি নম্বর লিখুন', 'Enter your NID number') 
                        : t('আপনার জন্ম সনদ নম্বর লিখুন', 'Enter your Birth Certificate number')} 
                    required 
                    onChange={handleChange} 
                    value={formData.idNumber} 
                />
              </div>

              {/* Expanded Location Section */}
              <div className="space-y-3 rounded-md border p-4">
                <Label>{t('পূর্ণ ঠিকানা', 'Full Address')}</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="building" className="text-sm font-normal text-muted-foreground">{t('বিল্ডিং/বাসা নং', 'Building/House No.')}</Label>
                        <Input id="building" placeholder={t('যেমনঃ ১২৩/বি', 'e.g., 123/B')} required onChange={handleChange} value={formData.building} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="floor" className="text-sm font-normal text-muted-foreground">{t('ফ্লোর (ঐচ্ছিক)', 'Floor (Optional)')}</Label>
                        <Input id="floor" placeholder={t('যেমনঃ ৪র্থ তলা', 'e.g., 4th Floor')} onChange={handleChange} value={formData.floor} />
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="street" className="text-sm font-normal text-muted-foreground">{t('রাস্তার ঠিকানা', 'Street Address')}</Label>
                    <Input id="street" placeholder={t('যেমনঃ প্রধান সড়ক, সেক্টর ১০', 'e.g., Main Road, Sector 10')} required onChange={handleChange} value={formData.street} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="thana" className="text-sm font-normal text-muted-foreground">{t('থানা/উপজেলা', 'Thana/Upazila')}</Label>
                        <Input id="thana" placeholder={t('যেমনঃ উত্তরা', 'e.g., Uttara')} required onChange={handleChange} value={formData.thana} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="city" className="text-sm font-normal text-muted-foreground">{t('শহর/জেলা', 'City/District')}</Label>
                        <Input id="city" placeholder={t('যেমনঃ ঢাকা', 'e.g., Dhaka')} required onChange={handleChange} value={formData.city} />
                    </div>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="postalCode" className="text-sm font-normal text-muted-foreground">{t('পোস্ট কোড', 'Postal Code')}</Label>
                        <Input id="postalCode" placeholder={t('যেমনঃ ১২৩০', 'e.g., 1230')} required onChange={handleChange} value={formData.postalCode} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="country" className="text-sm font-normal text-muted-foreground">{t('দেশ', 'Country')}</Label>
                        <Input id="country" required onChange={handleChange} value={formData.country} />
                    </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="email">{t('ইমেইল', 'Email')}</Label>
                    <Input id="email" type="email" placeholder={t('আপনার ইমেইল লিখুন', 'Enter your email')} required onChange={handleChange} value={formData.email} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="mobile">{t('মোবাইল নম্বর', 'Mobile Number')}</Label>
                    <Input id="mobile" type="tel" placeholder={t('আপনার মোবাইল নম্বর', 'Your mobile number')} required onChange={handleChange} value={formData.mobile} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t('পাসওয়ার্ড', 'Password')}</Label>
                <Input id="password" type="password" placeholder={t('একটি শক্তিশালী পাসওয়ার্ড দিন', 'Enter a strong password')} required onChange={handleChange} value={formData.password} />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                <UserPlus className="mr-2 h-4 w-4" />
                {loading ? t('রেজিস্টার হচ্ছে…', 'Registering…') : t('রেজিস্টার করুন', 'Register')}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm">
              {t('ইতিমধ্যে একটি অ্যাকাউন্ট আছে?', 'Already have an account?')}{' '}
              <button onClick={() => setLocation('/login')} className="text-primary hover:underline font-semibold">
                {t('এখানে লগইন করুন', 'Login here')}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

