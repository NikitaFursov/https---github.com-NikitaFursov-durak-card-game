import React, { useEffect, useState } from 'react';
import Card from './Card';

export function OpponentHand({ hand }) {
  const [animatedHand, setAnimatedHand] = useState([]);
  
  useEffect(() => {
    // Сброс анимации при полной смене руки (например, в начале игры)
    if (hand.length !== animatedHand.length) {
      setAnimatedHand(hand);
    }
  }, [hand]);

  return (
    <div className="opponent-hand">
      {hand.map((card, idx) => (
        <Card key={card.id || idx} faceUp={false} />
      ))}
    </div>
  );
}