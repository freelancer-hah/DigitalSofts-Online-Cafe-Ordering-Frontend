// Voice ordering utilities

// Product name mapping for better recognition
const productMap = {
  'karahi': 'Chicken Karahi',
  'chicken karahi': 'Chicken Karahi',
  'biryani': 'Beef Biryani',
  'beef biryani': 'Beef Biryani',
  'zinger': 'Zinger Burger',
  'zinger burger': 'Zinger Burger',
  'broast': 'Chicken Broast',
  'chicken broast': 'Chicken Broast',
  'kebab': 'Seekh Kebab',
  'seekh kebab': 'Seekh Kebab',
  'spring roll': 'Spring Rolls',
  'spring rolls': 'Spring Rolls',
  'chai': 'Kashmiri Chai',
  'kashmiri chai': 'Kashmiri Chai',
  'lime soda': 'Fresh Lime Soda',
  'soda': 'Fresh Lime Soda',
  'chocolate cake': 'Chocolate Lava Cake',
  'lava cake': 'Chocolate Lava Cake',
  'gulab jamun': 'Gulab Jamun',
};

// Match spoken words to menu items
export const matchProducts = (text, menuItems) => {
  const detected = [];
  const lowerText = text.toLowerCase();

  // Check for direct product matches
  for (const [key, value] of Object.entries(productMap)) {
    if (lowerText.includes(key)) {
      const matchedItem = menuItems.find(item => item.name === value);
      if (matchedItem) {
        detected.push(matchedItem);
      }
    }
  }

  // If no direct match, try fuzzy matching
  if (detected.length === 0) {
    menuItems.forEach(item => {
      const name = item.name.toLowerCase();
      const words = name.split(' ');
      const matched = words.some(word => lowerText.includes(word));
      if (matched) {
        detected.push(item);
      }
    });
  }

  return detected;
};

// Extract quantity from speech
export const extractQuantity = (text) => {
  const numbers = text.match(/\d+/g);
  return numbers ? parseInt(numbers[0]) : 1;
};

// Generate suggestions based on text
export const generateSuggestions = (text, menuItems) => {
  const suggestions = [];
  const words = text.toLowerCase().split(' ');

  menuItems.forEach(item => {
    const name = item.name.toLowerCase();
    const itemWords = name.split(' ');
    const matched = words.some(word => 
      itemWords.some(iw => iw.includes(word) || word.includes(iw))
    );
    if (matched) {
      suggestions.push(item);
    }
  });

  return suggestions.slice(0, 3);
};