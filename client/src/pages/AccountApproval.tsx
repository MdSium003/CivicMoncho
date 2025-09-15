import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useLanguage } from "../contexts/LanguageContext";
import { Check, X, User, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import { apiGet, apiPost, apiDelete } from "@/lib/api";

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

type PendingApproval = {
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
  createdAt: string;
};

export default function AccountApproval() {
  const { t } = useLanguage();
  const [, navigate] = useLocation();
  const [approvals, setApprovals] = useState<PendingApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await apiGet('/api/auth/me');
        // ok
      } catch (e) {
        navigate('/login');
        return;
      }
      try {
        const user = await apiGet<any>('/api/auth/me');
        if (user.role !== 'governmental') {
          navigate('/myprofile');
          return;
        }
        const data = await apiGet<PendingApproval[]>('/api/approvals');
        if (!cancelled) setApprovals(data);
      } catch (err: any) {
        if (!cancelled) setError(err.message || 'Failed to load approvals');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [navigate]);

  const handleApprove = async (id: string) => {
    try {
      await apiPost(`/api/approvals/${id}/approve`);
      setApprovals(prev => prev.filter(a => a.id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to approve');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('আপনি কি নিশ্চিত যে আপনি এই অ্যাকাউন্টটি মুছে ফেলতে চান?', 'Are you sure you want to delete this account?'))) {
      return;
    }
    try {
      await apiDelete(`/api/approvals/${id}`);
      setApprovals(prev => prev.filter(a => a.id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-muted-foreground">{t('লোড হচ্ছে…', 'Loading…')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground min-h-screen">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        <h1 className="text-3xl font-bold text-primary mb-6 border-b pb-4">
          {t("অ্যাকাউন্ট অনুমোদন", "Account Approval")}
        </h1>

        {approvals.length === 0 ? (
          <div className="text-center py-12">
            <User className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg text-muted-foreground">
              {t("কোনো অনুমোদনের অপেক্ষায় নেই", "No pending approvals")}
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {approvals.map((approval) => (
              <div key={approval.id} className="bg-card p-6 rounded-lg shadow-md border">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">
                      {approval.firstName} {approval.lastName}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {t(approval.role === 'governmental' ? 'সরকারি' : 'সিটিজেন', approval.role)} • {approval.idType.toUpperCase()}: {approval.idNumber}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleApprove(approval.id)}
                      className="text-green-600 hover:text-green-700"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      {t("অনুমোদন", "Approve")}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(approval.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4 mr-2" />
                      {t("মুছে ফেলুন", "Delete")}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-3 text-primary" />
                    <span>{approval.username}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-3 text-primary" />
                    <span>{approval.mobile}</span>
                  </div>
                  <div className="flex items-center md:col-span-2">
                    <MapPin className="w-4 h-4 mr-3 text-primary" />
                    <span>
                      {approval.building}{approval.floor ? ', ' + approval.floor : ''}, {approval.street}, {approval.thana}, {approval.city} - {approval.postalCode}, {approval.country}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-3 text-primary" />
                    <span>{new Date(approval.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

