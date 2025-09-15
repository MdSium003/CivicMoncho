import { useQuery } from "@tanstack/react-query";
import { Project } from "@shared/schema";
import { useLanguage } from "@/contexts/LanguageContext";
import ProjectCard from "@/components/ProjectCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { apiGet } from "@/lib/api";

export default function Projects() {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [isGovernmental, setIsGovernmental] = useState(false);
  const [, setLocation] = useLocation();

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

  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const categories = ["All", "Infrastructure", "Education", "Environment", "Healthcare", "Agriculture"];

  const filteredProjects = projects?.filter(project => 
    selectedCategory === "All" || project.category === selectedCategory
  );

  const categoryTranslation = (category: string) => {
    switch (category) {
      case "All": return t("সকল", "All");
      case "Infrastructure": return t("অবকাঠামো", "Infrastructure");
      case "Education": return t("শিক্ষা", "Education");
      case "Environment": return t("পরিবেশ", "Environment");
      case "Healthcare": return t("স্বাস্থ্য", "Healthcare");
      case "Agriculture": return t("কৃষি", "Agriculture");
      default: return category;
    }
  };

  return (
    <main className="flex-1 py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-3 items-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-1" data-testid="projects-page-title">
            {t("সরকারি প্রকল্পসমূহ", "Government Projects")}
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl text-center" data-testid="projects-page-subtitle">
            {t(
              "আমাদের দেশের উন্নয়নের জন্য চলমান ও পরিকল্পিত সরকারি প্রকল্পগুলি দেখুন। এই প্রকল্পগুলি আমাদের সমাজের বিভিন্ন ক্ষেত্রে ইতিবাচক প্রভাব ফেলবে।",
              "Explore ongoing and planned government projects for our country's development. These projects will have positive impact on various sectors of our society."
            )}
          </p>
          {isGovernmental && (
            <Button onClick={() => setLocation('/projects/create')} data-testid="create-project-button">
              {t('নতুন প্রকল্প তৈরি করুন', 'Create Project')}
            </Button>
          )}
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className="cursor-pointer transition-all hover:scale-105"
                onClick={() => setSelectedCategory(category)}
                data-testid={`category-filter-${category.toLowerCase()}`}
              >
                {categoryTranslation(category)}
              </Badge>
            ))}
          </div>
        </div>

        {/* Projects Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-card border border-border rounded-xl p-6 text-center animate-fade-in">
            <div className="text-3xl font-bold text-primary mb-2" data-testid="total-projects-count">
              {projects?.length || 0}
            </div>
            <p className="text-muted-foreground">
              {t("মোট প্রকল্প", "Total Projects")}
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-6 text-center animate-fade-in" style={{animationDelay: '0.1s'}}>
            <div className="text-3xl font-bold text-secondary mb-2" data-testid="active-projects-count">
              {projects?.filter(p => p.status === "Active").length || 0}
            </div>
            <p className="text-muted-foreground">
              {t("সক্রিয় প্রকল্প", "Active Projects")}
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-6 text-center animate-fade-in" style={{animationDelay: '0.2s'}}>
            <div className="text-3xl font-bold text-accent mb-2" data-testid="budget-total">
              ৳ ৫৪৫+
            </div>
            <p className="text-muted-foreground">
              {t("মোট বাজেট (কোটি)", "Total Budget (Crores)")}
            </p>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8" data-testid="projects-grid">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="space-y-4">
                <Skeleton className="h-48 w-full rounded-lg" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))
          ) : (
            filteredProjects?.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} />
            ))
          )}
        </div>

        {filteredProjects?.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg" data-testid="no-projects-message">
              {t("এই বিভাগে কোন প্রকল্প পাওয়া যায়নি।", "No projects found in this category.")}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}