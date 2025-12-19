// utils/gameLogic.js

import { compareCards } from './cardUtils';

// Может ли карта побить другую
export function canBeat(attackingCard, defendingCard, trump) {
  if (!attackingCard || !defendingCard || !trump) return false;

  // Если масти совпадают
  if (defendingCard.suit === attackingCard.suit) {
    return compareCards(defendingCard, attackingCard, trump.suit) > 0;
  }

  // Если defendingCard - козырь, а attackingCard - нет
  if (defendingCard.suit === trump.suit && attackingCard.suit !== trump.suit) {
    return true;
  }

  return false;
}

// Раздача карт игрокам
export function drawCards(players, deck, maxHand = 6) {
  const newPlayers = players.map(player => ({ ...player }));
  let currentDeck = [...deck];

  newPlayers.forEach(player => {
    const needed = maxHand - player.hand.length;
    if (needed > 0 && currentDeck.length > 0) {
      const cardsToDraw = Math.min(needed, currentDeck.length);
      const newCards = currentDeck.slice(0, cardsToDraw);
      player.hand = [...player.hand, ...newCards];
      currentDeck = currentDeck.slice(cardsToDraw);
    }
  });

  return { players: newPlayers, deck: currentDeck };
}

// AI отбивается (с дополнительной проверкой)
export function aiDefend(attackingCard, aiHand, trump) {
  if (!attackingCard || !aiHand || aiHand.length === 0 || !trump) return null;

  // Безопасная проверка входных параметров
  if (!Array.isArray(aiHand)) return null;
  
  // 1. Ищем карты той же масти, но старше
  const sameSuitCards = aiHand.filter(card =>
    card && card.suit === attackingCard.suit &&
    compareCards(card, attackingCard, trump.suit) > 0
  );

  if (sameSuitCards.length > 0) {
    // Берем самую младшую подходящую карту
    sameSuitCards.sort((a, b) => compareCards(a, b, trump.suit));
    return sameSuitCards[0];
  }

  // 2. Ищем козыри (если атакующая карта не козырь)
  if (attackingCard.suit !== trump.suit) {
    const trumpCards = aiHand.filter(card => card && card.suit === trump.suit);
    if (trumpCards.length > 0) {
      // Берем самый младший козырь
      trumpCards.sort((a, b) => compareCards(a, b, trump.suit));
      return trumpCards[0];
    }
  }

  return null;
}

// AI подкидывает карты
// AI подкидывает карты (исправленная версия)
export function aiAttack(aiHand, table) {
  if (aiHand.length === 0 || table.length === 0) return [];

  // Собираем все ранги карт на столе (только отбитые и неотбитые атакующие карты)
  const tableRanks = new Set();
  
  table.forEach(pair => {
    if (pair.attacking) {
      tableRanks.add(pair.attacking.rank);
    }
    // Также добавляем ранги отбитых карт
    if (pair.defending) {
      tableRanks.add(pair.defending.rank);
    }
  });

  console.log('Ранги карт на столе для подкидывания:', Array.from(tableRanks));
  console.log('Карты в руке AI:', aiHand.map(c => c.rank));

  // Ищем карты с такими же рангами в руке AI
  const matchingCards = aiHand.filter(card =>
    tableRanks.has(card.rank)
  );

  console.log('Подходящие карты для подкидывания:', matchingCards);

  // Ограничиваем количество подкидываемых карт 
  // (всего на столе должно быть не больше 6 пар, но игрок может подкинуть максимум 5 карт сверх первой)
  const maxCards = Math.max(0, 6 - table.length);
  
  // Возвращаем первые maxCards карт
  return matchingCards.slice(0, maxCards);
}

// Можно ли атаковать с данной картой
export function canAttack(hand, table, card) {
  if (table.length === 0) return true;

  const tableRanks = new Set();
  table.forEach(pair => {
    if (pair.attacking) tableRanks.add(pair.attacking.rank);
    if (pair.defending) tableRanks.add(pair.defending.rank);
  });

  return tableRanks.has(card.rank);
}

// Получить список всех карт на столе (для отладки)
export function getAllCardsOnTable(table) {
  return table.flatMap(pair => [
    pair.attacking,
    pair.defending
  ]).filter(Boolean);
}