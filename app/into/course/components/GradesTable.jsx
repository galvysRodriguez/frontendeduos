"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "app/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "app/components/ui/dialog";
import { Button } from "app/components/ui/button";
import toast, { Toaster } from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const gradesData = [
  {
    subject: "Matemáticas",
    lapsos: [
      {
        evaluations: [
          { name: "Examen 1", grade: 18, weight: "40%" },
          { name: "Proyecto 1", grade: 20, weight: "60%" },
        ],
        finalGrade: 18.8,
      },
      {
        evaluations: [
          { name: "Examen 2", grade: 15, weight: "50%" },
          { name: "Taller", grade: 17, weight: "50%" },
        ],
        finalGrade: 16,
      },
      {
        evaluations: [
          { name: "Exposición", grade: null, weight: "100%" },
        ],
        finalGrade: null,
      },
    ],
    finalAverage: 18.2,
  },
  {
    subject: "Historia",
    lapsos: [
      {
        evaluations: [
          { name: "Examen 1", grade: 19, weight: "100%" },
        ],
        finalGrade: 19,
      },
      {
        evaluations: [
          { name: "Exposición", grade: 20, weight: "50%" },
          { name: "Prueba Corta", grade: 18, weight: "50%" },
        ],
        finalGrade: 19,
      },
      {
        evaluations: [
          { name: "Ensayo", grade: 16, weight: "100%" },
        ],
        finalGrade: 16,
      },
    ],
    finalAverage: 18,
  },
];

const handleExportGradesSummary = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.setTextColor("#003366");
    doc.text("Resumen de Notas", 14, 20);
    autoTable(doc, {
        startY: 25,
        head: [['Asignatura', 'Lapso 1', 'Lapso 2', 'Lapso 3', 'Definitiva']],
        body: gradesData.map(row => [
            row.subject,
            row.lapsos[0].finalGrade !== null ? row.lapsos[0].finalGrade : '-',
            row.lapsos[1].finalGrade !== null ? row.lapsos[1].finalGrade : '-',
            row.lapsos[2].finalGrade !== null ? row.lapsos[2].finalGrade : '-',
            row.finalAverage !== null ? row.finalAverage : '-'
        ]),
        styles: { fontSize: 10, textColor: "#333333" },
        headStyles: { fillColor: "#003366", textColor: "#FFFFFF", fontStyle: "bold" },
        alternateRowStyles: { fillColor: "#F0F8FF" }
    });
    doc.save("resumen_notas.pdf");
    toast.success("Resumen de notas exportado.");
};

// PDF Export Function for the lapso details dialog
const handleExportLapsoDetails = (lapso, subject, lapsoIndex) => {
    if (!lapso) {
        toast.error("No se pudo exportar. Los datos del lapso no están disponibles.");
        return;
    }
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.setTextColor("#003366");
    doc.text(`Detalles del Lapso ${lapsoIndex + 1} - ${subject}`, 14, 20);
    doc.setFontSize(12);
    doc.setTextColor("#0077B6");
    doc.text(`Calificación Final: ${lapso.finalGrade !== null ? lapso.finalGrade : 'Pendiente'}`, 14, 30);
    autoTable(doc, {
        startY: 40,
        head: [['Evaluación', 'Nota', 'Ponderación']],
        body: lapso.evaluations.map(evalItem => [
            evalItem.name,
            evalItem.grade !== null ? evalItem.grade : 'Pendiente',
            evalItem.weight
        ]),
        styles: { fontSize: 10, textColor: "#333333" },
        headStyles: { fillColor: "#003366", textColor: "#FFFFFF", fontStyle: "bold" },
        alternateRowStyles: { fillColor: "#F0F8FF" }
    });
    doc.save(`detalles_lapso_${lapsoIndex + 1}.pdf`);
    toast.success("Detalles del lapso exportados.");
};


export function GradesTable() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedLapso, setSelectedLapso] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedLapsoIndex, setSelectedLapsoIndex] = useState(null);

  const handleGradeClick = (lapso, subject, index) => {
    setSelectedLapso(lapso);
    setSelectedSubject(subject);
    setSelectedLapsoIndex(index);
    setIsDialogOpen(true);
  };

  return (
    <div className="container mx-auto py-10 bg-gradient-to-br from-[#F0F8FF] to-[#E0F2F7] min-h-screen">
      <Toaster position="top-center"
        toastOptions={{
          style: {
            background: '#FFD700',
            color: '#003366',
            fontWeight: 'bold',
          },
        }}
      />
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-5xl mx-auto border border-gray-100">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold mb-2 text-[#003366]">BOLETÍN DE NOTAS</h1>
        </div>
        <div className="flex justify-end mb-4">
            <Button onClick={handleExportGradesSummary} className="bg-[#003366] hover:bg-[#002244] text-white">Exportar Resumen a PDF</Button>
        </div>

        <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
          <Table>
            <TableHeader className="bg-[#E0F2F7]">
              <TableRow>
                <TableHead className="text-[#003366]">Asignatura</TableHead>
                <TableHead className="text-[#003366]">Lapso 1</TableHead>
                <TableHead className="text-[#003366]">Lapso 2</TableHead>
                <TableHead className="text-[#003366]">Lapso 3</TableHead>
                <TableHead className="text-[#003366]">Definitiva</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white divide-y divide-gray-100">
              {gradesData.map((row) => (
                <TableRow key={row.subject} className="hover:bg-[#F8FDFE]">
                  <TableCell className="font-medium text-gray-700">{row.subject}</TableCell>
                  {row.lapsos.map((lapso, index) => (
                    <TableCell
                      key={index}
                      className="cursor-pointer hover:underline text-[#0077B6] font-semibold"
                      onClick={() => handleGradeClick(lapso, row.subject, index)}
                    >
                      {lapso.finalGrade !== null ? lapso.finalGrade : "-"}
                    </TableCell>
                  ))}
                  <TableCell className="text-[#003366] font-bold">
                    {row.finalAverage !== null ? row.finalAverage : "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-[#003366]">Detalle del Plan de Evaluación</DialogTitle>
              <DialogDescription className="text-gray-600">
                {selectedSubject} - Lapso {selectedLapsoIndex + 1}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-lg font-bold mb-2 text-[#003366]">Evaluaciones:</h4>
              {selectedLapso?.evaluations.length > 0 ? (
                <ul className="list-disc pl-5">
                  {selectedLapso.evaluations.map((evalItem, index) => (
                    <li key={index} className="mb-2 text-gray-700">
                      <p>
                        <strong>{evalItem.name}:</strong>{" "}
                        {evalItem.grade !== null ? evalItem.grade : "Pendiente"}
                      </p>
                      <p className="text-sm text-gray-500">
                        Ponderación: {evalItem.weight}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-700">
                  No hay evaluaciones registradas para este lapso.
                </p>
              )}
            </div>
            <div className="flex justify-between items-center mt-6">
                <p className="font-bold text-lg text-[#0077B6]">
                  Nota Final: {selectedLapso && selectedLapso.finalGrade !== null ? selectedLapso.finalGrade : 'Pendiente'}
                </p>
                <Button 
                    onClick={() => handleExportLapsoDetails(selectedLapso, selectedSubject, selectedLapsoIndex)} 
                    className="bg-[#003366] hover:bg-[#002244] text-white"
                >
                    Exportar Detalles a PDF
                </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}