"use client";

import { useState, Fragment } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "app/components/ui/sheet";
import { Button } from "app/components/ui/button";
import { Card, CardContent } from "app/components/ui/card";
import { MoveRight, FileText } from 'lucide-react';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Datos de ejemplo para los cursos y el horario
const initialCourses = [
    { id: '1', name: 'Matemáticas', teacher: 'Prof. Sánchez' },
    { id: '2', name: 'Física', teacher: 'Prof. García' },
    { id: '3', name: 'Historia', teacher: 'Prof. López' },
    { id: '4', name: 'Química', 'teacher': 'Prof. Díaz' },
];

const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
const times = ["08:00 - 09:30", "09:45 - 11:15", "11:30 - 13:00", "13:15 - 14:45"];

export function StudentSchedule() {
    const [schedule, setSchedule] = useState({});
    const [selectedCourse, setSelectedCourse] = useState(null);

    const assignCourse = (day, time) => {
        if (!selectedCourse) {
            alert("Por favor, selecciona un curso primero.");
            return;
        }

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
        setSelectedCourse(null);
    };

    const checkCollision = (day, time, course) => {
        // Verifica si el profesor ya está en otro curso a la misma hora en cualquier día
        for (const d of days) {
            if (schedule[d] && schedule[d][time] && schedule[d][time].teacher === course.teacher) {
                return true;
            }
        }
        return false;
    };
    
    const getCellClassName = (day, time) => {
        const assignedCourse = schedule[day]?.[time];
        let className = "h-20 border-2 rounded-lg flex flex-col justify-center items-center p-2 text-center transition-colors duration-200";

        if (assignedCourse) {
            className += " bg-[#E0F2F7] border-[#0077B6]";
            if (checkCollision(day, time, assignedCourse)) {
                className += " !bg-red-400 !border-red-600";
            }
        } else {
            className += " bg-[#F8FDFE] border-[#E0F2F7]";
        }

        if (selectedCourse) {
            className += " cursor-pointer hover:bg-gray-200";
        }

        return className;
    };

     const handleExportPdf = () => {
    const doc = new jsPDF();

    // Título
    doc.setFontSize(18);
    doc.text("Horario de Clases", 14, 22);

    // Preparar datos de la tabla
    const tableHeaders = ["Hora", ...days];
    const tableBody = times.map(time => {
      const row = [time];
      days.forEach(day => {
        const course = schedule[day]?.[time];
        row.push(course ? `${course.name}\n(${course.teacher})` : "Vacío");
      });
      return row;
    });

    // Generar la tabla
    autoTable(doc, {
      head: [tableHeaders],
      body: tableBody,
      startY: 30,
      theme: 'grid',
      headStyles: {
        fillColor: [0, 119, 182],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center'
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240]
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
        halign: 'center',
        valign: 'middle'
      },
      didDrawPage: (data) => {
        doc.setFontSize(8);
        doc.text(`Página ${doc.internal.getNumberOfPages()}`, 
                 data.settings.margin.left, 
                 doc.internal.pageSize.height - 10);
      }
    });

    // Guardar el PDF
    doc.save("horario_clases.pdf");
  };

    return (
        <div className="container mx-auto py-8 bg-gradient-to-br from-[#F0F8FF] to-[#E0F2F7] min-h-screen">
            <div className="bg-white p-8 rounded-xl shadow-lg max-w-6xl mx-auto border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-[#003366]">Constructor de Horarios</h1>
                    <div className="flex space-x-2">
                        <Button 
                            onClick={handleExportPdf}
                            className="bg-[#0077B6] hover:bg-[#005580] text-white"
                        >
                            <FileText className="mr-2 h-4 w-4" /> Exportar a PDF
                        </Button>
                        
                    </div>
                </div>

                <div className="grid grid-cols-6 gap-2">
                    <div className="col-span-1"></div>
                    {days.map(day => (
                        <div key={day} className="text-center font-bold text-lg text-[#003366]">{day}</div>
                    ))}
                    {times.map(time => (
                        <Fragment key={time}>
                            <div className="col-span-1 text-center font-bold py-4 text-[#003366]">{time}</div>
                            {days.map(day => {
                                const assignedCourse = schedule[day]?.[time];
                                return (
                                    <div
                                        key={`${day}-${time}`}
                                        className={getCellClassName(day, time)}
                                        onClick={() => assignCourse(day, time)}
                                    >
                                        {assignedCourse ? (
                                            <>
                                                <p className="font-semibold text-[#003366]">{assignedCourse.name}</p>
                                                <p className="text-sm text-gray-600">{assignedCourse.teacher}</p>
                                            </>
                                        ) : (
                                            <p className="text-gray-400 text-sm">Vacío</p>
                                        )}
                                    </div>
                                );
                            })}
                        </Fragment>
                    ))}
                </div>
            </div>
        </div>
    );
}