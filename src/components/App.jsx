import React, { useState, useEffect, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { createDeck } from '../utils/cardUtils';
import { canBeat, aiDefend, aiAttack } from '../utils/gameLogic';
import Deck from '../components/Deck';
import TableDropZone from '../components/TableDropZone';
import { PlayerHand } from '../components/PlayerHand';
import { OpponentHand } from '../components/OpponentHand';
import GameControls from '../components/GameControls';
import GameOverScreen from '../components/GameOverScreen';

export default function App() {
  // Состояния игры
  const [deck, setDeck] = useState([]);
  const [trump, setTrump] = useState(null);
  const [players, setPlayers] = useState([
    { id: 0, hand: [], name: 'Игрок' },
    { id: 1, hand: [], name: 'AI' }
  ]);
  const [table, setTable] = useState([]);
  const [turn, setTurn] = useState(0); // Чей ход: 0 - игрок, 1 - AI
  const [phase, setPhase] = useState('attack'); // 'attack' или 'defense'
  const [attacker, setAttacker] = useState(0); // Кто атакует в этом раунде
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [gameResult, setGameResult] = useState(null); // 'victory', 'defeat', 'draw'

  // Инициализация игры
  useEffect(() => {
    if (gameStarted) return;
    
    const initGame = () => {
      try {
        // Создаем и перемешиваем колоду
        const newDeck = createDeck(); // createDeck уже перемешивает карты
        
        // Выбираем козырь (последняя карта в колоде)
        const trumpCard = newDeck[newDeck.length - 1];
        setTrump(trumpCard);
        
        // Раздаем по 6 карт каждому игроку
        const playerHand = newDeck.slice(0, 6);
        const aiHand = newDeck.slice(6, 12);
        const remainingDeck = newDeck.slice(12);
        
        setPlayers([
          { id: 0, hand: playerHand, name: 'Игрок' },
          { id: 1, hand: aiHand, name: 'AI' }
        ]);
        setDeck(remainingDeck);
        setGameStarted(true);
        setTurn(0); // Игрок ходит первым
        setPhase('attack');
        setAttacker(0);
        setMessage('Игра началась! Ваш ход. Выберите карту для атаки.');
        setGameResult(null);
        
        console.log('Игра инициализирована:', {
          playerCards: playerHand.length,
          aiCards: aiHand.length,
          deck: remainingDeck.length,
          trump: trumpCard
        });
      } catch (error) {
        console.error('Ошибка инициализации игры:', error);
        setMessage('Ошибка загрузки игры. Пожалуйста, обновите страницу.');
      }
    };
    
    initGame();
  }, [gameStarted]);

  // Добор карт игроками
  const drawCardsForPlayers = useCallback(() => {
    setPlayers(prevPlayers => {
      let tempDeck = [...deck];
      const updatedPlayers = prevPlayers.map(player => {
        const needed = 6 - player.hand.length;
        if (needed > 0 && tempDeck.length > 0) {
          const cardsToDraw = Math.min(needed, tempDeck.length);
          const newCards = tempDeck.slice(0, cardsToDraw);
          tempDeck = tempDeck.slice(cardsToDraw);
          return {
            ...player,
            hand: [...player.hand, ...newCards]
          };
        }
        return player;
      });
      
      // Обновляем колоду
      setDeck(tempDeck);
      
      return updatedPlayers;
    });
  }, [deck]);

  // Проверка, можно ли атаковать выбранной картой
  const canAttackWithCard = useCallback((card) => {
    if (turn !== 0 || phase !== 'attack' || isProcessing) return false;
    
    // Если это первая карта в атаке - можно любую
    if (table.length === 0) return true;
    
    // Для подкидывания: карта должна совпадать по рангу с любой картой на столе
    const tableRanks = [];
    table.forEach(pair => {
      if (pair.attacking) tableRanks.push(pair.attacking.rank);
      if (pair.defending) tableRanks.push(pair.defending.rank);
    });
    
    return tableRanks.includes(card.rank);
  }, [table, turn, phase, isProcessing]);

  // Игрок кладет карту на стол (атака)
  const handleCardDrop = useCallback((card) => {
    if (isProcessing) return;
    
    if (turn !== 0) {
      setMessage('Не ваш ход!');
      return;
    }
    
    if (phase === 'attack') {
      // Режим атаки
      if (!canAttackWithCard(card)) {
        setMessage('Нельзя атаковать этой картой!');
        return;
      }
      
      setIsProcessing(true);
      
      // Добавляем карту на стол
      const newTable = [...table, { attacking: card, defending: null }];
      
      // Убираем карту из руки игрока
      const newHand = players[0].hand.filter(c => c.id !== card.id);
      
      setPlayers(prev => [
        { ...prev[0], hand: newHand },
        prev[1]
      ]);
      setTable(newTable);
      
      // Если это первая карта в атаке, переходим к защите
      if (newTable.length === 1) {
        setPhase('defense');
        setTurn(1); // AI отбивается
        setMessage('AI отбивается...');
      } else {
        // После подкидывания — снова даём AI отбиться
        setPhase('defense');
        setTurn(1);
        setMessage('AI отбивается от подкинутых карт...');
      }
      setIsProcessing(false);
      
    } else if (phase === 'defense' && turn === 0) {
      // Режим защиты (игрок отбивается)
      setIsProcessing(true);
      
      const lastPair = table[table.length - 1];
      if (!lastPair || lastPair.defending) {
        setMessage('Нельзя отбивать сейчас!');
        setIsProcessing(false);
        return;
      }
      
      // Проверяем, может ли карта побить атакующую
      if (canBeat(lastPair.attacking, card, trump)) {
        const newTable = [...table];
        newTable[newTable.length - 1] = { ...lastPair, defending: card };
        
        // Убираем карту из руки игрока
        const newHand = players[0].hand.filter(c => c.id !== card.id);
        
        setPlayers(prev => [
          { ...prev[0], hand: newHand },
          prev[1]
        ]);
        setTable(newTable);
        setMessage('Вы отбили карту!');
        
        // Проверяем, все ли карты отбиты
        const allDefended = newTable.every(pair => pair.defending);
        if (allDefended) {
          setTable(newTable);
          setMessage('Вы отбили карту!');

          // Проверяем: кто атаковал?
          if (attacker === 0) {
            // Игрок атаковал — он решает
            setPhase('attack');
            setTurn(0);
            setMessage('AI отбился! Можете подкинуть еще карты или закончить ход.');
          } else {
            // AI атаковал — AI решает
            setPhase('attack');
            setTurn(1);
            setMessage('Вы отбились! AI думает...');
          }
        }
      } else {
        setMessage('Эта карта не может побить атакующую!');
      }
      
      setIsProcessing(false);
    }
  }, [players, table, turn, phase, trump, canAttackWithCard, isProcessing, attacker]);

  // AI отбивается
  const aiDefendTurn = useCallback(() => {
    if (isProcessing) return;

    setIsProcessing(true);

    const aiHand = [...players[1].hand];
    const newTable = [...table];
    let allDefended = true;
    let aiTookCards = false;

    // Отбиваем все неотбитые пары
    for (let i = 0; i < newTable.length; i++) {
      const pair = newTable[i];
      if (!pair.defending) {
        const defenseCard = aiDefend(pair.attacking, aiHand, trump);
        if (defenseCard) {
          // Нашли карту для отбития
          const cardIndex = aiHand.findIndex(c => c.id === defenseCard.id);
          if (cardIndex !== -1) {
            aiHand.splice(cardIndex, 1);
            newTable[i] = { ...pair, defending: defenseCard };
          }
        } else {
          // Не может отбиться
          allDefended = false;
          aiTookCards = true;
          break;
        }
      }
    }

    setTimeout(() => {
      if (aiTookCards) {
        // AI берет все карты со стола
        const allCards = newTable.flatMap(pair => [
          pair.attacking,
          pair.defending
        ]).filter(Boolean);

        // Объединяем текущую руку AI и взятые карты
        const newAiHand = [...aiHand, ...allCards];

        // Добираем карты из колоды до 6 для обоих игроков
        let tempDeck = [...deck];
        const updatedPlayerHand = [...players[0].hand];
        const updatedAiHand = [...newAiHand];

        // Сначала добираем игроку (атакующему) до 6
        const playerNeeds = 6 - updatedPlayerHand.length;
        if (playerNeeds > 0 && tempDeck.length > 0) {
          const playerDrawCount = Math.min(playerNeeds, tempDeck.length);
          const playerNewCards = tempDeck.slice(0, playerDrawCount);
          updatedPlayerHand.push(...playerNewCards);
          tempDeck = tempDeck.slice(playerDrawCount);
        }

        // Затем добираем AI до 6
        const aiNeeds = 6 - updatedAiHand.length;
        if (aiNeeds > 0 && tempDeck.length > 0) {
          const aiDrawCount = Math.min(aiNeeds, tempDeck.length);
          const aiNewCards = tempDeck.slice(0, aiDrawCount);
          updatedAiHand.push(...aiNewCards);
          tempDeck = tempDeck.slice(aiDrawCount);
        }

        // Обновляем состояние
        setPlayers(prev => [
          { ...prev[0], hand: updatedPlayerHand },
          { ...prev[1], hand: updatedAiHand }
        ]);
        setDeck(tempDeck);
        setTable([]);

        setMessage('AI взял карты со стола! Теперь ваш ход.');
        setPhase('attack');
        setTurn(0);
        setAttacker(0);

      } else if (allDefended) {
        // AI успешно отбился
        setPlayers(prev => [
          prev[0],
          { ...prev[1], hand: aiHand }
        ]);
        setTable(newTable);
        setPhase('attack');

        // Кто атаковал? Только атакующий может подкидывать
        if (attacker === 0) {
          // Игрок атаковал → он подкидывает
          setTurn(0);
          setMessage('AI отбился! Можете подкинуть еще карты или закончить ход.');
        } else {
          // AI атаковал → он подкидывает
          setTurn(1);
          setMessage('AI отбился! AI может подкинуть карты...');
        }
      }
      
      setIsProcessing(false);
    }, 1000);
  }, [players, table, deck, trump, isProcessing, attacker]);

  // AI атакует
  const aiAttackTurn = useCallback(() => {
    if (isProcessing) return;

    setIsProcessing(true);

    const aiHand = [...players[1].hand];
    const newTable = [...table];

    if (newTable.length === 0 && aiHand.length > 0) {
      const randomIndex = Math.floor(Math.random() * aiHand.length);
      const attackCard = aiHand[randomIndex];
      const updatedHand = aiHand.filter((_, i) => i !== randomIndex);

      setPlayers(prev => [
        prev[0],
        { ...prev[1], hand: updatedHand }
      ]);
      setTable([{ attacking: attackCard, defending: null }]);
      setPhase('defense');
      setTurn(0);
      setMessage('AI атаковал! Отбейте карту.');
    } else {
      // AI не может атаковать → возможно, игра окончена
      setMessage('AI не может атаковать. Возможно, игра окончена.');
    }

    setIsProcessing(false);
  }, [players, table, isProcessing]);

  // Завершение раунда (когда все карты отбиты)
  const completeRound = useCallback(() => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      const allDefended = table.length > 0 && table.every(pair => pair.defending);
      
      if (!allDefended && table.length > 0) {
        setMessage('Не все карты отбиты!');
        setIsProcessing(false);
        return;
      }
      
      setTable([]); // Очищаем стол
      
      setTimeout(() => {
        drawCardsForPlayers();
        
        const nextAttacker = attacker === 0 ? 1 : 0;
        setAttacker(nextAttacker);
        setTurn(nextAttacker);
        setPhase('attack');
        
        if (nextAttacker === 0) {
          setMessage('Раунд завершен! Ваш ход.');
        } else {
          setMessage('Раунд завершен! AI ходит.');
        }
        
        setIsProcessing(false);
      }, 500);
      
    } catch (error) {
      console.error('Ошибка в completeRound:', error);
      setMessage('Ошибка завершения раунда');
      setIsProcessing(false);
    }
  }, [table, attacker, drawCardsForPlayers, isProcessing]);

  const aiThrowInTurn = useCallback(() => {
    if (isProcessing) return;

    const aiHand = [...players[1].hand];
    const possibleCards = aiAttack(aiHand, table);

    // ❌ Нечего подкидывать → конец раунда
    if (possibleCards.length === 0) {
      completeRound();
      return;
    }

    // ✅ Подкидываем ТОЛЬКО ОДНУ карту
    const card = possibleCards[0];

    setIsProcessing(true);

    setPlayers(prev => [
      prev[0],
      {
        ...prev[1],
        hand: aiHand.filter(c => c.id !== card.id)
      }
    ]);

    setTable(prev => [
      ...prev,
      { attacking: card, defending: null }
    ]);

    setPhase('defense');
    setTurn(0);
    setMessage('AI подкинул карту. Отбивайтесь!');

    setIsProcessing(false);
  }, [players, table, isProcessing, aiAttack, completeRound]);

  const handleTake = useCallback(() => {
    if (isProcessing) return;
    if (phase !== 'defense' || turn !== 0) {
      setMessage('Нельзя взять карты сейчас!');
      return;
    }

    setIsProcessing(true);

    const allCards = table.flatMap(pair => [pair.attacking, pair.defending]).filter(Boolean);
    const newHand = [...players[0].hand, ...allCards];

    // Обновляем руки и колоду
    let tempDeck = [...deck];
    const p0Hand = [...newHand];
    const p1Hand = [...players[1].hand];

    // Добор до 6
    const p0Need = Math.max(0, 6 - p0Hand.length);
    const p0Draw = tempDeck.slice(0, p0Need);
    tempDeck = tempDeck.slice(p0Draw.length);

    const p1Need = Math.max(0, 6 - p1Hand.length);
    const p1Draw = tempDeck.slice(0, p1Need);
    tempDeck = tempDeck.slice(p1Draw.length);

    const updatedP0 = [...p0Hand, ...p0Draw];
    const updatedP1 = [...p1Hand, ...p1Draw];

    // Применяем всё
    setPlayers([
      { id: 0, hand: updatedP0, name: 'Игрок' },
      { id: 1, hand: updatedP1, name: 'AI' }
    ]);
    setDeck(tempDeck);
    setTable([]);
    setAttacker(1); // AI остаётся атакующим
    setTurn(1);     // Ход у AI
    setPhase('attack');
    setMessage('Вы взяли карты! AI атакует снова.');

    setIsProcessing(false);
  }, [players, table, deck, phase, turn, isProcessing]);

  // Игрок заканчивает ход
  const handleEndTurn = useCallback(() => {
    if (isProcessing) return;
    
    console.log('handleEndTurn вызван:', {
      turn,
      phase,
      tableLength: table.length,
      allDefended: table.every(pair => pair.defending)
    });
    
    if (turn !== 0) {
      setMessage('Не ваш ход!');
      return;
    }
    
    if (phase !== 'attack') {
      setMessage('Сейчас фаза защиты!');
      return;
    }
    
    if (table.length === 0) {
      setMessage('Сначала нужно положить карту!');
      return;
    }
    
    // Проверяем, все ли карты на столе отбиты
    const allDefended = table.every(pair => pair.defending);
    
    if (!allDefended) {
      setMessage('Не все карты отбиты! Отбейте или возьмите карты.');
      return;
    }
    
    // Все отбито, завершаем раунд
    completeRound();
  }, [turn, phase, table, completeRound, isProcessing]);

  // AI ход
  useEffect(() => {
    if (!gameStarted || gameOver || isProcessing) return;

    if (turn === 1) {
      if (phase === 'defense') {
        const timer = setTimeout(() => aiDefendTurn(), 800);
        return () => clearTimeout(timer);
      }

      if (phase === 'attack' && table.length > 0) {
        const timer = setTimeout(() => aiThrowInTurn(), 800);
        return () => clearTimeout(timer);
      }

      if (phase === 'attack' && table.length === 0) {
        const timer = setTimeout(() => aiAttackTurn(), 800);
        return () => clearTimeout(timer);
      }
    }
  }, [
    turn,
    phase,
    table,
    gameStarted,
    gameOver,
    isProcessing,
    aiDefendTurn,
    aiAttackTurn,
    aiThrowInTurn
  ]);

  // Проверка конца игры и определение результата
  useEffect(() => {
    if (!gameStarted || gameOver) return;
    
    const playerHandEmpty = players[0].hand.length === 0;
    const aiHandEmpty = players[1].hand.length === 0;
    const deckEmpty = deck.length === 0;
    
    // Игра заканчивается, когда колода пуста и у кого-то из игроков закончились карты
    if (deckEmpty && (playerHandEmpty || aiHandEmpty)) {
      setGameOver(true);
      
      // Определяем результат игры
      if (playerHandEmpty && aiHandEmpty) {
        setGameResult('draw');
        setMessage('Ничья! Оба игрока вышли.');
      } else if (playerHandEmpty) {
        setGameResult('victory');
        setMessage('Поздравляем! Вы выиграли!');
      } else {
        setGameResult('defeat');
        setMessage('AI выиграл. Попробуйте еще раз!');
      }
    }
  }, [players, deck, gameStarted, gameOver]);

  // Отладочный вывод
  useEffect(() => {
    if (gameStarted) {
      console.log('Состояние игры:', {
        turn: turn === 0 ? 'Игрок' : 'AI',
        phase,
        attacker: attacker === 0 ? 'Игрок' : 'AI',
        tableCards: table.length,
        playerCards: players[0].hand.length,
        aiCards: players[1].hand.length,
        deckCards: deck.length,
        gameOver,
        gameResult,
        isProcessing
      });
    }
  }, [turn, phase, attacker, table, players, deck, gameOver, gameStarted, isProcessing, gameResult]);

  // Перезапуск игры
  const handleRestart = () => {
    setDeck([]);
    setTrump(null);
    setPlayers([
      { id: 0, hand: [], name: 'Игрок' },
      { id: 1, hand: [], name: 'AI' }
    ]);
    setTable([]);
    setTurn(0);
    setPhase('attack');
    setAttacker(0);
    setGameOver(false);
    setGameStarted(false);
    setGameResult(null);
    setMessage('');
    setIsProcessing(false);
  };

  if (!gameStarted) {
    return (
      <div className="loading">
        <h2>Загрузка игры...</h2>
      </div>
    );
  }

  if (gameOver) {
    return (
      <GameOverScreen
        gameResult={gameResult}
        onRestart={handleRestart}
        playerCards={players[0].hand.length}
        aiCards={players[1].hand.length}
        deckCards={deck.length}
      />
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="game">
        <h1>Карточный дурак</h1>
        
        <div className="game-header">
          <div className="game-status">
            <div className="status-item">
              <span className="status-label">Ход:</span>
              <span className={`status-value ${turn === 0 ? 'player-turn' : 'ai-turn'}`}>
                {turn === 0 ? 'Ваш' : 'AI'}
              </span>
            </div>
            <div className="status-item">
              <span className="status-label">Фаза:</span>
              <span className="status-value">
                {phase === 'attack' ? 'Атака' : 'Защита'}
              </span>
            </div>
            <div className="status-item">
              <span className="status-label">Атакующий:</span>
              <span className="status-value">
                {attacker === 0 ? 'Вы' : 'AI'}
              </span>
            </div>
          </div>
          
          <div className={`game-message ${message.includes('Ошибка') ? 'error' : ''}`}>
            {message}
          </div>
        </div>
        
        <div className="game-board">
          <Deck deck={deck} trump={trump} />
          
          <div className="opponent-section">
            <h3>Противник (AI)</h3>
            <OpponentHand hand={players[1].hand} />
            <div className="hand-count">Карт: {players[1].hand.length}</div>
          </div>
          
          <div className="table-section">
            <h3>Стол</h3>
            <TableDropZone table={table} />
            <div className="table-info">
              Карт на столе: {table.length}
              {table.length > 0 && (
                <span> (Отбито: {table.filter(p => p.defending).length})</span>
              )}
            </div>
          </div>
          
          <div className="player-section">
            <h3>Вы</h3>
            <PlayerHand 
              hand={players[0].hand} 
              onCardClick={handleCardDrop}
              canPlayCard={phase === 'attack' ? canAttackWithCard : null}
              isDefending={phase === 'defense' && turn === 0}
            />
            <div className="hand-count">Карт: {players[0].hand.length}</div>
          </div>
        </div>
        
        <div className="game-footer">
          <GameControls 
            onEndTurn={handleEndTurn} 
            onTake={handleTake}
            canEndTurn={phase === 'attack' && turn === 0 && table.length > 0 && table.every(p => p.defending)}
            canTake={phase === 'defense' && turn === 0}
            isProcessing={isProcessing}
          />
          
          <div className="footer-right">
            <button 
              onClick={handleRestart}
              className="restart-button-small"
            >
              <span className="btn-icon-mini">🔄</span>
              <span>Начать заново</span>
            </button>
            
            <div className="instructions">
              <p><strong>🎮 Как играть:</strong></p>
              <p>1. Атакуйте картой того же ранга, что на столе (или любой, если стол пуст)</p>
              <p>2. Отбивайтесь картой той же масти, но старше, или козырем</p>
              <p>3. Подкидывайте карты того же ранга, что уже на столе</p>
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  );
}