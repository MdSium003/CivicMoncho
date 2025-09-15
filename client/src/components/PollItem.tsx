import { Poll } from "@shared/schema";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { apiGet } from "@/lib/api";

interface PollItemProps {
  poll: Poll;
  index: number;
  totalVotes: number;
}

export default function PollItem({ poll, index, totalVotes }: PollItemProps) {
  const { t, language } = useLanguage();
  const [hasVoted, setHasVoted] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const percentage = totalVotes > 0 ? Math.round((poll.votes / totalVotes) * 100) : 0;

  // Fetch initial vote status for this project
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiGet<{ voted: boolean }>(`/api/projects/${poll.id}/vote-status`);
        if (!cancelled) setHasVoted(!!data.voted);
      } catch {
        // ignore
      }
    })();
    return () => { cancelled = true; };
  }, [poll.id]);

  const voteMutation = useMutation({
    mutationFn: async () => {
      const url = hasVoted ? `/api/projects/${poll.id}/unvote` : `/api/polls/${poll.id}/vote`;
      const res = await apiRequest("POST", url);
      return res.json();
    },
    onSuccess: () => {
      // Update both polls and projects lists to keep numbers consistent
      queryClient.invalidateQueries({ queryKey: ["/api/polls"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setHasVoted(v => !v);
      toast({
        title: hasVoted ? t("ভোট বাতিল", "Vote removed") : t("ভোট সফল!", "Vote Successful!"),
      });
    },
    onError: (err: any) => {
      if (err?.message?.includes("409")) {
        setHasVoted(true);
      } else if (err?.message?.includes("401")) {
        toast({
          title: t("লগইন প্রয়োজন", "Login Required"),
          description: t("ভোট দিতে লগইন করুন।", "Please login to vote."),
          variant: "destructive",
        });
      } else {
        toast({
          title: t("ত্রুটি", "Error"),
          description: t("ভোট প্রক্রিয়ায় সমস্যা হয়েছে।", "Unable to process vote."),
          variant: "destructive",
        });
      }
    },
  });

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return "bg-accent/10 text-accent border-accent/20";
      case 2: return "bg-primary/10 text-primary border-primary/20";
      case 3: return "bg-secondary/10 text-secondary border-secondary/20";
      default: return "bg-muted/10 text-muted-foreground border-border";
    }
  };

  const getProgressColor = (rank: number) => {
    switch (rank) {
      case 1: return "from-accent to-accent/80";
      case 2: return "from-primary to-primary/80";
      case 3: return "from-secondary to-secondary/80";
      default: return "from-muted-foreground to-muted-foreground/80";
    }
  };

  const getButtonColor = (rank: number) => {
    switch (rank) {
      case 1: return "bg-accent text-accent-foreground hover:bg-accent/90";
      case 2: return "bg-primary text-primary-foreground hover:bg-primary/90";
      case 3: return "bg-secondary text-secondary-foreground hover:bg-secondary/90";
      default: return "bg-muted text-muted-foreground hover:bg-muted/80";
    }
  };

  const formatVotes = (votes: number) => {
    const numStr = votes.toString();
    if (language === "bn") {
      return numStr.replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[parseInt(d)])
                   .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <div 
      className={`project-card rounded-xl shadow-lg p-6 animate-fade-in transition-all duration-500 hover:shadow-xl hover:-translate-y-1 ${
        index === 0 ? "bg-card border-2 border-accent/20" : "bg-card border border-border"
      }`}
      style={{ animationDelay: `${index * 0.1}s` }}
      data-testid={`poll-item-${poll.id}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-card-foreground mb-2" data-testid={`poll-title-${poll.id}`}>
            {language === "bn" ? poll.titleBn : poll.titleEn}
          </h3>
          <p className="text-muted-foreground text-sm" data-testid={`poll-description-${poll.id}`}>
            {language === "bn" ? poll.descriptionBn : poll.descriptionEn}
          </p>
        </div>
        <div className="text-right ml-4">
          <Badge className={getRankColor(index + 1)} data-testid={`poll-rank-${poll.id}`}>
            #{index + 1}
          </Badge>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-card-foreground">
            {t("মোট ভোট", "Total Votes")}
          </span>
          <span 
            className={`text-2xl font-bold count-animation ${
              index === 0 ? "text-accent" : 
              index === 1 ? "text-primary" : 
              index === 2 ? "text-secondary" : "text-muted-foreground"
            }`}
            data-testid={`poll-votes-${poll.id}`}
          >
            {formatVotes(poll.votes)}
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-3">
          <div 
            className={`h-3 rounded-full progress-bar bg-gradient-to-r ${getProgressColor(index + 1)}`}
            style={{ width: `${percentage}%` }}
            data-testid={`poll-progress-${poll.id}`}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1" data-testid={`poll-percentage-${poll.id}`}>
          {percentage}% {t("অংশগ্রহণকারীর সমর্থন", "participant support")}
        </p>
      </div>

      <Button
        className={`vote-button w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 hover:scale-105 relative overflow-hidden ${getButtonColor(index + 1)}`}
        onClick={() => voteMutation.mutate()}
        disabled={voteMutation.isPending}
        data-testid={`poll-vote-button-${poll.id}`}
      >
        {hasVoted ? (
          <>
            <Check className="w-4 h-4 mr-2" />
            {t("ভোট বাতিল", "Cancel Vote")}
          </>
        ) : (
          <>
            <ThumbsUp className="w-4 h-4 mr-2" />
            {t("এই প্রকল্পের জন্য ভোট দিন", "Vote for this project")}
          </>
        )}
      </Button>
    </div>
  );
}
