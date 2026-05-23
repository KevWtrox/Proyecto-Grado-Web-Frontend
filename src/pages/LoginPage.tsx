import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { login, logout } from '@/features/auth/services/auth.service';
import { useUserStore } from '@/core/store/userStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock } from 'lucide-react';

const loginSchema = z.object({
  correo: z.email('Ingresa un correo válido'),
  contrasena: z.string().min(1, 'La contraseña es requerida'),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginPage() {
  const setUser = useUserStore((s) => s.setUser);
  const navigate = useNavigate();
  const [showAccesoDenegado, setShowAccesoDenegado] = useState(false);

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { correo: '', contrasena: '' },
  });

  const mutation = useMutation({
    mutationFn: ({ correo, contrasena }: LoginForm) => login(correo, contrasena),
    onSuccess: (data) => {
      const rolesPermitidos = ['admin', 'docente'];
      if (!rolesPermitidos.includes(data.user.rol)) {
        logout();
        setShowAccesoDenegado(true);
        return;
      }
      setUser(data.user);
      toast.success('Bienvenido');
      navigate('/dashboard');
    },
    onError: () => toast.error('Credenciales incorrectas'),
  });

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #1a2820 0%, #3d4d44 50%, #2c3d34 100%)' }}
    >
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap"
      />

      {/* Card split en dos */}
      <div className="flex w-full max-w-[900px] rounded-2xl overflow-hidden shadow-2xl min-h-[520px]">

        {/* Panel izquierdo — imagen + mensaje */}
        <div
          className="hidden md:flex relative w-[45%] flex-col"
          style={{
            backgroundImage: "url('/img/CoplumuWallpaperLogin.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-[#1a2820]/65" />
          <div className="relative z-10 flex flex-col items-center justify-center h-full px-10 text-center gap-6">
            <h2 className="text-3xl font-bold text-white leading-snug">
              Bienvenido de nuevo
            </h2>
            <p
              className="text-[1.45rem] text-[#d4e8da] leading-relaxed"
              style={{ fontFamily: "'Great Vibes', cursive" }}
            >
              "La música es el lenguaje del alma,<br />
              habla donde las palabras callan."
            </p>
          </div>
        </div>

        {/* Panel derecho — formulario */}
        <div className="flex-1 flex flex-col px-10 py-10" style={{ background: '#2a3832' }}>

          {/* Logo + título */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-md" style={{ background: '#232e28' }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" style={{ color: '#D4A574' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
            <p className="text-xs font-medium uppercase tracking-widest" style={{ color: '#C5C5BD' }}>
              Sistema de Administración
            </p>
            <h1 className="text-4xl font-extrabold tracking-[0.2em] mt-1" style={{ color: '#D4A574' }}>
              TÓNICA
            </h1>
            <p className="text-xs mt-2 text-center" style={{ color: '#C5C5BD' }}>
              Conservatorio Plurinacional de Música
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-4 flex-1">
            <div>
              <label className="text-sm font-medium mb-1 block" style={{ color: '#C5C5BD' }}>Correo electrónico</label>
              <Input
                type="email"
                placeholder="usuario@conservatorio.edu.bo"
                className="border-[#3d4d44] text-[#F5F5F2] placeholder:text-[#C5C5BD]/50"
                style={{ background: '#232e28' }}
                {...form.register('correo')}
              />
              {form.formState.errors.correo && (
                <p className="text-xs text-red-400 mt-1">{form.formState.errors.correo.message}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block" style={{ color: '#C5C5BD' }}>Contraseña</label>
              <Input
                type="password"
                placeholder="••••••••"
                className="border-[#3d4d44] text-[#F5F5F2] placeholder:text-[#C5C5BD]/50"
                style={{ background: '#232e28' }}
                {...form.register('contrasena')}
              />
              {form.formState.errors.contrasena && (
                <p className="text-xs text-red-400 mt-1">{form.formState.errors.contrasena.message}</p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full h-11 text-sm font-semibold tracking-wide mt-2 hover:opacity-90 transition-opacity"
              style={{ background: '#D4A574', color: '#1a1f1c' }}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? 'Ingresando...' : <><Lock className="w-4 h-4 mr-2" />Iniciar sesión</>}
            </Button>
          </form>

          {/* Footer */}
          <p className="text-center text-[11px] mt-8" style={{ color: '#3d4d44' }}>
            Proyecto de grado desarrollado por Kevin Torrez · 2026
          </p>
        </div>
      </div>

      {/* Modal acceso denegado */}
      {showAccesoDenegado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-[380px] p-6 flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Acceso denegado</h2>
            <p className="text-sm text-center text-gray-500">
              Tu cuenta no tiene permisos para acceder a este panel.<br />
              Solo los usuarios con rol <span className="font-medium text-[#3d4d44]">Administrador</span> o <span className="font-medium text-[#3d4d44]">Docente</span> pueden ingresar.
            </p>
            <Button
              className="w-full bg-[#3d4d44] hover:bg-[#2c3d34] text-white mt-2"
              onClick={() => setShowAccesoDenegado(false)}
            >
              Entendido
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
