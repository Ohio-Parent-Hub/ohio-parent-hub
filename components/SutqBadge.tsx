import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

interface SutqBadgeProps {
  rating: string | number;
  className?: string;
}

export function SutqBadge({ rating, className }: SutqBadgeProps) {
  // Normalize rating to string
  const r = String(rating).trim();

  if (r === "3") {
    return (
      <Badge 
        variant="secondary" 
        className={`bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200 ${className}`}
      >
        <Star className="mr-1 h-3 w-3 fill-yellow-600 text-yellow-600" />
        Gold Rated
      </Badge>
    );
  }

  if (r === "2") {
    return (
      <Badge 
        variant="secondary" 
        className={`bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200 ${className}`}
      >
        <Star className="mr-1 h-3 w-3 fill-slate-400 text-slate-400" />
        Silver Rated
      </Badge>
    );
  }

  if (r === "1") {
    return (
      <Badge 
        variant="secondary" 
        className={`bg-orange-50 text-orange-800 border-orange-200 hover:bg-orange-100 ${className}`}
      >
        <Star className="mr-1 h-3 w-3 fill-orange-600 text-orange-600" />
        Bronze Rated
      </Badge>
    );
  }

  // Fallback / N/A
  return (
    <Badge variant="outline" className={`text-muted-foreground ${className}`}>
      Not Rated
    </Badge>
  );
}
