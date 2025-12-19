import React from 'react';

export default function GameControls({ onEndTurn, onTake, canEndTurn, canTake, isProcessing }) {
  return (
    <div className="controls-container">
      <div className="controls-wrapper">
        <button 
          onClick={onEndTurn} 
          disabled={!canEndTurn || isProcessing}
          className={`control-btn end-turn-btn ${!canEndTurn ? 'disabled' : ''} ${isProcessing ? 'processing' : ''}`}
        >
          <span className="btn-icon">✓</span>
          <span className="btn-text">Закончить ход</span>
          {canEndTurn && !isProcessing && (
            <span className="btn-glow"></span>
          )}
        </button>
        
        <button 
          onClick={onTake} 
          disabled={!canTake || isProcessing}
          className={`control-btn take-btn ${!canTake ? 'disabled' : ''} ${isProcessing ? 'processing' : ''}`}
        >
          <span className="btn-icon">🃏</span>
          <span className="btn-text">Взять карты</span>
          {canTake && !isProcessing && (
            <span className="btn-glow"></span>
          )}
        </button>
      </div>
      
      {isProcessing && (
        <div className="processing-overlay">
          <div className="spinner"></div>
          <span>Обработка...</span>
        </div>
      )}
    </div>
  );
}