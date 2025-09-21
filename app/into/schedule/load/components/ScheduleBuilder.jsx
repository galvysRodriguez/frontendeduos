"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "app/components/ui/sheet";
import { Button } from "app/components/ui/button";
import { Card, CardContent } from "app/components/ui/card";
import { MoveRight } from 'lucide-react';

// Datos de ejemplo para los cursos y el horario
const initialCourses = [
  { id: '1', name: 'Matemáticas', teacher: 'Prof. Sánchez' },
  { id: '2', name: 'Física', teacher: 'Prof. García' },
  { id: '3', name: 'Historia', teacher: 'Prof. López' },
  { id: '4', name: 'Química', teacher: 'Prof. Díaz' },
];

const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
const times = ["08:00 - 09:30", "09:45 - 11:15", "11:30 - 13:00", "13:15 - 14:45"];

export function ScheduleBuilder() {
  const [schedule, setSchedule] = useState({});
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Función para asignar un curso a una celda del horario
  const assignCourse = (day, time) => {
    if (!selectedCourse) {
      alert("Por favor, selecciona un curso primero.");
      return;
    }
    
    // Detección de colisión antes de asignar
    const isCollision = checkCollision(day, time, selectedCourse);
    if (isCollision) {
      alert("¡Colisión detectada! El profesor ya está asignado a esta hora.");
      return;
    }

    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [time]: selectedCourse
      }
    }));
    // Deseleccionar el curso después de asignarlo
    setSelectedCourse(null);
  };

  // Función para la detección de colisiones
  const checkCollision = (day, time, course) => {
    const existingCourse = schedule[day]?.[time];
    if (!existingCourse) return false;
    return existingCourse.teacher === course.teacher;
  };
  
  const getCellClassName = (day, time) => {
    const assignedCourse = schedule[day]?.[time];
    let className = "h-20 border-2 rounded-lg flex flex-col justify-center items-center p-2 text-center transition-colors duration-200";

    if (assignedCourse) {
      className += " bg-blue-200 border-blue-400";
      if (checkCollision(day, time, assignedCourse)) {
        className += " bg-red-400 border-red-600";
      }
    } else {
      className += " bg-gray-50 border-gray-300";
    }

    if (selectedCourse) {
      className += " cursor-pointer hover:bg-gray-200";
    }

    return className;
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Constructor de Horarios</h1>
        <Sheet>
          <SheetTrigger asChild>
            <Button>
              <MoveRight className="mr-2 h-4 w-4" /> Ver Cursos
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>Cursos Disponibles</SheetTitle>
            </SheetHeader>
            <div className="mt-4 space-y-2">
              <p className="text-sm text-gray-500 mb-4">
                Selecciona un curso y haz clic en una celda del horario para asignarlo.
                {selectedCourse && (
                    <span className="block mt-2 font-bold text-blue-500">
                        Curso seleccionado: {selectedCourse.name}
                    </span>
                )}
              </p>
              {initialCourses.map(course => (
                <Card 
                  key={course.id} 
                  className={`cursor-pointer transition-transform duration-200 hover:scale-[1.02]
                    ${selectedCourse?.id === course.id ? "border-blue-500 bg-blue-100" : "border-gray-300 bg-white"}`}
                  onClick={() => setSelectedCourse(course)}
                >
                  <CardContent className="p-4">
                    <p className="font-semibold text-lg">{course.name}</p>
                    <p className="text-sm text-gray-600">{course.teacher}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Tabla del Horario */}
      <div className="grid grid-cols-6 gap-2">
        <div className="col-span-1"></div>
        {days.map(day => (
          <div key={day} className="text-center font-bold text-lg">{day}</div>
        ))}
        {times.map(time => (
          <>
            <div key={time} className="col-span-1 text-center font-bold py-4">{time}</div>
            {days.map(day => {
              const assignedCourse = schedule[day]?.[time];
              return (
                <div
                  key={`${day}-${time}`}
                  className={getCellClassName(day, time)}
                  onClick={() => assignCourse(day, time)}
                >
                  {assignedCourse ? (
                    <p className="font-semibold">{assignedCourse.name}</p>
                  ) : (
                    <p className="text-gray-400 text-sm">Vacío</p>
                  )}
                </div>
              );
            })}
          </>
        ))}
      </div>
    </div>
  );
}