import { ReactNode } from "react";
import { ArrowRight, Calendar, MapPin, Music, Users, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface BaseEntityBentoProps {
  id: string;
  name: string;
  description: string;
  href: string;
  imageUrl: string;
  className?: string;
}

interface VenueBentoProps extends BaseEntityBentoProps {
  type: 'venue';
  city: string;
  country: string;
  capacity?: number;
  genres?: string[];
}

interface EventBentoProps extends BaseEntityBentoProps {
  type: 'event';
  artist: string;
  date: string;
  time: string;
  venue: string;
  location: string;
  price?: string;
  isUpcoming: boolean;
}

interface ArtistBentoProps extends BaseEntityBentoProps {
  type: 'artist';
  bio?: string;
  city?: string;
  country?: string;
  genres?: string[];
  rating?: number;
  reviewCount?: number;
}

type EntityBentoProps = VenueBentoProps | EventBentoProps | ArtistBentoProps;

const EntityBento = (props: EntityBentoProps) => {
  const { name, description, href, imageUrl, className, type } = props;

  const getIcon = () => {
    switch (type) {
      case 'venue': return MapPin;
      case 'event': return Calendar;
      case 'artist': return Music;
      default: return Music;
    }
  };

  const Icon = getIcon();

  return (
    <Link href={href}>
      <div
        className={cn(
          "group relative flex flex-col justify-between overflow-hidden rounded-xl h-[22rem]",
          "bg-slate-900/50 backdrop-blur-sm border border-slate-800",
          "transition-all duration-300 hover:border-slate-700",
          "transform-gpu hover:scale-[1.02]",
          className,
        )}
      >
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover opacity-30 transition-all duration-500 group-hover:opacity-40"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-transparent" />
        </div>

        {/* Main Content */}
        <div className="pointer-events-none z-10 flex transform-gpu flex-col gap-1 p-6 transition-all duration-300 group-hover:-translate-y-2">
          <Icon className="h-12 w-12 origin-left transform-gpu text-slate-400 transition-all duration-300 ease-in-out group-hover:scale-75 group-hover:text-white" />
          <h3 className="text-xl font-semibold text-white mt-2">
            {name}
          </h3>
          <p className="max-w-lg text-slate-400 text-sm leading-relaxed">
            {description}
          </p>
        </div>

        {/* Bottom Content */}
        <div className="relative z-10 p-6 pt-0">
          {type === 'venue' && <VenueBottomContent {...props as VenueBentoProps} />}
          {type === 'event' && <EventBottomContent {...props as EventBentoProps} />}
          {type === 'artist' && <ArtistBottomContent {...props as ArtistBentoProps} />}
        </div>

        {/* Hover CTA */}
        <div
          className={cn(
            "pointer-events-none absolute bottom-0 flex w-full translate-y-10 transform-gpu flex-row items-center p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100",
          )}
        >
          <Button variant="ghost" asChild size="sm" className="pointer-events-auto text-white hover:bg-slate-800/50">
            <span>
              Explore
              <ArrowRight className="ml-2 h-4 w-4" />
            </span>
          </Button>
        </div>

        {/* Hover Overlay */}
        <div className="pointer-events-none absolute inset-0 transform-gpu transition-all duration-300 group-hover:bg-slate-900/10" />
      </div>
    </Link>
  );
};

const VenueBottomContent = ({ city, country, capacity, genres }: VenueBentoProps) => (
  <div className="space-y-3">
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-300">{city}</span>
      <span className="text-slate-400">{country}</span>
    </div>
    
    {capacity && (
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <Users className="w-4 h-4" />
        <span>{capacity.toLocaleString()} capacity</span>
      </div>
    )}
    
    {genres && genres.length > 0 && (
      <div className="flex flex-wrap gap-1">
        {genres.slice(0, 2).map((genre) => (
          <Badge 
            key={genre} 
            variant="secondary" 
            className="text-xs bg-slate-800/50 text-slate-300 border-none"
          >
            {genre}
          </Badge>
        ))}
      </div>
    )}
  </div>
);

const EventBottomContent = ({ artist, date, time, venue, location, price, isUpcoming }: EventBentoProps) => (
  <div className="space-y-3">
    <div className="text-sm text-slate-300">
      <div className="font-medium">{artist}</div>
      <div className="text-slate-400">{venue}</div>
    </div>
    
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-300">{date}</span>
      <span className="text-slate-400">{time}</span>
    </div>
    
    <div className="flex items-center justify-between">
      <span className="text-slate-300 font-medium">{price || 'Free'}</span>
      {isUpcoming && (
        <Badge variant="secondary" className="text-xs bg-slate-800/50 text-slate-300 border-none">
          Upcoming
        </Badge>
      )}
    </div>
  </div>
);

const ArtistBottomContent = ({ city, country, genres, rating, reviewCount }: ArtistBentoProps) => (
  <div className="space-y-3">
    {city && country && (
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-300">{city}</span>
        <span className="text-slate-400">{country}</span>
      </div>
    )}
    
    {genres && genres.length > 0 && (
      <div className="flex flex-wrap gap-1">
        {genres.slice(0, 2).map((genre) => (
          <Badge 
            key={genre} 
            variant="secondary" 
            className="text-xs bg-slate-800/50 text-slate-300 border-none"
          >
            {genre}
          </Badge>
        ))}
      </div>
    )}
    
    <div className="flex items-center justify-between text-sm">
      {reviewCount && (
        <span className="text-slate-400">{reviewCount} reviews</span>
      )}
      {rating && (
        <div className="flex items-center gap-1 text-slate-300">
          <Star className="w-4 h-4 fill-current" />
          <span>{rating}</span>
        </div>
      )}
    </div>
  </div>
);

const EntityBentoGrid = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "grid w-full auto-rows-[22rem] gap-6",
        // Responsive grid
        "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        className,
      )}
    >
      {children}
    </div>
  );
};

export { EntityBento, EntityBentoGrid }; 