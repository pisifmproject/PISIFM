// src/packing/packingSocket.service.ts
// Socket.IO integration for real-time packing data updates

import { io } from '../socket';
import * as simulation from './packingSimulation.service';

// Polling interval reference
let pollingInterval: NodeJS.Timeout | null = null;
const POLLING_INTERVAL_MS = 3000; // 3 seconds - match simulation tick

/**
 * Room name for packing machine
 */
export function packingRoomFor(machineId: string): string {
  return `packing:${machineId.toLowerCase()}`;
}

/**
 * Broadcast state update for a specific machine
 */
function broadcastMachineState(machineId: string): void {
  const state = simulation.getMachineState(machineId);
  if (!state) return;

  const room = packingRoomFor(machineId);
  io().to(room).emit('packing:update', {
    machine_id: machineId,
    data: state,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Broadcast state updates for all machines
 */
function broadcastAllMachineStates(): void {
  const machineIds = simulation.getAvailableMachineIds();
  for (const machineId of machineIds) {
    broadcastMachineState(machineId);
  }
}

/**
 * Start polling and broadcasting packing data
 */
export function startPackingPolling(): void {
  if (pollingInterval) {
    console.log('[PackingSocket] Polling already running');
    return;
  }

  pollingInterval = setInterval(broadcastAllMachineStates, POLLING_INTERVAL_MS);
  console.log(`[PackingSocket] Started polling (every ${POLLING_INTERVAL_MS}ms)`);
}

/**
 * Stop polling
 */
export function stopPackingPolling(): void {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
    console.log('[PackingSocket] Stopped polling');
  }
}

/**
 * Initialize packing socket handlers
 */
export function initPackingSocketHandlers(): void {
  const ioInstance = io();

  ioInstance.on('connection', (socket) => {
    // Client joins a packing machine room
    socket.on('packing:join', ({ machineId }: { machineId: string }) => {
      const room = packingRoomFor(machineId);
      socket.join(room);
      socket.emit('packing:joined', { room, machineId });
      console.log(`[PackingSocket] ${socket.id} joined ${room}`);

      // Send initial state immediately
      const state = simulation.getMachineState(machineId);
      if (state) {
        socket.emit('packing:update', {
          machine_id: machineId,
          data: state,
          timestamp: new Date().toISOString(),
        });
      }
    });

    // Client leaves a packing machine room
    socket.on('packing:leave', ({ machineId }: { machineId: string }) => {
      const room = packingRoomFor(machineId);
      socket.leave(room);
      socket.emit('packing:left', { room, machineId });
      console.log(`[PackingSocket] ${socket.id} left ${room}`);
    });

    // Client requests current state
    socket.on('packing:getState', ({ machineId }: { machineId: string }) => {
      const state = simulation.getMachineState(machineId);
      socket.emit('packing:state', {
        machine_id: machineId,
        data: state || null,
        timestamp: new Date().toISOString(),
      });
    });

    // Client requests list of machines
    socket.on('packing:getMachines', () => {
      const machineIds = simulation.getAvailableMachineIds();
      socket.emit('packing:machines', {
        machines: machineIds,
        timestamp: new Date().toISOString(),
      });
    });
  });

  console.log('[PackingSocket] Socket handlers initialized');
}
