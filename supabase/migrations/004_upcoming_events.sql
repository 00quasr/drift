-- Add upcoming events for 2025
-- This ensures the homepage has data to display

INSERT INTO events (id, venue_id, title, slug, description, start_date, end_date, genres, ticket_url, ticket_price_min, ticket_price_max, currency, images, flyer_url, is_active) VALUES

-- February 2025 events
('880e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Klubnacht: New Year Energy', 'klubnacht-new-year-2025-02-01', 'Start February with powerful techno vibes at Berghain''s legendary Klubnacht.', '2025-02-01 23:00:00+00', '2025-02-02 12:00:00+00', '{"Techno", "Minimal", "Deep House"}', 'https://ra.co/events/2025001', 25.00, 35.00, 'EUR', '["https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"]', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', true),

('880e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'Tresor: Underground Sessions', 'tresor-underground-2025-02-08', 'Deep underground techno experience in the basement of legends.', '2025-02-08 22:00:00+00', '2025-02-09 08:00:00+00', '{"Techno", "Industrial", "Acid"}', 'https://tresorberlin.com/events/underground-2025', 20.00, 30.00, 'EUR', '["https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"]', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', true),

('880e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 'Watergate: House by the River', 'watergate-house-2025-02-15', 'Melodic house and techno with stunning river views.', '2025-02-15 20:00:00+00', '2025-02-16 06:00:00+00', '{"House", "Melodic Techno", "Progressive"}', 'https://water-gate.de/events/house-2025', 30.00, 40.00, 'EUR', '["https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"]', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', true),

('880e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004', 'Fabric: UK Bass Culture', 'fabric-bass-culture-2025-02-22', 'Celebrating the best of UK bass music and techno.', '2025-02-22 21:00:00+00', '2025-02-23 07:00:00+00', '{"Techno", "Drum & Bass", "UK Bass"}', 'https://fabriclondon.com/events/bass-culture-2025', 25.00, 35.00, 'GBP', '["https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"]', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', true),

('880e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440005', 'De School: 24H Marathon', 'de-school-marathon-2025-03-01', 'A 24-hour non-stop techno marathon in Amsterdam''s beloved venue.', '2025-03-01 18:00:00+00', '2025-03-02 18:00:00+00', '{"Techno", "House", "Minimal"}', 'https://deschoolamsterdam.nl/events/marathon-2025', 35.00, 50.00, 'EUR', '["https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"]', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', true),

-- March 2025 events  
('880e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440001', 'Berghain: Spring Awakening', 'berghain-spring-2025-03-15', 'Welcome spring with explosive techno energy at Berlin''s temple of sound.', '2025-03-15 23:00:00+00', '2025-03-16 14:00:00+00', '{"Techno", "Hard Techno"}', 'https://ra.co/events/2025015', 30.00, 40.00, 'EUR', '["https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"]', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', true);

-- Add artist lineups for upcoming events
INSERT INTO event_artists (event_id, artist_id, performance_order, performance_type, set_time) VALUES

-- February 1st Berghain
('880e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 1, 'headliner', '2025-02-02 02:00:00+00'),
('880e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440002', 2, 'headliner', '2025-02-02 05:00:00+00'),

-- February 8th Tresor
('880e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002', 1, 'headliner', '2025-02-09 02:00:00+00'),

-- February 15th Watergate
('880e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440003', 1, 'headliner', '2025-02-16 01:00:00+00'),

-- February 22nd Fabric
('880e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440004', 1, 'headliner', '2025-02-23 01:00:00+00'),

-- March 1st De School
('880e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440005', 1, 'headliner', '2025-03-02 01:00:00+00'),
('880e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440003', 2, 'support', '2025-03-01 20:00:00+00'),

-- March 15th Berghain
('880e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440002', 1, 'headliner', '2025-03-16 03:00:00+00'),
('880e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440001', 2, 'headliner', '2025-03-16 06:00:00+00'); 