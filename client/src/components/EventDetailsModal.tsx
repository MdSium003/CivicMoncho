import { useState, useEffect } from "react";
import { Event } from "@shared/schema";
import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { HandHeart, Users, ThumbsUp, Calendar, MapPin, CheckCircle, XCircle } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface EventDetailsModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function EventDetailsModal({ event, isOpen, onClose }: EventDetailsModalProps) {
  const { t, language } = useLanguage();
  const [hasVolunteered, setHasVolunteered] = useState(false);
  const [hasMarkedGoing, setHasMarkedGoing] = useState(false);
  const [hasMarkedHelpful, setHasMarkedHelpful] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch current user's status when modal opens
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!isOpen || !event?.id) return;
      try {
        const res = await fetch(`/api/events/${event.id}/status`, { credentials: "include" });
        if (!res.ok) return; // unauth returns default false
        const data = await res.json();
        if (!cancelled) {
          setHasVolunteered(!!data.volunteered);
          setHasMarkedGoing(!!data.going);
          setHasMarkedHelpful(!!data.helpful);
        }
      } catch {
        // ignore
      }
    })();
    return () => { cancelled = true; };
  }, [isOpen, event?.id]);

  const volunteerMutation = useMutation({
    mutationFn: async () => {
      const url = hasVolunteered ? `/api/events/${event?.id}/unvolunteer` : `/api/events/${event?.id}/volunteer`;
      const res = await apiRequest("POST", url);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      setHasVolunteered(v => !v);
      toast({
        title: hasVolunteered ? t("স্বেচ্ছাসেবী বাতিল", "Volunteer canceled") : t("স্বেচ্ছাসেবী নিবন্ধন সফল!", "Volunteer Registration Successful!"),
      });
    },
    onError: (err: any) => {
      if (err?.message?.includes("401")) {
        toast({
          title: t("লগইন প্রয়োজন", "Login Required"),
          description: t("স্বেচ্ছাসেবী নিবন্ধনের জন্য লগইন করুন।", "Please login to register as volunteer."),
          variant: "destructive",
        });
      } else {
        toast({
          title: t("ত্রুটি", "Error"),
          description: t("স্বেচ্ছাসেবী ক্রিয়া ব্যর্থ হয়েছে।", "Volunteer action failed."),
          variant: "destructive",
        });
      }
    },
  });

  const goingMutation = useMutation({
    mutationFn: async () => {
      const url = hasMarkedGoing ? `/api/events/${event?.id}/notgoing` : `/api/events/${event?.id}/going`;
      const res = await apiRequest("POST", url);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      setHasMarkedGoing(v => !v);
      toast({
        title: hasMarkedGoing ? t("অংশগ্রহণ বাতিল", "Participation canceled") : t("অংশগ্রহণ নিশ্চিত!", "Participation Confirmed!"),
      });
    },
    onError: (err: any) => {
      if (err?.message?.includes("401")) {
        toast({
          title: t("লগইন প্রয়োজন", "Login Required"),
          description: t("অংশগ্রহণের জন্য লগইন করুন।", "Please login to participate."),
          variant: "destructive",
        });
      } else {
        toast({ title: t("ত্রুটি", "Error"), description: t("অংশগ্রহণ ক্রিয়া ব্যর্থ হয়েছে।", "Going action failed."), variant: "destructive" });
      }
    },
  });

  const helpfulMutation = useMutation({
    mutationFn: async () => {
      const url = hasMarkedHelpful ? `/api/events/${event?.id}/unhelpful` : `/api/events/${event?.id}/helpful`;
      const res = await apiRequest("POST", url);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      setHasMarkedHelpful(v => !v);
      toast({
        title: hasMarkedHelpful ? t("সহায়ক ভোট বাতিল", "Helpful vote removed") : t("সহায়ক ভোট দেয়া হয়েছে!", "Marked as Helpful!"),
      });
    },
    onError: (err: any) => {
      if (err?.message?.includes("401")) {
        toast({
          title: t("লগইন প্রয়োজন", "Login Required"),
          description: t("সহায়ক ভোট দিতে লগইন করুন।", "Please login to mark as helpful."),
          variant: "destructive",
        });
      } else {
        toast({ title: t("ত্রুটি", "Error"), description: t("সহায়ক ক্রিয়া ব্যর্থ হয়েছে।", "Helpful action failed."), variant: "destructive" });
      }
    },
  });

  if (!event) return null;

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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="event-details-modal">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold" data-testid="modal-event-title">
            {language === "bn" ? event.titleBn : event.titleEn}
          </DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Event Image & Action Buttons */}
          <div className="space-y-4">
            <img 
              src={event.imageUrl} 
              alt={language === "bn" ? event.titleBn : event.titleEn}
              className="w-full h-64 object-cover rounded-lg"
              data-testid="modal-event-image"
            />
            
            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 hover:scale-105 ${
                  hasVolunteered 
                    ? "bg-secondary text-secondary-foreground hover:bg-secondary/90"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                }`}
                onClick={() => volunteerMutation.mutate()}
                disabled={volunteerMutation.isPending}
                data-testid="modal-volunteer-button"
              >
                {hasVolunteered ? (
                  <>
                    <XCircle className="w-5 h-5 mr-2" />
                    {t("স্বেচ্ছাসেবী বাতিল করুন", "Cancel Volunteer")}
                  </>
                ) : (
                  <>
                    <HandHeart className="w-5 h-5 mr-2" />
                    {t("স্বেচ্ছাসেবী হিসেবে নিবন্ধন করুন", "Register as Volunteer")}
                  </>
                )}
              </Button>

              <Button
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 hover:scale-105 ${
                  hasMarkedGoing 
                    ? "bg-accent text-accent-foreground hover:bg-accent/90"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/90"
                }`}
                onClick={() => goingMutation.mutate()}
                disabled={goingMutation.isPending}
                data-testid="modal-going-button"
              >
                {hasMarkedGoing ? (
                  <>
                    <XCircle className="w-5 h-5 mr-2" />
                    {t("আমি যাচ্ছি বাতিল", "Cancel Going")}
                  </>
                ) : (
                  <>
                    <Users className="w-5 h-5 mr-2" />
                    {t("আমি যাচ্ছি", "I'm Going")}
                  </>
                )}
              </Button>

              <Button
                variant={hasMarkedHelpful ? "default" : "outline"}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 hover:scale-105 ${
                  hasMarkedHelpful 
                    ? "bg-muted text-muted-foreground border-muted"
                    : "border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                }`}
                onClick={() => helpfulMutation.mutate()}
                disabled={helpfulMutation.isPending}
                data-testid="modal-helpful-button"
              >
                {hasMarkedHelpful ? (
                  <>
                    <XCircle className="w-5 h-5 mr-2" />
                    {t("সহায়ক ভোট বাতিল", "Remove Helpful")}
                  </>
                ) : (
                  <>
                    <ThumbsUp className="w-5 h-5 mr-2" />
                    {t("সহায়ক", "Helpful")}
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Event Details */}
          <div className="space-y-6">
            {/* Category Badge */}
            <div className="flex flex-wrap gap-2">
              <Badge 
                className={getCategoryColor(event.category)}
                data-testid="modal-event-category"
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

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold mb-2" data-testid="modal-description-title">
                {t("ইভেন্ট বিবরণ", "Event Description")}
              </h3>
              <p className="text-muted-foreground leading-relaxed" data-testid="modal-event-description">
                {language === "bn" ? event.descriptionBn : event.descriptionEn}
              </p>
            </div>

            <Separator />

            {/* Date and Location */}
            <div className="space-y-3">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-primary mr-3" />
                <div>
                  <span className="text-sm font-medium text-muted-foreground">{t("তারিখ", "Date")}</span>
                  <div className="text-foreground" data-testid="modal-event-date">{event.date}</div>
                </div>
              </div>
              <div className="flex items-center">
                <MapPin className="w-5 h-5 text-secondary mr-3" />
                <div>
                  <span className="text-sm font-medium text-muted-foreground">{t("স্থান", "Location")}</span>
                  <div className="text-foreground" data-testid="modal-event-location">{event.location}</div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Interaction Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-primary/5 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-primary mb-1" data-testid="modal-volunteers-count">
                  {formatNumber(event.volunteers)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("স্বেচ্ছাসেবী", "Volunteers")}
                </p>
              </div>

              <div className="bg-secondary/5 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-secondary mb-1" data-testid="modal-going-count">
                  {formatNumber(event.going)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("যাচ্ছেন", "Going")}
                </p>
              </div>

              <div className="bg-accent/5 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-accent mb-1" data-testid="modal-helpful-count">
                  {formatNumber(event.helpful)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("সহায়ক", "Helpful")}
                </p>
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-muted/20 rounded-lg p-4">
              <h4 className="font-medium mb-2">{t("অংশগ্রহণের উপকারিতা", "Benefits of Participation")}</h4>
              <p className="text-sm text-muted-foreground">
                {t(
                  "এই ইভেন্টে অংশগ্রহণের মাধ্যমে আপনি সমাজের উন্নয়নে অবদান রাখতে পারবেন এবং নতুন মানুষের সাথে পরিচিত হতে পারবেন।",
                  "By participating in this event, you can contribute to social development and meet new people in your community."
                )}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}