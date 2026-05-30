import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Check, X, Mail, Calendar, UserPlus, IdCard } from 'lucide-react';
import { MainLayout as Layout } from '@/layouts/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  getSolicitudes,
  aprobarSolicitud,
  rechazarSolicitud,
} from '@/features/usuarios/services/usuarios.service';
import type { Usuario } from '@/features/usuarios/types/usuarios.types';

type AccionConfirmar = 'aprobar' | 'rechazar' | null;

function paraleloLabel(p?: number): string {
  if (p == null) return '—';
  // Convención: 1→A, 2→B, 3→C, ...
  return String.fromCharCode(64 + p);
}

function iniciales(nombre: string, apellido: string): string {
  return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
}

function formatoFecha(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('es-BO');
  } catch {
    return iso;
  }
}

export function SolicitudesPage() {
  const queryClient = useQueryClient();

  const [confirmar, setConfirmar] = useState<{ accion: AccionConfirmar; usuario: Usuario | null }>({
    accion: null,
    usuario: null,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['solicitudes'],
    queryFn: () => getSolicitudes(1, 100),
  });

  const aprobarMut = useMutation({
    mutationFn: (id: string) => aprobarSolicitud(id),
    onSuccess: (u) => {
      queryClient.invalidateQueries({ queryKey: ['solicitudes'] });
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      toast.success(`${u.nombre} ${u.apellido} fue aprobado`);
      setConfirmar({ accion: null, usuario: null });
    },
    onError: () => toast.error('Error al aprobar la solicitud'),
  });

  const rechazarMut = useMutation({
    mutationFn: (id: string) => rechazarSolicitud(id),
    onSuccess: (u) => {
      queryClient.invalidateQueries({ queryKey: ['solicitudes'] });
      toast.success(`${u.nombre} ${u.apellido} fue rechazado`);
      setConfirmar({ accion: null, usuario: null });
    },
    onError: () => toast.error('Error al rechazar la solicitud'),
  });

  const solicitudes = data?.datos ?? [];
  const totalPendientes = data?.total ?? 0;

  return (
    <Layout>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Solicitudes de Incorporación</h1>
          <p className="text-sm text-muted-foreground mt-1">Gestión de nuevas solicitudes de estudiantes</p>
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20">
          <UserPlus className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">
            {totalPendientes} {totalPendientes === 1 ? 'solicitud pendiente' : 'solicitudes pendientes'}
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border-0 shadow-lg animate-pulse">
              <CardContent className="p-6 space-y-4">
                <div className="flex gap-4">
                  <div className="w-14 h-14 rounded-full bg-secondary" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-secondary rounded w-2/3" />
                    <div className="h-3 bg-secondary rounded w-full" />
                    <div className="h-3 bg-secondary rounded w-1/2" />
                  </div>
                </div>
                <div className="h-20 bg-secondary rounded" />
                <div className="flex gap-2">
                  <div className="h-9 bg-secondary rounded flex-1" />
                  <div className="h-9 bg-secondary rounded flex-1" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : solicitudes.length === 0 ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="py-16 text-center">
            <UserPlus className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
            <p className="text-muted-foreground">No hay solicitudes pendientes</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {solicitudes.map((u) => (
            <Card key={u.id} className="border-0 shadow-lg overflow-hidden">
              <CardContent className="p-6">
                {/* Cabecera */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-base font-bold text-primary shrink-0">
                    {iniciales(u.nombre, u.apellido)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-semibold text-foreground truncate">
                      {u.nombre} {u.apellido}
                    </h2>
                    <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5 truncate">
                      <Mail className="w-3.5 h-3.5 shrink-0" /> {u.correo}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
                      {u.ci && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-border bg-secondary/40 text-foreground">
                          <IdCard className="w-3 h-3" /> CI {u.ci}
                        </span>
                      )}
                      {u.paralelo != null && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-primary/30 bg-primary/10 text-primary font-medium">
                          Paralelo {paraleloLabel(u.paralelo)}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-muted-foreground">
                        <Calendar className="w-3 h-3" /> {formatoFecha(u.fecha_registro)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Mensaje */}
                <div className="mb-4">
                  <p className="text-xs font-medium text-muted-foreground mb-1.5">Mensaje:</p>
                  <div className="text-sm text-foreground bg-secondary/40 rounded-md p-3 border border-border min-h-[64px]">
                    {u.motivo_registro || <span className="italic text-muted-foreground">Sin mensaje</span>}
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex gap-2">
                  <Button
                    className="flex-1 bg-primary hover:opacity-90 text-primary-foreground"
                    onClick={() => setConfirmar({ accion: 'aprobar', usuario: u })}
                    disabled={aprobarMut.isPending || rechazarMut.isPending}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Aceptar
                  </Button>
                  <Button
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => setConfirmar({ accion: 'rechazar', usuario: u })}
                    disabled={aprobarMut.isPending || rechazarMut.isPending}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Rechazar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de confirmación */}
      {confirmar.accion && confirmar.usuario && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-foreground">
                {confirmar.accion === 'aprobar' ? 'Aprobar solicitud' : 'Rechazar solicitud'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">
                {confirmar.accion === 'aprobar' ? (
                  <>
                    ¿Aprobar la solicitud de <strong>{confirmar.usuario.nombre} {confirmar.usuario.apellido}</strong>?
                    El estudiante podrá iniciar sesión inmediatamente.
                  </>
                ) : (
                  <>
                    ¿Rechazar la solicitud de <strong>{confirmar.usuario.nombre} {confirmar.usuario.apellido}</strong>?
                    El estudiante no podrá iniciar sesión.
                  </>
                )}
              </p>
              <div className="flex gap-2">
                <Button
                  className={`flex-1 ${
                    confirmar.accion === 'aprobar'
                      ? 'bg-primary text-primary-foreground hover:opacity-90'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                  onClick={() => {
                    if (!confirmar.usuario) return;
                    if (confirmar.accion === 'aprobar') {
                      aprobarMut.mutate(confirmar.usuario.id);
                    } else {
                      rechazarMut.mutate(confirmar.usuario.id);
                    }
                  }}
                  disabled={aprobarMut.isPending || rechazarMut.isPending}
                >
                  {aprobarMut.isPending || rechazarMut.isPending
                    ? 'Procesando...'
                    : confirmar.accion === 'aprobar'
                    ? 'Aprobar'
                    : 'Rechazar'}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setConfirmar({ accion: null, usuario: null })}
                  disabled={aprobarMut.isPending || rechazarMut.isPending}
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Layout>
  );
}
