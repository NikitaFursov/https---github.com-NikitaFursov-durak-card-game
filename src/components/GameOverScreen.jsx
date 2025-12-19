// src/components/GameOverScreen.jsx
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function GameOverScreen({ 
  gameResult, 
  onRestart, 
  playerCards, 
  aiCards, 
  deckCards 
}) {
  const [showStats, setShowStats] = useState(false);
  const [confetti, setConfetti] = useState([]);

  const results = {
    victory: {
      title: 'Победа! 🏆',
      message: 'Вы вышли первым! Поздравляем с победой!',
      icon: '🎉',
      color: 'var(--success-color)',
      gradient: 'linear-gradient(135deg, #ffd700, #ffed4e)',
      sound: 'victory'
    },
    defeat: {
      title: 'Поражение 😔',
      message: 'AI выиграл эту партию. Попробуйте еще раз!',
      icon: '💪',
      color: 'var(--danger-color)',
      gradient: 'linear-gradient(135deg, #e74c3c, #ff6b6b)',
      sound: 'defeat'
    },
    draw: {
      title: 'Ничья! 🤝',
      message: 'Оба игрока вышли одновременно. Равная борьба!',
      icon: '⚖️',
      color: 'var(--secondary-color)',
      gradient: 'linear-gradient(135deg, #3498db, #2ecc71)',
      sound: 'draw'
    }
  };

  const result = results[gameResult] || results.defeat;

  // Запускаем конфетти для победы
  useEffect(() => {
    if (gameResult === 'victory') {
      const newConfetti = [];
      for (let i = 0; i < 150; i++) {
        newConfetti.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          rotation: Math.random() * 360,
          size: Math.random() * 20 + 10,
          color: ['#ffd700', '#ff6b6b', '#3498db', '#2ecc71'][Math.floor(Math.random() * 4)],
          shape: Math.random() > 0.5 ? 'circle' : 'rect'
        });
      }
      setConfetti(newConfetti);

      // Убираем конфетти через 5 секунд
      const timer = setTimeout(() => {
        setConfetti([]);
      }, 5000);

      return () => clearTimeout(timer);
    }

    setShowStats(true);
  }, [gameResult]);

  // Анимация появления статистики
  useEffect(() => {
    const timer = setTimeout(() => setShowStats(true), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div 
      className="game-over-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Конфетти для победы */}
      <AnimatePresence>
        {gameResult === 'victory' && confetti.map((item) => (
          <motion.div
            key={item.id}
            className="confetti"
            initial={{ 
              x: item.x + 'vw', 
              y: -20, 
              opacity: 1,
              rotate: 0 
            }}
            animate={{ 
              y: '120vh',
              rotate: 360,
              opacity: 0 
            }}
            transition={{ 
              duration: Math.random() * 3 + 2,
              ease: "linear" 
            }}
            style={{
              position: 'fixed',
              left: item.x + 'vw',
              width: item.size + 'px',
              height: item.size + 'px',
              background: item.color,
              borderRadius: item.shape === 'circle' ? '50%' : '0%',
              zIndex: 1000
            }}
          />
        ))}
      </AnimatePresence>

      <motion.div 
        className="game-over-container"
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
      >
        <div className={`result-card ${gameResult}`}>
          {/* Анимированная иконка */}
          <motion.div 
            className="result-icon"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              type: "spring", 
              stiffness: 200, 
              damping: 15,
              delay: 0.2 
            }}
          >
            <div className="icon-wrapper">
              <span style={{ fontSize: '5rem', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}>
                {result.icon}
              </span>
            </div>
          </motion.div>

          {/* Заголовок */}
          <motion.h1 
            className="result-title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{ background: result.gradient, WebkitBackgroundClip: 'text' }}
          >
            {result.title}
          </motion.h1>

          {/* Сообщение */}
          <motion.p 
            className="result-message"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {result.message}
          </motion.p>

          {/* Статистика */}
          <AnimatePresence>
            {showStats && (
              <motion.div 
                className="result-stats"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="stat-item">
                  <div className="stat-label">Ваши карты</div>
                  <div className={`stat-value ${playerCards === 0 ? 'winner' : ''}`}>
                    {playerCards}
                    {playerCards === 0 && (
                      <motion.span 
                        className="stat-badge"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      >
                        🏆
                      </motion.span>
                    )}
                  </div>
                </div>

                <div className="stat-item">
                  <div className="stat-label">Карты AI</div>
                  <div className={`stat-value ${aiCards === 0 ? 'winner' : ''}`}>
                    {aiCards}
                    {aiCards === 0 && (
                      <motion.span 
                        className="stat-badge"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      >
                        🤖
                      </motion.span>
                    )}
                  </div>
                </div>

                <div className="stat-item">
                  <div className="stat-label">В колоде</div>
                  <div className="stat-value">{deckCards}</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Действия */}
          <motion.div 
            className="result-actions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <motion.button
              className="restart-btn-primary"
              onClick={onRestart}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="btn-icon">🔄</span>
              <span className="btn-text">Играть снова</span>
            </motion.button>

            <div className="result-tips">
              <p>💡 Совет: Старайтесь избавляться от мелких карт первыми и помните о козырях!</p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}