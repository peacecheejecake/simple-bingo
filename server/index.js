import { createServer } from 'node:http';
import { Server } from 'socket.io';

const PORT = Number(process.env.LIVE_DRAW_PORT ?? 3001);
const DRAW_DURATION_MS = 2400;
const MAX_HISTORY = 5;

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: '*',
  },
});

const state = {
  isDrawing: false,
  selected: '',
  history: [],
  candidates: [],
};

const normalizeCandidates = (items) => {
  if (!Array.isArray(items)) return [];
  return items.map((item) => String(item).trim()).filter(Boolean);
};

const pickRandomItem = (items, current) => {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];

  let next = items[Math.floor(Math.random() * items.length)];
  while (next === current) {
    next = items[Math.floor(Math.random() * items.length)];
  }
  return next;
};

const emitState = () => {
  io.emit('draw:state', state);
};

io.on('connection', (socket) => {
  socket.emit('draw:state', state);

  socket.on('draw:setCandidates', (items) => {
    const candidates = normalizeCandidates(items);
    if (candidates.length === 0) return;

    state.candidates = candidates;
    emitState();
  });

  socket.on('draw:start', (items) => {
    if (state.isDrawing) return;

    const candidates = normalizeCandidates(items);
    if (candidates.length > 0) {
      state.candidates = candidates;
    }
    if (state.candidates.length === 0) return;

    state.isDrawing = true;
    state.selected = '';
    emitState();

    setTimeout(() => {
      const winner = pickRandomItem(state.candidates, state.history[0]);
      state.isDrawing = false;
      state.selected = winner;
      state.history = [winner, ...state.history].slice(0, MAX_HISTORY);
      emitState();
    }, DRAW_DURATION_MS);
  });
});

httpServer.listen(PORT, '127.0.0.1', () => {
  console.log(`Live draw server listening on http://localhost:${PORT}`);
});
