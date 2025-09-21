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
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "app/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "app/components/ui/select";
import toast, { Toaster } from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Trash2, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// --- VALIDATION AND DATA STRUCTURES ---

const literalGrades = {
    A: 20,
    B: 16,
    C: 12,
    D: 8,
    E: 1,
};

const initialStudents = [
    { id: 1, name: "María Rodríguez", grades: {}, studentId: "12345678" },
    { id: 2, name: "Carlos Gómez", grades: {}, studentId: "87654321" },
    { id: 3, name: "Ana Pérez", grades: {}, studentId: "11223344" },
];

const initialEvaluations = [
    {
        id: 'e1',
        title: "Examen 1",
        weight: 40,
        lapso: 1,
        date: '2025-10-20',
        estrategia: 'Escrita',
        contenido: 'Unidad I: Álgebra',
        tecnica: 'Prueba',
        instrumento: 'Cuestionario'
    },
    {
        id: 'e2',
        title: "Taller 1",
        weight: 60,
        lapso: 1,
        date: '2025-11-15',
        estrategia: 'Práctica',
        contenido: 'Unidad I: Gráficas',
        tecnica: 'Prueba de ejecución',
        instrumento: 'Guía de trabajo'
    },
    {
        id: 'e3',
        title: "Proyecto Final",
        weight: 100,
        lapso: 2,
        date: '2026-03-01',
        estrategia: 'Proyecto',
        contenido: 'Unidad II: Vectores',
        tecnica: 'Demostración',
        instrumento: 'Rúbrica'
    },
];

const estrategias = ["Escrita", "Práctica", "Proyecto", "Oral", "Observación"];
const tecnicas = ["Prueba", "Entrevista", "Prueba de ejecución", "Guía de trabajo", "Observación sistemática"];
const instrumentos = ["Cuestionario", "Registro anecdótico", "Escala de estimación", "Lista de cotejo", "Rúbrica"];

const evaluationFormSchema = z.object({
    title: z.string().min(2, "El título es requerido."),
    weight: z.number().min(1, "La ponderación debe ser ≥ 1.").max(100, "La ponderación ≤ 100."),
    date: z.string().min(1, "La fecha es requerida."),
    estrategia: z.string().min(2, "La estrategia es requerida."),
    contenido: z.string().min(2, "El contenido es requerido."),
    tecnica: z.string().min(2, "La técnica es requerida."),
    instrumento: z.string().min(2, "El instrumento es requerido."),
});

// --- PDF EXPORT FUNCTIONS ---

const handleExportStudents = (students) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.setTextColor("#003366"); // Azul oscuro del logo
    doc.text("Listado de Estudiantes", 14, 20);
    autoTable(doc, {
        startY: 25,
        head: [['Cédula', 'Nombre Completo']],
        body: students.map(student => [student.studentId, student.name]),
        styles: { fontSize: 10, cellPadding: 3, textColor: "#333333" },
        headStyles: { fillColor: "#003366", textColor: "#FFFFFF", fontStyle: "bold" }, // Azul oscuro, texto blanco
        alternateRowStyles: { fillColor: "#F0F8FF" } // Un azul muy claro
    });
    doc.save("lista_estudiantes.pdf");
    toast.success("Lista de estudiantes exportada.");
};

const handleExportPlan = (evaluations, activeLapso) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.setTextColor("#003366"); // Azul oscuro del logo
    doc.text(`Plan de Evaluación - Lapso ${activeLapso}`, 14, 20);
    const filteredEvaluations = evaluations.filter(e => e.lapso === activeLapso);

    autoTable(doc, {
        startY: 25,
        head: [['Fecha', 'Título', 'Estrategia', 'Contenido', 'Técnica', 'Instrumento', 'Ponderación (%)']],
        body: filteredEvaluations.map(e => [
            e.date || '-',
            e.title,
            e.estrategia || '-',
            e.contenido || '-',
            e.tecnica || '-',
            e.instrumento || '-',
            `${e.weight}%`
        ]),
        styles: { fontSize: 9, textColor: "#333333" },
        headStyles: { fillColor: "#003366", textColor: "#FFFFFF", fontStyle: "bold" }, // Azul oscuro, texto blanco
        alternateRowStyles: { fillColor: "#F0F8FF" } // Un azul muy claro
    });

    doc.save(`plan_evaluacion_lapso_${activeLapso}.pdf`);
    toast.success("Plan de evaluación exportado.");
};

const handleExportGrades = (students, evaluations, activeLapso, calculateFinalGrade) => {
    const doc = new jsPDF('landscape');
    doc.setFontSize(16);
    doc.setTextColor("#003366"); // Azul oscuro del logo
    doc.text(`Notas del Lapso ${activeLapso}`, 14, 20);
    const currentLapsoEvaluations = evaluations.filter(e => e.lapso === activeLapso);
    const headers = ['Estudiante', ...currentLapsoEvaluations.map(e => `${e.title} (${e.weight}%)`), 'Nota Final'];
    const body = students.map(student => {
        const row = [student.name];
        currentLapsoEvaluations.forEach(evalItem => {
            row.push(student.grades[evalItem.title] || '-');
        });
        row.push(calculateFinalGrade(student));
        return row;
    });

    autoTable(doc, {
        startY: 25,
        head: [headers],
        body: body,
        styles: { fontSize: 8, textColor: "#333333" },
        headStyles: { fillColor: "#003366", textColor: "#FFFFFF", fontStyle: "bold" }, // Azul oscuro, texto blanco
        alternateRowStyles: { fillColor: "#F0F8FF" } // Un azul muy claro
    });
    doc.save(`notas_lapso_${activeLapso}.pdf`);
    toast.success("Notas exportadas.");
};

// --- MAIN COMPONENT ---
export function TeacherCourseView() {
    const [students, setStudents] = useState(initialStudents);
    const [evaluations, setEvaluations] = useState(initialEvaluations);
    const [activeLapso, setActiveLapso] = useState(1);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    const form = useForm({
        resolver: zodResolver(evaluationFormSchema),
        defaultValues: {
            title: "", weight: 0, date: "", estrategia: "", contenido: "", tecnica: "", instrumento: ""
        },
    });

    const onSubmitNewEvaluation = (values) => {
        const totalWeight = evaluations.filter(e => e.lapso === activeLapso).reduce((sum, item) => sum + item.weight, 0);
        if (totalWeight + values.weight > 100) {
            toast.error("La ponderación total excede el 100%.");
            return;
        }

        const newId = `e${evaluations.length + 1}`;
        const newEvaluation = { id: newId, ...values, lapso: activeLapso };
        setEvaluations(prev => [...prev, newEvaluation]);
        form.reset();
        setIsSheetOpen(false);
        toast.success("¡Plan de evaluación guardado!");
    };

    const handleGradeChange = (studentId, evaluationTitle, value) => {
        let grade = null;
        const numericValue = parseFloat(value);

        if (!isNaN(numericValue) && numericValue >= 1 && numericValue <= 20) {
            grade = numericValue;
        }
        else if (value.length === 1 && literalGrades[value.toUpperCase()] !== undefined) {
            grade = literalGrades[value.toUpperCase()];
        }

        if (grade === null && value.length > 0) {
            toast.error("Nota inválida. Use 1-20 o A, B, C, D, E.");
            return;
        }

        setStudents(prevStudents =>
            prevStudents.map(student =>
                student.id === studentId
                    ? { ...student, grades: { ...student.grades, [evaluationTitle]: grade } }
                    : student
            )
        );
    };

    const handleEvaluationChange = (id, field, value) => {
        setEvaluations(evaluations.map(evalItem =>
            evalItem.id === id ? { ...evalItem, [field]: value } : evalItem
        ));
    };

    const handleDeleteEvaluation = (id) => {
        setEvaluations(evaluations.filter(evalItem => evalItem.id !== id));
        toast.success("Evaluación eliminada.");
    };

    const calculateFinalGrade = (student) => {
        let totalGrade = 0;
        let totalWeight = 0;
        const currentLapsoEvaluations = evaluations.filter(e => e.lapso === activeLapso);

        currentLapsoEvaluations.forEach(evalItem => {
            const grade = student.grades[evalItem.title];
            if (grade !== null && !isNaN(grade)) {
                totalGrade += (grade * evalItem.weight);
                totalWeight += evalItem.weight;
            }
        });

        return totalWeight > 0 ? (totalGrade / totalWeight).toFixed(2) : "-";
    };

    const renderGradesTab = () => (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold mb-4 text-[#003366]">Notas del Lapso {activeLapso}</h3>
                <Button variant="outline" onClick={() => handleExportGrades(students, evaluations, activeLapso, calculateFinalGrade)} className="border-[#003366] text-[#003366] hover:bg-[#E0F2F7] bg-white">Exportar a PDF</Button>
            </div>
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <Table className="min-w-full">
                    <TableHeader className="bg-[#E0F2F7]">
                        <TableRow>
                            <TableHead className="w-[200px] font-bold text-[#003366]">Estudiante</TableHead>
                            {evaluations.filter(e => e.lapso === activeLapso).map((evalItem) => (
                                <TableHead key={evalItem.id} className="text-center text-[#003366]">
                                    {evalItem.title} <span className="text-xs text-gray-600">({evalItem.weight}%)</span>
                                </TableHead>
                            ))}
                            <TableHead className="font-bold text-[#003366]">Nota Final</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="bg-white divide-y divide-gray-100">
                        {students.map((student) => (
                            <TableRow key={student.id} className="hover:bg-[#F8FDFE]">
                                <TableCell className="font-medium text-gray-700">{student.name}</TableCell>
                                {evaluations.filter(e => e.lapso === activeLapso).map((evalItem) => (
                                    <TableCell key={evalItem.id}>
                                        <Input
                                            type="text"
                                            value={student.grades[evalItem.title] || ""}
                                            onChange={(e) => handleGradeChange(student.id, evalItem.title, e.target.value)}
                                            className="text-center border-gray-300 focus:border-[#0077B6] focus:ring-[#0077B6]"
                                        />
                                    </TableCell>
                                ))}
                                <TableCell className="font-bold text-center text-[#003366]">{calculateFinalGrade(student)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <div className="mt-6 flex justify-end">
                <Button onClick={() => toast.success("Notas guardadas!")} className="bg-[#4CAF50] hover:bg-[#388E3C] text-white">Guardar Cambios</Button>
            </div>
        </div>
    );

    const renderPlanTab = () => (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-[#003366]">Plan de Evaluación del Lapso {activeLapso}</h3>
                <div className="flex space-x-2">
                    <Button variant="outline" onClick={() => handleExportPlan(evaluations, activeLapso)} className="border-[#003366] text-[#003366] hover:bg-[#E0F2F7] ">Exportar a PDF</Button>
                    <Button onClick={() => setIsSheetOpen(true)} className="bg-[#0077B6] hover:bg-[#005580] text-white"><Plus className="h-4 w-4 mr-2" /> Agregar Evaluación</Button>
                </div>
            </div>

            <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <Table>
                    <TableHeader className="bg-[#E0F2F7]">
                        <TableRow>
                            <TableHead className="text-[#003366]">Fecha</TableHead>
                            <TableHead className="text-[#003366]">Título</TableHead>
                            <TableHead className="text-[#003366]">Estrategia</TableHead>
                            <TableHead className="text-[#003366]">Contenido</TableHead>
                            <TableHead className="text-[#003366]">Técnica</TableHead>
                            <TableHead className="text-[#003366]">Instrumento</TableHead>
                            <TableHead className="text-[#003366]">Ponderación (%)</TableHead>
                            <TableHead className="text-center text-[#003366]">Acción</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="bg-white divide-y divide-gray-100">
                        {evaluations.filter(e => e.lapso === activeLapso).map((evalItem) => (
                            <TableRow key={evalItem.id} className="hover:bg-[#F8FDFE]">
                                <TableCell><Input type="date" value={evalItem.date} onChange={(e) => handleEvaluationChange(evalItem.id, 'date', e.target.value)} className="border-gray-300 focus:border-[#0077B6]" /></TableCell>
                                <TableCell><Input value={evalItem.title} onChange={(e) => handleEvaluationChange(evalItem.id, 'title', e.target.value)} className="border-gray-300 focus:border-[#0077B6]" /></TableCell>
                                <TableCell><Input value={evalItem.estrategia} onChange={(e) => handleEvaluationChange(evalItem.id, 'estrategia', e.target.value)} className="border-gray-300 focus:border-[#0077B6]" /></TableCell>
                                <TableCell><Input value={evalItem.contenido} onChange={(e) => handleEvaluationChange(evalItem.id, 'contenido', e.target.value)} className="border-gray-300 focus:border-[#0077B6]" /></TableCell>
                                <TableCell><Input value={evalItem.tecnica} onChange={(e) => handleEvaluationChange(evalItem.id, 'tecnica', e.target.value)} className="border-gray-300 focus:border-[#0077B6]" /></TableCell>
                                <TableCell><Input value={evalItem.instrumento} onChange={(e) => handleEvaluationChange(evalItem.id, 'instrumento', e.target.value)} className="border-gray-300 focus:border-[#0077B6]" /></TableCell>
                                <TableCell><Input type="number" value={evalItem.weight} onChange={(e) => handleEvaluationChange(evalItem.id, 'weight', parseFloat(e.target.value) || 0)} className="border-gray-300 focus:border-[#0077B6]" /></TableCell>
                                <TableCell className="text-center">
                                    <Button variant="ghost" size="icon" onClick={() => handleDeleteEvaluation(evalItem.id)} className="text-red-500 hover:bg-red-50">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        <TableRow className="bg-[#E0F2F7] font-bold">
                            <TableCell colSpan={6} className="text-right text-[#003366]">Total:</TableCell>
                            <TableCell className="text-[#003366]">
                                {evaluations.filter(e => e.lapso === activeLapso).reduce((sum, item) => sum + item.weight, 0)}%
                            </TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
            <div className="mt-6 flex justify-end">
                <Button onClick={() => toast.success("Plan de evaluación guardado!")} className="bg-[#4CAF50] hover:bg-[#388E3C] text-white">Guardar Cambios</Button>
            </div>

            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="bg-white p-6 shadow-lg">
                    <SheetHeader className="mb-6">
                        <SheetTitle className="text-2xl font-bold text-[#003366]">Nueva Evaluación</SheetTitle>
                        <SheetDescription className="text-gray-600">Define una nueva actividad de evaluación con detalles completos.</SheetDescription>
                    </SheetHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmitNewEvaluation)} className="space-y-4 py-4">
                            <FormField
                                control={form.control} name="title"
                                render={({ field }) => (<FormItem><FormLabel className="text-gray-700">Título</FormLabel><FormControl><Input placeholder="Ej. Examen Final" {...field} className="border-gray-300 focus:border-[#0077B6]" /></FormControl><FormMessage /></FormItem>)}
                            />
                            <FormField
                                control={form.control} name="weight"
                                render={({ field }) => (<FormItem><FormLabel className="text-gray-700">Ponderación (%)</FormLabel><FormControl><Input type="number" placeholder="Ej. 25" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} className="border-gray-300 focus:border-[#0077B6]" /></FormControl><FormMessage /></FormItem>)}
                            />
                            <FormField
                                control={form.control} name="date"
                                render={({ field }) => (<FormItem><FormLabel className="text-gray-700">Fecha</FormLabel><FormControl><Input type="date" {...field} className="border-gray-300 focus:border-[#0077B6]" /></FormControl><FormMessage /></FormItem>)}
                            />
                            <FormField
                                control={form.control} name="estrategia"
                                render={({ field }) => (<FormItem><FormLabel className="text-gray-700">Estrategia</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="border-gray-300 focus:border-[#0077B6]"><SelectValue placeholder="Selecciona una estrategia" /></SelectTrigger></FormControl><SelectContent className="bg-white">{estrategias.map(est => <SelectItem key={est} value={est}>{est}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)}
                            />
                            <FormField
                                control={form.control} name="contenido"
                                render={({ field }) => (<FormItem><FormLabel className="text-gray-700">Contenido</FormLabel><FormControl><Input placeholder="Ej. Unidad I: Álgebra" {...field} className="border-gray-300 focus:border-[#0077B6]" /></FormControl><FormMessage /></FormItem>)}
                            />
                            <FormField
                                control={form.control} name="tecnica"
                                render={({ field }) => (<FormItem><FormLabel className="text-gray-700">Técnica</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="border-gray-300 focus:border-[#0077B6]"><SelectValue placeholder="Selecciona una técnica" /></SelectTrigger></FormControl><SelectContent className="bg-white">{tecnicas.map(tec => <SelectItem key={tec} value={tec}>{tec}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)}
                            />
                            <FormField
                                control={form.control} name="instrumento"
                                render={({ field }) => (<FormItem><FormLabel className="text-gray-700">Instrumento</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="border-gray-300 focus:border-[#0077B6]"><SelectValue placeholder="Selecciona un instrumento" /></SelectTrigger></FormControl><SelectContent className="bg-white">{instrumentos.map(ins => <SelectItem key={ins} value={ins}>{ins}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)}
                            />
                            <Button type="submit" className="w-full bg-[#0077B6] hover:bg-[#005580] text-white">Guardar Evaluación</Button>
                        </form>
                    </Form>
                </SheetContent>
            </Sheet>
        </div>
    );

    const renderStudentsTab = () => (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-[#003366]">Listado de Estudiantes</h3>
                <Button variant="outline" onClick={() => handleExportStudents(students)} className="border-[#003366] text-[#003366] hover:bg-[#E0F2F7] bg-white">Exportar a PDF</Button>
            </div>
            <div id="student-table-to-export" className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <Table>
                    <TableHeader className="bg-[#E0F2F7]">
                        <TableRow>
                            <TableHead className="text-[#003366]">Cédula</TableHead>
                            <TableHead className="text-[#003366]">Nombre Completo</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-gray-100">
                        {students.map(student => (
                            <TableRow key={student.id} className="hover:bg-[#F8FDFE]">
                                <TableCell className="text-gray-700">{student.studentId}</TableCell>
                                <TableCell className="text-gray-700">{student.name}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );

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
            <div className="bg-white p-8 rounded-xl shadow-lg max-w-6xl mx-auto border border-gray-100">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold mb-2 text-[#003366]">GESTIÓN DE CURSO</h1>
                </div>

                <div className="flex items-center space-x-4 mb-8 p-4 bg-[#F8FDFE] rounded-lg shadow-sm">
                    <span className="font-semibold text-lg text-[#003366]">Seleccionar Lapso:</span>
                    <Button
                        variant={activeLapso === 1 ? 'default' : 'outline'}
                        onClick={() => setActiveLapso(1)}
                        className={activeLapso === 1 ? "bg-[#0077B6] hover:bg-[#005580] text-white" : "border-[#0077B6] text-[#0077B6] hover:bg-[#E0F2F7]"}
                    >
                        Lapso 1
                    </Button>
                    <Button
                        variant={activeLapso === 2 ? 'default' : 'outline'}
                        onClick={() => setActiveLapso(2)}
                        className={activeLapso === 2 ? "bg-[#0077B6] hover:bg-[#005580] text-white" : "border-[#0077B6] text-[#0077B6] hover:bg-[#E0F2F7]"}
                    >
                        Lapso 2
                    </Button>
                </div>

                <Tabs defaultValue="grades">
                    <TabsList className="grid w-full grid-cols-3 bg-[#E0F2F7] rounded-lg p-1">
                        <TabsTrigger
                            value="grades"
                            className="data-[state=active]:bg-[#0077B6] data-[state=active]:text-white data-[state=active]:shadow-sm text-[#003366] hover:text-[#005580]"
                        >
                            Cargar Notas
                        </TabsTrigger>
                        <TabsTrigger
                            value="plan"
                            className="data-[state=active]:bg-[#0077B6] data-[state=active]:text-white data-[state=active]:shadow-sm text-[#003366] hover:text-[#005580]"
                        >
                            Plan de Evaluación
                        </TabsTrigger>
                        <TabsTrigger
                            value="students"
                            className="data-[state=active]:bg-[#0077B6] data-[state=active]:text-white data-[state=active]:shadow-sm text-[#003366] hover:text-[#005580]"
                        >
                            Estudiantes
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="grades" className="mt-6 p-4 bg-[#FDFEFF] rounded-lg shadow-sm">{renderGradesTab()}</TabsContent>
                    <TabsContent value="plan" className="mt-6 p-4 bg-[#FDFEFF] rounded-lg shadow-sm">{renderPlanTab()}</TabsContent>
                    <TabsContent value="students" className="mt-6 p-4 bg-[#FDFEFF] rounded-lg shadow-sm">{renderStudentsTab()}</TabsContent>
                </Tabs>
            </div>
        </div>
    );
}