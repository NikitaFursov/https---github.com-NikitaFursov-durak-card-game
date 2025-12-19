// src/components/Deck.jsx (обновленная версия)
import React, { useState, useEffect } from 'react';
import Card from './Card';

export default function Deck({ deck, trump, gameState }) {
  const [trumpTaken, setTrumpTaken] = useState(false);
  const [trumpTakenMessage, setTrumpTakenMessage] = useState(false);

  // Отслеживаем когда колода становится пустой и козырь забирается
  useEffect(() => {
    if (trump && deck.length === 0 && !trumpTaken) {
      setTrumpTaken(true);
      // Показываем сообщение "Забрал!" на 1.5 секунды
      setTrumpTakenMessage(true);
      const messageTimer = setTimeout(() => {
        setTrumpTakenMessage(false);
      }, 1500);
      
      return () => clearTimeout(messageTimer);
    }
  }, [deck.length, trump, trumpTaken]);

  // Сбрасываем состояние при новой игре
  useEffect(() => {
    if (gameState === 'new') {
      setTrumpTaken(false);
      setTrumpTakenMessage(false);
    }
  }, [gameState]);

  return (
    <div className="deck-compact">
      <div className="deck-stack">
        {deck.length > 0 && (
          <>
            <div className="deck-card back" style={{ transform: 'translate(0px, 0px)' }}></div>
            <div className="deck-card back" style={{ transform: 'translate(2px, 2px)' }}></div>
            <div className="deck-card back" style={{ transform: 'translate(4px, 4px)' }}></div>
          </>
        )}
        <div className="deck-count">{deck.length}</div>
      </div>
      
      {trump && (
        <div className={`trump-display ${trumpTaken ? 'trump-taken' : ''}`}>
          <span>Козырь:</span>
          <div className="trump-card-container">
            <Card 
              card={trump} 
              faceUp={true}
              disabled={trumpTaken}
            />
            {trumpTakenMessage && (
              <div className="trump-taken-message">
                Вышел
              </div>
            )}
            {trumpTaken && !trumpTakenMessage && (
              <div className="trump-taken-permanent">
                <span className="taken-indicator">✓</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}