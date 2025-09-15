import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Event } from "@shared/schema";
import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Calendar, MapPin, Users, HandHeart, ThumbsUp, Trash2, Clock } from "lucide-react";
import EventDetailsModal from "@/components/EventDetailsModal";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiGet, apiDelete } from "@/lib/api";

interface EventCardProps {
  event: Event;
  index: number;
  onOpenModal: (event: Event) => void;
  isGovernmental?: boolean;
  onDelete?: (eventId: string) => void;
}

// Helper function to check if an event is finished (past today's date)
function isEventFinished(eventDate: string): boolean {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  return eventDate < today;
}

function EventCard({ event, index, onOpenModal, isGovernmental = false, onDelete }: EventCardProps) {
  const { t, language } = useLanguage();
  const isFinished = isEventFinished(event.date);

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

  const formatNumber = (num: number) => {
    const numStr = num.toString();
    if (language === "bn") {
      return numStr.replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[parseInt(d)])
                   .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <div 
      className="bg-card border border-border rounded-lg shadow-lg overflow-hidden animate-fade-in transition-all duration-500 hover:shadow-xl hover:-translate-y-2 cursor-pointer"
      style={{ animationDelay: `${index * 0.1}s` }}
      onClick={() => onOpenModal(event)}
      data-testid={`event-card-${event.id}`}
    >
      <img 
        src={event.imageUrl} 
        alt={language === "bn" ? event.titleBn : event.titleEn}
        className="w-full h-48 object-cover"
        data-testid={`event-image-${event.id}`}
      />
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Badge 
              className={getCategoryColor(event.category)}
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
            {isFinished && (
              <Badge 
                variant="destructive"
                className="bg-red-100 text-red-800 border-red-200"
                data-testid={`event-ended-${event.id}`}
              >
                <Clock className="w-3 h-3 mr-1" />
                {t("শেষ", "ENDED")}
              </Badge>
            )}
          </div>
          {isGovernmental && onDelete && (
            <Button 
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={(e) => { 
                e.stopPropagation(); 
                onDelete(event.id); 
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
        
        <h3 className="text-xl font-bold mb-2 text-card-foreground" data-testid={`event-title-${event.id}`}>
          {language === "bn" ? event.titleBn : event.titleEn}
        </h3>
        
        <p className="text-muted-foreground mb-4 text-sm" data-testid={`event-description-${event.id}`}>
          {language === "bn" ? event.descriptionBn : event.descriptionEn}
        </p>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 mr-2" />
            <span data-testid={`event-date-${event.id}`}>{event.date}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 mr-2" />
            <span data-testid={`event-location-${event.id}`}>{event.location}</span>
          </div>
        </div>
        
        <div className="mb-4">
          <Button 
            variant="ghost" 
            className="text-primary hover:text-primary/80 p-0 h-auto font-medium"
            onClick={(e) => {
              e.stopPropagation();
              onOpenModal(event);
            }}
            data-testid={`event-details-${event.id}`}
          >
            {t("বিস্তারিত দেখুন", "View Details")} →
          </Button>
        </div>
        
        {/* Event Status */}
        {isFinished ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="w-6 h-6 text-red-600 mr-2" />
              <span className="text-lg font-bold text-red-800">
                {t("ইভেন্ট শেষ হয়েছে", "EVENT ENDED")}
              </span>
            </div>
            <p className="text-sm text-red-600">
              {t("এই ইভেন্টে আর অংশগ্রহণ করা যাবে না", "Participation is no longer available for this event")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-primary/5 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center mb-1">
                <HandHeart className="w-4 h-4 text-primary mr-1" />
              </div>
              <div className="text-lg font-bold text-primary" data-testid={`event-volunteers-${event.id}`}>
                {formatNumber(event.volunteers)}
              </div>
              <p className="text-xs text-muted-foreground">
                {t("স্বেচ্ছাসেবী", "Volunteers")}
              </p>
            </div>
            
            <div className="bg-secondary/5 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center mb-1">
                <Users className="w-4 h-4 text-secondary mr-1" />
              </div>
              <div className="text-lg font-bold text-secondary" data-testid={`event-going-${event.id}`}>
                {formatNumber(event.going)}
              </div>
              <p className="text-xs text-muted-foreground">
                {t("যাচ্ছেন", "Going")}
              </p>
            </div>
            
            <div className="bg-accent/5 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center mb-1">
                <ThumbsUp className="w-4 h-4 text-accent mr-1" />
              </div>
              <div className="text-lg font-bold text-accent" data-testid={`event-helpful-${event.id}`}>
                {formatNumber(event.helpful)}
              </div>
              <p className="text-xs text-muted-foreground">
                {t("সহায়ক", "Helpful")}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Events() {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGovernmental, setIsGovernmental] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await apiGet<any>('/api/auth/me');
        if (!cancelled) {
          setIsGovernmental(me.role === 'governmental');
          setIsLoggedIn(true);
        }
      } catch {
        if (!cancelled) {
          setIsGovernmental(false);
          setIsLoggedIn(false);
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleOpenModal = (event: Event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
    setIsModalOpen(false);
  };

  const { data: events, isLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (eventId: string) => {
      return apiDelete(`/api/events/${eventId}`);
    },
    onSuccess: () => {
      toast({ title: t('ইভেন্ট মুছে ফেলা হয়েছে', 'Event deleted') });
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      setConfirmOpen(false);
      setEventToDelete(null);
    },
    onError: (err: any) => {
      toast({ 
        title: t('ত্রুটি', 'Error'), 
        description: err.message || t('মুছে ফেলতে ব্যর্থ', 'Failed to delete'), 
        variant: 'destructive' 
      });
    }
  });

  const handleDeleteEvent = (eventId: string) => {
    setEventToDelete(eventId);
    setConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (eventToDelete) {
      deleteMutation.mutate(eventToDelete);
    }
  };

  const categories = ["All", "Environment", "Community Service", "Education", "Healthcare", "Technology", "Agriculture"];

  const filteredEvents = events?.filter(event => 
    selectedCategory === "All" || event.category === selectedCategory
  );

  const categoryTranslation = (category: string) => {
    switch (category) {
      case "All": return t("সকল", "All");
      case "Environment": return t("পরিবেশ", "Environment");
      case "Community Service": return t("সমাজসেবা", "Community Service");
      case "Education": return t("শিক্ষা", "Education");
      case "Healthcare": return t("স্বাস্থ্য", "Healthcare");
      case "Technology": return t("প্রযুক্তি", "Technology");
      case "Agriculture": return t("কৃষি", "Agriculture");
      default: return category;
    }
  };

  return (
    <main className="flex-1 py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4" data-testid="events-page-title">
            {t("স্থানীয় ইভেন্ট ও কার্যক্রম", "Local Events & Programs")}
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto" data-testid="events-page-subtitle">
            {t(
              "আমাদের কমিউনিটির উন্নয়নে অংশগ্রহণ করুন। এই ইভেন্টগুলো সমাজে ইতিবাচক পরিবর্তন আনতে সাহায্য করবে।",
              "Join our community development initiatives. These events will help bring positive change to society."
            )}
          </p>
          {isGovernmental && (
            <Link href="/events/pending">
              <Button className="mt-4">{t('অপেক্ষমাণ ইভেন্ট অনুমোদন', 'Approve Pending Events')}</Button>
            </Link>
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
                data-testid={`category-filter-${category.toLowerCase().replace(' ', '-')}`}
              >
                {categoryTranslation(category)}
              </Badge>
            ))}
          </div>
        </div>

        {/* Events Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-card border border-border rounded-xl p-6 text-center animate-fade-in">
            <div className="text-3xl font-bold text-primary mb-2" data-testid="total-events-count">
              {events?.length || 0}
            </div>
            <p className="text-muted-foreground">
              {t("মোট ইভেন্ট", "Total Events")}
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-6 text-center animate-fade-in" style={{animationDelay: '0.1s'}}>
            <div className="text-3xl font-bold text-secondary mb-2" data-testid="upcoming-events-count">
              {events?.length || 0}
            </div>
            <p className="text-muted-foreground">
              {t("আসন্ন ইভেন্ট", "Upcoming Events")}
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-6 text-center animate-fade-in" style={{animationDelay: '0.2s'}}>
            <div className="text-3xl font-bold text-accent mb-2" data-testid="participants-estimate">
              ২৫০০+
            </div>
            <p className="text-muted-foreground">
              {t("প্রত্যাশিত অংশগ্রহণকারী", "Expected Participants")}
            </p>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8" data-testid="events-grid">
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
            filteredEvents?.map((event, index) => (
              <EventCard 
                key={event.id} 
                event={event} 
                index={index} 
                onOpenModal={handleOpenModal}
                isGovernmental={isGovernmental}
                onDelete={handleDeleteEvent}
              />
            ))
          )}
        </div>

        {filteredEvents?.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg" data-testid="no-events-message">
              {t("এই বিভাগে কোন ইভেন্ট পাওয়া যায়নি।", "No events found in this category.")}
            </p>
          </div>
        )}

        {/* Call to Action */}
        {isLoggedIn && (
          <div className="mt-16 bg-primary text-primary-foreground rounded-xl p-8 text-center animate-fade-in">
            <h2 className="text-2xl md:text-3xl font-bold mb-4" data-testid="events-cta-title">
              {t("আপনার ইভেন্ট প্রস্তাব করুন", "Propose Your Event")}
            </h2>
            <p className="text-lg mb-6 opacity-90" data-testid="events-cta-description">
              {t(
                "আপনার কমিউনিটির জন্য নতুন ইভেন্টের ধারণা আছে? আমাদের সাথে শেয়ার করুন।",
                "Have ideas for new community events? Share them with us."
              )}
            </p>
            <Link href="/events/create">
              <Button 
                size="lg"
                className="bg-accent text-accent-foreground hover:bg-accent/90 px-8 py-4 text-lg font-semibold transition-all hover:scale-105"
                data-testid="propose-event-button"
              >
                {t("ইভেন্ট প্রস্তাব করুন", "Propose Event")} →
              </Button>
            </Link>
          </div>
        )}
        
        <EventDetailsModal 
          event={selectedEvent}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />

        {/* Delete Confirmation Dialog */}
        <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('ইভেন্ট মুছে ফেলুন', 'Delete Event')}</DialogTitle>
            </DialogHeader>
            <p className="text-muted-foreground">
              {t('আপনি কি নিশ্চিত যে আপনি এই ইভেন্টটি মুছে ফেলতে চান?', 'Are you sure you want to delete this event?')}
            </p>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setConfirmOpen(false)}
                disabled={deleteMutation.isPending}
              >
                {t('বাতিল', 'Cancel')}
              </Button>
              <Button 
                variant="destructive" 
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? t('মুছে ফেলছেন...', 'Deleting...') : t('মুছে ফেলুন', 'Delete')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
}

