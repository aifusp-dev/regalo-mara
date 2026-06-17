import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL;

export const socket = SOCKET_URL
  ? io(SOCKET_URL, { autoConnect: false })
  : io({ autoConnect: false });
