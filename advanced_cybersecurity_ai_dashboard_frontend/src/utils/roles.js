 // PUBLIC_INTERFACE
 /** Check if role is permitted for resource */
 export function canAccess(userRole, allowed = []) {
   if (!allowed || allowed.length === 0) return true;
   return allowed.includes(userRole);
 }
