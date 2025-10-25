export interface Player {
  id: string;
  name: string;
  role: 'civilian' | 'imposter';
  score: number;
  hasVoted: boolean;
  vote?: string;
  isAdmin?: boolean;
  socketId?: string;
  hasConfirmed?: boolean;
}

export interface Game {
  id: string;
  players: Player[];
  state: GameState;
  currentObject?: string;
  round: number;
  timer: number;
  votes: Record<string, string>;
  currentPlayerIndex?: number;
  discussionOrder?: Player[];
}

export enum GameState {
  LOBBY = 'LOBBY',
  ASSIGN_ROLES = 'ASSIGN_ROLES',
  REVEAL_ROLE = 'REVEAL_ROLE',
  DISCUSSION = 'DISCUSSION',
  DISCUSSION_ROUND_1 = 'DISCUSSION_ROUND_1',
  DISCUSSION_ROUND_2 = 'DISCUSSION_ROUND_2',
  VOTING = 'VOTING',
  RESULT = 'RESULT',
  RESULTS = 'RESULTS',
  LEADERBOARD = 'LEADERBOARD'
}

export const WORD_BANK = [
  'Pizza', 'Burger', 'Sandwich', 'Bread', 'Rice', 'Pasta', 'Soup', 'Salad', 'Chicken', 'Fish',
  'Egg', 'Cheese', 'Milk', 'Butter', 'Sugar', 'Salt', 'Pepper', 'Oil', 'Honey', 'Jam',
  'Apple', 'Banana', 'Orange', 'Grapes', 'Tomato', 'Potato', 'Onion', 'Carrot', 'Lettuce', 'Cucumber',
  'Coffee', 'Tea', 'Water', 'Juice', 'Soda', 'Beer', 'Wine', 'Ice Cream', 'Cake', 'Cookie',
  'Chocolate', 'Candy', 'Chips', 'Popcorn', 'Cereal', 'Yogurt', 'Toast', 'Pancake', 'Donut', 'Muffin',
  'Phone', 'Computer', 'TV', 'Radio', 'Camera', 'Headphones', 'Charger', 'Remote', 'Speaker', 'Microwave',
  'Refrigerator', 'Toaster', 'Blender', 'Hair Dryer', 'Iron', 'Vacuum', 'Washing Machine', 'Dishwasher', 'Oven', 'Fan',
  'Light Bulb', 'Lamp', 'Clock', 'Alarm', 'Calculator', 'Flashlight', 'Battery', 'Cable', 'Plug', 'Switch',
  'Shirt', 'Pants', 'Dress', 'Skirt', 'Jacket', 'Coat', 'Sweater', 'Hoodie', 'Jeans', 'Shorts',
  'Socks', 'Shoes', 'Sneakers', 'Boots', 'Sandals', 'Hat', 'Cap', 'Scarf', 'Gloves', 'Belt',
  'Tie', 'Watch', 'Ring', 'Necklace', 'Earrings', 'Bracelet', 'Sunglasses', 'Glasses', 'Bag', 'Backpack',
  'Purse', 'Wallet', 'Umbrella', 'Pajamas', 'Underwear', 'Bra', 'T-Shirt', 'Tank Top', 'Cardigan', 'Vest',
  'Bed', 'Pillow', 'Blanket', 'Sheet', 'Mattress', 'Chair', 'Table', 'Sofa', 'Desk', 'Mirror',
  'Curtains', 'Window', 'Door', 'Key', 'Lock', 'Doormat', 'Rug', 'Carpet', 'Floor', 'Wall',
  'Ceiling', 'Roof', 'Stairs', 'Kitchen', 'Bathroom', 'Bedroom', 'Living Room', 'Garage', 'Garden', 'Yard',
  'Sink', 'Faucet', 'Toilet', 'Shower', 'Bathtub', 'Towel', 'Soap', 'Shampoo', 'Toothbrush', 'Toothpaste',
  'Plate', 'Bowl', 'Cup', 'Mug', 'Glass', 'Fork', 'Knife', 'Spoon', 'Napkin', 'Tablecloth',
  'Pot', 'Pan', 'Cutting Board', 'Can Opener', 'Bottle Opener', 'Spatula', 'Ladle', 'Whisk', 'Strainer', 'Grater',
  'Pen', 'Pencil', 'Paper', 'Notebook', 'Book', 'Ruler', 'Eraser', 'Stapler', 'Scissors', 'Tape',
  'Glue', 'Marker', 'Highlighter', 'Folder', 'Binder', 'Envelope', 'Stamp', 'Calendar', 'Clipboard', 'Briefcase',
  'Car', 'Bus', 'Train', 'Bicycle', 'Motorcycle', 'Airplane', 'Boat', 'Taxi', 'Truck', 'Van',
  'Tire', 'Wheel', 'Steering Wheel', 'Seat', 'Seatbelt', 'Mirror', 'Windshield', 'Headlight', 'Horn', 'Gas',
  'Brush', 'Comb', 'Razor', 'Shaving Cream', 'Deodorant', 'Perfume', 'Lotion', 'Sunscreen', 'Makeup', 'Lipstick',
  'Nail Polish', 'Tissue', 'Band Aid', 'Medicine', 'Vitamins', 'Thermometer', 'Scale', 'Cotton Swab', 'Floss', 'Mouthwash',
  'Hammer', 'Screwdriver', 'Wrench', 'Pliers', 'Drill', 'Saw', 'Nail', 'Screw', 'Bolt', 'Nut',
  'Ladder', 'Rope', 'Chain', 'Wire', 'Tape Measure', 'Level', 'Toolbox', 'Flashlight', 'Extension Cord', 'Outlet',
  'Ball', 'Bat', 'Racket', 'Net', 'Goal', 'Helmet', 'Glove', 'Uniform', 'Sneakers', 'Whistle',
  'Bicycle', 'Skateboard', 'Roller Skates', 'Swimming Pool', 'Beach Ball', 'Frisbee', 'Jump Rope', 'Hula Hoop', 'Kite', 'Yo-Yo',
  'Tree', 'Flower', 'Grass', 'Rock', 'Sand', 'Water', 'Sun', 'Moon', 'Star', 'Cloud',
  'Rain', 'Snow', 'Wind', 'Fire', 'Ice', 'Mountain', 'Hill', 'River', 'Lake', 'Ocean',
  'Beach', 'Forest', 'Park', 'Garden', 'Leaf', 'Branch', 'Root', 'Seed', 'Fruit', 'Vegetable',
  'Dog', 'Cat', 'Bird', 'Fish', 'Horse', 'Cow', 'Pig', 'Chicken', 'Duck', 'Rabbit',
  'Mouse', 'Rat', 'Hamster', 'Guinea Pig', 'Turtle', 'Frog', 'Snake', 'Lizard', 'Spider', 'Ant',
  'Bee', 'Butterfly', 'Fly', 'Mosquito', 'Worm', 'Snail', 'Crab', 'Lobster', 'Shrimp', 'Octopus',
  'Movie', 'Music', 'Song', 'Dance', 'Game', 'Toy', 'Puzzle', 'Cards', 'Dice', 'Chess',
  'Checkers', 'Monopoly', 'Scrabble', 'Video Game', 'Controller', 'Headset', 'Screen', 'Projector', 'Theater', 'Concert',
  'Spring', 'Summer', 'Fall', 'Winter', 'Hot', 'Cold', 'Warm', 'Cool', 'Sunny', 'Cloudy',
  'Rainy', 'Snowy', 'Windy', 'Stormy', 'Thunder', 'Lightning', 'Rainbow', 'Fog', 'Mist', 'Dew',
  'Red', 'Blue', 'Green', 'Yellow', 'Orange', 'Purple', 'Pink', 'Brown', 'Black', 'White',
  'Gray', 'Silver', 'Gold', 'Beige', 'Tan', 'Maroon', 'Navy', 'Teal', 'Lime', 'Magenta',
  'Circle', 'Square', 'Triangle', 'Rectangle', 'Oval', 'Diamond', 'Heart', 'Star', 'Arrow', 'Cross',
  'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Morning', 'Afternoon', 'Evening',
  'Night', 'Today', 'Tomorrow', 'Yesterday', 'Week', 'Month', 'Year', 'Hour', 'Minute', 'Second',
  'Head', 'Hair', 'Face', 'Eye', 'Nose', 'Mouth', 'Ear', 'Neck', 'Shoulder', 'Arm',
  'Hand', 'Finger', 'Thumb', 'Chest', 'Back', 'Stomach', 'Leg', 'Knee', 'Foot', 'Toe',
  'Walk', 'Run', 'Jump', 'Sit', 'Stand', 'Sleep', 'Eat', 'Drink', 'Read', 'Write',
  'Talk', 'Listen', 'Look', 'See', 'Hear', 'Touch', 'Smell', 'Taste', 'Think', 'Feel',
  'Home', 'School', 'Work', 'Store', 'Mall', 'Restaurant', 'Hospital', 'Bank', 'Post Office', 'Library',
  'Park', 'Beach', 'Mountain', 'City', 'Town', 'Village', 'Street', 'Road', 'Bridge', 'Building',
  'Money', 'Dollar', 'Coin', 'Bill', 'Credit Card', 'Cash', 'Receipt', 'Shopping Cart', 'Bag', 'Price',
  'Sale', 'Discount', 'Coupon', 'Store', 'Market', 'Grocery', 'Pharmacy', 'Gas Station', 'ATM', 'Bank',
  'Phone Call', 'Text Message', 'Email', 'Letter', 'Postcard', 'Package', 'Mail', 'Newspaper', 'Magazine', 'Internet',
  'Website', 'Social Media', 'Chat', 'Video Call', 'Meeting', 'Conversation', 'Language', 'Word', 'Sentence', 'Story',
  'Doctor', 'Nurse', 'Hospital', 'Clinic', 'Medicine', 'Pill', 'Injection', 'Bandage', 'Thermometer', 'Stethoscope',
  'X-Ray', 'Surgery', 'Treatment', 'Checkup', 'Appointment', 'Emergency', 'Ambulance', 'First Aid', 'Vaccine', 'Prescription',
  'Teacher', 'Student', 'Classroom', 'Homework', 'Test', 'Exam', 'Grade', 'Report Card', 'Diploma', 'Degree',
  'University', 'College', 'Kindergarten', 'Elementary', 'High School', 'Subject', 'Math', 'Science', 'History', 'English',
  'Job', 'Career', 'Boss', 'Employee', 'Coworker', 'Office', 'Meeting', 'Project', 'Deadline', 'Salary',
  'Interview', 'Resume', 'Application', 'Promotion', 'Retirement', 'Vacation', 'Holiday', 'Weekend', 'Overtime', 'Break',
  'Family', 'Parent', 'Mother', 'Father', 'Child', 'Son', 'Daughter', 'Brother', 'Sister', 'Grandparent',
  'Grandmother', 'Grandfather', 'Uncle', 'Aunt', 'Cousin', 'Friend', 'Neighbor', 'Stranger', 'Baby', 'Adult',
  'Happy', 'Sad', 'Angry', 'Excited', 'Nervous', 'Calm', 'Worried', 'Surprised', 'Confused', 'Tired',
  'Energetic', 'Bored', 'Interested', 'Proud', 'Embarrassed', 'Grateful', 'Sorry', 'Love', 'Hate', 'Like',
  'Go', 'Come', 'Take', 'Give', 'Make', 'Do', 'Say', 'Get', 'Know', 'Think',
  'See', 'Look', 'Use', 'Find', 'Want', 'Need', 'Try', 'Ask', 'Tell', 'Help',
  'Big', 'Small', 'Large', 'Tiny', 'Huge', 'Little', 'Long', 'Short', 'Tall', 'Wide',
  'Narrow', 'Thick', 'Thin', 'Heavy', 'Light', 'Full', 'Empty', 'Many', 'Few', 'All',
  'Wood', 'Metal', 'Plastic', 'Glass', 'Paper', 'Cloth', 'Leather', 'Rubber', 'Stone', 'Brick',
  'Concrete', 'Steel', 'Iron', 'Aluminum', 'Copper', 'Silver', 'Gold', 'Diamond', 'Cotton', 'Wool'
];
