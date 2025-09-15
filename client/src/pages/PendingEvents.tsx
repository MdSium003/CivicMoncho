import { useEffect, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PendingEvent } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiGet, apiPost, apiDelete } from "@/lib/api";

export default function PendingEvents() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  // Check auth and role
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await apiGet<any>('/api/auth/me');
        if (me.role !== 'governmental') {
          if (!cancelled) setLocation('/');
        }
      } catch {
        if (!cancelled) setLocation('/login');
      }
    })();
    return () => { cancelled = true; };
  }, [setLocation]);

  const { data, isLoading } = useQuery<PendingEvent[]>({
    queryKey: ['/api/events/pending'],
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiPost(`/api/events/pending/${id}/approve`);
      return id;
    },
    onSuccess: (id: string) => {
      queryClient.setQueryData<PendingEvent[] | undefined>(['/api/events/pending'], (old) => (old ? old.filter(e => e.id !== id) : old));
      toast({ title: t('অনুমোদিত', 'Approved'), description: t('ইভেন্টটি অনুমোদিত হয়েছে।', 'The event has been approved.') });
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
    },
    onError: (err: any) => {
      toast({ title: t('ত্রুটি', 'Error'), description: err.message || t('অনুমোদন ব্যর্থ', 'Approval failed'), variant: 'destructive' });
    }
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiDelete(`/api/events/pending/${id}`);
      return id;
    },
    onSuccess: (id: string) => {
      queryClient.setQueryData<PendingEvent[] | undefined>(['/api/events/pending'], (old) => (old ? old.filter(e => e.id !== id) : old));
      toast({ title: t('বাতিল', 'Rejected'), description: t('ইভেন্টটি বাতিল করা হয়েছে।', 'The event has been rejected.') });
    },
    onError: (err: any) => {
      toast({ title: t('ত্রুটি', 'Error'), description: err.message || t('বাতিল ব্যর্থ', 'Rejection failed'), variant: 'destructive' });
    }
  });

  const grouped = useMemo(() => {
    const categories = new Map<string, PendingEvent[]>();
    (data || []).forEach(ev => {
      const list = categories.get(ev.category) || [];
      list.push(ev);
      categories.set(ev.category, list);
    });
    return Array.from(categories.entries());
  }, [data]);

  return (
    <main className="flex-1 py-16 bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {t('অপেক্ষমাণ ইভেন্ট অনুমোদন', 'Pending Event Approvals')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            {t('নিচের প্রস্তাবিত ইভেন্টগুলো পর্যালোচনা করুন ও সিদ্ধান্ত দিন।', 'Review proposed events and take action.')}
          </p>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-48 w-full rounded-lg" />
            ))}
          </div>
        ) : grouped.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              {t('কোন অপেক্ষমাণ ইভেন্ট নেই।', 'No pending events.')}
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {grouped.map(([category, list]) => (
              <div key={category}>
                <div className="flex items-center gap-3 mb-4">
                  <Badge variant="outline" className="text-sm">
                    {category}
                  </Badge>
                  <span className="text-muted-foreground text-sm">{list.length} {t('টি', '')}</span>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  {list.map(ev => (
                    <Card key={ev.id} className="overflow-hidden">
                      <div className="h-40 w-full bg-muted">
                        {ev.imageUrl && (
                          <img src={ev.imageUrl} alt={ev.titleEn} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <CardHeader>
                        <CardTitle className="text-xl">
                          {ev.titleBn} / {ev.titleEn}
                        </CardTitle>
                        <CardDescription>
                          {ev.location} · {ev.date}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                          {ev.descriptionBn}
                        </p>
                        <div className="flex gap-3">
                          <Button 
                            onClick={() => approveMutation.mutate(ev.id)}
                            disabled={approveMutation.isPending}
                          >
                            {t('অনুমোদন', 'Approve')}
                          </Button>
                          <Button 
                            variant="destructive"
                            onClick={() => rejectMutation.mutate(ev.id)}
                            disabled={rejectMutation.isPending}
                          >
                            {t('বাতিল', 'Reject')}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
