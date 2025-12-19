// src/components/TableDropZone.jsx (обновленная версия)
import React from 'react';
import { useDrop } from 'react-dnd';
import Card from './Card';
import { motion, AnimatePresence } from 'framer-motion';

export default function TableDropZone({ table, onCardDrop }) {
  const [, dropRef] = useDrop(() => ({
    accept: 'CARD',
    drop: (item) => {
      if (onCardDrop && item.card) {
        onCardDrop(item.card);
      }
    }
  }), [onCardDrop]);

  // Группируем карты для более компактного отображения
  const renderTableCards = () => {
    if (table.length === 0) {
      return (
        <div className="empty-table-message">
          <p>Перетащите карту сюда или кликните на карту в руке</p>
          <div className="drop-hint">↓</div>
        </div>
      );
    }

    return (
      <div className="table-grid">
        {table.map((pair, idx) => (
          <motion.div
            key={idx}
            className="table-pair-compact"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="attacking-card">
              <Card card={pair.attacking} />
              {!pair.defending && (
                <div className="defend-prompt">
                  <span>Отбейте</span>
                </div>
              )}
            </div>
            {pair.defending && (
              <motion.div
                className="defending-card"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
              >
                <Card card={pair.defending} />
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <div ref={dropRef} className="table-drop-zone">
      <AnimatePresence mode="wait">
        {renderTableCards()}
      </AnimatePresence>
    </div>
  );
}