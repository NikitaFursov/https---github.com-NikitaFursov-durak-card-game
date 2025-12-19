import React from 'react';
import Card from './Card';

export function PlayerHand({ hand, onCardClick, canPlayCard, isDefending }) {
  return (
    <div className="player-hand">
      {hand.map((card) => (
        <Card
          key={card.id}
          card={card}
          onClick={() => onCardClick(card)}
          highlight={canPlayCard ? canPlayCard(card) : false}
          disabled={!isDefending && !canPlayCard}
        />
      ))}
    </div>
  );
}