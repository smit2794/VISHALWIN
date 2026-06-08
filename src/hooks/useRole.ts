import { useState } from'react';
import { UserRole } from'../types';

export const useRole = () => {
 const [role, setRoleState] = useState<UserRole>(() => {
 const saved = localStorage.getItem('renu_role');
 return (saved as UserRole) ||'Admin';
 });

 const setRole = (newRole: UserRole) => {
 setRoleState(newRole);
 localStorage.setItem('renu_role', newRole);
 // Dispatch custom event to notify other components of the change
 window.dispatchEvent(new Event('renu_role_changed'));
 };

 return {
 role,
 setRole,
 isAdmin: role ==='Admin',
 isCoordinator: role ==='Coordinator',
 };
};
export default useRole;
