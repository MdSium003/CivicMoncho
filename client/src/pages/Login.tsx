import { useState } from 'react';
import { useLocation } from 'wouter';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn } from 'lucide-react';

export default function Login() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'citizen' | 'governmental'>('citizen');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username: email, password, role })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Login failed');
      }
      window.dispatchEvent(new Event('auth:changed'));
      setLocation('/myprofile');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 flex items-center justify-center bg-background py-16">
      <div className="w-full max-w-md mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">{t('লগইন', 'Login')}</CardTitle>
            <CardDescription>
              {t('আপনার অ্যাকাউন্টে প্রবেশ করুন', 'Access your account')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Role selector */}
              <div className="space-y-2">
                <Label>{t('লগইন ধরন', 'Login Type')}</Label>
                <div className="relative flex w-full rounded-lg bg-muted p-1">
                  <button type="button" onClick={() => setRole('citizen')} className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${role === 'citizen' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}>
                    {t('সিটিজেন লগইন', 'Citizen Login')}
                  </button>
                  <button type="button" onClick={() => setRole('governmental')} className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${role === 'governmental' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}>
                    {t('সরকারি লগইন', 'Governmental Login')}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t('ইমেইল', 'Email')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('আপনার ইমেইল লিখুন', 'Enter your email')}
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">{t('পাসওয়ার্ড', 'Password')}</Label>
                  <a href="#" className="text-sm text-primary hover:underline">
                    {t('পাসওয়ার্ড ভুলে গেছেন?', 'Forgot password?')}
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder={t('আপনার পাসওয়ার্ড লিখুন', 'Enter your password')}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                <LogIn className="mr-2 h-4 w-4" />
                {loading ? t('লগইন হচ্ছে…', 'Logging in…') : t('লগইন করুন', 'Login')}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm">
              {t('অ্যাকাউন্ট নেই?', "Don't have an account?")}{' '}
              <button onClick={() => setLocation('/register')} className="text-primary hover:underline font-semibold">
                {t('নতুন অ্যাকাউন্ট তৈরি করুন', 'Create a new account')}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

