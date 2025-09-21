"use client";

import { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import esLocale from "@fullcalendar/core/locales/es";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "app/components/ui/dialog";
import { Button } from "app/components/ui/button";
import { Input } from "app/components/ui/input";
import { Label } from "app/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "app/components/ui/select";
import { Plus, Trash } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

// Datos de ejemplo para los cursos y los eventos
const courses = [
    { id: '1', name: 'Matemáticas', color: '#B3E5FC' },
    { id: '2', name: 'Física', color: '#FFCCBC' },
    { id: '3', name: 'Historia', color: '#C8E6C9' },
    { id: '4', name: 'Química', color: '#FFE0B2' },
];

// Eventos de ejemplo con un nuevo campo `isEditable`
const initialEvents = [
    { id: 'ev1', title: 'Taller de Álgebra', start: '2025-09-20', courseId: '1', backgroundColor: '#B3E5FC', borderColor: '#B3E5FC', isEditable: false },
    { id: 'ev2', title: 'Examen de Leyes de Newton', start: '2025-09-25', courseId: '2', backgroundColor: '#FFCCBC', borderColor: '#FFCCBC', isEditable: false },
    { id: 'ev3', title: 'Debate sobre la I Guerra Mundial', start: '2025-10-05', courseId: '3', backgroundColor: '#C8E6C9', borderColor: '#C8E6C9', isEditable: false },
    { id: 'ev4', title: 'Examen de Nomenclatura', start: '2025-10-10', courseId: '4', backgroundColor: '#FFE0B2', borderColor: '#FFE0B2', isEditable: false },
];

export function EventCalendar() {
    const [events, setEvents] = useState(initialEvents);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedCourseFilter, setSelectedCourseFilter] = useState("all");

    const filteredEvents = events.filter(event => 
        selectedCourseFilter === "all" || event.courseId === selectedCourseFilter
    );

    const handleDateClick = (info) => {
        setSelectedDate(info.dateStr);
        setEditingEvent(null);
        setIsDialogOpen(true);
    };

    const handleEventClick = (info) => {
        const event = info.event;
        const eventData = {
            id: event.id,
            title: event.title,
            start: event.startStr,
            courseId: event.extendedProps.courseId,
            backgroundColor: event.backgroundColor,
            borderColor: event.borderColor,
            isEditable: event.extendedProps.isEditable
        };
        setEditingEvent(eventData);
        setIsDialogOpen(true);
    };

    const handleEventDrop = (info) => {
        const newEvents = events.map(e => {
            if (e.id === info.event.id && e.isEditable) {
                return { ...e, start: info.event.startStr };
            }
            return e;
        });
        setEvents(newEvents);
        toast.success("Evento movido con éxito.");
    };

    const handleSaveEvent = (e) => {
        e.preventDefault();
        const form = e.target;
        const title = form.title.value;
        const date = form.date.value;

        if (!title || !date) {
            toast.error("Todos los campos son obligatorios.");
            return;
        }

        if (editingEvent && editingEvent.isEditable) {
            setEvents(events.map(ev => 
                ev.id === editingEvent.id 
                ? { ...ev, title, start: date } 
                : ev
            ));
            toast.success("Evento actualizado con éxito.");
        } else if (!editingEvent) {
            const newEvent = {
                id: `${Date.now()}`,
                title,
                start: date,
                isEditable: true,
                courseId: '1', // Puedes cambiar esto si quieres un curso predeterminado para eventos personalizados
                backgroundColor: 'red', // Color distinto para los eventos creados por el usuario
                borderColor: 'red',
            };
            setEvents([...events, newEvent]);
            toast.success("Evento creado con éxito.");
        }
        closeDialog();
    };

    const handleDeleteEvent = () => {
        if (editingEvent && editingEvent.isEditable) {
            setEvents(events.filter(e => e.id !== editingEvent.id));
            toast.success("Evento eliminado.");
            closeDialog();
        }
    };

    const closeDialog = () => {
        setIsDialogOpen(false);
        setEditingEvent(null);
        setSelectedDate(null);
    };

    return (
        <div className="container mx-auto py-8">
            <Toaster />
            <div className="bg-white p-8 rounded-xl shadow-lg max-w-7xl mx-auto border border-gray-100 min-h-[80vh]">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
                    <h1 className="text-3xl font-bold text-[#003366]">Calendario de Actividades</h1>
                    <div className="flex items-center space-x-4 w-full md:w-auto justify-center md:justify-end">
                        <Select onValueChange={setSelectedCourseFilter} value={selectedCourseFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filtrar por Curso" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los Cursos</SelectItem>
                                {courses.map(course => (
                                    <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button
                            onClick={() => { setEditingEvent(null); setIsDialogOpen(true); }}
                            className="bg-blue-500 hover:bg-blue-600 text-white"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Nuevo Evento
                        </Button>
                    </div>
                </div>

                <div className="w-full h-[600px] font-sans">
                    <FullCalendar
                        plugins={[dayGridPlugin]}
                        initialView="dayGridMonth"
                        locale={esLocale}
                        headerToolbar={{
                            left: "prev,next today",
                            center: "title",
                            right: ""
                        }}
                        height="100%"
                        events={filteredEvents}
                        editable={true} // Permite el drag and drop para eventos con `editable: true`
                        selectable={true}
                        eventClassNames="cursor-pointer"
                        dayCellClassNames="border"
                        dateClick={handleDateClick}
                        eventClick={handleEventClick}
                        eventDrop={handleEventDrop}
                        eventContent={(arg) => {
                            const event = arg.event;
                            const course = courses.find(c => c.id === event.extendedProps.courseId);
                            const eventColor = event.extendedProps.isEditable ? 'red' : (course?.color || '#ECEFF1');
                            return (
                                <div className="p-1 rounded-sm overflow-hidden text-ellipsis whitespace-nowrap text-xs font-medium"
                                     style={{ backgroundColor: eventColor, color: "#333", border: `1px solid ${eventColor}` }}>
                                    {event.title}
                                </div>
                            );
                        }}
                    />
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingEvent?.isEditable ? "Editar Evento Personalizado" : "Crear Nuevo Evento"}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSaveEvent}>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="title" className="text-right">Título</Label>
                                    <Input id="title" name="title" defaultValue={editingEvent?.title || ''} className="col-span-3" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="date" className="text-right">Fecha</Label>
                                    <Input id="date" name="date" type="date" defaultValue={editingEvent?.start ? editingEvent.start.split('T')[0] : selectedDate} className="col-span-3" />
                                </div>
                                {/* El campo de curso ya no se muestra en el formulario */}
                            </div>
                            <DialogFooter>
                                <Button variant="outline" type="button" onClick={closeDialog}>Cancelar</Button>
                                {editingEvent?.isEditable ? (
                                    <Button type="submit">Guardar Cambios</Button>
                                ) : (
                                    <Button type="submit">Crear Evento</Button>
                                )}
                            </DialogFooter>
                        </form>
                        {editingEvent?.isEditable && (
                            <Button 
                                variant="destructive" 
                                onClick={handleDeleteEvent}
                                className="w-full mt-4"
                            >
                                <Trash className="h-4 w-4 mr-2" /> Eliminar Evento
                            </Button>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}