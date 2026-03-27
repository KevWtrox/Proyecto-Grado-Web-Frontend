import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { login } from '@/lib/auth';
import { useUserStore } from '@/lib/userStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const loginSchema = z.object({
  correo: z.string().email('Ingresa un correo válido'),
  contrasena: z.string().min(1, 'La contraseña es requerida'),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginPage() {
  const setUser = useUserStore((s) => s.setUser);
  const navigate = useNavigate();
  
  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { correo: '', contrasena: '' },
  });

  const mutation = useMutation({
    mutationFn: ({ correo, contrasena }: LoginForm) => login(correo, contrasena),
    onSuccess: (data) => {
      setUser(data.user);
      toast.success('Bienvenido');
      navigate('/dashboard');
    },
    onError: () => toast.error('Credenciales incorrectas'),
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f0e6]">
      <Card className="w-[350px] shadow-xl border-0">
        <CardHeader className="space-y-1 pb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#2d5a3d] flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-[#f5f0e6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </div>
          <CardTitle className="text-2xl text-center text-[#2d5a3d]">Conservatorio Plurinacional de Musica</CardTitle>
          <p className="text-sm text-center text-muted-foreground">Ingresa tus credenciales</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
            <div className="space-y-2">
              <Input 
                type="email" 
                placeholder="Correo electrónico" 
                className="bg-[#f5f0e6] border-[#c4b896]"
                {...form.register('correo')} 
              />
            </div>
            <div className="space-y-2">
              <Input 
                type="password" 
                placeholder="Contraseña" 
                className="bg-[#f5f0e6] border-[#c4b896]"
                {...form.register('contrasena')} 
              />
            </div>
            <Button type="submit" className="w-full bg-[#2d5a3d] hover:bg-[#1e3d29] text-[#f5f0e6]" disabled={mutation.isPending}>
              {mutation.isPending ? 'Ingresando...' : 'Entrar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
