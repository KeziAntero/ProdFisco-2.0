import { useAuth } from './useAuth';

export function useAdmin() {
  const { user } = useAuth();
  
  // Apenas o e-mail 'adm@fiscal.com' é considerado administrador
  const isAdmin = user?.email === 'adm@fiscal.com';
  
  return {
    isAdmin,
    adminEmails: ['adm@fiscal.com']
  };
}
