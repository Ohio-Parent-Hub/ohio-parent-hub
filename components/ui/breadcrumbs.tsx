import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
  // Base item (Home) is always implicit in the schema, but we can explicitly add it to the visual list if we want.
  // Or we can treat "items" as everything AFTER home.
  // Let's treat "items" as the full list including or excluding Home, but for this project let's standardize:
  // The caller passes [Home, City, Detail] or whatever they want.
  
  // Actually, to make it easier, let's auto-prepend Home if it's not the first item, 
  // or just let the caller handle it for maximum flexibility.
  // I'll stick to: Caller provides the full chain they want displayed.

  // Schema.org JSON-LD generation
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.label,
      "item": `https://ohioparenthub.com${item.href}` // Assuming absolute URLs or relative to domain
    }))
  };

  return (
    <nav aria-label="Breadcrumb" className={`flex items-center text-sm text-muted-foreground ${className}`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      
      <ol className="flex items-center gap-2 flex-wrap">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isHome = item.href === "/";
          
          return (
            <li key={item.href} className="flex items-center gap-2">
              {index > 0 && (
                <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
              )}
              
              {isLast ? (
                <span className="font-medium text-foreground" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link 
                  href={item.href} 
                  className="hover:text-primary transition-colors flex items-center gap-1"
                >
                  {isHome && <Home className="h-3.5 w-3.5" />}
                  <span>{item.label}</span>
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
