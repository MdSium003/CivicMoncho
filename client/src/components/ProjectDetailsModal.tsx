import { useEffect, useState } from "react";
import { Project } from "@shared/schema";
import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ThumbsUp, Calendar, DollarSign, Users, CheckCircle } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ProjectDetailsModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProjectDetailsModal({ project, isOpen, onClose }: ProjectDetailsModalProps) {
  const { t, language } = useLanguage();
  const [hasVoted, setHasVoted] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (res.ok) {
          if (!cancelled) setIsAuthed(true);
          // naive check by requesting vote presence (optional endpoint missing) – fallback to local state only
        } else {
          if (!cancelled) setIsAuthed(false);
        }
      } catch {
        if (!cancelled) setIsAuthed(false);
      }
    })();
    return () => { cancelled = true; };
  }, [isOpen]);

  const voteMutation = useMutation({
    mutationFn: async () => {
      const url = hasVoted ? `/api/projects/${project?.id}/unvote` : `/api/projects/${project?.id}/upvote`;
      const res = await apiRequest("POST", url);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setHasVoted((v) => !v);
      toast({
        title: hasVoted ? t("ভোট বাতিল", "Vote removed") : t("ভোট সফল", "Vote cast"),
      });
    },
    onError: (err: any) => {
      if (err?.message?.includes("409")) {
        setHasVoted(true);
      } else if (err?.message?.includes("401")) {
        setIsAuthed(false);
        toast({
          title: t("লগইন প্রয়োজন", "Login Required"),
          description: t("ভোট দিতে লগইন করুন।", "Please login to vote."),
          variant: "destructive",
        });
      } else {
        toast({ title: t("ত্রুটি", "Error"), description: t("ভোট দিতে সমস্যা হয়েছে", "Unable to process vote"), variant: "destructive" });
      }
    }
  });

  if (!project) return null;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
      case "সক্রিয়":
        return "bg-secondary/10 text-secondary";
      case "planning":
      case "পরিকল্পনা":
        return "bg-primary/10 text-primary";
      case "implementation":
      case "বাস্তবায়ন":
        return "bg-accent/10 text-accent";
      default:
        return "bg-muted/10 text-muted-foreground";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "infrastructure":
      case "অবকাঠামো":
        return "bg-primary/10 text-primary";
      case "education":
      case "শিক্ষা":
        return "bg-secondary/10 text-secondary";
      case "environment":
      case "পরিবেশ":
        return "bg-secondary/10 text-secondary";
      case "healthcare":
      case "স্বাস্থ্য":
        return "bg-destructive/10 text-destructive";
      case "agriculture":
      case "কৃষি":
        return "bg-accent/10 text-accent";
      default:
        return "bg-muted/10 text-muted-foreground";
    }
  };

  const formatUpvotes = (upvotes: number) => {
    const numStr = upvotes.toString();
    if (language === "bn") {
      return numStr.replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[parseInt(d)])
                   .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="project-details-modal">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold" data-testid="modal-project-title">
            {language === "bn" ? project.titleBn : project.titleEn}
          </DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Project Image */}
          <div className="space-y-4">
            <img 
              src={project.imageUrl} 
              alt={language === "bn" ? project.titleBn : project.titleEn}
              className="w-full h-64 object-cover rounded-lg"
              data-testid="modal-project-image"
            />
            
            {/* Vote Button */}
            {isAuthed ? (
              <Button
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 relative overflow-hidden ${hasVoted ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}
                onClick={() => voteMutation.mutate()}
                disabled={voteMutation.isPending}
                data-testid="modal-vote-button"
              >
                {hasVoted ? (
                  <>
                    <ThumbsUp className="w-5 h-5 mr-2" />
                    {t('ভোট বাতিল করুন', 'Cancel Vote')}
                  </>
                ) : (
                  <>
                    <ThumbsUp className="w-5 h-5 mr-2" />
                    {t('ভোট দিন', 'Cast Vote')}
                  </>
                )}
              </Button>
            ) : (
              <Button className="w-full py-3 px-6 rounded-lg font-semibold bg-muted text-muted-foreground cursor-not-allowed" disabled>
                <ThumbsUp className="w-5 h-5 mr-2" /> {t('ভোট দিতে লগইন করুন', 'Login to vote')}
              </Button>
            )}

            {/* Upvotes Display */}
            <div className="bg-card border border-border rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-primary mb-2" data-testid="modal-upvotes-count">
                {formatUpvotes(project.upvotes)}
              </div>
              <p className="text-muted-foreground text-sm">
                {t("জন এই প্রকল্পকে সমর্থন করেছেন", "people support this project")}
              </p>
            </div>
          </div>

          {/* Project Details */}
          <div className="space-y-6">
            {/* Status and Category Badges */}
            <div className="flex flex-wrap gap-2">
              <Badge 
                className={getCategoryColor(project.category)}
                data-testid="modal-project-category"
              >
                {t(
                  project.category === "Infrastructure" ? "অবকাঠামো" : 
                  project.category === "Education" ? "শিক্ষা" : 
                  project.category === "Environment" ? "পরিবেশ" : 
                  project.category === "Healthcare" ? "স্বাস্থ্য" :
                  project.category === "Agriculture" ? "কৃষি" : project.category,
                  project.category
                )}
              </Badge>
              <Badge 
                variant="outline" 
                className={getStatusColor(project.status)}
                data-testid="modal-project-status"
              >
                {t(
                  project.status === "Planning" ? "পরিকল্পনা" :
                  project.status === "Active" ? "সক্রিয়" :
                  project.status === "Implementation" ? "বাস্তবায়ন" : project.status,
                  project.status
                )}
              </Badge>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold mb-2" data-testid="modal-description-title">
                {t("প্রকল্প বিবরণ", "Project Description")}
              </h3>
              <p className="text-muted-foreground leading-relaxed" data-testid="modal-project-description">
                {language === "bn" ? project.descriptionBn : project.descriptionEn}
              </p>
            </div>

            <Separator />

            {/* Project Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/30 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <DollarSign className="w-5 h-5 text-primary mr-2" />
                  <span className="text-sm font-medium">{t("বাজেট", "Budget")}</span>
                </div>
                <div className="text-xl font-bold text-foreground" data-testid="modal-project-budget">
                  {project.budget}
                </div>
              </div>

              <div className="bg-muted/30 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Users className="w-5 h-5 text-secondary mr-2" />
                  <span className="text-sm font-medium">{t("সমর্থন", "Support")}</span>
                </div>
                <div className="text-xl font-bold text-secondary" data-testid="modal-project-support">
                  {formatUpvotes(project.upvotes)}
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-muted/20 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Calendar className="w-5 h-5 text-accent mr-2" />
                <span className="text-sm font-medium">{t("প্রকল্পের অবস্থা", "Project Status")}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {t(
                  project.status === "Planning" ? "এই প্রকল্পটি বর্তমানে পরিকল্পনা পর্যায়ে রয়েছে এবং শীঘ্রই বাস্তবায়ন শুরু হবে।" :
                  project.status === "Active" ? "এই প্রকল্পটি বর্তমানে সক্রিয়ভাবে চলমান রয়েছে।" :
                  project.status === "Implementation" ? "এই প্রকল্পটি বাস্তবায়নের পর্যায়ে রয়েছে।" :
                  "প্রকল্পের অবস্থা আপডেট করা হবে।",
                  
                  project.status === "Planning" ? "This project is currently in the planning phase and implementation will begin soon." :
                  project.status === "Active" ? "This project is currently active and ongoing." :
                  project.status === "Implementation" ? "This project is in the implementation phase." :
                  "Project status will be updated."
                )}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
