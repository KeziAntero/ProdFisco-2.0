import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { addAdminUser } from '@/utils/addAdminUser';

export default function SetupAdmin() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleCreateAdmin = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const response = await addAdminUser();
      
      if (response.success) {
        setResult({
          success: true,
          message: 'Usuário administrador criado com sucesso! Email: adm@fiscal.com, Senha: admin123'
        });
      } else {
        setResult({
          success: false,
          message: `Erro: ${response.error}`
        });
      }
    } catch (error: any) {
      setResult({
        success: false,
        message: `Erro: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Setup Administrador</CardTitle>
          <CardDescription>
            Criar usuário administrador no sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">Dados do Administrador:</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Email: adm@fiscal.com</li>
              <li>• Matrícula: 0101</li>
              <li>• Senha: admin123</li>
            </ul>
          </div>

          <Button 
            onClick={handleCreateAdmin} 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Criando usuário...' : 'Criar Usuário Administrador'}
          </Button>

          {result && (
            <div className={`p-3 rounded-lg text-sm ${
              result.success 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {result.message}
            </div>
          )}

          <div className="text-xs text-muted-foreground text-center">
            <p>Execute esta operação apenas uma vez.</p>
            <p>Após criar o usuário, você pode fazer login com as credenciais acima.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
