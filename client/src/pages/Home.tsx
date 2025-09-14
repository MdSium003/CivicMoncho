import { useQuery } from "@tanstack/react-query";
import { Project, Poll, Event } from "@shared/schema";
import { useLanguage } from "@/contexts/LanguageContext";
import ProjectCard from "@/components/ProjectCard";
import PollItem from "@/components/PollItem";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, HandHeart, ThumbsUp } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { t } = useLanguage();

  const { data: projects, isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects/top"],
  });

  const { data: events, isLoading: eventsLoading } = useQuery<Event[]>({
    queryKey: ["/api/events/top"],
  });

  const { data: polls, isLoading: pollsLoading } = useQuery<Poll[]>({
    queryKey: ["/api/polls"],
  });

  const totalVotes = polls?.reduce((sum, poll) => sum + poll.votes, 0) || 0;
  const totalParticipants = Math.floor(totalVotes * 0.37); // Estimated unique participants
  const totalProjects = polls?.length || 0;

  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "environment":
        return "bg-secondary/10 text-secondary border-secondary/20";
      case "community service":
        return "bg-primary/10 text-primary border-primary/20";
      case "education":
        return "bg-accent/10 text-accent border-accent/20";
      case "healthcare":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "technology":
        return "bg-muted/10 text-muted-foreground border-border";
      case "agriculture":
        return "bg-secondary/10 text-secondary border-secondary/20";
      default:
        return "bg-muted/10 text-muted-foreground border-border";
    }
  };

  return (
    <main className="flex-1">
      {/* Hero Section */}
      <section className="hero-gradient text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center animate-slide-up">
            <h1 className="text-4xl md:text-6xl font-bold mb-6" data-testid="hero-title">
              {t(
                "গণতন্ত্রের মাধ্যমে নাগরিকদের ক্ষমতায়ন",
                "Empowering Citizens Through Democracy"
              )}
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90" data-testid="hero-subtitle">
              {t(
                "আমাদের সমাজের ভবিষ্যৎ গড়তে আপনার মতামত গুরুত্বপূর্ণ",
                "Your voice matters in shaping our community's future"
              )}
            </p>
            <Button 
              size="lg" 
              className="bg-accent text-accent-foreground hover:bg-accent/90 px-8 py-4 text-lg font-semibold transition-all hover:scale-105 animate-bounce-gentle"
              data-testid="hero-cta-button"
            >
              {t("প্রকল্প দেখুন", "Explore Projects")}
            </Button>
          </div>
        </div>
      </section>

      {/* Top Projects and Events Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4" data-testid="top-content-title">
              {t("শীর্ষ প্রকল্প ও ইভেন্ট", "Top Projects & Events")}
            </h2>
            <p className="text-lg text-muted-foreground" data-testid="top-content-subtitle">
              {t(
                "সর্বাধিক জনপ্রিয় প্রকল্প ও সহায়ক ইভেন্টসমূহ দেখুন",
                "View the most popular projects and helpful events"
              )}
            </p>
          </div>

          {/* Two Column Grid */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Top Projects Column */}
            <div className="space-y-6 flex flex-col">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-foreground" data-testid="projects-title">
                  {t("শীর্ষ প্রকল্পসমূহ", "Top Projects")}
                </h3>
                <Link href="/projects">
                  <Button variant="outline" size="sm" data-testid="view-all-projects-button">
                    {t("সকল দেখুন", "View All")} →
                  </Button>
                </Link>
              </div>

              <div className="space-y-4 flex-1" data-testid="projects-list">
                {projectsLoading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="bg-card border border-border rounded-lg p-4 space-y-3">
                      <div className="flex items-start space-x-4">
                        <Skeleton className="h-16 w-16 rounded-lg flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-full" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  projects?.slice(0, 4).map((project, index) => (
                    <div 
                      key={project.id} 
                      className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow animate-fade-in"
                      style={{ animationDelay: `${index * 0.1}s` }}
                      data-testid={`project-item-${project.id}`}
                    >
                      <div className="flex items-start space-x-4">
                        <img 
                          src={project.imageUrl} 
                          alt={project.titleEn}
                          className="h-16 w-16 rounded-lg object-cover flex-shrink-0"
                          data-testid={`project-image-${project.id}`}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-lg font-semibold text-card-foreground truncate" data-testid={`project-title-${project.id}`}>
                              {project.titleEn}
                            </h4>
                            <Badge variant="outline" className="ml-2 flex-shrink-0">
                              {project.category}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2" data-testid={`project-description-${project.id}`}>
                            {project.descriptionEn}
                          </p>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              {t("বাজেট", "Budget")}: {project.budget}
                            </span>
                            <div className="flex items-center space-x-2">
                              <span className="text-primary font-medium">
                                {formatNumber(project.upvotes || 0)} {t("ভোট", "votes")}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Top Events Column */}
            <div className="space-y-6 flex flex-col">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-foreground" data-testid="events-title">
                  {t("শীর্ষ ইভেন্টসমূহ", "Top Events")}
                </h3>
                <Link href="/events">
                  <Button variant="outline" size="sm" data-testid="view-all-events-button">
                    {t("সকল দেখুন", "View All")} →
                  </Button>
                </Link>
              </div>

              <div className="space-y-4 flex-1" data-testid="events-list">
                {eventsLoading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="bg-card border border-border rounded-lg p-4 space-y-3">
                      <div className="flex items-start space-x-4">
                        <Skeleton className="h-16 w-16 rounded-lg flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-full" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  events?.slice(0, 4).map((event, index) => (
                    <div 
                      key={event.id} 
                      className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow animate-fade-in"
                      style={{ animationDelay: `${index * 0.1}s` }}
                      data-testid={`event-item-${event.id}`}
                    >
                      <div className="flex items-start space-x-4">
                        <img 
                          src={event.imageUrl} 
                          alt={event.titleEn}
                          className="h-16 w-16 rounded-lg object-cover flex-shrink-0"
                          data-testid={`event-image-${event.id}`}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-lg font-semibold text-card-foreground truncate" data-testid={`event-title-${event.id}`}>
                              {event.titleEn}
                            </h4>
                            <Badge 
                              className={`ml-2 flex-shrink-0 ${getCategoryColor(event.category)}`}
                              data-testid={`event-category-${event.id}`}
                            >
                              {t(
                                event.category === "Environment" ? "পরিবেশ" : 
                                event.category === "Community Service" ? "সমাজসেবা" : 
                                event.category === "Education" ? "শিক্ষা" : 
                                event.category === "Healthcare" ? "স্বাস্থ্য" :
                                event.category === "Technology" ? "প্রযুক্তি" :
                                event.category === "Agriculture" ? "কৃষি" : event.category,
                                event.category
                              )}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2" data-testid={`event-description-${event.id}`}>
                            {event.descriptionEn}
                          </p>
                          <div className="space-y-1 mb-2">
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Calendar className="w-3 h-3 mr-1" />
                              <span data-testid={`event-date-${event.id}`}>{event.date}</span>
                            </div>
                            <div className="flex items-center text-xs text-muted-foreground">
                              <MapPin className="w-3 h-3 mr-1" />
                              <span data-testid={`event-location-${event.id}`} className="truncate">{event.location}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-3">
                              <span className="text-primary">
                                <HandHeart className="w-3 h-3 inline mr-1" />
                                {formatNumber(event.volunteers)}
                              </span>
                              <span className="text-secondary">
                                <Users className="w-3 h-3 inline mr-1" />
                                {formatNumber(event.going)}
                              </span>
                              <span className="text-accent">
                                <ThumbsUp className="w-3 h-3 inline mr-1" />
                                {formatNumber(event.helpful)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Voting Poll Section */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4" data-testid="polls-title">
              {t("সম্প্রদায়িক ভোটিং পোল", "Community Voting Poll")}
            </h2>
            <p className="text-lg text-muted-foreground" data-testid="polls-subtitle">
              {t(
                "আমাদের সম্প্রদায়ে যে প্রকল্পগুলো অগ্রাধিকার পেতে চান সেগুলোর জন্য ভোট দিন",
                "Vote for the projects you want to see prioritized in our community"
              )}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8" data-testid="polls-grid">
            {pollsLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="bg-card border border-border rounded-xl p-6 space-y-4">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ))
            ) : (
              polls?.map((poll, index) => (
                <PollItem 
                  key={poll.id} 
                  poll={poll} 
                  index={index} 
                  totalVotes={totalVotes}
                />
              ))
            )}
          </div>

          {/* Voting Stats */}
          <div className="mt-12 bg-card border border-border rounded-xl p-6 animate-fade-in" data-testid="voting-stats">
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-primary mb-2 count-animation" data-testid="total-votes">
                  {formatNumber(totalVotes)}
                </div>
                <p className="text-muted-foreground">
                  {t("মোট প্রদত্ত ভোট", "Total Votes Cast")}
                </p>
              </div>
              <div>
                <div className="text-3xl font-bold text-secondary mb-2 count-animation" data-testid="total-participants">
                  {formatNumber(totalParticipants)}
                </div>
                <p className="text-muted-foreground">
                  {t("সক্রিয় অংশগ্রহণকারী", "Active Participants")}
                </p>
              </div>
              <div>
                <div className="text-3xl font-bold text-accent mb-2 count-animation" data-testid="total-projects">
                  {totalProjects}
                </div>
                <p className="text-muted-foreground">
                  {t("পোলে থাকা প্রকল্প", "Projects in Poll")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold mb-6" data-testid="cta-title">
            {t("গণতান্ত্রিক প্রক্রিয়ায় যোগ দিন", "Join the Democratic Process")}
          </h2>
          <p className="text-xl mb-8 opacity-90" data-testid="cta-description">
            {t(
              "আপনার অংশগ্রহণ গণতন্ত্রকে আরও শক্তিশালী করে। আজই নিবন্ধন করুন এবং আপনার মতামত জানান।",
              "Your participation makes democracy stronger. Sign up today to have your voice heard."
            )}
          </p>
          <Button 
            size="lg"
            className="bg-accent text-accent-foreground hover:bg-accent/90 px-8 py-4 text-lg font-semibold transition-all hover:scale-105"
            data-testid="cta-button"
          >
            {t("শুরু করুন", "Get Started")} →
          </Button>
        </div>
      </section>
    </main>
  );
}
