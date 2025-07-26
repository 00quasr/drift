import React from 'react';
import { Calendar, Clock, MapPin, Users, Star, Music } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from './badge';
import { getRandomBackgroundImage } from '@/lib/utils/imageUtils';

interface BaseEntityCardProps {
  id: string;
  title: string;
  imageUrl: string;
  category: string;
  href: string;
}

interface VenueCardProps extends BaseEntityCardProps {
  type: 'venue';
  city: string;
  country: string;
  capacity?: number;
  genres?: string[];
}

interface EventCardProps extends BaseEntityCardProps {
  type: 'event';
  artist: string;
  date: string;
  time: string;
  venue: string;
  location: string;
  price?: string;
  attendees?: number;
  rating?: number;
  isUpcoming: boolean;
}

interface ArtistCardProps extends BaseEntityCardProps {
  type: 'artist';
  bio?: string;
  city?: string;
  country?: string;
  genres?: string[];
  rating?: number;
  reviewCount?: number;
}

type EntityCardProps = VenueCardProps | EventCardProps | ArtistCardProps;

export const EntityCard: React.FC<EntityCardProps> = (props) => {
  const { id, title, imageUrl, category, href, type } = props;
  
  // Use the actual uploaded image if available, otherwise fall back to random background
  const displayImage = imageUrl || getRandomBackgroundImage(id);

  return (
    <Link href={href}>
      <div className="group relative overflow-hidden h-[320px] md:h-[380px] bg-black border-2 border-white/20 hover:border-white/60 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src={displayImage}
            alt={title}
            fill
            className="object-cover opacity-50 group-hover:opacity-70 transition-opacity duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Angular Corner Design */}
        <div className="absolute top-4 right-4 w-8 h-8 z-20">
          <div className="w-full h-full border-l-2 border-t-2 border-white/60 transform rotate-45" />
        </div>
        
        {/* Category Tag - 90s Style */}
        <div className="absolute top-4 left-4 z-20">
          <div className="bg-black/80 backdrop-blur-sm border border-white/60 px-3 py-1">
            <span className="text-white text-xs font-bold tracking-widest uppercase font-mono">
              {category}
            </span>
          </div>
        </div>
        
        {/* Content Container - Fixed Layout */}
        <div className="relative z-10 h-full flex flex-col">
          {/* Main Content Area */}
          <div className="flex-1 p-6 flex flex-col justify-center">
            {type === 'venue' && <VenueContent {...props as VenueCardProps} />}
            {type === 'event' && <EventContent {...props as EventCardProps} />}
            {type === 'artist' && <ArtistContent {...props as ArtistCardProps} />}
          </div>
          
          {/* Bottom CTA - Fixed Position */}
          <div className="p-6 pt-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span className="text-white text-sm font-bold tracking-wider uppercase">
                  ENTER
                </span>
              </div>
              <div className="w-6 h-6 border border-white/60 flex items-center justify-center transform rotate-45 group-hover:bg-white group-hover:text-black transition-all duration-300">
                <span className="transform -rotate-45 text-xs font-bold">→</span>
              </div>
            </div>
          </div>
        </div>

        {/* Glitch Effect Overlay */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none z-30">
          <div className="h-full w-full bg-gradient-to-r from-transparent via-white/10 to-transparent transform skew-x-12" />
        </div>
      </div>
    </Link>
  );
};

const VenueContent: React.FC<VenueCardProps> = ({ 
  title, 
  city, 
  country, 
  capacity, 
  genres 
}) => (
  <div className="space-y-4">
    <div>
      <h3 className="text-2xl font-bold text-white mb-2 tracking-tight uppercase leading-tight">
        {title}
      </h3>
      <div className="flex items-center gap-2 text-sm">
        <span className="text-white/80 font-bold tracking-widest uppercase">{city}</span>
        <div className="w-1 h-1 bg-white rounded-full" />
        <span className="text-white/80 font-bold tracking-widest uppercase">{country}</span>
      </div>
    </div>
    
    {capacity && (
      <div className="flex items-center gap-2">
        <Users className="w-4 h-4 text-white" />
        <span className="text-white font-bold text-sm tracking-wider">
          {capacity.toLocaleString()} CAP
        </span>
      </div>
    )}
    
    {genres && genres.length > 0 && (
      <div className="flex flex-wrap gap-2">
        {genres.slice(0, 2).map((genre) => (
          <div 
            key={genre} 
            className="bg-white/10 border border-white/30 px-2 py-1"
          >
            <span className="text-white text-xs font-bold tracking-widest uppercase">
              {genre}
            </span>
          </div>
        ))}
      </div>
    )}
  </div>
);

const EventContent: React.FC<EventCardProps> = ({ 
  title, 
  artist, 
  date, 
  time, 
  venue, 
  location, 
  price, 
  attendees, 
  rating,
  isUpcoming 
}) => (
  <div className="space-y-4">
    <div>
      <div className="text-white/80 font-bold text-xs tracking-widest uppercase mb-1">
        {artist}
      </div>
      <h3 className="text-2xl font-bold text-white mb-2 tracking-tight uppercase leading-tight">
        {title}
      </h3>
      <div className="flex items-center gap-2 text-sm">
        <span className="text-white/80 font-bold tracking-widest uppercase">{date}</span>
        <div className="w-1 h-1 bg-white rounded-full" />
        <span className="text-white/80 font-bold tracking-widest uppercase">{time}</span>
      </div>
    </div>
    
    <div className="space-y-1">
      <div className="text-white font-bold text-sm tracking-wider uppercase">{venue}</div>
      <div className="text-white/60 text-xs tracking-widest uppercase">{location}</div>
    </div>
    
    <div className="flex items-center justify-between">
      {price && (
        <div className="bg-white text-black px-2 py-1">
          <span className="font-bold text-sm tracking-wider uppercase">{price}</span>
        </div>
      )}
      {attendees && (
        <span className="text-white/80 text-xs font-bold tracking-widest uppercase">
          {attendees.toLocaleString()} GOING
        </span>
      )}
    </div>
  </div>
);

const ArtistContent: React.FC<ArtistCardProps> = ({ 
  title, 
  bio, 
  city, 
  country, 
  genres, 
  rating, 
  reviewCount 
}) => (
  <div className="space-y-4">
    <div>
      <h3 className="text-2xl font-bold text-white mb-2 tracking-tight uppercase leading-tight">
        {title}
      </h3>
      {city && country && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-white/80 font-bold tracking-widest uppercase">{city}</span>
          <div className="w-1 h-1 bg-white rounded-full" />
          <span className="text-white/80 font-bold tracking-widest uppercase">{country}</span>
        </div>
      )}
    </div>
    
    {bio && (
      <p className="text-white/80 text-sm leading-relaxed line-clamp-2 font-medium">
        {bio}
      </p>
    )}
    
    {genres && genres.length > 0 && (
      <div className="flex flex-wrap gap-2">
        {genres.slice(0, 2).map((genre) => (
          <div 
            key={genre} 
            className="bg-white/10 border border-white/30 px-2 py-1"
          >
            <span className="text-white text-xs font-bold tracking-widest uppercase">
              {genre}
            </span>
          </div>
        ))}
      </div>
    )}
    
    <div className="flex items-center justify-between">
      {reviewCount && (
        <span className="text-white/80 text-xs font-bold tracking-widest uppercase">
          {reviewCount} REVIEWS
        </span>
      )}
      {rating && (
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 text-white fill-current" />
          <span className="text-white font-bold text-sm">{rating}</span>
        </div>
      )}
    </div>
  </div>
); 