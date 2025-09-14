import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "../contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThumbsUp, MessageSquare, User, Pin, PlusCircle, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// --- Data Schemas (Interfaces) ---
interface Comment {
  id: string;
  authorId?: string;
  author?: { username: string; firstName?: string; lastName?: string } | null;
  text: string;
  createdAt: string;
}

interface ThreadRow {
  id: string;
  titleEn: string;
  titleBn: string;
  category: string;
  contentEn: string;
  contentBn: string;
  createdAt: string;
  likes: number;
  pinned: number;
  commentCount?: number;
  author?: { username: string; firstName?: string; lastName?: string } | null;
}

// --- Create Thread Modal Component ---
interface CreateThreadModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
}

function CreateThreadModal({ isOpen, onClose, categories }: CreateThreadModalProps) {
  const { t, language } = useLanguage();
  const [titleBn, setTitleBn] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [contentBn, setContentBn] = useState("");
  const [contentEn, setContentEn] = useState("");
  const [category, setCategory] = useState("");
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ titleBn, titleEn, contentBn, contentEn, category })
      });
      if (!res.ok) throw new Error('Failed to create thread');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/threads'] });
      onClose();
      setTitleBn(""); setTitleEn(""); setContentBn(""); setContentEn(""); setCategory("");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (titleBn.trim() && titleEn.trim() && contentBn.trim() && contentEn.trim() && category) {
      createMutation.mutate();
    }
  };

  const categoryTranslation: { [key: string]: string } = {
    "Environment": "পরিবেশ",
    "Community Service": "সমাজসেবা",
    "Education": "শিক্ষা",
    "Technology": "প্রযুক্তি",
    "Healthcare": "স্বাস্থ্যসেবা",
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("নতুন থ্রেড তৈরি করুন", "Create a New Thread")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">{t("শিরোনাম(বাংলা)", "Title(Bangla)")}</Label>
            <Input value={titleBn} onChange={(e) => setTitleBn(e.target.value)} className="col-span-3" placeholder={language === 'bn' ? "আপনার থ্রেডের শিরোনাম" : "Title for your thread"} />
            <Label className="text-right">{t("শিরোনাম(ইংরেজি)", "Title(English)")}</Label>
            <Input value={titleEn} onChange={(e) => setTitleEn(e.target.value)} className="col-span-3" placeholder={language === 'bn' ? "আপনার থ্রেডের শিরোনাম" : "Title for your thread"} />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">{t("বিভাগ", "Category")}</Label>
            <Select onValueChange={setCategory} value={category}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder={t("একটি বিভাগ নির্বাচন করুন", "Select a category")} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {language === 'bn' ? categoryTranslation[cat] || cat : cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">{t("বিষয়বস্তু(বাংলা)", "Content(Bangla)")}</Label>
            <Textarea value={contentBn} onChange={(e) => setContentBn(e.target.value)} className="col-span-3 min-h-[120px]" placeholder={language === 'bn' ? "আপনার থ্রেড সম্পর্কে বিস্তারিত লিখুন..." : "Describe your thread in more detail..."} />
            <Label className="text-right pt-2">{t("বিষয়বস্তু(ইংরেজি)", "Content(English)")}</Label>
            <Textarea value={contentEn} onChange={(e) => setContentEn(e.target.value)} className="col-span-3 min-h-[120px]" placeholder={language === 'bn' ? "আপনার থ্রেড সম্পর্কে বিস্তারিত লিখুন..." : "Describe your thread in more detail..."} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={createMutation.isPending}>{t("থ্রেড তৈরি করুন", "Create Thread")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// --- Thread Details Modal Component ---
interface ThreadDetailsModalProps {
  thread: ThreadRow | null;
  isOpen: boolean;
  onClose: () => void;
}

function ThreadDetailsModal({ thread, isOpen, onClose }: ThreadDetailsModalProps) {
    const { t, language } = useLanguage();
    const [newComment, setNewComment] = useState("");
    const queryClient = useQueryClient();
    const [isGovernmental, setIsGovernmental] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
      let cancelled = false;
      (async () => {
        try {
          const res = await fetch('/api/auth/me', { credentials: 'include' });
          if (res.ok) {
            const me = await res.json();
            if (!cancelled) setIsGovernmental(me.role === 'governmental');
          }
        } catch {}
      })();
      return () => { cancelled = true; };
    }, []);

    const { data: comments } = useQuery<Comment[]>({
      enabled: !!thread,
      queryKey: ['/api/threads', thread?.id, 'comments'],
      queryFn: async () => {
        const res = await fetch(`/api/threads/${thread!.id}/comments`, { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to load comments');
        return res.json();
      }
    });

    const commentMutation = useMutation({
      mutationFn: async () => {
        const res = await fetch(`/api/threads/${thread!.id}/comments`, {
          method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: newComment })
        });
        if (!res.ok) {
          const errorText = await res.text().catch(() => '');
          throw new Error(`${res.status}: ${errorText}`);
        }
        return res.json();
      },
      onSuccess: () => {
        setNewComment("");
        queryClient.invalidateQueries({ queryKey: ['/api/threads', thread!.id, 'comments'] });
        queryClient.invalidateQueries({ queryKey: ['/api/threads'] });
      },
      onError: (err: any) => {
        if (err?.message?.includes("401")) {
          toast({
            title: t("লগইন প্রয়োজন", "Login Required"),
            description: t("মন্তব্য পোস্ট করতে লগইন করুন।", "Please login to post comments."),
            variant: "destructive",
          });
        }
      }
    });

    if (!thread) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <DialogTitle>{language === 'bn' ? thread.titleBn : thread.titleEn}</DialogTitle>
                        <div className="text-sm text-muted-foreground pt-1">
                          <span>
                            {thread.author ? `${thread.author.firstName || ''} ${thread.author.lastName || ''}`.trim() || thread.author.username : 'User'} • {new Date(thread.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      {isGovernmental && (
                        <div className="flex gap-2">
                          {thread.pinned ? (
                            <PinButton id={thread.id} action="unpin" />
                          ) : (
                            <PinButton id={thread.id} action="pin" />
                          )}
                          <DeleteButton id={thread.id} onDeleted={() => { onClose(); queryClient.invalidateQueries({ queryKey: ['/api/threads'] }); }} />
                        </div>
                      )}
                    </div>
                </DialogHeader>
                <div className="py-4 prose dark:prose-invert max-w-none">
                    <p>{language === 'bn' ? thread.contentBn : thread.contentEn}</p>
                </div>

                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                    <h4 className="font-semibold">{t("Comments", "Comments")} ({comments?.length || 0})</h4>
                    {comments?.map(comment => (
                        <div key={comment.id} className="flex items-start space-x-3">
                            <div className="flex-1 bg-muted/50 p-3 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <p className="font-semibold text-sm">{comment.author ? `${comment.author.firstName || ''} ${comment.author.lastName || ''}`.trim() || comment.author.username : (comment.authorId || 'User')}</p>
                                    <p className="text-xs text-muted-foreground">{new Date(comment.createdAt).toLocaleString()}</p>
                                </div>
                                <p className="text-sm mt-1">{comment.text}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <DialogFooter>
                    <form onSubmit={(e) => { e.preventDefault(); if (newComment.trim()) commentMutation.mutate(); }} className="w-full space-y-2">
                         <Textarea 
                            placeholder={t("একটি মন্তব্য লিখুন...","Write a comment...")}
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                         />
                         <Button type="submit" disabled={commentMutation.isPending}>{t( "মন্তব্য পোস্ট করুন","Post Comment")}</Button>
                    </form>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// --- Thread Card Component ---
interface ThreadCardProps {
  thread: ThreadRow;
  index: number;
  onOpenModal: (thread: ThreadRow) => void;
}

function ThreadCard({ thread, index, onOpenModal }: ThreadCardProps) {
  const { t, language } = useLanguage();
  const [isGovernmental, setIsGovernmental] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (res.ok) {
          const me = await res.json();
          if (!cancelled) setIsGovernmental(me.role === 'governmental');
        }
      } catch {}
    })();
    return () => { cancelled = true; };
  }, []);

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "environment": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "community service": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "education": return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      case "technology": return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case "healthcare": return "bg-red-500/10 text-red-500 border-red-500/20";
      default: return "bg-muted/10 text-muted-foreground border-border";
    }
  };

  const categoryTranslation: { [key: string]: string } = {
    "Environment": "পরিবেশ",
    "Community Service": "সমাজসেবা",
    "Education": "শিক্ষা",
    "Technology": "প্রযুক্তি",
    "Healthcare": "স্বাস্থ্যসেবা",
  }

  const queryClient = useQueryClient();
  const likeMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/threads/${thread.id}/like`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to like');
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/threads'] })
  });

  return (
    <div 
      className="bg-card border border-border rounded-lg shadow-lg overflow-hidden animate-fade-in transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
      style={{ animationDelay: `${index * 0.1}s` }}
      onClick={() => onOpenModal(thread)}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <Badge className={getCategoryColor(thread.category)}>
            {language === 'bn' ? categoryTranslation[thread.category] || thread.category : thread.category}
          </Badge>
          {thread.pinned ? (
             <div className="flex items-center text-sm text-yellow-500 font-semibold">
                <Pin className="w-4 h-4 mr-1.5" />
                {t('পিন করা হয়েছে', 'Pinned')}
             </div>
          ) : (
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); likeMutation.mutate(); }}>
              <ThumbsUp className="w-4 h-4 mr-1.5" /> {thread.likes}
            </Button>
          )}
        </div>
        
        <h3 className="text-xl font-bold mb-2 text-card-foreground">{language === 'bn' ? thread.titleBn : thread.titleEn}</h3>
        
        <p className="text-muted-foreground mb-4 text-sm line-clamp-3">
          {language === 'bn' ? thread.contentBn : thread.contentEn}
        </p>

        <div className="flex items-center justify-between text-muted-foreground text-sm mt-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center">
              <MessageSquare className="w-4 h-4 mr-1.5" />
              <span className="whitespace-nowrap">{thread.commentCount || 0} {t('মন্তব্য','Comments')}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center gap-1 min-w-0">
              <User className="w-4 h-4 flex-shrink-0" />
              <span className="truncate max-w-[140px]">{thread.author ? `${thread.author.firstName || ''} ${thread.author.lastName || ''}`.trim() || thread.author.username : 'User'}</span>
              <span className="opacity-60">• {new Date(thread.createdAt).toLocaleDateString()}</span>
            </div>
            {isGovernmental && (
              <div className="flex items-center gap-2">
                {thread.pinned ? (
                  <PinButton id={thread.id} action="unpin" compact onClickStop />
                ) : (
                  <PinButton id={thread.id} action="pin" compact onClickStop />
                )}
                <DeleteButton id={thread.id} compact onClickStop />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PinButton({ id, action, compact = false, onClickStop = false }: { id: string; action: 'pin' | 'unpin'; compact?: boolean; onClickStop?: boolean }) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/threads/${id}/${action}`, { method: 'POST', credentials: 'include' });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/threads'] })
  });
  return (
    <Button variant="outline" size={compact ? 'sm' : 'default'} onClick={(e) => { if (onClickStop) e.stopPropagation(); mutation.mutate(); }} className="px-2">
      <Pin className="w-4 h-4" />
    </Button>
  );
}

function DeleteButton({ id, onDeleted, compact = false, onClickStop = false }: { id: string; onDeleted?: () => void; compact?: boolean; onClickStop?: boolean }) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/threads/${id}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['/api/threads'] }); onDeleted && onDeleted(); }
  });
  return (
    <Button variant="outline" size={compact ? 'sm' : 'default'} onClick={(e) => { if (onClickStop) e.stopPropagation(); mutation.mutate(); }} className="text-red-600 hover:text-red-700 px-2">
      <Trash2 className="w-4 h-4" />
    </Button>
  );
}

// --- Main Threads Page Component ---
export default function Threads() {
  const { t, language } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedThread, setSelectedThread] = useState<ThreadRow | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (!cancelled) setIsAuthenticated(res.ok);
      } catch {
        if (!cancelled) setIsAuthenticated(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleOpenModal = (thread: ThreadRow) => {
    setSelectedThread(thread);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedThread(null);
    setIsModalOpen(false);
  };

  const { data: threads, isLoading } = useQuery<ThreadRow[]>({
    queryKey: ["/api/threads"],
    queryFn: async () => {
      const res = await fetch('/api/threads');
      if (!res.ok) throw new Error('Failed to load threads');
      return res.json();
    },
  });

  const categories = ["All", "Environment", "Community Service", "Education", "Technology", "Healthcare"];
  
  const categoryTranslation: { [key: string]: string } = {
    "All": "সব",
    "Environment": "পরিবেশ",
    "Community Service": "সমাজসেবা",
    "Education": "শিক্ষা",
    "Technology": "প্রযুক্তি",
    "Healthcare": "স্বাস্থ্যসেবা",
  }

  const filteredThreads = threads
    ?.filter(thread => selectedCategory === "All" || thread.category === selectedCategory)
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));


  return (
    <main className="flex-1 py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {t("কমিউনিটি থ্রেড", "Community Threads")}
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            {t("আলোচনায় অংশ নিন, ধারণা শেয়ার করুন এবং কমিউনিটি প্রকল্পে সহযোগিতা করুন।",
              "Engage in discussions, share ideas, and collaborate on community projects."
            )}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
            <div className="flex flex-wrap justify-center gap-2">
                {categories.map((category) => (
                <Badge
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    className="cursor-pointer transition-all hover:scale-105"
                    onClick={() => setSelectedCategory(category)}
                >
                    {language === 'bn' ? categoryTranslation[category] : category}
                </Badge>
                ))}
            </div>
            {isAuthenticated && (
              <Button onClick={() => setIsCreateModalOpen(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" /> {t("নতুন থ্রেড", "New Thread")}
              </Button>
            )}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="space-y-4 bg-card p-6 rounded-lg">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-5 w-1/4" />
                    <Skeleton className="h-5 w-1/3" />
                </div>
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="flex justify-between items-center pt-2">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-5 w-1/4" />
                </div>
              </div>
            ))
          ) : (
            filteredThreads?.map((thread, index) => (
              <ThreadCard key={thread.id} thread={thread} index={index} onOpenModal={handleOpenModal} />
            ))
          )}
        </div>

        {filteredThreads?.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              {t("No threads found in this category.", "এই বিভাগে কোন থ্রেড পাওয়া যায়নি।")}
            </p>
          </div>
        )}

        <ThreadDetailsModal 
          thread={selectedThread}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />

        <CreateThreadModal 
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            categories={categories.filter(c => c !== "All")}
        />

      </div>
    </main>
  );
}
