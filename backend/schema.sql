-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create rooms table
CREATE TABLE rooms (
    id VARCHAR(6) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    host_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    max_players INTEGER DEFAULT 6,
    drawing_time INTEGER DEFAULT 60,
    voting_time INTEGER DEFAULT 15,
    rounds INTEGER DEFAULT 3,
    is_private BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'waiting',
    current_round INTEGER DEFAULT 0,
    current_phase VARCHAR(20) DEFAULT NULL,
    current_prompt_id INTEGER DEFAULT NULL,
    current_drawing_index INTEGER DEFAULT 0,
    phase_end_time TIMESTAMP DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create room_players table (many-to-many relationship)
CREATE TABLE room_players (
    room_id VARCHAR(6) REFERENCES rooms(id),
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (room_id, user_id)
);

-- Create prompts table
CREATE TABLE prompts (
    id SERIAL PRIMARY KEY,
    text VARCHAR(255) NOT NULL,
    category VARCHAR(50) DEFAULT 'general',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create drawings table
CREATE TABLE drawings (
    id SERIAL PRIMARY KEY,
    room_id VARCHAR(6) REFERENCES rooms(id) ON DELETE CASCADE,
    round_number INTEGER NOT NULL,
    prompt_id INTEGER REFERENCES prompts(id),
    artist_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create stars table
CREATE TABLE stars (
    id SERIAL PRIMARY KEY,
    drawing_id INTEGER REFERENCES drawings(id) ON DELETE CASCADE,
    voter_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (drawing_id, voter_id)
);

-- Insert some sample prompts
INSERT INTO prompts (text, category) VALUES
-- 🐾 animals
('Elephant', 'animals'),
('Fox', 'animals'),
('Penguin', 'animals'),
('Tiger', 'animals'),
('Giraffe', 'animals'),
('Whale', 'animals'),
('Sloth', 'animals'),
('Kangaroo', 'animals'),
('Octopus', 'animals'),
('Zebra', 'animals'),

-- 🦜 birds
('Owl', 'birds'),
('Parrot', 'birds'),
('Peacock', 'birds'),
('Eagle', 'birds'),
('Flamingo', 'birds'),
('Crow', 'birds'),
('Toucan', 'birds'),
('Hawk', 'birds'),
('Hummingbird', 'birds'),
('Pigeon', 'birds'),

-- 🐟 fishes
('Clownfish', 'fishes'),
('Goldfish', 'fishes'),
('Shark', 'fishes'),
('Anglerfish', 'fishes'),
('Bluefin Tuna', 'fishes'),
('Betta Fish', 'fishes'),
('Eel', 'fishes'),
('Salmon', 'fishes'),
('Swordfish', 'fishes'),
('Jellyfish', 'fishes'),

-- 🌿 nature
('Tree', 'nature'),
('Flower', 'nature'),
('Leaf', 'nature'),
('Mushroom', 'nature'),
('Fern', 'nature'),
('Vine', 'nature'),
('Cactus', 'nature'),
('Moss', 'nature'),
('Pinecone', 'nature'),
('Acorn', 'nature'),

-- 🧑‍🎨 characters
('Pirate', 'characters'),
('Ninja', 'characters'),
('Elf/Elven', 'characters'),
('Princess', 'characters'),
('Knight', 'characters'),
('Robot', 'characters'),
('King', 'characters'),
('Troll', 'characters'),
('Ifan', 'characters'),
('Witch', 'characters'),

-- 🏞️ places
('Island', 'places'),
('Desert', 'places'),
('Jungle', 'places'),
('Village', 'places'),
('Mountain', 'places'),
('Lake', 'places'),
('Forest', 'places'),
('Valley', 'places'),
('Swamp', 'places'),
('Ruins', 'places'),

-- 🍕 food
('Pizza', 'food'),
('Sushi', 'food'),
('Burger', 'food'),
('Cupcake', 'food'),
('Ice Cream', 'food'),
('Hotdog', 'food'),
('Sandwich', 'food'),
('Pretzel', 'food'),
('Popcorn', 'food'),
('Burrito', 'food'),

-- 💻 technology
('Computer', 'technology'),
('Drone', 'technology'),
('Camera', 'technology'),
('Phone', 'technology'),
('Keyboard', 'technology'),
('Satellite', 'technology'),
('Printer', 'technology'),
('Calculator', 'technology'),
('Tablet', 'technology'),
('Speaker', 'technology'),

-- 🎮 gaming
('Controller', 'gaming'),
('Joystick', 'gaming'),
('Arcade', 'gaming'),
('Coin', 'gaming'),
('Sword', 'gaming'),
('Shield', 'gaming'),
('Dice', 'gaming'),
('Potion', 'gaming'),
('Helmet', 'gaming'),
('Spaceship', 'gaming'),

-- 🏃 activities
('Swimming', 'activities'),
('Cycling', 'activities'),
('Climbing', 'activities'),
('Painting', 'activities'),
('Cooking', 'activities'),
('Dancing', 'activities'),
('Coding', 'activities'),
('Fishing', 'activities'),
('Hiking', 'activities'),
('Writing', 'activities'),

-- 🚗 vehicles
('Car', 'vehicles'),
('Train', 'vehicles'),
('Bus', 'vehicles'),
('Airplane', 'vehicles'),
('Boat', 'vehicles'),
('Motorcycle', 'vehicles'),
('Truck', 'vehicles'),
('Helicopter', 'vehicles'),
('Scooter', 'vehicles'),
('Spaceship', 'vehicles'),

-- 🌱 plants
('Rose', 'plants'),
('Bamboo', 'plants'),
('Sunflower', 'plants'),
('Tulip', 'plants'),
('Dandelion', 'plants'),
('Palm Tree', 'plants'),
('Fern', 'plants'),
('Orchid', 'plants'),
('Lily', 'plants'),
('Succulent', 'plants'),

-- 🪵 objects
('Chair', 'objects'),
('Lamp', 'objects'),
('Clock', 'objects'),
('Mirror', 'objects'),
('Vase', 'objects'),
('Door', 'objects'),
('Statue', 'objects'),
('Candle', 'objects'),
('Teapot', 'objects'),
('Table', 'objects'),

-- ⚽ sports
('Ball', 'sports'),
('Net', 'sports'),
('Skateboard', 'sports'),
('Goal', 'sports'),
('Yellow Card', 'sports'),
('Baseball Bat', 'sports'),
('Glove', 'sports'),
('Hoops', 'sports'),
('Racket', 'sports'),
('Skis', 'sports'),

-- 🎵 music
('Guitar', 'music'),
('Piano', 'music'),
('Drum', 'music'),
('Violin', 'music'),
('Flute', 'music'),
('Trumpet', 'music'),
('Saxophone', 'music'),
('Microphone', 'music'),
('DJ Turntable', 'music'),
('Gamelan', 'music'),

-- 🎤 Celebrities
('Singer', 'celebrities'),
('Actor', 'celebrities'),
('Athlete', 'celebrities'),
('Model', 'celebrities'),
('Comedian', 'celebrities'),
('Influencer', 'celebrities'),
('Director', 'celebrities'),
('Producer', 'celebrities'),
('Author', 'celebrities'),
('Artist', 'celebrities'),

-- 🎨 Professions
('Doctor', 'professions'),
('Engineer', 'professions'),
('Teacher', 'professions'),
('Scientist', 'professions'),
('Artist', 'professions'),
('Chef', 'professions'),
('Nurse', 'professions'),
('Firefighter', 'professions'),
('Police Officer', 'professions'),
('Pilot', 'professions'),

-- 🏰 Fantasy
('Dragon', 'fantasy'),
('Unicorn', 'fantasy'),
('Fairy', 'fantasy'),
('Mermaid', 'fantasy'),
('Goblin', 'fantasy'),
('Phoenix', 'fantasy'),
('Griffin', 'fantasy'),
('Centaur', 'fantasy'),
('Giant', 'fantasy'),
('Werewolf', 'fantasy'),

-- 🏛️ Landmarks
('Pyramid', 'landmarks'),
('Colosseum', 'landmarks'),
('Monas', 'landmarks'),
('Machu Picchu', 'landmarks'),
('Great Wall', 'landmarks'),
('Stonehenge', 'landmarks'),
('Acropolis', 'landmarks'),
('Taj Mahal', 'landmarks'),
('Eiffel Tower', 'landmarks'),
('Statue of Liberty', 'landmarks'),

-- 🎡 Fair
('Ferris Wheel', 'fair'),
('Roller Coaster', 'fair'),
('Cotton Candy', 'fair'),
('Carousel', 'fair'),
('Funhouse', 'fair'),
('Bumper Cars', 'fair'),
('Game Booth', 'fair'),
('Popcorn Stand', 'fair'),
('Water Slide', 'fair'),
('Haunted House', 'fair'),

-- 🎈 Party
('Balloon', 'party'),
('Cake', 'party'),
('Confetti', 'party'),
('Party Hat', 'party'),
('Streamers', 'party'),
('Gift Box', 'party'),
('Party Popper', 'party'),
('Balloons', 'party'),
('Party Favor', 'party'),
('Piñata', 'party'),

-- 🎁 Gifts
('Present', 'gifts'),
('Gift Bag', 'gifts'),
('Ribbon', 'gifts'),
('Wrapping Paper', 'gifts'),
('Gift Card', 'gifts'),
('Bow', 'gifts'),
('Gift Box', 'gifts'),
('Greeting Card', 'gifts'),
('Teddy Bear', 'gifts'),
('Chocolate Box', 'gifts'),

-- 🎒 school
('Backpack', 'school'),
('Notebook', 'school'),
('Pencil', 'school'),
('Eraser', 'school'),
('Ruler', 'school'),
('Calculator', 'school'),
('Glue Stick', 'school'),
('Highlighter', 'school'),
('Stapler', 'school'),
('Whiteboard', 'school'),

-- 👕 clothing
('Hat', 'clothing'),
('Boots', 'clothing'),
('Scarf', 'clothing'),
('Gloves', 'clothing'),
('Belt', 'clothing'),
('Hoodie', 'clothing'),
('Jacket', 'clothing'),
('Sneakers', 'clothing'),
('Tie', 'clothing'),
('Cape', 'clothing'),

-- ☁️ weather
('Cloud', 'weather'),
('Rain', 'weather'),
('Lightning', 'weather'),
('Snowflake', 'weather'),
('Sun', 'weather'),
('Rainbow', 'weather'),
('Wind', 'weather'),
('Tornado', 'weather'),
('Storm', 'weather'),
('Frost', 'weather'),

-- 🌌 space
('Planet', 'space'),
('Star', 'space'),
('Asteroid', 'space'),
('Comet', 'space'),
('Moon', 'space'),
('Galaxy', 'space'),
('Nebula', 'space'),
('Pillars of Creation', 'space'),
('Meteor', 'space'),
('Satellite', 'space'),

-- 🌄 landscapes
('Volcano', 'landscapes'),
('Canyon', 'landscapes'),
('Glacier', 'landscapes'),
('Tundra', 'landscapes'),
('Wetland', 'landscapes'),
('Prairie', 'landscapes'),
('Coral Reef', 'landscapes'),
('Savannah', 'landscapes'),
('Badlands', 'landscapes'),
('Delta', 'landscapes'),

-- 🛏️ rooms
('Kitchen', 'rooms'),
('Bathroom', 'rooms'),
('Bedroom', 'rooms'),
('Office', 'rooms'),
('Living Room', 'rooms'),
('Library', 'rooms'),
('Garden', 'rooms'),
('Balcony', 'rooms'),
('Hallway', 'rooms'),
('Attic', 'rooms'),

-- 🎬 movies
('Titanic', 'movies'),
('Jaws', 'movies'),
('Avengers', 'movies'),
('Joker', 'movies'),
('Avatar', 'movies'),
('Star Wars', 'movies'),
('Jurassic World', 'movies'),
('Harry Potter', 'movies'),
('Lord of the Rings', 'movies'),
('Pocong', 'movies'),

-- 🎨 art
('Palette', 'art'),
('Paintbrush', 'art'),
('Sculpture', 'art'),
('Easel', 'art'),
('Canvas', 'art'),
('Chisel', 'art'),
('Sketchbook', 'art'),
('Crayon', 'art'),
('Marker', 'art'),
('Clay', 'art'),

-- 🎨 crafts
('Origami', 'crafts'),
('Glue', 'crafts'),
('Scissors', 'crafts'),
('Styrofoam', 'crafts'),
('Beads', 'crafts'),
('String', 'crafts'),
('Recyclables', 'crafts'),
('Stickers', 'crafts'),
('Markers', 'crafts'),
('Tape', 'crafts'),

-- 🌈 colors
('Raging Red', 'colors'),
('Brooding Blue', 'colors'),
('Grateful Green', 'colors'),
('Powerful Purple', 'colors'),
('Overzealous Orange', 'colors'),
('Youthful Yellow', 'colors'),
('Playful Pink', 'colors'),
('Cool Cyan', 'colors'),
('Magnificent Magenta', 'colors'),
('Bubbly Brown', 'colors'),

-- 🦖 dinosaurs
('Tyrannosaurus', 'dinosaurs'),
('Triceratops', 'dinosaurs'),
('Stegosaurus', 'dinosaurs'),
('Velociraptor', 'dinosaurs'),
('Brachiosaurus', 'dinosaurs'),
('Ankylosaurus', 'dinosaurs'),
('Spinosaurus', 'dinosaurs'),
('Pterodactyl', 'dinosaurs'),
('Argentinosaurus', 'dinosaurs'),
('Mosasaurus', 'dinosaurs'),

-- 🎉 events
('Party', 'occasions'),
('Parade', 'occasions'),
('Concert', 'occasions'),
('Festival', 'occasions'),
('Fair', 'occasions'),
('Ceremony', 'occasions'),
('Rally', 'occasions'),
('Tournament', 'occasions'),
('Marathon', 'occasions'),
('Exhibition', 'occasions'),

-- 🎂 holidays
('Christmas', 'occasions'),
('Halloween', 'occasions'),
('New Year', 'occasions'),
('Valentine', 'occasions'),
('Easter', 'occasions'),
('Diwali', 'occasions'),
('Hanukkah', 'occasions'),
('Eid', 'occasions'),
('Thanksgiving', 'occasions'),
('Independence', 'occasions');