import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, List, BarChart3, Settings, Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin } = useAdmin();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <img src="/logo.svg" alt="ProdFisco Logo" className="w-16 h-16" />
        <div>
          <h1 className="text-3xl font-bold">Bem-vindo ao ProdFisco</h1>
          <p className="text-muted-foreground">Olá, {user?.email}! Gerencie seus registros de produtividade fiscal.</p>
        </div>
      </div>

  {/* Cards removidos conforme solicitação */}

  {/* Card 'Como usar o sistema' removido conforme solicitação */}
    </div>
  );
};

export default Index;
