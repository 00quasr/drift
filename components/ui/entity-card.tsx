import React from 'react';
import { Calendar, Clock, MapPin, Users, Star, Music } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from './badge';

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

  return (
    <Link href={href}>
      <div className="group relative overflow-hidden rounded-lg h-[380px] bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors duration-200">
        {/* Background image */}
        <div className="absolute inset-0">
          <div className="relative w-full h-full">
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover opacity-10"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
          <div className="absolute inset-0 bg-slate-950/60" />
        </div>
        
        {/* Category tag */}
        <div className="absolute top-4 right-4">
          <div className="text-xs text-slate-500 font-mono">{category}</div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 p-6 h-full flex flex-col justify-between">
          {type === 'venue' && <VenueContent {...props as VenueCardProps} />}
          {type === 'event' && <EventContent {...props as EventCardProps} />}
          {type === 'artist' && <ArtistContent {...props as ArtistCardProps} />}
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
  <>
    <div>
      <div className="text-sm text-slate-400 font-mono mb-2">VENUE</div>
      <h3 className="text-2xl font-medium text-white mb-6">{title}</h3>
    </div>
    
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-400">{city}</span>
        <span className="text-slate-400">{country}</span>
      </div>
      
      {capacity && (
        <div className="text-sm text-slate-300">
          <div>Capacity: {capacity.toLocaleString()}</div>
        </div>
      )}
      
      {genres && genres.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {genres.slice(0, 2).map((genre) => (
            <Badge 
              key={genre} 
              variant="secondary" 
              className="text-xs bg-slate-800 text-slate-300 border-none"
            >
              {genre}
            </Badge>
          ))}
        </div>
      )}
      
      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
        <div className="text-white font-medium">View Details</div>
        <button className="text-sm text-white hover:text-slate-300 transition-colors">
          →
        </button>
      </div>
    </div>
  </>
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
  <>
    <div>
      <div className="text-sm text-slate-400 font-mono mb-2">{artist}</div>
      <h3 className="text-2xl font-medium text-white mb-6">{title}</h3>
    </div>
    
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-400">{date}</span>
        <span className="text-slate-400">{time}</span>
      </div>
      
      <div className="text-sm text-slate-300">
        <div>{venue}</div>
        <div className="text-slate-500">{location}</div>
      </div>
      
      <div className="flex items-center justify-between text-sm text-slate-400">
        {attendees && <span>{attendees.toLocaleString()} attending</span>}
        {rating && <span>★ {rating}</span>}
      </div>
      
      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
        <div className="text-white font-medium">{price || 'Free'}</div>
        <button className="text-sm text-white hover:text-slate-300 transition-colors">
          Details →
        </button>
      </div>
    </div>
  </>
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
  <>
    <div>
      <div className="text-sm text-slate-400 font-mono mb-2">ARTIST</div>
      <h3 className="text-2xl font-medium text-white mb-6">{title}</h3>
    </div>
    
    <div className="space-y-3">
      {city && country && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">{city}</span>
          <span className="text-slate-400">{country}</span>
        </div>
      )}
      
      {bio && (
        <div className="text-sm text-slate-300">
          <div className="line-clamp-2">{bio}</div>
        </div>
      )}
      
      {genres && genres.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {genres.slice(0, 2).map((genre) => (
            <Badge 
              key={genre} 
              variant="secondary" 
              className="text-xs bg-slate-800 text-slate-300 border-none"
            >
              {genre}
            </Badge>
          ))}
        </div>
      )}
      
      <div className="flex items-center justify-between text-sm text-slate-400">
        {reviewCount && <span>{reviewCount} reviews</span>}
        {rating && <span>★ {rating}</span>}
      </div>
      
      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
        <div className="text-white font-medium">View Profile</div>
        <button className="text-sm text-white hover:text-slate-300 transition-colors">
          →
        </button>
      </div>
    </div>
  </>
); 