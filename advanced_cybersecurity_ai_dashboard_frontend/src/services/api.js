 // PUBLIC_INTERFACE
 /** API client for REST calls with environment-based base URL. */
 const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

 // PUBLIC_INTERFACE
 export async function apiFetch(path, options = {}) {
   const url = API_BASE_URL ? `${API_BASE_URL}${path}` : path;
   const resp = await fetch(url, {
     headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
     ...options,
   });
   try {
     return await resp.json();
   } catch {
     return {};
   }
 }

 // PUBLIC_INTERFACE
 export function getApiBaseUrl() {
   /** Returns API base URL from environment. */
   return API_BASE_URL;
 }
