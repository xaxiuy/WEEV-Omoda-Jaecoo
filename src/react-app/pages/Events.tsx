import { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Check, Star, Filter, Plus, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '@/react-app/hooks/useAuth';
import { useToast } from '@/react-app/hooks/useToast';
import { ImageUpload } from '@/react-app/components/ImageUpload';
import LoadingSpinner from '@/react-app/components/LoadingSpinner';
import EmptyState from '@/react-app/components/EmptyState';

interface Event {
  id: string;
  brandId: string;
  type: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  city: string | null;
  locationText: string | null;
  startAt: string;
  endAt: string;
  capacity: number | null;
  rsvpCount: number;
  userRsvpStatus: string | null;
  brandName: string;
  brandLogoUrl: string | null;
}

export default function EventsPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming'>('upcoming');
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    type: 'event',
    title: '',
    description: '',
    imageUrl: '',
    city: '',
    locationText: '',
    startAt: '',
    endAt: '',
    capacity: '',
  });

  const isBrandAdmin = user?.role === 'brand_admin' || user?.role === 'superadmin';

  useEffect(() => {
    fetchEvents();
  }, [filter]);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const headers: Record<string, string> = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const params = new URLSearchParams();
      if (filter === 'upcoming') {
        params.set('upcoming', 'true');
      }

      const response = await fetch(`/api/events?${params}`, { headers });
      if (response.ok) {
        const data = await response.json();
        setEvents(data.events);
      }
    } catch (error) {
      console.error('Failed to fetch events', error);
    } finally {
      setLoading(false);
    }
  };

  const rsvp = async (eventId: string, status: 'going' | 'interested' | 'cancelled') => {
    if (!user) {
      toast.info('Inicia sesión para confirmar asistencia');
      return;
    }

    const token = localStorage.getItem('accessToken');
    const response = await fetch(`/api/events/${eventId}/rsvp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });

    if (response.ok) {
      setEvents(events.map(e => e.id === eventId ? {
        ...e,
        userRsvpStatus: status,
        rsvpCount: status === 'going' ? e.rsvpCount + 1 : e.rsvpCount - 1
      } : e));
      
      if (status === 'going') {
        toast.success('¡Asistencia confirmada!');
      } else if (status === 'interested') {
        toast.success('Marcado como interesado');
      }
    } else {
      toast.error('Error al confirmar asistencia');
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-AR', { 
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const token = localStorage.getItem('accessToken');
    const payload = {
      type: formData.type,
      title: formData.title,
      description: formData.description || undefined,
      imageUrl: formData.imageUrl || undefined,
      city: formData.city || undefined,
      locationText: formData.locationText || undefined,
      startAt: formData.startAt,
      endAt: formData.endAt,
      capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
    };

    try {
      const url = editingEvent 
        ? `/api/brand/events/${editingEvent.id}`
        : '/api/brand/events';
      
      const response = await fetch(url, {
        method: editingEvent ? 'PATCH' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setShowModal(false);
        resetForm();
        fetchEvents();
        toast.success(editingEvent ? 'Evento actualizado' : 'Evento creado exitosamente');
      } else {
        toast.error('Error al guardar el evento');
      }
    } catch (error) {
      console.error('Failed to save event', error);
      toast.error('Error al guardar el evento');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este evento?')) return;

    const token = localStorage.getItem('accessToken');
    try {
      const response = await fetch(`/api/brand/events/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        fetchEvents();
        toast.success('Evento eliminado');
      } else {
        toast.error('Error al eliminar el evento');
      }
    } catch (error) {
      console.error('Failed to delete event', error);
      toast.error('Error al eliminar el evento');
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      type: event.type,
      title: event.title,
      description: event.description || '',
      imageUrl: event.imageUrl || '',
      city: event.city || '',
      locationText: event.locationText || '',
      startAt: event.startAt,
      endAt: event.endAt,
      capacity: event.capacity?.toString() || '',
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingEvent(null);
    setFormData({
      type: 'event',
      title: '',
      description: '',
      imageUrl: '',
      city: '',
      locationText: '',
      startAt: '',
      endAt: '',
      capacity: '',
    });
  };

  if (loading) {
    return <LoadingSpinner message="Cargando eventos..." />;
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] pb-20">
      <div className="max-w-6xl mx-auto px-4 pt-6 md:pt-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Eventos</h1>
            <p className="text-gray-600 mt-1">
              {isBrandAdmin ? 'Gestiona eventos y desafíos para tu comunidad' : 'Descubrí experiencias exclusivas'}
            </p>
          </div>

          {isBrandAdmin && (
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="flex items-center gap-2 bg-[#1877F2] hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors shadow-sm active:scale-95"
            >
              <Plus className="w-5 h-5" />
              Crear Evento
            </button>
          )}
        </div>

        {/* Filters - only show for non-admin users */}
        {!isBrandAdmin && (
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center space-x-2 bg-white rounded-xl p-1.5 shadow-sm border border-gray-200 w-fit">
              <button
                onClick={() => setFilter('upcoming')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all font-medium text-sm ${
                  filter === 'upcoming' 
                    ? 'bg-[#1877F2] text-white shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Próximos</span>
              </button>
              <button
                onClick={() => setFilter('all')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all font-medium text-sm ${
                  filter === 'all' 
                    ? 'bg-[#1877F2] text-white shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>Todos</span>
              </button>
            </div>
          </div>
        )}

        {/* Events Grid */}
        <div className="grid md:grid-cols-2 gap-4 md:gap-6">
          {events.map((event) => (
            <div key={event.id} className="bg-white rounded-2xl md:rounded-3xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              {event.imageUrl && (
                <img 
                  src={event.imageUrl} 
                  alt={event.title} 
                  className="w-full h-48 md:h-56 object-cover" 
                />
              )}
              
              <div className="p-5 md:p-6">
                {/* Brand info */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    {event.brandLogoUrl && (
                      <img 
                        src={event.brandLogoUrl} 
                        alt={event.brandName} 
                        className="w-8 h-8 rounded-full object-cover border-2 border-gray-100" 
                      />
                    )}
                    <span className="text-gray-700 font-semibold text-sm">
                      {event.brandName}
                    </span>
                  </div>
                  {event.type === 'service_clinic' && (
                    <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold border border-blue-100">
                      Service
                    </span>
                  )}
                </div>

                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 line-clamp-2">
                  {event.title}
                </h2>
                
                {event.description && (
                  <p className="text-gray-600 mb-4 line-clamp-2 text-sm md:text-base">
                    {event.description}
                  </p>
                )}

                {/* Event details */}
                <div className="space-y-2.5 mb-5">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <div className="w-5 h-5 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-3 h-3 text-purple-600" />
                    </div>
                    <span className="text-sm font-medium">{formatDate(event.startAt)}</span>
                  </div>
                  
                  {event.locationText && (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <div className="w-5 h-5 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-3 h-3 text-green-600" />
                      </div>
                      <span className="text-sm font-medium line-clamp-1">{event.locationText}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2 text-gray-600">
                    <div className="w-5 h-5 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Users className="w-3 h-3 text-amber-600" />
                    </div>
                    <span className="text-sm font-medium">
                      {event.rsvpCount} confirmados
                      {event.capacity && ` • ${event.capacity - event.rsvpCount} lugares`}
                    </span>
                  </div>
                </div>

                {/* RSVP buttons or Admin controls */}
                {isBrandAdmin ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(event)}
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 px-4 py-3 rounded-xl font-semibold transition-all active:scale-95"
                    >
                      <Edit className="w-4 h-4" />
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-xl transition-all active:scale-95"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : user && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => rsvp(event.id, event.userRsvpStatus === 'going' ? 'cancelled' : 'going')}
                      className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all active:scale-95 ${
                        event.userRsvpStatus === 'going'
                          ? 'bg-green-50 text-green-700 border-2 border-green-200'
                          : 'bg-[#1877F2] text-white hover:bg-blue-600 shadow-sm'
                      }`}
                    >
                      {event.userRsvpStatus === 'going' ? (
                        <span className="flex items-center justify-center space-x-2">
                          <Check className="w-4 h-4" />
                          <span>Confirmado</span>
                        </span>
                      ) : (
                        'Confirmar'
                      )}
                    </button>
                    
                    <button
                      onClick={() => rsvp(event.id, event.userRsvpStatus === 'interested' ? 'cancelled' : 'interested')}
                      className={`px-4 py-3 rounded-xl transition-all active:scale-95 ${
                        event.userRsvpStatus === 'interested'
                          ? 'bg-amber-50 text-amber-600 border-2 border-amber-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <Star className={`w-5 h-5 ${event.userRsvpStatus === 'interested' ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {events.length === 0 && (
          <div className="bg-white rounded-2xl md:rounded-3xl border border-gray-200">
            <EmptyState
              icon={Calendar}
              title="No hay eventos disponibles"
              description={isBrandAdmin ? 'Comienza creando tu primer evento o desafío para tu comunidad' : 'Volvé pronto para ver las próximas experiencias exclusivas'}
              iconColor="from-purple-500 to-purple-600"
              action={isBrandAdmin ? {
                label: 'Crear Evento',
                onClick: () => {
                  resetForm();
                  setShowModal(true);
                }
              } : undefined}
            />
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingEvent ? 'Editar Evento' : 'Nuevo Evento'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Tipo de Evento *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500"
                  required
                >
                  <option value="event">Evento General</option>
                  <option value="service_clinic">Service Clinic</option>
                  <option value="test_drive">Test Drive</option>
                  <option value="launch">Lanzamiento</option>
                  <option value="challenge">Desafío</option>
                  <option value="meetup">Meetup</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Título *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500"
                  required
                  placeholder="ej: Test Drive Exclusivo"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500"
                  placeholder="Describe el evento..."
                />
              </div>

              <ImageUpload
                value={formData.imageUrl}
                onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                namespace="events"
                label="Imagen del Evento"
                aspectRatio="16/9"
              />

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Ciudad</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500"
                    placeholder="Buenos Aires"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Capacidad</label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500"
                    placeholder="50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Ubicación</label>
                <input
                  type="text"
                  value={formData.locationText}
                  onChange={(e) => setFormData({ ...formData, locationText: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500"
                  placeholder="Av. Corrientes 1234, CABA"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Fecha y Hora Inicio *</label>
                  <input
                    type="datetime-local"
                    value={formData.startAt}
                    onChange={(e) => setFormData({ ...formData, startAt: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Fecha y Hora Fin *</label>
                  <input
                    type="datetime-local"
                    value={formData.endAt}
                    onChange={(e) => setFormData({ ...formData, endAt: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#1877F2] hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors shadow-sm"
                >
                  {editingEvent ? 'Guardar Cambios' : 'Crear Evento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
