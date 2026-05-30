import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getUsuarios, actualizarUsuario, eliminarUsuario, crearUsuario } from '@/features/usuarios/services/usuarios.service';
import type { ActualizarUsuarioRequest, CrearUsuarioRequest } from '@/features/usuarios/types/usuarios.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Usuario } from '@/features/usuarios/types/usuarios.types';
import { MainLayout as Layout } from '@/layouts/MainLayout';

const MOCK_MODE = false;

const MENCIONES = [
  'Bajo Eléctrico',
  'Batería',
  'Guitarra Acústica',
  'Guitarra Eléctrica',
  'Percusión Moderna',
  'Piano Moderno',
  'Saxofón Moderno',
  'Trompeta Moderna',
  'Canto Moderno',
] as const;

type FormDataType = Partial<Usuario> & { contrasena?: string };

const mockUsuarios = {
  total: 5,
  pagina: 1,
  limite: 20,
  datos: [
    { id: '1', nombre: 'Kevin', apellido: 'Torrez', correo: 'kevin@example.com', rol: 'admin', mencion: 'Bateria Moderna', paralelo: 1, fecha_registro: '2026-03-27', activo: true },
    { id: '2', nombre: 'Maria', apellido: 'Garcia', correo: 'maria@example.com', rol: 'estudiante', mencion: 'Piano', paralelo: 2, fecha_registro: '2026-03-26', activo: true },
    { id: '3', nombre: 'Juan', apellido: 'Perez', correo: 'juan@example.com', rol: 'estudiante', mencion: 'Guitarra', paralelo: 1, fecha_registro: '2026-03-25', activo: true },
    { id: '4', nombre: 'Ana', apellido: 'Lopez', correo: 'ana@example.com', rol: 'estudiante', mencion: 'Violín', paralelo: 3, fecha_registro: '2026-03-24', activo: false },
    { id: '5', nombre: 'Carlos', apellido: 'Ruiz', correo: 'carlos@example.com', rol: 'estudiante', mención: 'Batería', paralelo: 2, fecha_registro: '2026-03-23', activo: true },
  ] as Usuario[]
};

type ModalType = 'ver' | 'editar' | 'crear' | 'eliminar' | null;

export function EstudiantesPage() {
  const queryClient = useQueryClient();
  
  const [pagina, setPagina] = useState(1);
  const [filtroRol, setFiltroRol] = useState<string | null>(null);
  const [filtroActivo, setFiltroActivo] = useState<boolean | null>(null);
  const [modal, setModal] = useState<ModalType>(null);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null);
  const [formData, setFormData] = useState<FormDataType>({});

  const { data, isLoading } = useQuery({
    queryKey: ['usuarios', pagina, filtroRol, filtroActivo],
    queryFn: async () => {
      if (MOCK_MODE) {
        await new Promise(r => setTimeout(r, 500));
        return mockUsuarios;
      }
      return getUsuarios(pagina, 20, filtroRol, filtroActivo);
    },
  });

  const actualizarMutate = useMutation({
    mutationFn: ({ id, datos }: { id: string; datos: ActualizarUsuarioRequest }) =>
      actualizarUsuario(id, datos),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      toast.success('Usuario actualizado correctamente');
      setModal(null);
      setUsuarioSeleccionado(null);
    },
    onError: () => toast.error('Error al actualizar usuario'),
  });

  const eliminarMutate = useMutation({
    mutationFn: (id: string) => eliminarUsuario(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      toast.success('Usuario eliminado correctamente');
      setModal(null);
      setUsuarioSeleccionado(null);
    },
    onError: () => toast.error('Error al eliminar usuario'),
  });

  const crearMutate = useMutation({
    mutationFn: (datos: CrearUsuarioRequest) => crearUsuario(datos),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      toast.success('Usuario creado correctamente');
      setModal(null);
      setFormData({});
    },
    onError: () => toast.error('Error al crear usuario'),
  });

  const totalPaginas = data ? Math.ceil(data.total / data.limite) : 1;

  const handleVer = (usuario: Usuario) => {
    setUsuarioSeleccionado(usuario);
    setModal('ver');
  };

  const handleEditar = (usuario: Usuario) => {
    setUsuarioSeleccionado(usuario);
    setFormData({
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      mencion: usuario.mencion,
      paralelo: usuario.paralelo,
      activo: usuario.activo,
    });
    setModal('editar');
  };

  const handleEliminar = (usuario: Usuario) => {
    setUsuarioSeleccionado(usuario);
    setModal('eliminar');
  };

  const handleCrear = () => {
    setFormData({});
    setModal('crear');
  };

  const guardarEditar = () => {
    if (!usuarioSeleccionado) return;
    actualizarMutate.mutate({
      id: usuarioSeleccionado.id,
      datos: {
        nombre: formData.nombre,
        apellido: formData.apellido,
        mencion: formData.mencion,
        paralelo: formData.paralelo,
        activo: formData.activo,
      },
    });
  };

  const guardarCrear = () => {
    if (!formData.nombre || !formData.apellido || !formData.correo || !formData.contrasena || !formData.rol || !formData.genero) {
      toast.error('Todos los campos obligatorios deben completarse');
      return;
    }
    crearMutate.mutate({
      nombre: formData.nombre,
      apellido: formData.apellido,
      correo: formData.correo,
      contrasena: formData.contrasena,
      rol: formData.rol,
      genero: formData.genero,
      mencion: formData.mencion,
      paralelo: formData.paralelo,
    });
  };

  return (
    <Layout>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-foreground">Lista de Estudiantes</h1>
          <Button 
            onClick={handleCrear}
            className="bg-primary hover:opacity-90 text-primary-foreground"
          >
            + Nuevo Usuario
          </Button>
        </div>

        <Card className="border-0 shadow-lg mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Rol</label>
                <select
                  className="w-full p-2 border rounded-md bg-input-background text-foreground border-border"
                  value={filtroRol ?? ''}
                  onChange={(e) => {
                    setFiltroRol(e.target.value || null);
                    setPagina(1);
                  }}
                >
                  <option value="">Todos</option>
                  <option value="admin">Admin</option>
                  <option value="docente">Docente</option>
                  <option value="estudiante">Estudiante</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Estado</label>
                <select
                  className="w-full p-2 border rounded-md bg-input-background text-foreground border-border"
                  value={filtroActivo === null ? '' : filtroActivo.toString()}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFiltroActivo(val === '' ? null : val === 'true');
                    setPagina(1);
                  }}
                >
                  <option value="">Todos</option>
                  <option value="true">Activo</option>
                  <option value="false">Inactivo</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary">
                  <tr>
                    <th className="text-left p-4 font-medium text-foreground">Nombre</th>
                    <th className="text-left p-4 font-medium text-foreground">Apellido</th>
                    <th className="text-left p-4 font-medium text-foreground">Correo</th>
                    <th className="text-left p-4 font-medium text-foreground">Rol</th>
                    <th className="text-left p-4 font-medium text-foreground">Mención</th>
                    <th className="text-left p-4 font-medium text-foreground">Paralelo</th>
                    <th className="text-left p-4 font-medium text-foreground">Estado</th>
                    <th className="text-left p-4 font-medium text-foreground">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr><td colSpan={8} className="p-8 text-center">Cargando...</td></tr>
                  ) : data?.datos.length === 0 ? (
                    <tr><td colSpan={8} className="p-8 text-center">No hay usuarios</td></tr>
                  ) : (
                    data?.datos.map((usuario) => (
                      <tr key={usuario.id} className="border-t border-border hover:bg-secondary/50">
                        <td className="p-4">{usuario.nombre}</td>
                        <td className="p-4">{usuario.apellido}</td>
                        <td className="p-4">{usuario.correo}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-xs ${
                            usuario.rol === 'admin' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                          }`}>
                            {usuario.rol}
                          </span>
                        </td>
                        <td className="p-4">{usuario.mencion || '-'}</td>
                        <td className="p-4">{usuario.paralelo || '-'}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-xs ${
                            usuario.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {usuario.activo ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleVer(usuario)}
                              className="border-border text-foreground"
                            >
                              Ver
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditar(usuario)}
                              className="border-border text-foreground"
                            >
                              Editar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEliminar(usuario)}
                              className="border-red-300 text-red-600 hover:bg-red-50"
                            >
                              Eliminar
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between p-4 border-t border-border">
              <span className="text-sm text-muted-foreground">
                Página {pagina} de {totalPaginas} ({data?.total || 0} usuarios)
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={pagina <= 1}
                  onClick={() => setPagina(p => p - 1)}
                  className="border-border text-foreground"
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  disabled={pagina >= totalPaginas}
                  onClick={() => setPagina(p => p + 1)}
                  className="border-border text-foreground"
                >
                  Siguiente
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {modal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-[500px] max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle className="text-foreground">
                  {modal === 'ver' && 'Detalles del Usuario'}
                  {modal === 'editar' && 'Editar Usuario'}
                  {modal === 'crear' && 'Crear Usuario'}
                  {modal === 'eliminar' && 'Confirmar Eliminación'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {modal === 'ver' && usuarioSeleccionado && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div><p className="text-sm text-muted-foreground">ID</p><p className="font-mono text-xs">{usuarioSeleccionado.id}</p></div>
                      <div><p className="text-sm text-muted-foreground">Nombre</p><p>{usuarioSeleccionado.nombre}</p></div>
                      <div><p className="text-sm text-muted-foreground">Apellido</p><p>{usuarioSeleccionado.apellido}</p></div>
                      <div><p className="text-sm text-muted-foreground">Correo</p><p>{usuarioSeleccionado.correo}</p></div>
                      <div><p className="text-sm text-muted-foreground">Rol</p><p>{usuarioSeleccionado.rol}</p></div>
                      <div><p className="text-sm text-muted-foreground">Género</p><p>{usuarioSeleccionado.genero === 'M' ? 'Masculino' : usuarioSeleccionado.genero === 'F' ? 'Femenino' : '-'}</p></div>
                      <div><p className="text-sm text-muted-foreground">Mención</p><p>{usuarioSeleccionado.mencion || '-'}</p></div>
                      <div><p className="text-sm text-muted-foreground">Paralelo</p><p>{usuarioSeleccionado.paralelo || '-'}</p></div>
                      <div><p className="text-sm text-muted-foreground">Fecha Registro</p><p>{new Date(usuarioSeleccionado.fecha_registro).toLocaleDateString()}</p></div>
                      <div><p className="text-sm text-muted-foreground">Estado</p><span className={`px-2 py-1 rounded text-xs ${usuarioSeleccionado.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{usuarioSeleccionado.activo ? 'Activo' : 'Inactivo'}</span></div>
                    </div>
                    <Button onClick={() => setModal(null)} className="w-full mt-4 bg-primary text-primary-foreground">Cerrar</Button>
                  </div>
                )}

                {modal === 'editar' && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Nombre</label>
                      <Input value={formData.nombre || ''} onChange={(e) => setFormData({...formData, nombre: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Apellido</label>
                      <Input value={formData.apellido || ''} onChange={(e) => setFormData({...formData, apellido: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Mención</label>
                      <select
                        className="w-full p-2 border rounded-md bg-input-background text-foreground border-border"
                        value={formData.mencion || ''}
                        onChange={(e) => setFormData({...formData, mencion: e.target.value || undefined})}
                      >
                        <option value="">Sin mención</option>
                        {MENCIONES.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Paralelo</label>
                      <Input type="number" value={formData.paralelo || ''} onChange={(e) => setFormData({...formData, paralelo: parseInt(e.target.value)})} />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Activo</label>
                      <select className="w-full p-2 border rounded-md bg-input-background text-foreground border-border" value={formData.activo?.toString() || 'true'} onChange={(e) => setFormData({...formData, activo: e.target.value === 'true'})}>
                        <option value="true">Activo</option>
                        <option value="false">Inactivo</option>
                      </select>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button onClick={guardarEditar} className="flex-1 bg-primary text-primary-foreground" disabled={actualizarMutate.isPending}>
                        {actualizarMutate.isPending ? 'Guardando...' : 'Guardar'}
                      </Button>
                      <Button onClick={() => setModal(null)} variant="outline" className="flex-1">Cancelar</Button>
                    </div>
                  </div>
                )}

                {modal === 'crear' && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Nombre *</label>
                      <Input value={formData.nombre || ''} onChange={(e) => setFormData({...formData, nombre: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Apellido *</label>
                      <Input value={formData.apellido || ''} onChange={(e) => setFormData({...formData, apellido: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Correo *</label>
                      <Input type="email" value={formData.correo || ''} onChange={(e) => setFormData({...formData, correo: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Contraseña *</label>
                      <Input type="password" value={formData.contrasena || ''} onChange={(e) => setFormData({...formData, contrasena: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-1 block">Rol *</label>
                        <select className="w-full p-2 border rounded-md bg-input-background text-foreground border-border" value={formData.rol || ''} onChange={(e) => setFormData({...formData, rol: e.target.value})}>
                          <option value="">Seleccionar rol</option>
                          <option value="admin">Admin</option>
                          <option value="docente">Docente</option>
                          <option value="estudiante">Estudiante</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Género *</label>
                        <select className="w-full p-2 border rounded-md bg-input-background text-foreground border-border" value={formData.genero || ''} onChange={(e) => setFormData({...formData, genero: (e.target.value || undefined) as 'M' | 'F' | undefined})}>
                          <option value="">Seleccionar</option>
                          <option value="M">Masculino</option>
                          <option value="F">Femenino</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Mención</label>
                      <select
                        className="w-full p-2 border rounded-md bg-input-background text-foreground border-border"
                        value={formData.mencion || ''}
                        onChange={(e) => setFormData({...formData, mencion: e.target.value || undefined})}
                      >
                        <option value="">Sin mención</option>
                        {MENCIONES.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Paralelo</label>
                      <Input type="number" value={formData.paralelo || ''} onChange={(e) => setFormData({...formData, paralelo: parseInt(e.target.value)})} />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button onClick={guardarCrear} className="flex-1 bg-primary text-primary-foreground" disabled={crearMutate.isPending}>
                        {crearMutate.isPending ? 'Creando...' : 'Crear'}
                      </Button>
                      <Button onClick={() => setModal(null)} variant="outline" className="flex-1">Cancelar</Button>
                    </div>
                  </div>
                )}

                {modal === 'eliminar' && usuarioSeleccionado && (
                  <div className="text-center">
                    <p className="mb-4">¿Estás seguro de eliminar al usuario <strong>{usuarioSeleccionado.nombre} {usuarioSeleccionado.apellido}</strong>?</p>
                    <p className="text-sm text-muted-foreground mb-4">Esta acción es un soft-delete, el usuario será marcado como inactivo.</p>
                    <div className="flex gap-2">
                      <Button onClick={() => eliminarMutate.mutate(usuarioSeleccionado.id)} className="flex-1 bg-red-600 text-white hover:bg-red-700" disabled={eliminarMutate.isPending}>
                        {eliminarMutate.isPending ? 'Eliminando...' : 'Eliminar'}
                      </Button>
                      <Button onClick={() => setModal(null)} variant="outline" className="flex-1">Cancelar</Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
    </Layout>
  );
}
