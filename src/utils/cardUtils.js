// utils/cardUtils.js

const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
const ranks = ['6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

// Создание и перемешивание колоды
export function createDeck() {
  const deck = [];
  let id = 0;

  // Создаем упорядоченную колоду
  for (let suit of suits) {
    for (let rank of ranks) {
      deck.push({
        id: id++,
        suit,
        rank,
        code: `${rank[0]}${suit[0]}` // Например: '6h' для шестерки червей
      });
    }
  }

  // Перемешиваем колоду перед возвратом
  return shuffleDeck(deck);
}

// Перемешивание колоды (алгоритм Фишера-Йетса)
export function shuffleDeck(deck) {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Сравнение карт (возвращает положительное число если card1 сильнее, 
// отрицательное если card2 сильнее, 0 если равны)
export function compareCards(card1, card2, trumpSuit) {
  const rankOrder = ['6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

  // Определяем силу карт
  const getCardValue = (card) => {
    let value = rankOrder.indexOf(card.rank);
    // Козыри значительно сильнее обычных карт
    if (card.suit === trumpSuit) {
      value += 100;
    }
    return value;
  };

  const value1 = getCardValue(card1);
  const value2 = getCardValue(card2);

  return value1 - value2;
}

// Получить символ масти
export function getSuitSymbol(suit) {
  const symbols = {
    hearts: '♥',
    diamonds: '♦',
    clubs: '♣',
    spades: '♠'
  };
  return symbols[suit] || suit;
}

// Получить цвет масти
export function getSuitColor(suit) {
  return (suit === 'hearts' || suit === 'diamonds') ? 'red' : 'black';
}

// Проверка, является ли карта козырем
export function isTrump(card, trumpSuit) {
  return card.suit === trumpSuit;
}

// Получить индекс ранга карты (от 0 для '6' до 8 для 'A')
export function getRankIndex(rank) {
  const rankOrder = ['6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  return rankOrder.indexOf(rank);
}

// Получить следующую карту по силе (для тестирования)
export function getNextStrongerCard(card, trumpSuit) {
  const rankOrder = ['6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  const currentIndex = rankOrder.indexOf(card.rank);
  
  if (currentIndex < rankOrder.length - 1) {
    return {
      ...card,
      rank: rankOrder[currentIndex + 1]
    };
  }
  
  // Если это туз, попробуем сменить масть на козырь
  if (card.suit !== trumpSuit) {
    return {
      ...card,
      suit: trumpSuit,
      rank: '6' // самый младший козырь
    };
  }
  
  return null; // Нельзя стать сильнее
}

// Фильтрация карт по масти
export function filterBySuit(cards, suit) {
  return cards.filter(card => card.suit === suit);
}

// Сортировка карт по силе (от слабых к сильным)
export function sortCardsByStrength(cards, trumpSuit) {
  return [...cards].sort((a, b) => compareCards(a, b, trumpSuit));
}