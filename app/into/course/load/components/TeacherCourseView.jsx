"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "app/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "app/components/ui/table";
import { Button } from "app/components/ui/button";
import { Input } from "app/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "app/components/ui/sheet";

// Placeholder data - In a real app, this would come from an API
const initialStudents = [
  { id: 1, name: "María Rodríguez", grades: {} },
  { id: 2, name: "Carlos Gómez", grades: {} },
  { id: 3, name: "Ana Pérez", grades: {} },
];

const initialEvaluations = [
  { name: "Examen 1", weight: 40, lapso: 1 },
  { name: "Taller 1", weight: 60, lapso: 1 },
];

export function TeacherCourseView() {
  const [students, setStudents] = useState(initialStudents);
  const [evaluations, setEvaluations] = useState(initialEvaluations);
  const [activeLapso, setActiveLapso] = useState(1);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [newEvaluation, setNewEvaluation] = useState({ name: "", weight: "", lapso: activeLapso });

  // Function to calculate final grade for a student
  const calculateFinalGrade = (student) => {
    let totalGrade = 0;
    let totalWeight = 0;
    const currentLapsoEvaluations = evaluations.filter(evalItem => evalItem.lapso === activeLapso);

    currentLapsoEvaluations.forEach(evalItem => {
      const grade = student.grades[evalItem.name];
      const weight = evalItem.weight;
      if (grade && weight) {
        totalGrade += (grade * weight);
        totalWeight += weight;
      }
    });

    return totalWeight > 0 ? (totalGrade / totalWeight).toFixed(2) : "-";
  };

  // Function to handle grade input
  const handleGradeChange = (studentId, evaluationName, value) => {
    setStudents(prevStudents =>
      prevStudents.map(student =>
        student.id === studentId
          ? { ...student, grades: { ...student.grades, [evaluationName]: parseFloat(value) || null } }
          : student
      )
    );
  };

  // Function to handle new evaluation input
  const handleNewEvaluationChange = (e) => {
    const { name, value } = e.target;
    setNewEvaluation(prev => ({
      ...prev,
      [name]: name === "weight" ? parseFloat(value) || 0 : value
    }));
  };

  // Function to add a new evaluation to the plan
  const handleAddEvaluation = () => {
    if (newEvaluation.name && newEvaluation.weight > 0) {
      setEvaluations(prev => [...prev, newEvaluation]);
      setNewEvaluation({ name: "", weight: "", lapso: activeLapso });
      setIsSheetOpen(false);
    }
  };

  // The Grade Upload Tab
  const renderGradesTab = () => (
    <div>
      <h3 className="text-xl font-semibold mb-4">Notas del Lapso {activeLapso}</h3>
      <Table className="min-w-full divide-y divide-gray-200">
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead className="w-[200px] font-bold">Estudiante</TableHead>
            {evaluations.filter(e => e.lapso === activeLapso).map((evalItem) => (
              <TableHead key={evalItem.name} className="text-center">
                {evalItem.name} <span className="text-xs text-gray-500">({evalItem.weight}%)</span>
              </TableHead>
            ))}
            <TableHead className="font-bold">Nota Final</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="bg-white divide-y divide-gray-200">
          {students.map((student) => (
            <TableRow key={student.id}>
              <TableCell className="font-medium">{student.name}</TableCell>
              {evaluations.filter(e => e.lapso === activeLapso).map((evalItem) => (
                <TableCell key={evalItem.name}>
                  <Input
                    type="number"
                    min="0"
                    max="20"
                    value={student.grades[evalItem.name] || ""}
                    onChange={(e) => handleGradeChange(student.id, evalItem.name, e.target.value)}
                    className="text-center"
                  />
                </TableCell>
              ))}
              <TableCell className="font-bold text-center">{calculateFinalGrade(student)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="mt-6 flex justify-end">
        <Button onClick={() => alert("Notas guardadas!")}>Guardar Cambios</Button>
      </div>
    </div>
  );

  // The Evaluation Plan Management Tab
  const renderPlanTab = () => (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Plan de Evaluación del Lapso {activeLapso}</h3>
        <Button onClick={() => setIsSheetOpen(true)}>Agregar Evaluación</Button>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Evaluación</TableHead>
            <TableHead>Ponderación (%)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {evaluations.filter(e => e.lapso === activeLapso).map((evalItem) => (
            <TableRow key={evalItem.name}>
              <TableCell>{evalItem.name}</TableCell>
              <TableCell>{evalItem.weight}%</TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell className="font-bold">Total</TableCell>
            <TableCell className="font-bold">
              {evaluations.filter(e => e.lapso === activeLapso).reduce((sum, item) => sum + item.weight, 0)}%
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Nueva Evaluación</SheetTitle>
            <SheetDescription>Define una nueva actividad de evaluación para el lapso actual.</SheetDescription>
          </SheetHeader>
          <div className="mt-4 space-y-4">
            <Input name="name" placeholder="Nombre (Ej. Examen Final)" value={newEvaluation.name} onChange={handleNewEvaluationChange} />
            <Input name="weight" type="number" placeholder="Ponderación (%)" value={newEvaluation.weight} onChange={handleNewEvaluationChange} />
            <Button onClick={handleAddEvaluation} className="w-full">Guardar Evaluación</Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Gestión de Curso: [Nombre del Curso]</h1>
      <Tabs defaultValue="grades">
        <TabsList>
          <TabsTrigger value="grades" onClick={() => setActiveLapso(1)}>Cargar Notas</TabsTrigger>
          <TabsTrigger value="plan" onClick={() => setActiveLapso(1)}>Gestionar Plan de Evaluación</TabsTrigger>
        </TabsList>
        <TabsContent value="grades" className="mt-6">
          {renderGradesTab()}
        </TabsContent>
        <TabsContent value="plan" className="mt-6">
          {renderPlanTab()}
        </TabsContent>
      </Tabs>
    </div>
  );
}