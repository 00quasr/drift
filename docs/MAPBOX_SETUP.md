# Mapbox Setup for Drift

This document explains how to set up Mapbox integration for displaying venue locations on maps.

## Prerequisites

1. A Mapbox account (free tier available)
2. A Mapbox access token

## Setup Instructions

### 1. Create a Mapbox Account

1. Go to [mapbox.com](https://www.mapbox.com/)
2. Sign up for a free account
3. Complete the account verification process

### 2. Get Your Access Token

1. Log in to your Mapbox account
2. Go to your [Account Dashboard](https://account.mapbox.com/)
3. Navigate to the "Access tokens" section
4. Copy your "Default public token" or create a new one

### 3. Configure Environment Variables

1. Copy the token from Mapbox
2. Add it to your `.env.local` file:

```bash
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoieW91ci11c2VybmFtZSIsImEiOiJjbGxx...
```

**Important:** Make sure your token starts with `pk.` (public token) for frontend use.

### 4. Verify Setup

1. Restart your development server: `npm run dev`
2. Navigate to any venue page that has latitude/longitude coordinates
3. You should see an interactive map in the "LOCATION" section

## Features

The Mapbox integration provides:

- **Interactive Maps**: Users can zoom, pan, and interact with venue locations
- **Custom Markers**: Purple markers that match Drift's brand colors
- **Dark Theme**: Maps use Mapbox's dark style to match Drift's design
- **Venue Popups**: Click markers to see venue name and address
- **Fallback Handling**: Graceful degradation when coordinates are missing
- **Error Handling**: Clear error messages when maps fail to load

## Map Styles

The integration uses `mapbox://styles/mapbox/dark-v11` to match Drift's dark theme. The marker color is set to `#9B5DE5` (Drift's primary purple).

## Troubleshooting

### Map not loading?
- Check that your access token is correct and starts with `pk.`
- Verify the token is set in `.env.local`
- Check browser console for error messages
- Ensure you haven't exceeded Mapbox's free tier limits

### Coordinates missing?
- Venues without latitude/longitude will show a "LOCATION NOT AVAILABLE" placeholder
- Use the Supabase dashboard to add coordinates to venues
- Coordinates should be stored as decimal degrees (e.g., 51.5074, -0.1278)

### Styling issues?
- Custom popup styles are defined in `app/globals.css`
- The map container has cyberpunk-style borders matching Drift's design
- Markers use Drift's brand colors automatically

## Mapbox Pricing

- **Free Tier**: 50,000 map loads per month
- **Pay-as-you-go**: $0.50 per 1,000 additional loads
- For production apps with high traffic, consider upgrading to a paid plan

## Database Schema

Venues store location data in these fields:
- `latitude` (NUMERIC): Latitude coordinate
- `longitude` (NUMERIC): Longitude coordinate
- `address` (TEXT): Street address for display
- `city` (TEXT): City name
- `country` (TEXT): Country name

Example coordinates:
- **Fabric, London**: 51.52120000, -0.10270000
- **Berghain, Berlin**: 52.51080000, 13.44290000 