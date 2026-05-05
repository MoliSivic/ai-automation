// Mock data for Flash Card Generator

export interface User {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
}

export interface Deck {
  id: string;
  user_id: string;
  title: string;
  description: string;
  card_count: number;
  created_at: string;
  updated_at: string;
}

export interface Card {
  id: string;
  deck_id: string;
  front_text: string;
  back_text: string;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface Settings {
  id: string;
  user_id: string;
  shuffle_enabled: boolean;
  daily_goal: number | null;
  default_ai_card_count: number;
  default_ai_style: string;
  theme: string;
  updated_at: string;
}

export interface StudySession {
  id: string;
  user_id: string;
  deck_id: string;
  started_at: string;
  ended_at: string | null;
  known_count: number;
  total_count: number;
}

// Mock current user
export const mockUser: User = {
  id: "user-1",
  email: "demo@flashcards.app",
  full_name: "Demo User",
  created_at: "2024-01-01T00:00:00Z",
};

// Mock decks
export const mockDecks: Deck[] = [
  {
    id: "deck-1",
    user_id: "user-1",
    title: "JavaScript Fundamentals",
    description:
      "Core JavaScript concepts including variables, functions, and objects",
    card_count: 15,
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-20T14:30:00Z",
  },
  {
    id: "deck-2",
    user_id: "user-1",
    title: "React Hooks",
    description: "useState, useEffect, useContext and more",
    card_count: 12,
    created_at: "2024-01-18T09:00:00Z",
    updated_at: "2024-01-22T11:00:00Z",
  },
  {
    id: "deck-3",
    user_id: "user-1",
    title: "CSS Flexbox & Grid",
    description: "Modern CSS layout techniques",
    card_count: 8,
    created_at: "2024-01-20T15:00:00Z",
    updated_at: "2024-01-21T16:00:00Z",
  },
  {
    id: "deck-4",
    user_id: "user-1",
    title: "TypeScript Basics",
    description: "Types, interfaces, and generics",
    card_count: 10,
    created_at: "2024-01-22T08:00:00Z",
    updated_at: "2024-01-23T12:00:00Z",
  },
];

// Mock cards for deck-1 (JavaScript Fundamentals)
export const mockCards: Record<string, Card[]> = {
  "deck-1": [
    {
      id: "card-1-1",
      deck_id: "deck-1",
      front_text: "What is a closure in JavaScript?",
      back_text:
        "A closure is a function that has access to its outer function's scope, even after the outer function has returned. It 'closes over' the variables from its parent scope.",
      position: 1,
      created_at: "2024-01-15T10:00:00Z",
      updated_at: "2024-01-15T10:00:00Z",
    },
    {
      id: "card-1-2",
      deck_id: "deck-1",
      front_text: "What is the difference between let and const?",
      back_text:
        "Both are block-scoped. 'let' allows reassignment while 'const' creates a read-only reference that cannot be reassigned. However, const objects can still have their properties modified.",
      position: 2,
      created_at: "2024-01-15T10:00:00Z",
      updated_at: "2024-01-15T10:00:00Z",
    },
    {
      id: "card-1-3",
      deck_id: "deck-1",
      front_text: "What is hoisting?",
      back_text:
        "Hoisting is JavaScript's default behavior of moving declarations to the top of their scope. Variable declarations (var) are hoisted but not initialized. Function declarations are fully hoisted.",
      position: 3,
      created_at: "2024-01-15T10:00:00Z",
      updated_at: "2024-01-15T10:00:00Z",
    },
    {
      id: "card-1-4",
      deck_id: "deck-1",
      front_text: "What is the event loop?",
      back_text:
        "The event loop is a mechanism that allows JavaScript to perform non-blocking operations. It continuously checks the call stack and task queue, pushing callbacks from the queue to the stack when it's empty.",
      position: 4,
      created_at: "2024-01-15T10:00:00Z",
      updated_at: "2024-01-15T10:00:00Z",
    },
    {
      id: "card-1-5",
      deck_id: "deck-1",
      front_text: "What are Promises?",
      back_text:
        "Promises are objects representing the eventual completion or failure of an asynchronous operation. They have three states: pending, fulfilled, or rejected.",
      position: 5,
      created_at: "2024-01-15T10:00:00Z",
      updated_at: "2024-01-15T10:00:00Z",
    },
  ],
  "deck-2": [
    {
      id: "card-2-1",
      deck_id: "deck-2",
      front_text: "What does useState return?",
      back_text:
        "useState returns an array with two elements: the current state value and a function to update it. Example: const [count, setCount] = useState(0);",
      position: 1,
      created_at: "2024-01-18T09:00:00Z",
      updated_at: "2024-01-18T09:00:00Z",
    },
    {
      id: "card-2-2",
      deck_id: "deck-2",
      front_text: "When does useEffect run?",
      back_text:
        "useEffect runs after render. With an empty dependency array [], it runs once on mount. With dependencies, it runs when any dependency changes. Without an array, it runs after every render.",
      position: 2,
      created_at: "2024-01-18T09:00:00Z",
      updated_at: "2024-01-18T09:00:00Z",
    },
    {
      id: "card-2-3",
      deck_id: "deck-2",
      front_text: "What is useContext used for?",
      back_text:
        "useContext allows you to subscribe to React context without introducing nesting. It reads the context value from the nearest matching Provider above it in the tree.",
      position: 3,
      created_at: "2024-01-18T09:00:00Z",
      updated_at: "2024-01-18T09:00:00Z",
    },
  ],
  "deck-3": [
    {
      id: "card-3-1",
      deck_id: "deck-3",
      front_text: "What is the main axis in Flexbox?",
      back_text:
        "The main axis is defined by flex-direction. If it's 'row', the main axis runs horizontally. If it's 'column', it runs vertically. justify-content aligns items along this axis.",
      position: 1,
      created_at: "2024-01-20T15:00:00Z",
      updated_at: "2024-01-20T15:00:00Z",
    },
    {
      id: "card-3-2",
      deck_id: "deck-3",
      front_text: "What does 'grid-template-columns: repeat(3, 1fr)' do?",
      back_text:
        "It creates 3 equal-width columns. 'repeat(3, 1fr)' is shorthand for '1fr 1fr 1fr'. The 'fr' unit represents a fraction of the available space in the grid container.",
      position: 2,
      created_at: "2024-01-20T15:00:00Z",
      updated_at: "2024-01-20T15:00:00Z",
    },
  ],
  "deck-4": [
    {
      id: "card-4-1",
      deck_id: "deck-4",
      front_text: "What is the difference between 'type' and 'interface'?",
      back_text:
        "Both can describe object shapes. Interfaces can be extended and merged. Types can create unions, tuples, and mapped types. Types use '=' while interfaces don't.",
      position: 1,
      created_at: "2024-01-22T08:00:00Z",
      updated_at: "2024-01-22T08:00:00Z",
    },
    {
      id: "card-4-2",
      deck_id: "deck-4",
      front_text: "What are generics in TypeScript?",
      back_text:
        "Generics allow you to create reusable components that work with multiple types. They're like type variables: function identity<T>(arg: T): T { return arg; }",
      position: 2,
      created_at: "2024-01-22T08:00:00Z",
      updated_at: "2024-01-22T08:00:00Z",
    },
  ],
};

// Mock settings
export const mockSettings: Settings = {
  id: "settings-1",
  user_id: "user-1",
  shuffle_enabled: true,
  daily_goal: 20,
  default_ai_card_count: 10,
  default_ai_style: "concise",
  theme: "ocean",
  updated_at: "2024-01-20T00:00:00Z",
};

// Mock study sessions
export const mockStudySessions: StudySession[] = [
  {
    id: "session-1",
    user_id: "user-1",
    deck_id: "deck-1",
    started_at: "2024-01-20T10:00:00Z",
    ended_at: "2024-01-20T10:15:00Z",
    known_count: 4,
    total_count: 5,
  },
  {
    id: "session-2",
    user_id: "user-1",
    deck_id: "deck-2",
    started_at: "2024-01-21T14:00:00Z",
    ended_at: "2024-01-21T14:10:00Z",
    known_count: 2,
    total_count: 3,
  },
];

// AI generation mock
export const generateMockCards = (
  text: string,
  count: number,
): Omit<Card, "id" | "deck_id" | "created_at" | "updated_at">[] => {
  const mockGeneratedCards = [
    {
      front_text: "What is the main concept discussed?",
      back_text:
        "The core concept involves understanding the fundamental principles and their practical applications.",
      position: 1,
    },
    {
      front_text: "Define the key terminology",
      back_text:
        "Key terms include the specialized vocabulary used to describe concepts in this field.",
      position: 2,
    },
    {
      front_text: "What are the benefits?",
      back_text:
        "Benefits include improved efficiency, better understanding, and enhanced problem-solving abilities.",
      position: 3,
    },
    {
      front_text: "What are common challenges?",
      back_text:
        "Common challenges include complexity, time management, and resource allocation.",
      position: 4,
    },
    {
      front_text: "How is this applied in practice?",
      back_text:
        "In practice, these concepts are applied through systematic approaches and proven methodologies.",
      position: 5,
    },
    {
      front_text: "What are best practices?",
      back_text:
        "Best practices include thorough planning, continuous learning, and regular evaluation.",
      position: 6,
    },
    {
      front_text: "Compare and contrast approaches",
      back_text:
        "Different approaches vary in methodology, scope, and effectiveness depending on context.",
      position: 7,
    },
    {
      front_text: "What are the prerequisites?",
      back_text:
        "Prerequisites include foundational knowledge, proper tools, and a clear understanding of goals.",
      position: 8,
    },
    {
      front_text: "What are future trends?",
      back_text:
        "Future trends point toward increased automation, integration, and innovation in this field.",
      position: 9,
    },
    {
      front_text: "Summarize the key takeaways",
      back_text:
        "Key takeaways include the importance of understanding fundamentals and applying them consistently.",
      position: 10,
    },
  ];

  return mockGeneratedCards.slice(0, count).map((card, index) => ({
    ...card,
    position: index + 1,
  }));
};
