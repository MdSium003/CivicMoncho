import { useState, useEffect } from "react";
import { Project } from "@shared/schema";
import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThumbsUp, Trash2 } from "lucide-react";
import ProjectDetailsModal from "./ProjectDetailsModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiGet, apiDelete, apiPut } from "@/lib/api";

interface ProjectCardProps {
  project: Project;
  index: number;
}

export default function ProjectCard({ project, index }: ProjectCardProps) {
  const { t, language } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGovernmental, setIsGovernmental] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await apiGet<any>('/api/auth/me');
        if (!cancelled) setIsGovernmental(me.role === 'governmental');
      } catch {}
    })();
    return () => { cancelled = true; };
  }, []);


  const deleteMutation = useMutation({
    mutationFn: async () => {
      return apiDelete(`/api/projects/${project.id}`);
    },
    onSuccess: () => {
      toast({ title: t('প্রকল্প মুছে ফেলা হয়েছে', 'Project deleted') });
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      setConfirmOpen(false);
    }
  });

  const statusMutation = useMutation({
    mutationFn: async (status: string) => {
      // Using apiPut for PATCH-like update; server accepts PATCH but api helper uses method PUT/POST/DELETE. We keep PUT here for simplicity.
      return apiPut(`/api/projects/${project.id}/status`, { status });
    },
    onSuccess: () => {
      toast({ title: t('অবস্থা আপডেট হয়েছে', 'Status updated') });
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
    }
  });

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
      case "partially active":
        return "bg-purple-500/10 text-purple-600";
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

  let imageUrl = project.imageUrl;
  if (project.titleEn === "River Bridge") {
    imageUrl = "/bridge.jpg";
  } else if (project.titleEn === "Highway Development") {
    imageUrl = "/highway.jpg";
  }
  project.imageUrl = imageUrl;

  return (
    <>
      <div 
        className="project-card bg-card border border-border rounded-lg shadow-lg overflow-hidden animate-fade-in transition-all duration-500 hover:shadow-xl hover:-translate-y-2 cursor-pointer"
        style={{ animationDelay: `${index * 0.1}s` }}
        onClick={() => setIsModalOpen(true)}
        data-testid={`project-card-${project.id}`}
      >
        <img 
          src={imageUrl} 
          alt={language === "bn" ? project.titleBn : project.titleEn}
          className="w-full h-48 object-cover"
          data-testid={`project-image-${project.id}`}
        />
        <div className="p-6">
          <div className="flex items-center justify-between mb-3">
            <Badge 
              className={getCategoryColor(project.category)}
              data-testid={`project-category-${project.id}`}
            >
              {t(
                project.category === "Infrastructure" ? "অবকাঠামো" : 
                project.category === "Education" ? "শিক্ষা" : 
                project.category === "Environment" ? "পরিবেশ" : project.category,
                project.category
              )}
            </Badge>
            <span className="text-sm text-muted-foreground" data-testid={`project-budget-${project.id}`}>
              {project.budget}
            </span>
          </div>
          
          <h3 className="text-xl font-bold mb-2 text-card-foreground" data-testid={`project-title-${project.id}`}>
            {language === "bn" ? project.titleBn : project.titleEn}
          </h3>
          
          <p className="text-muted-foreground mb-4" data-testid={`project-description-${project.id}`}>
            {language === "bn" ? project.descriptionBn : project.descriptionEn}
          </p>
          
          <div className="flex items-center justify-between mb-4">
            {isGovernmental ? (
              <div className="flex items-center gap-2">
                <Select defaultValue={project.status} onValueChange={(v) => statusMutation.mutate(v)}>
                  <SelectTrigger className={`h-9 ${getStatusColor(project.status)} border`}> 
                    <SelectValue placeholder={t('অবস্থা নির্বাচন করুন', 'Select status')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Planning">{t("পরিকল্পনা", "Planning")}</SelectItem>
                    <SelectItem value="Active">{t("সক্রিয়", "Active")}</SelectItem>
                    <SelectItem value="Implementation">{t("বাস্তবায়ন", "Implementation")}</SelectItem>
                    <SelectItem value="Partially Active">{t("আংশিক সক্রিয়", "Partially Active")}</SelectItem>
                    <SelectItem value="Completed">{t("সম্পন্ন", "Completed")}</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  variant="outline"
                  className="text-red-600 hover:text-red-700"
                  onClick={(e) => { e.stopPropagation(); setConfirmOpen(true); }}
                >
                  <Trash2 className="w-4 h-4 mr-1.5" /> {t('মুছে ফেলুন', 'Delete')}
                </Button>
              </div>
            ) : (
              <Badge 
                variant="outline" 
                className={getStatusColor(project.status)}
                data-testid={`project-status-${project.id}`}
              >
                {t("অবস্থা:", "Status:")} {t(
                  project.status === "Planning" ? "পরিকল্পনা" :
                  project.status === "Active" ? "সক্রিয়" :
                  project.status === "Implementation" ? "বাস্তবায়ন" : project.status,
                  project.status
                )}
              </Badge>
            )}
            
            <Button 
              variant="ghost" 
              className="text-primary hover:text-primary/80 p-0 h-auto font-medium"
              onClick={(e) => {
                e.stopPropagation();
                setIsModalOpen(true);
              }}
              data-testid={`project-learn-more-${project.id}`}
            >
              {t("আরও জানুন", "Learn More")} →
            </Button>
          </div>
          
          {/* Upvotes Display Only */}
          <div className="flex items-center justify-center bg-muted/30 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <ThumbsUp className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">
                {t("সমর্থন", "Support")}
              </span>
              <div className="text-lg font-bold text-primary" data-testid={`project-upvotes-${project.id}`}>
                {formatUpvotes(project.upvotes)}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <ProjectDetailsModal 
        project={project}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('আপনি কি নিশ্চিত?', 'Are you sure?')}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">{t('আপনি কি সত্যিই এই প্রকল্পটি মুছে ফেলতে চান?', 'Do you really want to delete this project?')}</p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)}>{t('বাতিল', 'Cancel')}</Button>
            <Button variant="destructive" onClick={() => deleteMutation.mutate()} disabled={deleteMutation.isPending}>{t('মুছে ফেলুন', 'Delete')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

