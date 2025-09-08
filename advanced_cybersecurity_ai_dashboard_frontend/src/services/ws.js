 // PUBLIC_INTERFACE
 /** Connect to backend WebSocket or return noop disconnect. */
 export function connectWS(onMessage) {
   const WS_URL = process.env.REACT_APP_WS_URL || '';
   if (!WS_URL) return () => {};
   const ws = new WebSocket(WS_URL);
   ws.onmessage = (e) => {
     try { onMessage(JSON.parse(e.data)); } catch { /* ignore parse errors */ }
   };
   return () => ws.close();
 }
