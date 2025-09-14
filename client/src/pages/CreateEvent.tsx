import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';

export default function CreateEvent() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    titleEn: '',
    titleBn: '',
    descriptionEn: '',
    descriptionBn: '',
    category: '',
    location: '',
    date: '',
    imageUrl: '',
    volunteersNeeded: '',
    organizer: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (!res.ok) {
          if (!cancelled) {
            toast({ title: t('লগইন প্রয়োজন', 'Login required'), description: t('ইভেন্ট প্রস্তাব করতে লগইন করুন।', 'Please log in to propose an event.') });
            setLocation('/login');
          }
        }
      } catch {
        if (!cancelled) {
          toast({ title: t('লগইন প্রয়োজন', 'Login required'), description: t('ইভেন্ট প্রস্তাব করতে লগইন করুন।', 'Please log in to propose an event.') });
          setLocation('/login');
        }
      }
    })();
    return () => { cancelled = true; };
  }, [setLocation, t, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string) => (value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/events/propose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          titleEn: formData.titleEn,
          titleBn: formData.titleBn,
          descriptionEn: formData.descriptionEn,
          descriptionBn: formData.descriptionBn,
          category: formData.category,
          date: formData.date,
          location: formData.location,
          imageUrl: formData.imageUrl,
          volunteersNeeded: formData.volunteersNeeded,
        })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to submit event');
      }
      toast({
        title: t('ইভেন্ট জমা হয়েছে', 'Event submitted'),
        description: t('আপনার ইভেন্টটি অনুমোদনের অপেক্ষায় আছে।', 'Your event is pending approval.'),
      });
      setLocation('/events');
    } catch (err: any) {
      setError(err.message || 'Failed to submit event');
      toast({ title: t('ত্রুটি', 'Error'), description: err.message || t('জমা ব্যর্থ হয়েছে', 'Submission failed'), variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex-1 py-16 bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="w-full animate-fade-in shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl md:text-4xl font-bold">
              {t("নতুন ইভেন্ট তৈরি করুন", "Create a New Event")}
            </CardTitle>
            <CardDescription>
              {t("আপনার ইভেন্টের বিবরণ নিচের ফর্মটিতে পূরণ করুন।", "Please fill out the details of your event in the form below.")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Event Title Fields */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="titleEn">{t("ইভেন্টের নাম (ইংরেজি)", "Event Title (English)")}</Label>
                  <Input id="titleEn" name="titleEn" value={formData.titleEn} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="titleBn">{t("ইভেন্টের নাম (বাংলা)", "Event Title (Bangla)")}</Label>
                  <Input id="titleBn" name="titleBn" value={formData.titleBn} onChange={handleChange} required />
                </div>
              </div>

              {/* Event Description Fields */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="descriptionEn">{t("ইভেন্টের বিবরণ (ইংরেজি)", "Event Description (English)")}</Label>
                  <Textarea id="descriptionEn" name="descriptionEn" value={formData.descriptionEn} onChange={handleChange} required className="min-h-[120px]" />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="descriptionBn">{t("ইভেন্টের বিবরণ (বাংলা)", "Event Description (Bangla)")}</Label>
                  <Textarea id="descriptionBn" name="descriptionBn" value={formData.descriptionBn} onChange={handleChange} required className="min-h-[120px]" />
                </div>
              </div>

              {/* Category and Location */}
              <div className="grid md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <Label htmlFor="category">{t("বিভাগ", "Category")}</Label>
                    <Select name="category" onValueChange={handleSelectChange('category')} required>
                        <SelectTrigger>
                            <SelectValue placeholder={t("একটি বিভাগ নির্বাচন করুন", "Select a category")} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Environment">{t("পরিবেশ", "Environment")}</SelectItem>
                            <SelectItem value="Community Service">{t("সমাজসেবা", "Community Service")}</SelectItem>
                            <SelectItem value="Education">{t("শিক্ষা", "Education")}</SelectItem>
                            <SelectItem value="Healthcare">{t("স্বাস্থ্য", "Healthcare")}</SelectItem>
                            <SelectItem value="Technology">{t("প্রযুক্তি", "Technology")}</SelectItem>
                             <SelectItem value="Agriculture">{t("কৃষি", "Agriculture")}</SelectItem>
                        </SelectContent>
                    </Select>
                 </div>
                 <div className="space-y-2">
                  <Label htmlFor="location">{t("অবস্থান", "Location")}</Label>
                  <Input id="location" name="location" value={formData.location} onChange={handleChange} required />
                </div>
              </div>

              {/* Date and Image URL */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="date">{t("তারিখ", "Date")}</Label>
                  <Input id="date" name="date" type="date" value={formData.date} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="imageUrl">{t("ছবির ইউআরএল", "Image URL")}</Label>
                  <Input id="imageUrl" name="imageUrl" placeholder="https://example.com/image.jpg" value={formData.imageUrl} onChange={handleChange} />
                </div>
              </div>
              
              {/* Volunteers and Organizer */}
               <div className="grid md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                  <Label htmlFor="volunteersNeeded">{t("প্রয়োজনীয় স্বেচ্ছাসেবক", "Volunteers Needed")}</Label>
                  <Input id="volunteersNeeded" name="volunteersNeeded" type="number" placeholder="e.g., 50" value={formData.volunteersNeeded} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="organizer">{t("আয়োজক", "Organizer")}</Label>
                  <Input id="organizer" name="organizer" value={formData.organizer} onChange={handleChange} required />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                {error && <p className="text-sm text-destructive mb-2">{error}</p>}
                <Button type="submit" className="w-full text-lg py-6" disabled={submitting}>
                  {t("ইভেন্ট জমা দিন", "Submit Event")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

