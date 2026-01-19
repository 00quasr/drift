# Drift Intelligence - Artist Analytics & Data Platform

## Executive Summary

Build **Drift Intelligence** - a comprehensive artist data platform focused on the **underground electronic music scene**. This positions Drift as the "**Resident Advisor meets Chartmetric**" - combining community/event features with professional analytics.

**Our Core Differentiator:** We don't just count followers. We map the **social fabric of underground electronic music** - who plays with whom, where they came from, which labels matter, and what trajectory they're on.

---

## Market Research

### Industry Size (2025)
| Metric | Value | Source |
|--------|-------|--------|
| Global Music Market | $184.69B (growing 18.1% CAGR) | [Technavio](https://www.technavio.com/report/music-market-industry-analysis) |
| Digital Music Market | $36.27B → $53.09B by 2030 | [Mordor Intelligence](https://www.mordorintelligence.com/industry-reports/digital-music-market) |
| Major Label Revenue | $13.8B in 2025 | [IBISWorld](https://www.ibisworld.com/united-states/industry/major-label-music-production/1252/) |

### Competitor Landscape

| Platform | Pricing | Focus | Strengths | Weaknesses |
|----------|---------|-------|-----------|------------|
| **[Viberate](https://www.viberate.com/)** | $19.90/mo | Electronic music | Founded by UMEK, 11M artists, venues/festivals | Limited underground focus |
| **[Chartmetric](https://chartmetric.com/)** | $140/mo | Mainstream | Career Stage Score, 5yr history | Expensive, mainstream bias |
| **[Soundcharts](https://soundcharts.com/)** | $129/mo | Real-time | 12M artists, radio tracking | No event integration |
| **[Resident Advisor](https://ra.co/)** | Free (ticketing fees) | Underground electronic | 50M users, trust, ticketing | No analytics tools |

### Market Gap: The Opportunity

**No platform currently combines:**
1. Underground electronic music focus (like RA)
2. Professional analytics (like Chartmetric)
3. Event/venue ecosystem (unique to Drift)
4. Community features (following, reviews)

**Drift's Unique Position:**
- Already has venue database + event listings
- Already has artist profiles with reviews
- Already has user following/social system
- Focus on techno/house/electronic (underserved by mainstream tools)

---

## Why Electronic Music Is Different

Electronic music is fundamentally different from mainstream pop/rock:

1. **Scene-based, not star-based** - Community and connections matter more than raw numbers
2. **Label prestige > play counts** - A release on Ostgut Ton with 10K plays means more than a major label release with 100K
3. **Underground credibility is currency** - Artists actively avoid "selling out"
4. **Event history defines careers** - Where you play matters more than what you stream
5. **Network effects dominate** - B2Bs, collabs, collective membership all signal status

**Chartmetric/Viberate can't track this because they don't have event data, venue data, or scene context.**

Drift does.

---

## Purpose & Value Proposition

### Who Uses This?

| User Type | Pain Point | What Drift Solves |
|-----------|------------|-------------------|
| **Artist Managers** | Tracking multiple artists across platforms is tedious | Single dashboard, cross-platform view |
| **Labels/A&R** | Finding emerging underground talent is guesswork | Data-driven discovery, Drift Score |
| **Booking Agents** | Justifying artist fees requires proof of reach | Exportable reports, market analysis |
| **Artists** | Understanding growth and comparing to peers | Self-service analytics, benchmarking |
| **Venues/Promoters** | Booking the right artists for their market | Artist-venue fit scoring, demographic data |

---

## The Complex System: 7 Interconnected Engines

### Engine 1: Scene Graph Network

Build a multi-dimensional graph database mapping artist relationships:

```
NODES: Artists, Labels, Venues, Events, Collectives
EDGES:
  - Artist ↔ Artist (B2B, collab, remix, same_label)
  - Artist → Label (signed_to, released_on)
  - Artist → Venue (played_at, residency)
  - Artist → Collective (member_of)
```

**Metrics derived:**
- **Scene Centrality Score**: PageRank-style algorithm measuring influence within the graph
- **Bridge Score**: Artists who connect different scenes (e.g., Berlin techno to UK bass)
- **Emerging Signal**: Artists gaining connections to established nodes
- **Cluster Detection**: Identify scene "families" and movements

**Unique insight:** "This artist is 2 degrees from Charlotte de Witte, connected via 3 mutual labels and 5 shared events"

### Engine 2: Underground Authenticity Index (UAI)

A multi-factor credibility score that mainstream platforms cannot replicate:

| Factor | Weight | Data Source | What It Measures |
|--------|--------|-------------|------------------|
| Label Independence | 20% | Discogs/Beatport | % releases on independent labels |
| Vinyl Ratio | 10% | Discogs | % releases with vinyl pressing |
| Club/Festival Ratio | 15% | Drift Events | Small clubs vs big festivals |
| Platform Balance | 15% | All | SoundCloud engagement vs Spotify streams |
| Free Content Ratio | 10% | SoundCloud/Mixcloud | Mixes/podcasts vs paid releases |
| Scene Contribution | 15% | Drift/RA | Running events, mentoring, collective work |
| Longevity | 15% | All | Years active without "blowing up" |

**Output:** UAI 0-100 score with breakdown + "Underground Profile" classification:
- 90-100: "Purist" (cult following, refuses mainstream)
- 70-89: "Scene Core" (established underground respect)
- 50-69: "Crossover Potential" (underground roots, growing visibility)
- 30-49: "Commercial Leaning" (mainstream success, underground origins)
- 0-29: "Mainstream" (primarily commercial)

### Engine 3: Label Intelligence System

Build the world's most comprehensive electronic music label database:

**Label Prestige Algorithm:**
- Historical influence (years active, notable alumni)
- Current roster strength (sum of artist scores)
- Release quality signals (chart performance, critical reception)
- Distribution independence
- Scene recognition (RA mentions, critical coverage)

**Label Classification:**
- **Legendary**: Tresor, Ostgut Ton, Warp, R&S, Planet E
- **Established**: Running Hot, Perlon, Clone, Kompakt
- **Rising**: Labels with momentum and critical acclaim
- **Emerging**: New labels with promising rosters

### Engine 4: Geographic Scene Intelligence

Map the global electronic music landscape:

**Scene Health Index** per city/region:
- Number of active artists
- Event frequency and venue diversity
- Label presence
- Genre diversity
- Growth trajectory

**Artist Market Analysis:**
- Home scene identification
- Market penetration map (where fans are vs where artist plays)
- Untapped market opportunities
- Touring efficiency analysis

**Scene Emergence Detection:**
- Identify cities with rapidly growing underground activity
- Early warning for "next Berlin" type scenes
- Track genre emergence by geography

### Engine 5: Event Intelligence (Drift's Unfair Advantage)

Leverage Drift's event and venue data for unique insights:

**Booking Pattern Analysis:**
- Festival circuit vs club circuit breakdown
- Venue tier progression over time
- Residency detection and tracking
- Support slot to headliner trajectory

**Time Slot Intelligence:**
```
HEADLINER (midnight-2am): Peak visibility, established act
PRIME TIME (10pm-midnight): Rising act with momentum
WARM UP (8-10pm): Emerging or supporting act
CLOSING (2am+): Scene respect, marathon credibility
```

**Event Prestige Scoring:**
```typescript
function calculateEventPrestige(event: Event): number {
  const venueScore = event.venue.prestige_score; // 0-100
  const lineupScore = averageArtistScore(event.lineup);
  const capacityFactor = Math.log10(event.venue.capacity) * 10;
  const festivalBonus = event.is_festival ? 15 : 0;
  const brandFactor = eventBrandScore(event.series_name); // recurring event series

  return weighted_average([
    [venueScore, 0.3],
    [lineupScore, 0.25],
    [capacityFactor, 0.15],
    [festivalBonus, 0.15],
    [brandFactor, 0.15]
  ]);
}
```

### Engine 6: Mix & Podcast Ecosystem

Track the podcast/mix economy (crucial for electronic music):

**Tracked Platforms:**
- Resident Advisor podcast
- Boiler Room sets
- Essential Mix (BBC Radio 1)
- Dekmantel podcast
- SoundCloud DJ mixes
- Mixcloud archives

**Metrics:**
- Mix appearances per year
- Platform prestige (Essential Mix >> random podcast)
- Set length trends (2hr peak time vs 6hr marathon)
- Geographic coverage of mix platforms
- Video vs audio only

### Engine 7: Trajectory Intelligence

The "crystal ball" engine - predictive analytics for artist careers:

**Career Stage Detection:**
```
EMERGING: <5 events/year, small venues, no festival slots
BREAKING: 10-30 events/year, mix of venue tiers, first festival slots
ESTABLISHED: 30+ events/year, consistent headliner, multiple festivals
PEAK: Maximum event density, top billing, global coverage
LEGACY: Reduced frequency, high prestige events only
```

**Momentum Score:**
Real-time momentum based on:
- Follower growth velocity (not just count)
- Event booking frequency increase
- Label tier progression
- Scene graph centrality changes
- Mix/podcast appearance rate

**Breakout Prediction:**
ML model trained on historical breakout artists to identify:
- Artists showing early breakout signals
- Estimated time to next career stage
- Risk factors for stagnation

---

## The Unified Drift Score 2.0

Combine all 7 engines into a sophisticated multi-dimensional score:

```typescript
interface DriftScoreV2 {
  // Overall score
  total: number; // 0-100

  // Component scores (each 0-100)
  reach: number;           // Traditional follower/stream metrics
  momentum: number;        // Growth velocity across all platforms
  underground: number;     // Underground Authenticity Index
  network: number;         // Scene Graph centrality
  booking: number;         // Event Intelligence score
  prestige: number;        // Label affiliations + event quality

  // Metadata
  trajectory: 'rising' | 'stable' | 'declining' | 'breakout';
  career_stage: 'emerging' | 'breaking' | 'established' | 'peak' | 'legacy';
  primary_scenes: string[];
  genre_tags: string[];

  // Comparative
  percentile_overall: number; // vs all artists
  percentile_genre: number;   // vs same genre
  percentile_scene: number;   // vs same scene
}
```

**Dynamic Weighting Based on Career Stage:**

```python
def calculate_drift_score_v2(artist_id):
    # Gather data from all engines
    reach = engine_1_reach.calculate(artist_id)
    momentum = engine_7_trajectory.get_momentum(artist_id)
    underground = engine_2_uai.calculate(artist_id)
    network = engine_1_graph.get_centrality(artist_id)
    booking = engine_5_events.calculate_score(artist_id)
    prestige = engine_3_labels.get_artist_prestige(artist_id)

    # Dynamic weighting based on career stage
    stage = detect_career_stage(artist_id)
    weights = get_weights_for_stage(stage)

    # Weights shift based on career stage:
    # EMERGING: network 0.25, underground 0.20, momentum 0.25, reach 0.10, booking 0.10, prestige 0.10
    # BREAKING: momentum 0.25, booking 0.20, reach 0.15, network 0.15, underground 0.15, prestige 0.10
    # ESTABLISHED: booking 0.25, reach 0.20, prestige 0.20, network 0.15, momentum 0.10, underground 0.10
    # PEAK: reach 0.25, booking 0.25, prestige 0.25, network 0.10, momentum 0.10, underground 0.05

    total = weighted_sum([reach, momentum, underground, network, booking, prestige], weights)

    return DriftScoreV2(
        total=total,
        reach=reach,
        momentum=momentum,
        underground=underground,
        network=network,
        booking=booking,
        prestige=prestige,
        trajectory=determine_trajectory(momentum, reach),
        career_stage=stage,
        ...
    )
```

---

## Monetization Strategy

### Tiered Subscription + API

#### Tier 1: Free (Artist Self-Service)
- Basic analytics for own profile
- Limited historical data (30 days)
- Connect 1 platform
- Goal: Viral adoption, data collection

#### Tier 2: Pro Artist ($9.90/mo) - *Undercut Viberate*
- Full analytics for own profile
- 12 months historical data
- All platforms connected
- Growth reports
- Benchmark vs similar artists

#### Tier 3: Manager/Label ($49/mo)
- Manage up to 10 artists
- Cross-artist comparison
- Exportable reports (PDF/CSV)
- Full Drift Score 2.0 access
- Scene Graph insights
- Market analysis

#### Tier 4: Enterprise ($299/mo)
- Unlimited artists
- API access (1000 calls/day)
- White-label reports
- Custom integrations
- Priority support
- Breakout prediction access

#### Tier 5: API/Data Licensing (Custom Pricing)
- Full API access
- Bulk data exports
- For: Large labels, research firms, other platforms
- Pricing: $500-5000/mo based on usage

### Revenue Projections (Conservative)

| Year | Free Users | Paid Users | Conversion | MRR |
|------|------------|------------|------------|-----|
| Y1 | 5,000 | 250 | 5% | $7,500 |
| Y2 | 20,000 | 1,500 | 7.5% | $45,000 |
| Y3 | 50,000 | 5,000 | 10% | $175,000 |

*Assumes average revenue per paid user of $35/mo*

---

## Technical Architecture

### Data Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         DRIFT INTELLIGENCE                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    USER INTERFACES                                │   │
│  │                                                                   │   │
│  │  /intelligence/dashboard     Multi-artist overview (managers)    │   │
│  │  /intelligence/artist/[id]   Deep-dive analytics                 │   │
│  │  /intelligence/compare       Side-by-side comparison             │   │
│  │  /intelligence/discover      A&R talent discovery                │   │
│  │  /intelligence/scene/[id]    Scene/city analytics                │   │
│  │  /intelligence/label/[id]    Label intelligence                  │   │
│  │  /artist/[id] (existing)     Public profile + basic stats        │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                    │                                     │
│  ┌─────────────────────────────────┴───────────────────────────────┐   │
│  │                       API LAYER                                   │   │
│  │                                                                   │   │
│  │  /api/intelligence/artist/[id]/stats      Current metrics        │   │
│  │  /api/intelligence/artist/[id]/history    Time-series data       │   │
│  │  /api/intelligence/artist/[id]/graph      Network connections    │   │
│  │  /api/intelligence/artist/[id]/trajectory Career analysis        │   │
│  │  /api/intelligence/compare                Multi-artist compare   │   │
│  │  /api/intelligence/discover               Talent search          │   │
│  │  /api/intelligence/scene/[id]             Scene data             │   │
│  │  /api/intelligence/label/[id]             Label data             │   │
│  │  /api/v1/artists (public API)             External API access    │   │
│  └─────────────────────────────────┬───────────────────────────────┘   │
│                                    │                                     │
│  ┌─────────────────────────────────┴───────────────────────────────┐   │
│  │                 7 INTELLIGENCE ENGINES                           │   │
│  │            (Supabase Edge Functions + pg_cron)                   │   │
│  │                                                                   │   │
│  │  ┌──────────────────────────────────────────────────────────┐   │   │
│  │  │ Engine 1: Scene Graph      │ Engine 2: UAI              │   │   │
│  │  │ - Connection mapping       │ - Label independence       │   │   │
│  │  │ - PageRank centrality      │ - Vinyl ratio             │   │   │
│  │  │ - Cluster detection        │ - Platform balance        │   │   │
│  │  └──────────────────────────────────────────────────────────┘   │   │
│  │  ┌──────────────────────────────────────────────────────────┐   │   │
│  │  │ Engine 3: Label Intel      │ Engine 4: Geo Scenes      │   │   │
│  │  │ - Prestige scoring         │ - Scene health index      │   │   │
│  │  │ - Roster analysis          │ - Market penetration      │   │   │
│  │  │ - Historical influence     │ - Emergence detection     │   │   │
│  │  └──────────────────────────────────────────────────────────┘   │   │
│  │  ┌──────────────────────────────────────────────────────────┐   │   │
│  │  │ Engine 5: Event Intel      │ Engine 6: Mix/Podcast     │   │   │
│  │  │ - Booking patterns         │ - Platform appearances    │   │   │
│  │  │ - Venue progression        │ - Prestige scoring        │   │   │
│  │  │ - Time slot analysis       │ - Set length trends       │   │   │
│  │  └──────────────────────────────────────────────────────────┘   │   │
│  │  ┌──────────────────────────────────────────────────────────┐   │   │
│  │  │ Engine 7: Trajectory Intelligence                        │   │   │
│  │  │ - Career stage detection   │ - Breakout prediction     │   │   │
│  │  │ - Momentum scoring         │ - Risk assessment         │   │   │
│  │  └──────────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────┬───────────────────────────────┘   │
│                                    │                                     │
│  ┌─────────────────────────────────┴───────────────────────────────┐   │
│  │                 DATA AGGREGATION LAYER                           │   │
│  │            (Supabase Edge Functions + pg_cron)                   │   │
│  │                                                                   │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐            │   │
│  │  │ Spotify  │ │ YouTube  │ │SoundCloud│ │ Beatport │            │   │
│  │  │  Worker  │ │  Worker  │ │  Worker  │ │  Worker  │            │   │
│  │  │  (daily) │ │  (daily) │ │  (daily) │ │ (weekly) │            │   │
│  │  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘            │   │
│  │       │            │            │            │                    │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐            │   │
│  │  │Instagram │ │ Bandcamp │ │  RA.co   │ │ Discogs  │            │   │
│  │  │  Worker  │ │ Scraper  │ │  Worker  │ │  Worker  │            │   │
│  │  │ (weekly) │ │ (weekly) │ │  (daily) │ │ (weekly) │            │   │
│  │  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘            │   │
│  │       │            │            │            │                    │   │
│  │       └────────────┴────────────┴────────────┘                    │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                    DATABASE LAYER                                 │   │
│  │                                                                   │   │
│  │  artist_external_ids        Platform account links                │   │
│  │  artist_metrics_history     Time-series data (growth tracking)    │   │
│  │  artist_platform_stats      Current aggregated metrics            │   │
│  │  artist_drift_scores        Computed scores + rankings            │   │
│  │  artist_connections         Scene graph edges                     │   │
│  │  labels                     Label database + prestige             │   │
│  │  label_releases             Artist-label relationships            │   │
│  │  scenes                     Geographic scene data                 │   │
│  │  mix_appearances            Podcast/mix tracking                  │   │
│  │  artist_trajectory          Career stage snapshots                │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

### Platform Integration Details

| Platform | API Type | Data Available | Auth | Rate Limit | Priority |
|----------|----------|----------------|------|------------|----------|
| **Spotify** | REST API | Followers, monthly listeners, popularity, genres, top tracks | Client Credentials | ~100/min | P0 |
| **YouTube** | REST API | Subscribers, views, video stats | API Key | 10k quota/day | P0 |
| **SoundCloud** | REST API (restricted) | Followers, plays, reposts | OAuth (partner) | Unknown | P1 |
| **Beatport** | Partner API | Chart positions, releases | Partnership | Unknown | P1 |
| **Instagram** | Graph API | Followers, engagement | Facebook App | Strict | P2 |
| **Bandcamp** | Scraping | Supporters, sales rank | N/A | 1 req/5sec | P2 |
| **Discogs** | REST API | Releases, credits, labels | API Key | 60/min | P1 |
| **RA.co** | Scraping/Partner | Events, DJ rankings | N/A | TBD | P1 |

---

## Database Schema

### Core Tables

```sql
-- 1. External platform identities (link artist to external accounts)
CREATE TABLE artist_external_ids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  platform TEXT NOT NULL, -- spotify, youtube, soundcloud, instagram, beatport, bandcamp, discogs, ra
  platform_id TEXT NOT NULL, -- e.g., Spotify artist ID
  platform_url TEXT, -- e.g., https://open.spotify.com/artist/xxx
  platform_username TEXT, -- e.g., @amelielens
  verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  last_fetched_at TIMESTAMPTZ,
  fetch_status TEXT DEFAULT 'pending', -- pending, success, error, rate_limited
  fetch_error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(artist_id, platform)
);

-- 2. Historical metrics (time-series for growth tracking)
CREATE TABLE artist_metrics_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  metric_type TEXT NOT NULL, -- followers, monthly_listeners, plays, views, subscribers, chart_position
  value BIGINT NOT NULL,
  fetched_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_metrics_artist_platform ON artist_metrics_history(artist_id, platform, metric_type);
CREATE INDEX idx_metrics_fetched ON artist_metrics_history(fetched_at DESC);

-- 3. Current aggregated stats (fast dashboard queries)
CREATE TABLE artist_platform_stats (
  artist_id UUID PRIMARY KEY REFERENCES artists(id) ON DELETE CASCADE,
  -- Streaming
  spotify_followers INT,
  spotify_monthly_listeners INT,
  spotify_popularity INT, -- 0-100
  soundcloud_followers INT,
  soundcloud_plays BIGINT,
  beatport_followers INT,
  beatport_chart_peak INT,
  -- Video
  youtube_subscribers INT,
  youtube_total_views BIGINT,
  youtube_avg_views INT,
  -- Social
  instagram_followers INT,
  instagram_engagement_rate DECIMAL,
  -- Other
  bandcamp_supporters INT,
  discogs_have INT, -- people who own their releases
  discogs_want INT, -- people who want their releases
  ra_followers INT,
  ra_ranking INT,
  -- Computed totals
  total_streaming_reach BIGINT GENERATED ALWAYS AS (
    COALESCE(spotify_monthly_listeners, 0) +
    COALESCE(soundcloud_plays, 0) / 100 +
    COALESCE(youtube_total_views, 0) / 1000
  ) STORED,
  total_social_reach BIGINT GENERATED ALWAYS AS (
    COALESCE(spotify_followers, 0) +
    COALESCE(soundcloud_followers, 0) +
    COALESCE(youtube_subscribers, 0) +
    COALESCE(instagram_followers, 0)
  ) STORED,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Drift Score 2.0 (multi-dimensional scoring)
CREATE TABLE artist_drift_scores (
  artist_id UUID PRIMARY KEY REFERENCES artists(id) ON DELETE CASCADE,
  -- Overall score
  drift_score INT CHECK (drift_score BETWEEN 0 AND 100),
  -- Component scores (all 0-100)
  reach_score INT,           -- Traditional follower/stream metrics
  momentum_score INT,        -- Growth velocity across all platforms
  underground_score INT,     -- Underground Authenticity Index
  network_score INT,         -- Scene Graph centrality
  booking_score INT,         -- Event Intelligence score
  prestige_score INT,        -- Label affiliations + event quality
  -- Career stage
  career_stage TEXT,         -- emerging, breaking, established, peak, legacy
  trajectory TEXT,           -- rising, stable, declining, breakout
  -- Growth metrics
  growth_velocity_7d DECIMAL,
  growth_velocity_30d DECIMAL,
  growth_velocity_90d DECIMAL,
  -- Market analysis
  primary_markets JSONB,     -- [{city: "Berlin", strength: 92}, ...]
  primary_scenes TEXT[],     -- ['berlin_techno', 'uk_bass']
  genre_rankings JSONB,      -- {techno: 145, house: 890}
  similar_artists JSONB,     -- [{id: "xxx", similarity: 0.85}, ...]
  -- Percentiles
  percentile_overall INT,
  percentile_genre INT,
  percentile_scene INT,
  -- Metadata
  computed_at TIMESTAMPTZ DEFAULT NOW(),
  next_computation_at TIMESTAMPTZ
);

-- 5. Subscription/access tracking
CREATE TABLE intelligence_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier TEXT NOT NULL DEFAULT 'free', -- free, pro, manager, enterprise
  managed_artists UUID[], -- array of artist IDs they can view
  api_calls_remaining INT DEFAULT 0,
  api_calls_reset_at TIMESTAMPTZ,
  stripe_subscription_id TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  UNIQUE(user_id)
);
```

### Scene Graph Tables

```sql
-- 6. Artist connections (Scene Graph edges)
CREATE TABLE artist_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_a UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  artist_b UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  connection_type TEXT NOT NULL, -- b2b, collab, remix, same_label, same_event, same_collective
  strength DECIMAL CHECK (strength BETWEEN 0 AND 1), -- 0-1 based on frequency/recency
  first_connection DATE,
  last_connection DATE,
  connection_count INT DEFAULT 1,
  metadata JSONB, -- additional context (event IDs, release IDs, etc.)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(artist_a, artist_b, connection_type),
  CHECK (artist_a < artist_b) -- Ensure no duplicate pairs
);
CREATE INDEX idx_connections_artist_a ON artist_connections(artist_a);
CREATE INDEX idx_connections_artist_b ON artist_connections(artist_b);
CREATE INDEX idx_connections_type ON artist_connections(connection_type);
```

### Label Intelligence Tables

```sql
-- 7. Labels database
CREATE TABLE labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  -- Classification
  tier TEXT, -- legendary, established, rising, emerging
  independence_status TEXT, -- independent, subsidiary, major
  genre_tags TEXT[],
  scene_tags TEXT[], -- berlin, detroit, uk, etc.
  -- Metrics
  prestige_score INT CHECK (prestige_score BETWEEN 0 AND 100),
  artist_roster_count INT DEFAULT 0,
  active_since INT, -- year
  vinyl_percentage DECIMAL,
  -- Connections
  parent_label_id UUID REFERENCES labels(id),
  distribution_partner TEXT,
  -- External links
  discogs_id TEXT,
  beatport_id TEXT,
  bandcamp_url TEXT,
  -- Metadata
  headquarters_city TEXT,
  headquarters_country TEXT,
  notable_alumni TEXT[], -- artists who started here
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Label releases
CREATE TABLE label_releases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label_id UUID NOT NULL REFERENCES labels(id) ON DELETE CASCADE,
  artist_id UUID REFERENCES artists(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  release_type TEXT, -- EP, LP, single, VA
  release_date DATE,
  format TEXT[], -- vinyl, digital, CD
  catalog_number TEXT,
  beatport_chart_peak INT,
  discogs_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Artist-label affiliations
CREATE TABLE artist_label_affiliations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  label_id UUID NOT NULL REFERENCES labels(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL, -- signed, released_on, founded, resident
  active BOOLEAN DEFAULT TRUE,
  first_release DATE,
  release_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(artist_id, label_id, relationship_type)
);
```

### Geographic Scene Tables

```sql
-- 10. Scenes database
CREATE TABLE scenes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, -- "Berlin Techno", "Detroit House", etc.
  slug TEXT UNIQUE,
  city TEXT,
  country TEXT,
  region TEXT, -- europe, north_america, asia, etc.
  genre_tags TEXT[],
  -- Metrics
  health_score INT CHECK (health_score BETWEEN 0 AND 100),
  artist_count INT DEFAULT 0,
  venue_count INT DEFAULT 0,
  event_frequency DECIMAL, -- events per week
  growth_rate DECIMAL, -- % change YoY
  -- Status
  emergence_status TEXT, -- emerging, active, established, declining
  -- Metadata
  description TEXT,
  notable_venues TEXT[],
  notable_labels TEXT[],
  computed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Artist-scene affiliations
CREATE TABLE artist_scenes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  scene_id UUID NOT NULL REFERENCES scenes(id) ON DELETE CASCADE,
  affiliation_strength DECIMAL CHECK (affiliation_strength BETWEEN 0 AND 1),
  is_home_scene BOOLEAN DEFAULT FALSE,
  events_in_scene INT DEFAULT 0,
  first_appearance DATE,
  last_appearance DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(artist_id, scene_id)
);
```

### Mix/Podcast Tables

```sql
-- 12. Mix platforms
CREATE TABLE mix_platforms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, -- "RA Podcast", "Boiler Room", "Essential Mix"
  slug TEXT UNIQUE,
  prestige_score INT CHECK (prestige_score BETWEEN 0 AND 100),
  platform_type TEXT, -- podcast, live_stream, radio, youtube_series
  url TEXT,
  active BOOLEAN DEFAULT TRUE
);

-- 13. Artist mix appearances
CREATE TABLE artist_mix_appearances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  platform_id UUID NOT NULL REFERENCES mix_platforms(id) ON DELETE CASCADE,
  appearance_date DATE,
  set_length_minutes INT,
  url TEXT,
  view_count BIGINT,
  is_b2b BOOLEAN DEFAULT FALSE,
  b2b_partner UUID REFERENCES artists(id),
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Trajectory Tables

```sql
-- 14. Artist trajectory snapshots
CREATE TABLE artist_trajectory_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL,
  career_stage TEXT, -- emerging, breaking, established, peak, legacy
  momentum_score INT,
  trajectory_direction TEXT, -- rising, stable, declining, breakout
  predicted_next_stage TEXT,
  prediction_confidence DECIMAL,
  factors JSONB, -- what's driving the prediction
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(artist_id, snapshot_date)
);
CREATE INDEX idx_trajectory_artist ON artist_trajectory_snapshots(artist_id, snapshot_date DESC);
```

---

## Implementation Roadmap

### Phase 1: Enhanced Database Schema (1 week)
**Goal:** Set up all database infrastructure

- [ ] Create all database migrations
- [ ] Set up indexes for graph queries
- [ ] Create materialized views for computed scores
- [ ] Set up RLS policies

**Deliverable:** Production-ready database schema

### Phase 2: Scene Graph Engine (2 weeks)
**Goal:** Build artist relationship graph

- [ ] Build graph construction from existing Drift data (events → artist connections)
- [ ] Implement centrality algorithms (PageRank variant)
- [ ] Create cluster detection for scene families
- [ ] Build "degrees of separation" queries
- [ ] Create connection visualization UI

**Deliverable:** Working scene graph with centrality scores

### Phase 3: Label Intelligence (2 weeks)
**Goal:** Comprehensive label database

- [ ] Seed label database (Discogs API + manual curation)
- [ ] Implement label prestige scoring algorithm
- [ ] Connect artists to labels via releases
- [ ] Build label dashboard and search
- [ ] Create label comparison features

**Deliverable:** Label intelligence system

### Phase 4: Event Intelligence (2 weeks)
**Goal:** Leverage Drift's unique event data

- [ ] Implement booking pattern analysis from existing events
- [ ] Build venue prestige scoring
- [ ] Create time slot analysis
- [ ] Implement residency detection
- [ ] Build event-based artist progression charts

**Deliverable:** Event intelligence insights

### Phase 5: Underground Authenticity Index (1 week)
**Goal:** Unique credibility scoring

- [ ] Implement UAI calculation with all 7 factors
- [ ] Build profile classification system (Purist → Mainstream)
- [ ] Create Underground Profile UI component
- [ ] Add UAI to artist profiles

**Deliverable:** UAI scores for all artists

### Phase 6: Trajectory Engine (2 weeks)
**Goal:** Predictive career analytics

- [ ] Implement career stage detection algorithm
- [ ] Build momentum scoring system
- [ ] Create breakout prediction model (start with heuristics)
- [ ] Build trajectory visualization
- [ ] Add prediction confidence metrics

**Deliverable:** Career trajectory predictions

### Phase 7: Unified Drift Score 2.0 & Dashboard (2 weeks)
**Goal:** Bring it all together

- [ ] Implement unified Drift Score 2.0 calculation
- [ ] Build comprehensive manager dashboard
- [ ] Create artist deep-dive analytics pages
- [ ] Implement comparison tools
- [ ] Design public-facing artist profiles with scores

**Deliverable:** Complete intelligence platform

### Phase 8: External Platform Integration (3 weeks)
**Goal:** Real data from streaming platforms

- [ ] Spotify integration (followers, monthly listeners)
- [ ] YouTube integration (subscribers, views)
- [ ] SoundCloud integration (apply for API)
- [ ] Beatport integration (partnership)
- [ ] Discogs integration (releases, credits)
- [ ] Build platform linking UI

**Deliverable:** Cross-platform data aggregation

### Phase 9: Monetization & API (2 weeks)
**Goal:** Revenue generation

- [ ] Implement Stripe subscription tiers
- [ ] Build tier access controls
- [ ] Create public API (`/api/v1/`)
- [ ] Implement API key management
- [ ] Build usage tracking and rate limiting

**Deliverable:** Paying customers

---

## Competitive Advantages

| Feature | Drift | Viberate | Chartmetric | RA |
|---------|-------|----------|-------------|-----|
| Scene Graph Analysis | ✅ | ❌ | ❌ | ❌ |
| Underground Authenticity Index | ✅ | ❌ | ❌ | ❌ |
| Label Prestige System | ✅ | Partial | ❌ | ❌ |
| Event Intelligence | ✅ (own data) | ✅ | ❌ | ✅ |
| Geographic Scene Mapping | ✅ | Partial | ❌ | Partial |
| Mix/Podcast Tracking | ✅ | Partial | ❌ | ✅ |
| Breakout Prediction | ✅ | ❌ | ✅ | ❌ |
| Dynamic Career Stage Weighting | ✅ | ❌ | ❌ | ❌ |
| Underground focus | ✅ | Partial | ❌ | ✅ |
| Venue database | ✅ | ✅ | ❌ | ✅ |
| Community features | ✅ | ❌ | ❌ | ✅ |
| Affordable pricing | ✅ | ✅ | ❌ | Free |

**Unique selling point:** "The only platform that maps the actual social fabric of underground electronic music - who plays with whom, where they came from, which labels matter, and what trajectory they're on."

---

## Success Metrics

| Metric | Target (Y1) | Target (Y2) |
|--------|-------------|-------------|
| Artists with linked platforms | 1,000 | 10,000 |
| Labels in database | 500 | 5,000 |
| Scenes tracked | 50 | 200 |
| Paid subscriptions | 250 | 1,500 |
| Monthly recurring revenue | $7,500 | $45,000 |
| Data freshness | < 24 hours | < 12 hours |
| Platform coverage | Spotify + YT | All major |
| API customers | 5 | 25 |
| Scene Graph edges | 50,000 | 500,000 |
| Prediction accuracy | 60% | 75% |

---

## Sources

- [Viberate Pricing & Features](https://www.viberate.com/pricing/)
- [Chartmetric Platform](https://chartmetric.com/)
- [Soundcharts Music Analytics](https://soundcharts.com/)
- [Resident Advisor Pro](https://pro.ra.co/)
- [Music Market Size - Technavio](https://www.technavio.com/report/music-market-industry-analysis)
- [Digital Music Market - Mordor Intelligence](https://www.mordorintelligence.com/industry-reports/digital-music-market)
- [Spotify Web API](https://developer.spotify.com/documentation/web-api)
- [YouTube Data API](https://developers.google.com/youtube/v3)
- [Discogs API](https://www.discogs.com/developers)
- [Top Music Analytics Tools 2025 - Viberate](https://www.viberate.com/blog/music-analytics/top-5-music-analytics-tools-2025/)
