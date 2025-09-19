// Este es un ejemplo conceptual. La implementación completa requiere una lógica más compleja
// con el manejo de estados de drag and drop.

"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "app/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "app/components/ui/sheet";
import { Button } from "app/components/ui/button";

// Importa los componentes de drag and drop
// import { DndProvider, useDrag, useDrop } from "react-dnd";
// import { HTML5Backend } from "react-dnd-html5-backend";

// Datos de ejemplo
const courses = [
  { id: '1', name: 'Matemáticas', type: 'course', teacher: 'Prof. Sánchez' },
  { id: '2', name: 'Física', type: 'course', teacher: 'Prof. García' },
  { id: '3', name: 'Historia', type: 'course', teacher: 'Prof. López' },
];

const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
const times = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00"];

export function ScheduleBuilder() {
  const [schedule, setSchedule] = useState({});
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Lógica de drag and drop (conceptual)
  const handleDrop = (day, time, course) => {
    // 1. Detectar colisión
    const isCollision = checkCollision(day, time, course);
    if (isCollision) {
      alert("¡Colisión de horarios detectada!");
      return; 
    }

    // 2. Si no hay colisión, actualizar el horario
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [time]: course
      }
    }));
  };

  const checkCollision = (day, time, newCourse) => {
    // Implementa la lógica de colisión aquí.
    // Ejemplo: Verifica si el mismo profesor ya está asignado en la misma hora.
    const existingCourse = schedule[day]?.[time];
    if (existingCourse && existingCourse.teacher === newCourse.teacher) {
      return true;
    }
    return false;
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Crear Horario de Clases</h1>
      <Tabs defaultValue="builder" className="w-full">
        <TabsList>
          <TabsTrigger value="builder">Constructor de Horarios</TabsTrigger>
          <TabsTrigger value="courses" onClick={() => setIsSheetOpen(true)}>Cursos Disponibles</TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="mt-6">
          <div className="grid grid-cols-6 gap-2">
            <div className="col-span-1"></div>
            {days.map(day => (
              <div key={day} className="text-center font-bold">{day}</div>
            ))}
            {times.map(time => (
              <>
                <div key={time} className="col-span-1 text-center font-bold py-4">{time}</div>
                {days.map(day => {
                  const course = schedule[day]?.[time];
                  return (
                    // La lógica de `onDrop` se implementa con react-dnd
                    <div
                      key={`${day}-${time}`}
                      className={`h-20 border-2 border-dashed rounded-lg flex items-center justify-center p-2 text-center 
                                 ${course ? "bg-blue-200" : "bg-gray-50"}
                                 ${checkCollision(day, time, course) ? "border-red-500 bg-red-100" : "border-gray-300"}`}
                      // onDrop={e => handleDrop(day, time, e.dataTransfer.getData("course"))}
                    >
                      {course ? (
                        <p className="text-sm font-semibold">{course.name}</p>
                      ) : (
                        <p className="text-gray-400 text-sm">Arrastra aquí</p>
                      )}
                    </div>
                  );
                })}
              </>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Cursos Disponibles</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-2">
            {courses.map(course => (
              <div
                key={course.id}
                className="p-4 border rounded-lg bg-gray-100 cursor-grab"
                // draggable="true" onDragStart={e => e.dataTransfer.setData("course", course.name)}
              >
                <p className="font-semibold">{course.name}</p>
                <p className="text-sm text-gray-600">{course.teacher}</p>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}