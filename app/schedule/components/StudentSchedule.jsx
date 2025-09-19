"use client";

import { useRef } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "app/components/ui/table";
import { Button } from "app/components/ui/button";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Card, CardContent, CardHeader, CardTitle } from "app/components/ui/card";

// Datos de ejemplo para el horario
const scheduleData = {
  "08:00 - 09:30": {
    Lunes: "Matemáticas",
    Martes: "Historia",
    Miercoles: "Matemáticas",
    Jueves: null,
    Viernes: "Biología",
  },
  "09:45 - 11:15": {
    Lunes: "Física",
    Martes: null,
    Miercoles: null,
    Jueves: "Educación Física",
    Viernes: null,
  },
  "11:30 - 13:00": {
    Lunes: null,
    Martes: "Química",
    Miercoles: null,
    Jueves: null,
    Viernes: "Historia",
  },
};

const daysOfWeek = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes"];
const timeSlots = Object.keys(scheduleData);

export function StudentSchedule() {
  const tableRef = useRef(null);

  const handleExportPdf = () => {
    const input = tableRef.current;
    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210; 
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save("horario_academico.pdf");
    });
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Mi Horario Académico</h1>
        <Button onClick={handleExportPdf}>Exportar a PDF</Button>
      </div>
      <div ref={tableRef} className="bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">Hora</TableHead>
              {daysOfWeek.map((day) => (
                <TableHead key={day} className="text-center font-bold">{day}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {timeSlots.map((timeSlot) => (
              <TableRow key={timeSlot}>
                <TableCell className="font-bold">{timeSlot}</TableCell>
                {daysOfWeek.map((day) => (
                  <TableCell key={day} className="text-center">
                    <Card className="h-full">
                      <CardHeader className="p-2">
                        <CardTitle className="text-sm font-semibold text-gray-700">
                          {scheduleData[timeSlot][day] || ""}
                        </CardTitle>
                      </CardHeader>
                    </Card>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}