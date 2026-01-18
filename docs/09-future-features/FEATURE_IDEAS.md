# Future Feature Ideas

**Created**: January 2026
**Status**: Brainstorm / Research Phase

A collection of unique features that could differentiate Drift from other platforms and drive user engagement.

---

## Active Development

### Spotify & SoundCloud Integration (DRI-54)
**Status**: Ticketed | **Difficulty**: Low-Medium | **Impact**: High

Embedded music players on artist profiles.

**What's possible**:
| Platform | Embed Type | Features |
|----------|------------|----------|
| Spotify | iFrame | Tracks, albums, playlists, artist top tracks, dark theme support |
| SoundCloud | Widget API | Tracks, playlists, full playback control, customizable colors |

**Implementation**:
- Artists paste their Spotify/SoundCloud URLs in profile settings
- We parse and embed the appropriate player
- Responsive, mobile-friendly players
- No autoplay (user preference)

**Phases**:
1. Basic URL fields + embeds
2. Smart URL detection (artist vs track vs playlist)
3. Featured track selection, analytics, event page integration

See [Linear ticket DRI-54](https://linear.app/drift-yourself/issue/DRI-54) for full spec.

---

## Priority Features

### 1. Venue Passport / Achievement System
**Difficulty**: Medium | **Impact**: High

Gamification system that rewards exploration and engagement.

**Features**:
- Collect "stamps" for venues visited
- Unlock city badges (Berlin Veteran, Munich Explorer, Hamburg Nightowl)
- Milestones: "100 events attended", "10 different cities", "First review"
- Shareable stats cards for social media (Instagram stories format)
- Yearly wrapped: "Your 2026 in electronic music"

**Why it works**:
- Gamification drives repeat engagement
- Shareable content = free marketing
- Creates emotional connection to platform

**Implementation notes**:
- Database: `user_achievements`, `user_venue_visits` tables
- Achievement triggers on check-in or review submission
- Social share API for generating image cards

---

### 2. Live Check-in / "Who's Here"
**Difficulty**: Medium-High | **Impact**: High

Real-time social presence at venues and events.

**Features**:
- Anonymous real-time crowd counter at venues
- Opt-in friend visibility ("See which friends are here")
- Live "crowd vibe" updates during events (energy level 1-10)
- Queue time estimates from user reports
- Post-event: "You were here with 847 others"

**Why it works**:
- FOMO driver - see where the action is
- Social proof for venue/event discovery
- Real-time engagement keeps app open

**Implementation notes**:
- Supabase Realtime for live updates
- Privacy-first: anonymous by default, opt-in for friend visibility
- Geofencing for automatic check-in suggestions
- Rate limiting to prevent spam

**Privacy considerations**:
- No location tracking without explicit consent
- Check-ins expire after event ends
- Users can go "invisible" anytime

---

### 3. Sound System Database
**Difficulty**: Low | **Impact**: Medium

Detailed audio specifications for venues - something no platform does well.

**Features**:
- Sound system specs (Funktion-One, Void, Pioneer, etc.)
- User ratings of sound quality by position in venue
- "Best spot to stand" heatmaps
- Audio enthusiast detailed reviews
- Comparison between venues

**Why it works**:
- Audiophiles are passionate and vocal
- Differentiates from generic venue listings
- Low effort, high value for niche audience

**Implementation notes**:
- Add `sound_system` fields to venues table
- New review category for "Sound Quality"
- Heatmap visualization component

---

## Secondary Features

### 4. Sonic DNA / Vibe Matching
**Difficulty**: High | **Impact**: High

AI-powered matching of users to venues/events based on taste.

**Features**:
- Each venue gets a "sonic profile" based on aggregated reviews
- Profile dimensions: bass-heavy, minimal, industrial, melodic, hard, soft
- Match users to venues/events based on their review history
- "You liked Berghain's sound? Try these venues..."
- Visual "vibe map" showing similar venues/events

**Implementation notes**:
- ML model trained on review text + ratings
- Embedding vectors for venues and users
- Cosine similarity for recommendations

---

### 5. Set Timeline / Tracklist Crowdsourcing
**Difficulty**: Medium | **Impact**: Medium

Collaborative event documentation.

**Features**:
- Users collaboratively identify tracks played at events
- Timeline of the night: "22:00 - Warm-up → 02:00 - Peak → 05:00 - Sunrise"
- Integration with Shazam/SoundCloud for track IDs
- Artists can confirm/add to tracklists
- Spotify/Apple Music playlist generation

**Implementation notes**:
- `event_tracklists` table with timestamps
- Voting system for track confirmations
- Artist verification badges

---

### 6. Artist Radar / Discovery Algorithm
**Difficulty**: Medium | **Impact**: Medium

Surface upcoming artists before they blow up.

**Features**:
- "Discover before they blow up" - highlight rising artists
- Track artist trajectory (small venues → bigger venues)
- "This artist played 3 events you attended" connections
- Local scene support badges
- Follow artists to get notified of new bookings

**Implementation notes**:
- Artist growth metrics based on venue size progression
- User-artist connection graph
- Notification system for followed artists

---

### 7. Crew / Squad Features
**Difficulty**: Medium | **Impact**: Medium

Group coordination for nightlife.

**Features**:
- Create private groups with friends
- Vote on events together (poll system)
- See group's collective event history
- "Your crew has attended 47 events together"
- Shared wishlists for upcoming events

**Implementation notes**:
- `crews` and `crew_members` tables
- Real-time voting with Supabase
- Group chat integration (future)

---

### 8. Event DNA Visualization
**Difficulty**: High | **Impact**: Medium

Visual exploration of events inspired by djoid.io's scatter maps.

**Features**:
- Visual map of events by genre, energy, crowd size
- See your "event history" as a journey through the scene
- Discover events in unexplored territory
- Interactive filtering and zooming

**Implementation notes**:
- D3.js or similar for visualization
- Dimensionality reduction (t-SNE/UMAP) for positioning
- Canvas rendering for performance

---

### 9. Lineup Builder for Promoters
**Difficulty**: Medium | **Impact**: Medium

Tools for event organizers.

**Features**:
- AI-suggested lineups based on venue vibe and past success
- See which artists have played similar venues
- Booking request system with artist availability calendar
- Historical lineup performance data (attendance, reviews)
- Budget estimation based on artist tier

**Implementation notes**:
- Promoter-only dashboard
- Artist availability calendar integration
- Analytics on past event performance

---

### 10. Time Machine / Archive
**Difficulty**: Low | **Impact**: Low-Medium

Historical documentation of the scene.

**Features**:
- Archive of past events with photos, tracklists, lineups
- "On this day 5 years ago" memories
- Scene history documentation
- Legendary night reconstructions
- User-contributed photos and memories

**Implementation notes**:
- Historical data import from existing sources
- User photo uploads with moderation
- Memory notification system

---

### 11. Scene Health Index
**Difficulty**: Medium | **Impact**: Low

Analytics dashboard for scene trends.

**Features**:
- City-level analytics: "Berlin scene is 23% busier than last month"
- New venue openings and closures tracked
- Genre trend tracking over time
- Support local scene initiatives
- Public dashboard for press/media

**Implementation notes**:
- Aggregated analytics from platform data
- Public API for scene statistics
- Visualization dashboard

---

### 12. Artist Journey Map
**Difficulty**: Low | **Impact**: Low

Visualize artist career paths.

**Features**:
- Timeline of artist's venue progression
- From bedroom to Berghain visualization
- See where artists started vs where they play now
- Inspiration for upcoming artists
- Artist milestones and achievements

**Implementation notes**:
- Timeline component from event history
- Venue tier classification
- Shareable artist journey cards

---

## Feature Comparison Matrix

| Feature | Difficulty | Impact | Unique? | MVP Priority |
|---------|------------|--------|---------|--------------|
| Venue Passport | Medium | High | Medium | Yes |
| Live Check-in | Medium-High | High | High | Yes |
| Sound System DB | Low | Medium | Very High | Yes |
| Sonic DNA Matching | High | High | High | No |
| Tracklist Crowdsourcing | Medium | Medium | Medium | No |
| Artist Radar | Medium | Medium | Medium | No |
| Crew Features | Medium | Medium | Low | No |
| Event Visualization | High | Medium | High | No |
| Lineup Builder | Medium | Medium | Medium | No |
| Time Machine | Low | Low-Medium | Low | No |
| Scene Health Index | Medium | Low | Medium | No |
| Artist Journey | Low | Low | Medium | No |

---

## Inspiration Sources

- **djoid.io** - Visual music curation, track matching, graph playlists
- **Untappd** - Check-ins, badges, social beer tracking (model for Venue Passport)
- **Spotify Wrapped** - Yearly stats, shareable cards
- **Resident Advisor** - Event listings, artist profiles (competitor)
- **Shotgun** - Ticketing with social features

---

## Next Steps

1. **Validate with users** - Survey existing users on feature interest
2. **Prototype top 3** - Build MVP versions for testing
3. **Measure engagement** - A/B test features with subset of users
4. **Iterate based on data** - Focus on what drives retention

---

## Notes

- All features should be mobile-first
- Privacy is paramount - opt-in for social features
- Start simple, add complexity based on usage
- Consider monetization potential (premium features, promoter tools)
