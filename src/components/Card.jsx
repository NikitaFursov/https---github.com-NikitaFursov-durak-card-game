// src/components/Card.jsx
import React from 'react';

const suitSymbols = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠'
};

const suitColors = {
  hearts: '#e74c3c',
  diamonds: '#e74c3c',
  clubs: '#2c3e50',
  spades: '#2c3e50'
};

export default function Card({ 
  card, 
  onClick, 
  faceUp = true, 
  highlight = false, 
  disabled = false, 
  isTrump = false,
  compact = false
}) {
  const handleClick = () => {
    if (!disabled && onClick) {
      onClick(card);
    }
  };

  if (!faceUp) {
    return (
      <div className={`card back ${compact ? 'compact' : ''}`} title="Скрытая карта">
        <div className="card-back-design">
          <div className="card-back-center">
            <div className="card-back-logo">♠♣</div>
            <div className="card-back-logo">♥♦</div>
          </div>
        </div>
      </div>
    );
  }

  const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
  const color = suitColors[card.suit];
  const symbol = suitSymbols[card.suit];

  return (
    <div
      className={`card ${card.suit} ${highlight ? 'highlight' : ''} ${disabled ? 'disabled' : ''} ${isTrump ? 'trump' : ''} ${compact ? 'compact' : ''}`}
      onClick={handleClick}
      style={{ 
        cursor: disabled ? 'not-allowed' : 'pointer',
        '--card-color': color
      }}
      title={`${card.rank} ${symbol}${isTrump ? ' (козырь)' : ''}`}
    >
      {isTrump && (
        <div className="trump-overlay">
          <div className="trump-crown">♛</div>
        </div>
      )}
      
      <div className="card-inner">
        {/* Верхний левый угол */}
        <div className="card-corner top-left">
          <div className="corner-rank" style={{ color }}>{card.rank}</div>
          <div className="corner-suit" style={{ color }}>{symbol}</div>
        </div>
        
        {/* Центральный символ */}
        <div className="card-center">
          <div className="center-symbol" style={{ color }}>
            {symbol}
            {card.rank === '10' ? (
              <div className="rank-symbol small">10</div>
            ) : card.rank === 'J' ? (
              <div className="rank-symbol">J</div>
            ) : card.rank === 'Q' ? (
              <div className="rank-symbol">♕</div>
            ) : card.rank === 'K' ? (
              <div className="rank-symbol">♔</div>
            ) : card.rank === 'A' ? (
              <div className="rank-symbol">A</div>
            ) : (
              <div className="rank-symbol">{card.rank}</div>
            )}
          </div>
        </div>
        
        {/* Нижний правый угол */}
        <div className="card-corner bottom-right">
          <div className="corner-rank" style={{ color }}>{card.rank}</div>
          <div className="corner-suit" style={{ color }}>{symbol}</div>
        </div>
      </div>
      
      {/* Декоративные элементы */}
      <div className="card-decoration">
        <div className="decoration-corner tl"></div>
        <div className="decoration-corner tr"></div>
        <div className="decoration-corner bl"></div>
        <div className="decoration-corner br"></div>
      </div>
    </div>
  );
}