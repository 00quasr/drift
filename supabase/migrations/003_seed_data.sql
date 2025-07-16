-- Seed data for Drift Platform
-- NOTE: This data is for development/testing only

-- Insert sample venues
INSERT INTO venues (id, name, slug, description, address, city, country, latitude, longitude, capacity, website, social_links, images, genres, amenities, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Berghain', 'berghain', 'The world''s most famous techno club, known for its uncompromising music policy and legendary sound system.', 'Am Wriezener Bahnhof, 10243 Berlin', 'Berlin', 'Germany', 52.510800, 13.442900, 1500, 'https://berghain.berlin', '{"instagram": "@berghain", "facebook": "berghain.berlin"}', '["https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"]', '{"Techno", "House", "Electronic"}', '{"Sound System", "Multiple Floors", "Garden"}', true),

('550e8400-e29b-41d4-a716-446655440002', 'Tresor', 'tresor', 'Legendary techno club in the basement of a former department store, an institution of Berlin''s electronic music scene.', 'Köpenicker Str. 70, 10179 Berlin', 'Berlin', 'Germany', 52.502700, 13.419200, 800, 'https://tresorberlin.com', '{"instagram": "@tresorberlin", "soundcloud": "tresor"}', '["https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"]', '{"Techno", "Minimal", "Industrial"}', '{"Historic Venue", "Multiple Rooms", "Record Shop"}', true),

('550e8400-e29b-41d4-a716-446655440003', 'Watergate', 'watergate', 'Stunning club on the banks of the Spree river with floor-to-ceiling windows overlooking the water.', 'Falckensteinstr. 49, 10997 Berlin', 'Berlin', 'Germany', 52.499400, 13.445600, 600, 'https://water-gate.de', '{"instagram": "@watergate_berlin", "facebook": "WatergateClub"}', '["https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"]', '{"House", "Techno", "Progressive"}', '{"River View", "Terrace", "Premium Sound"}', true),

('550e8400-e29b-41d4-a716-446655440004', 'Fabric', 'fabric', 'London''s most famous superclub, known for its incredible sound system and diverse programming.', '77a Charterhouse St, London EC1M 3HN', 'London', 'United Kingdom', 51.521200, -0.102700, 1500, 'https://fabriclondon.com', '{"instagram": "@fabriclondon", "twitter": "@FabricLondon"}', '["https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"]', '{"Techno", "House", "Drum & Bass"}', '{"Body Sonic Sound", "Multiple Rooms", "Late License"}', true),

('550e8400-e29b-41d4-a716-446655440005', 'De School', 'de-school', 'Amsterdam''s beloved underground venue in a former school building, known for its intimate atmosphere.', 'Dr. Jan van Breemenstraat 1, 1056 AB Amsterdam', 'Amsterdam', 'Netherlands', 52.353600, 4.859400, 700, 'https://deschoolamsterdam.nl', '{"instagram": "@de_school", "facebook": "DeSchoolAmsterdam"}', '["https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"]', '{"Techno", "House", "Minimal"}', '{"Garden", "Kitchen", "24h License"}', true);

-- Insert sample artists
INSERT INTO artists (id, name, slug, bio, country, city, genres, social_links, images, is_active) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'Marcel Dettmann', 'marcel-dettmann', 'Marcel Dettmann is a German DJ and producer known for his driving techno sets and deep understanding of the Berlin sound. As a resident at Berghain since 2005, he has become one of the most respected names in contemporary techno.', 'Germany', 'Berlin', '{"Techno", "Deep Techno", "Minimal"}', '{"instagram": "@marceldettmann", "soundcloud": "marceldettmann", "website": "https://marceldettmann.com"}', '["https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"]', true),

('660e8400-e29b-41d4-a716-446655440002', 'Ben Klock', 'ben-klock', 'Ben Klock is a German techno DJ and producer. He is a resident DJ at Berghain and runs the label Klockworks. Known for his powerful, driving sets that epitomize the Berlin techno sound.', 'Germany', 'Berlin', '{"Techno", "Hard Techno"}', '{"instagram": "@benklock", "soundcloud": "benklock"}', '["https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"]', true),

('660e8400-e29b-41d4-a716-446655440003', 'Nina Kraviz', 'nina-kraviz', 'Nina Kraviz is a Russian DJ, music producer and singer. She runs the label трип (Trip) and is known for her eclectic sets that blend techno, acid, and experimental sounds.', 'Russia', 'Moscow', '{"Techno", "Acid", "Experimental"}', '{"instagram": "@ninakraviz", "soundcloud": "nina-kraviz"}', '["https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"]', true),

('660e8400-e29b-41d4-a716-446655440004', 'Charlotte de Witte', 'charlotte-de-witte', 'Charlotte de Witte is a Belgian DJ and record producer who specializes in acid techno and minimal techno music. She is the founder of the label KNTXT.', 'Belgium', 'Brussels', '{"Acid Techno", "Minimal Techno"}', '{"instagram": "@charlottedewitte", "soundcloud": "charlotte-de-witte"}', '["https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"]', true),

('660e8400-e29b-41d4-a716-446655440005', 'Amelie Lens', 'amelie-lens', 'Amelie Lens is a Belgian electronic music DJ, record producer, and owner of the label Lenske. Known for her powerful techno sets and rapid rise in the electronic music scene.', 'Belgium', 'Antwerp', '{"Techno", "Industrial Techno"}', '{"instagram": "@amelielens", "soundcloud": "amelie-lens"}', '["https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"]', true);

-- Insert sample events
INSERT INTO events (id, venue_id, title, slug, description, start_date, end_date, genres, ticket_url, ticket_price_min, ticket_price_max, currency, images, flyer_url, is_active) VALUES
('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Klubnacht', 'klubnacht-2024-01-20', 'The legendary weekly Saturday night session at Berghain featuring the finest techno selectors.', '2024-01-20 23:00:00+00', '2024-01-21 12:00:00+00', '{"Techno", "Minimal", "Deep House"}', 'https://ra.co/events/1234567', 20.00, 30.00, 'EUR', '["https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"]', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', true),

('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Ostgut Ton Showcase', 'ostgut-ton-showcase-2024-01-27', 'A special showcase featuring artists from Berghain''s own label Ostgut Ton.', '2024-01-27 23:00:00+00', '2024-01-28 10:00:00+00', '{"Techno", "Deep House"}', 'https://ra.co/events/1234568', 25.00, 35.00, 'EUR', '["https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"]', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', true),

('770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'Tresor 30th Anniversary', 'tresor-30th-anniversary-2024-02-03', 'Celebrating 30 years of Tresor with a special lineup of techno legends.', '2024-02-03 22:00:00+00', '2024-02-04 08:00:00+00', '{"Techno", "Industrial", "Acid"}', 'https://tresorberlin.com/events/30th-anniversary', 30.00, 40.00, 'EUR', '["https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"]', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', true),

('770e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440003', 'Watergate Weekend', 'watergate-weekend-2024-02-10', 'A weekend-long celebration of house and techno by the river.', '2024-02-10 20:00:00+00', '2024-02-11 06:00:00+00', '{"House", "Techno", "Progressive"}', 'https://water-gate.de/events/weekend-2024', 35.00, 45.00, 'EUR', '["https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"]', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', true),

('770e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440004', 'Fabric presents KNTXT', 'fabric-kntxt-2024-02-17', 'Charlotte de Witte brings her KNTXT label showcase to London.', '2024-02-17 21:00:00+00', '2024-02-18 07:00:00+00', '{"Acid Techno", "Minimal Techno"}', 'https://fabriclondon.com/events/kntxt', 25.00, 35.00, 'GBP', '["https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"]', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', true);

-- Insert event-artist relationships (lineups)
INSERT INTO event_artists (event_id, artist_id, performance_order, performance_type, set_time) VALUES
('770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 1, 'headliner', '2024-01-21 02:00:00+00'),
('770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440002', 2, 'headliner', '2024-01-21 05:00:00+00'),

('770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', 1, 'headliner', '2024-01-28 01:00:00+00'),

('770e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440002', 1, 'headliner', '2024-02-04 03:00:00+00'),
('770e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440001', 2, 'support', '2024-02-04 01:00:00+00'),

('770e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440003', 1, 'headliner', '2024-02-11 02:00:00+00'),

('770e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440004', 1, 'headliner', '2024-02-18 01:00:00+00'),
('770e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440005', 2, 'support', '2024-02-17 23:00:00+00'); 