import { useQuery } from "@tanstack/react-query";
import { Project } from "@shared/schema";
import { useLanguage } from "@/contexts/LanguageContext";
import ProjectCard from "@/components/ProjectCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Link } from "wouter";
import { PlusCircle } from "lucide-react"; // Added for the button icon

// --- Self-contained Button component ---
const Button = ({ children, className, variant, size, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'outline' | 'ghost' | 'default', size?: 'sm' | 'icon' | 'default' | 'lg' }) => {
  const baseStyle = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background";
  
  const sizeStyles = {
    default: "h-10 py-2 px-4",
    sm: "h-9 px-3 rounded-md",
    lg: "h-11 px-8 rounded-md",
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


export default function Projects() {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

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
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4" data-testid="projects-page-title">
            {t("সরকারি প্রকল্পসমূহ", "Government Projects")}
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto" data-testid="projects-page-subtitle">
            {t(
              "আমাদের দেশের উন্নয়নের জন্য চলমান ও পরিকল্পিত সরকারি প্রকল্পগুলি দেখুন। এই প্রকল্পগুলি আমাদের সমাজের বিভিন্ন ক্ষেত্রে ইতিবাচক প্রভাব ফেলবে।",
              "Explore ongoing and planned government projects for our country's development. These projects will have positive impact on various sectors of our society."
            )}
          </p>
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

        {/* --- MODIFIED: Call to Action to create a new project --- */}
        <div className="mt-16 bg-primary text-primary-foreground rounded-xl p-8 text-center animate-fade-in transition-transform duration-300 hover:-translate-y-1">
          <h2 className="text-2xl md:text-3xl font-bold mb-4" data-testid="projects-cta-title">
            {t("নতুন প্রকল্প তৈরি করুন", "Create a New Project")}
          </h2>
          <p className="text-lg mb-6 opacity-90" data-testid="projects-cta-description">
            {t(
              "আপনার কমিউনিটির জন্য নতুন প্রকল্পের ধারণা আছে? আমাদের সাথে শেয়ার করুন।",
              "Have ideas for new community projects? Share them with us."
            )}
          </p>
          <Link href="/projects/create">
            <Button 
              size="lg"
              className="bg-accent text-accent-foreground hover:bg-accent/90 px-8 py-4 text-lg font-semibold transition-all hover:scale-105 animate-pulse"
              data-testid="create-project-button"
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              {t("প্রকল্প তৈরি করুন", "Create Project")}
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}

