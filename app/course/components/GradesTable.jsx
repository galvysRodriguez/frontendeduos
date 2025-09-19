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
    finalAverage: null,
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

export function GradesTable() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedLapso, setSelectedLapso] = useState(null);

  const handleGradeClick = (lapso) => {
    setSelectedLapso(lapso);
    setIsDialogOpen(true);
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Asignatura</TableHead>
            <TableHead>Lapso 1</TableHead>
            <TableHead>Lapso 2</TableHead>
            <TableHead>Lapso 3</TableHead>
            <TableHead>Definitiva</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {gradesData.map((row) => (
            <TableRow key={row.subject}>
              <TableCell className="font-medium">{row.subject}</TableCell>
              {row.lapsos.map((lapso, index) => (
                <TableCell
                  key={index}
                  className="cursor-pointer hover:underline text-blue-500"
                  onClick={() => handleGradeClick(lapso)}
                >
                  {lapso.finalGrade !== null ? lapso.finalGrade : "-"}
                </TableCell>
              ))}
              <TableCell>
                {row.finalAverage !== null ? row.finalAverage : "-"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                <DialogHeader>
                    <DialogTitle>Detalle del Plan de Evaluación</DialogTitle>
                    <DialogDescription>
                    {selectedLapso?.finalGrade ? `Calificación final del lapso: ${selectedLapso.finalGrade}` : "Calificación del lapso pendiente"}
                    </DialogDescription>
                </DialogHeader>
                <div className="mt-4">
                    <h4 className="text-lg font-bold mb-2">Evaluaciones:</h4>
                    {selectedLapso?.evaluations.length > 0 ? (
                    <ul className="list-disc pl-5">
                        {selectedLapso.evaluations.map((evalItem, index) => (
                        <li key={index} className="mb-2">
                            <p><strong>{evalItem.name}:</strong> {evalItem.grade  ? evalItem.grade : "Pendiente"}</p>
                            <p className="text-sm text-gray-500">Ponderación: {evalItem.weight}</p>
                        </li>
                        ))}
                    </ul>
                    ) : (
                    <p>No hay evaluaciones registradas para este lapso.</p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    </>
  );
}