import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';
import { apiPost } from '@/lib/api';

export default function CreateProject() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    titleEn: '',
    titleBn: '',
    descriptionEn: '',
    descriptionBn: '',
    category: '',
    status: '',
    budget: '',
    imageUrl: '',
    country: '',
    city: '',
    thana: '',
    startDate: '',
    endDate: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      await apiPost('/api/projects', {
        titleEn: formData.titleEn,
        titleBn: formData.titleBn,
        descriptionEn: formData.descriptionEn,
        descriptionBn: formData.descriptionBn,
        category: formData.category,
        status: formData.status,
        budget: formData.budget,
        imageUrl: formData.imageUrl,
      });
      toast({
        title: t('প্রকল্প জমা হয়েছে', 'Project submitted'),
        description: t('নতুন প্রকল্পটি তালিকায় যুক্ত হয়েছে।', 'The new project has been added to the list.'),
      });
      // Ensure projects page refetches
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      setLocation('/projects');
    } catch (err: any) {
      setError(err.message || 'Failed to create project');
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
              {t("নতুন প্রকল্প তৈরি করুন", "Create a New Project")}
            </CardTitle>
            <CardDescription>
              {t("আপনার প্রকল্পের বিবরণ নিচের ফর্মটিতে পূরণ করুন।", "Please fill out the details of your project in the form below.")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Project Title Fields */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="titleEn">{t("প্রকল্পের নাম (ইংরেজি)", "Project Title (English)")}</Label>
                  <Input id="titleEn" name="titleEn" value={formData.titleEn} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="titleBn">{t("প্রকল্পের নাম (বাংলা)", "Project Title (Bangla)")}</Label>
                  <Input id="titleBn" name="titleBn" value={formData.titleBn} onChange={handleChange} required />
                </div>
              </div>

              {/* Project Description Fields */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="descriptionEn">{t("প্রকল্পের বিবরণ (ইংরেজি)", "Project Description (English)")}</Label>
                  <Textarea id="descriptionEn" name="descriptionEn" value={formData.descriptionEn} onChange={handleChange} required className="min-h-[120px]" />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="descriptionBn">{t("প্রকল্পের বিবরণ (বাংলা)", "Project Description (Bangla)")}</Label>
                  <Textarea id="descriptionBn" name="descriptionBn" value={formData.descriptionBn} onChange={handleChange} required className="min-h-[120px]" />
                </div>
              </div>

              {/* Category and Status */}
              <div className="grid md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <Label htmlFor="category">{t("বিভাগ", "Category")}</Label>
                    <Select name="category" onValueChange={handleSelectChange('category')} required>
                        <SelectTrigger>
                            <SelectValue placeholder={t("একটি বিভাগ নির্বাচন করুন", "Select a category")} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Infrastructure">{t("অবকাঠামো", "Infrastructure")}</SelectItem>
                            <SelectItem value="Education">{t("শিক্ষা", "Education")}</SelectItem>
                            <SelectItem value="Environment">{t("পরিবেশ", "Environment")}</SelectItem>
                            <SelectItem value="Healthcare">{t("স্বাস্থ্য", "Healthcare")}</SelectItem>
                            <SelectItem value="Technology">{t("প্রযুক্তি", "Technology")}</SelectItem>
                        </SelectContent>
                    </Select>
                 </div>
                 <div className="space-y-2">
                    <Label htmlFor="status">{t("অবস্থা", "Status")}</Label>
                    <Select name="status" onValueChange={handleSelectChange('status')} required>
                        <SelectTrigger>
                            <SelectValue placeholder={t("একটি অবস্থা নির্বাচন করুন", "Select a status")} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Planning">{t("পরিকল্পনা", "Planning")}</SelectItem>
                            <SelectItem value="Active">{t("সক্রিয়", "Active")}</SelectItem>
                            <SelectItem value="Implementation">{t("বাস্তবায়ন", "Implementation")}</SelectItem>
                             <SelectItem value="Completed">{t("সম্পন্ন", "Completed")}</SelectItem>
                        </SelectContent>
                    </Select>
                 </div>
              </div>

              {/* Budget and Image URL */}
              <div className="grid md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                  <Label htmlFor="budget">{t("বাজেট", "Budget")}</Label>
                  <Input id="budget" name="budget" placeholder="e.g., ৳50,00,000" value={formData.budget} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="imageUrl">{t("ছবির ইউআরএল", "Image URL")}</Label>
                  <Input id="imageUrl" name="imageUrl" placeholder="https://example.com/image.jpg" value={formData.imageUrl} onChange={handleChange} />
                </div>
              </div>
              
              {/* Location Fields (not stored yet, kept for UI completeness) */}
              <div className="space-y-2 pt-4 border-t">
                 <h3 className="text-lg font-medium">{t("অবস্থান", "Location")}</h3>
                 <div className="grid md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="country">{t("দেশ", "Country")}</Label>
                      <Input id="country" name="country" value={formData.country} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">{t("শহর/জেলা", "City/District")}</Label>
                      <Input id="city" name="city" value={formData.city} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="thana">{t("থানা/উপজেলা", "Thana/Upazila")}</Label>
                      <Input id="thana" name="thana" value={formData.thana} onChange={handleChange} />
                    </div>
                 </div>
              </div>

              {/* Date Fields (not stored yet) */}
               <div className="grid md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                  <Label htmlFor="startDate">{t("শুরুর তারিখ", "Start Date")}</Label>
                  <Input id="startDate" name="startDate" type="date" value={formData.startDate} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">{t("শেষ তারিখ", "End Date")}</Label>
                  <Input id="endDate" name="endDate" type="date" value={formData.endDate} onChange={handleChange} />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                {error && <p className="text-sm text-destructive mb-2">{error}</p>}
                <Button type="submit" className="w-full text-lg py-6" disabled={submitting}>
                  {t("প্রকল্প জমা দিন", "Submit Project")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

