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
  SheetFooter
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
import { Plus, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// --- VALIDATION AND DATA STRUCTURES ---

const initialCourses = [
    { id: 'c1', name: 'Matemática', assignedTeacherId: 't1' },
    { id: 'c2', name: 'Lenguaje', assignedTeacherId: 't2' },
    { id: 'c3', name: 'Ciencias Naturales', assignedTeacherId: null },
];

const initialTeachers = [
    { id: 't1', name: 'Prof. Ana Pérez', assignedCourses: ['c1'] },
    { id: 't2', name: 'Prof. Luis Gómez', assignedCourses: ['c2'] },
    { id: 't3', name: 'Prof. Sofía Castro', assignedCourses: [] },
];

const initialEstrategias = ["Escrita", "Práctica", "Proyecto", "Oral", "Observación"];
const initialTecnicas = ["Prueba", "Entrevista", "Prueba de ejecución", "Guía de trabajo", "Observación sistemática"];
const initialInstrumentos = ["Cuestionario", "Registro anecdótico", "Escala de estimación", "Lista de cotejo", "Rúbrica"];

const teacherFormSchema = z.object({
  name: z.string().min(2, "El nombre es requerido."),
});

const courseFormSchema = z.object({
    name: z.string().min(2, "El nombre es requerido."),
    assignedTeacher: z.string().optional(),
});

const evaluationItemSchema = z.object({
    name: z.string().min(2, "El nombre es requerido."),
});

// --- MAIN COMPONENT ---
export function AdminCourseView() {
    const [courses, setCourses] = useState(initialCourses);
    const [teachers, setTeachers] = useState(initialTeachers);
    const [estrategias, setEstrategias] = useState(initialEstrategias);
    const [tecnicas, setTecnicas] = useState(initialTecnicas);
    const [instrumentos, setInstrumentos] = useState(initialInstrumentos);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [sheetType, setSheetType] = useState(null);

    const teacherForm = useForm({
        resolver: zodResolver(teacherFormSchema),
        defaultValues: { name: "" },
    });

    const courseForm = useForm({
        resolver: zodResolver(courseFormSchema),
        defaultValues: { name: "", assignedTeacher: "" },
    });

    const evalItemForm = useForm({
        resolver: zodResolver(evaluationItemSchema),
        defaultValues: { name: "" },
    });

    const handleOpenSheet = (type) => {
        setSheetType(type);
        setIsSheetOpen(true);
    };

    const handleAddTeacher = (values) => {
        const newTeacherId = `t${teachers.length + 1}`;
        setTeachers(prev => [...prev, { id: newTeacherId, name: values.name, assignedCourses: [] }]);
        teacherForm.reset();
        setIsSheetOpen(false);
        toast.success("Profesor agregado.");
    };

    const handleAddCourse = (values) => {
        const newCourseId = `c${courses.length + 1}`;
        setCourses(prev => [...prev, { id: newCourseId, name: values.name, assignedTeacherId: values.assignedTeacher }]);
        if (values.assignedTeacher) {
            setTeachers(prev =>
                prev.map(t =>
                    t.id === values.assignedTeacher ? { ...t, assignedCourses: [...t.assignedCourses, newCourseId] } : t
                )
            );
        }
        courseForm.reset();
        setIsSheetOpen(false);
        toast.success("Curso agregado.");
    };
    
    const handleAddEvalItem = (values) => {
        if (sheetType === 'estrategia') {
            setEstrategias(prev => [...prev, values.name]);
        } else if (sheetType === 'tecnica') {
            setTecnicas(prev => [...prev, values.name]);
        } else if (sheetType === 'instrumento') {
            setInstrumentos(prev => [...prev, values.name]);
        }
        evalItemForm.reset();
        setIsSheetOpen(false);
        toast.success(`${sheetType} agregada.`);
    };

    const handleDeleteEvalItem = (type, name) => {
        if (type === 'estrategia') {
            setEstrategias(prev => prev.filter(item => item !== name));
        } else if (type === 'tecnica') {
            setTecnicas(prev => prev.filter(item => item !== name));
        } else if (type === 'instrumento') {
            setInstrumentos(prev => prev.filter(item => item !== name));
        }
        toast.success(`${type} eliminada.`);
    };

    const getTeacherName = (id) => {
        const teacher = teachers.find(t => t.id === id);
        return teacher ? teacher.name : '-';
    };

    const getAssignedCourses = (teacherId) => {
      const teacher = teachers.find(t => t.id === teacherId);
      if (!teacher) return '-';
      const assignedCourseNames = teacher.assignedCourses.map(courseId => {
        const course = courses.find(c => c.id === courseId);
        return course ? course.name : '';
      }).filter(Boolean);
      return assignedCourseNames.length > 0 ? assignedCourseNames.join(', ') : '-';
    };

    const renderCoursesTab = () => (
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-[#003366]">Cursos</h3>
          <Button onClick={() => handleOpenSheet('course')} className="bg-[#0077B6] hover:bg-[#005580] text-white"><Plus className="h-4 w-4 mr-2" /> Agregar Curso</Button>
        </div>
        <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
          <Table>
            <TableHeader className="bg-[#E0F2F7]">
              <TableRow>
                <TableHead className="text-[#003366]">Curso</TableHead>
                <TableHead className="text-[#003366]">Profesor Asignado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white divide-y divide-gray-100">
              {courses.map(course => (
                <TableRow key={course.id} className="hover:bg-[#F8FDFE]">
                  <TableCell className="text-gray-700">{course.name}</TableCell>
                  <TableCell className="text-gray-700">{getTeacherName(course.assignedTeacherId)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );

    const renderTeachersTab = () => (
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-[#003366]">Profesores</h3>
          <Button onClick={() => handleOpenSheet('teacher')} className="bg-[#0077B6] hover:bg-[#005580] text-white"><Plus className="h-4 w-4 mr-2" /> Agregar Profesor</Button>
        </div>
        <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
          <Table>
            <TableHeader className="bg-[#E0F2F7]">
              <TableRow>
                <TableHead className="text-[#003366]">Nombre</TableHead>
                <TableHead className="text-[#003366]">Cursos Asignados</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white divide-y divide-gray-100">
              {teachers.map(teacher => (
                <TableRow key={teacher.id} className="hover:bg-[#F8FDFE]">
                  <TableCell className="text-gray-700">{teacher.name}</TableCell>
                  <TableCell className="text-gray-700">{getAssignedCourses(teacher.id)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );

    const renderEvalElementsTab = () => (
      <Tabs defaultValue="estrategias">
        <TabsList className="grid w-full grid-cols-3 bg-[#E0F2F7] rounded-lg p-1 mb-6">
          <TabsTrigger value="estrategias" className="data-[state=active]:bg-[#0077B6] data-[state=active]:text-white data-[state=active]:shadow-sm text-[#003366] hover:text-[#005580]">Estrategias</TabsTrigger>
          <TabsTrigger value="tecnicas" className="data-[state=active]:bg-[#0077B6] data-[state=active]:text-white data-[state=active]:shadow-sm text-[#003366] hover:text-[#005580]">Técnicas</TabsTrigger>
          <TabsTrigger value="instrumentos" className="data-[state=active]:bg-[#0077B6] data-[state=active]:text-white data-[state=active]:shadow-sm text-[#003366] hover:text-[#005580]">Instrumentos</TabsTrigger>
        </TabsList>
        <TabsContent value="estrategias" className="p-4 bg-[#FDFEFF] rounded-lg shadow-sm">
          <div className="flex justify-between mb-4">
            <h4 className="text-lg font-semibold text-[#003366]">Estrategias de Evaluación</h4>
            <Button onClick={() => handleOpenSheet('estrategia')} className="bg-[#0077B6] hover:bg-[#005580] text-white"><Plus className="h-4 w-4 mr-2" /> Agregar</Button>
          </div>
          <Table>
            <TableBody className="bg-white divide-y divide-gray-100">
              {estrategias.map((est, index) => (
                <TableRow key={index} className="hover:bg-[#F8FDFE]">
                  <TableCell className="text-gray-700">{est}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteEvalItem('estrategia', est)} className="text-red-500 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
        <TabsContent value="tecnicas" className="p-4 bg-[#FDFEFF] rounded-lg shadow-sm">
          <div className="flex justify-between mb-4">
            <h4 className="text-lg font-semibold text-[#003366]">Técnicas de Evaluación</h4>
            <Button onClick={() => handleOpenSheet('tecnica')} className="bg-[#0077B6] hover:bg-[#005580] text-white"><Plus className="h-4 w-4 mr-2" /> Agregar</Button>
          </div>
          <Table>
            <TableBody className="bg-white divide-y divide-gray-100">
              {tecnicas.map((tec, index) => (
                <TableRow key={index} className="hover:bg-[#F8FDFE]">
                  <TableCell className="text-gray-700">{tec}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteEvalItem('tecnica', tec)} className="text-red-500 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
        <TabsContent value="instrumentos" className="p-4 bg-[#FDFEFF] rounded-lg shadow-sm">
          <div className="flex justify-between mb-4">
            <h4 className="text-lg font-semibold text-[#003366]">Instrumentos de Evaluación</h4>
            <Button onClick={() => handleOpenSheet('instrumento')} className="bg-[#0077B6] hover:bg-[#005580] text-white"><Plus className="h-4 w-4 mr-2" /> Agregar</Button>
          </div>
          <Table>
            <TableBody className="bg-white divide-y divide-gray-100">
              {instrumentos.map((inst, index) => (
                <TableRow key={index} className="hover:bg-[#F8FDFE]">
                  <TableCell className="text-gray-700">{inst}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteEvalItem('instrumento', inst)} className="text-red-500 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
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
            <h1 className="text-4xl font-extrabold mb-2 text-[#003366]">PANEL DE ADMINISTRACIÓN</h1>
          </div>
          <Tabs defaultValue="courses">
            <TabsList className="grid w-full grid-cols-3 bg-[#E0F2F7] rounded-lg p-1 mb-6">
              <TabsTrigger value="courses" className="data-[state=active]:bg-[#0077B6] data-[state=active]:text-white data-[state=active]:shadow-sm text-[#003366] hover:text-[#005580]">Cursos</TabsTrigger>
              <TabsTrigger value="teachers" className="data-[state=active]:bg-[#0077B6] data-[state=active]:text-white data-[state=active]:shadow-sm text-[#003366] hover:text-[#005580]">Profesores</TabsTrigger>
              <TabsTrigger value="eval_elements" className="data-[state=active]:bg-[#0077B6] data-[state=active]:text-white data-[state=active]:shadow-sm text-[#003366] hover:text-[#005580]">Elementos de Evaluación</TabsTrigger>
            </TabsList>
            <TabsContent value="courses" className="mt-6 p-4 bg-[#FDFEFF] rounded-lg shadow-sm">{renderCoursesTab()}</TabsContent>
            <TabsContent value="teachers" className="mt-6 p-4 bg-[#FDFEFF] rounded-lg shadow-sm">{renderTeachersTab()}</TabsContent>
            <TabsContent value="eval_elements" className="mt-6 p-4 bg-[#FDFEFF] rounded-lg shadow-sm">{renderEvalElementsTab()}</TabsContent>
          </Tabs>
        </div>
  
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetContent className="bg-white p-6 shadow-lg">
            <SheetHeader className="mb-6">
              <SheetTitle className="text-2xl font-bold text-[#003366]">
                {sheetType === 'teacher' && "Nuevo Profesor"}
                {sheetType === 'course' && "Nuevo Curso"}
                {sheetType === 'estrategia' && "Nueva Estrategia"}
                {sheetType === 'tecnica' && "Nueva Técnica"}
                {sheetType === 'instrumento' && "Nuevo Instrumento"}
              </SheetTitle>
              <SheetDescription className="text-gray-600">
                {sheetType === 'teacher' && "Agrega un nuevo profesor al sistema."}
                {sheetType === 'course' && "Crea un nuevo curso y asígnale un profesor."}
                {sheetType === 'estrategia' && "Agrega un tipo de estrategia de evaluación."}
                {sheetType === 'tecnica' && "Agrega una técnica de evaluación."}
                {sheetType === 'instrumento' && "Agrega un instrumento de evaluación."}
              </SheetDescription>
            </SheetHeader>
            
            {sheetType === 'teacher' && (
              <Form {...teacherForm}>
                <form onSubmit={teacherForm.handleSubmit(handleAddTeacher)} className="space-y-4 py-4">
                  <FormField
                    control={teacherForm.control} name="name"
                    render={({ field }) => (<FormItem><FormLabel>Nombre</FormLabel><FormControl><Input placeholder="Ej. Prof. Juan Pérez" {...field} className="border-gray-300 focus:border-[#0077B6]" /></FormControl><FormMessage /></FormItem>)}
                  />
                  <SheetFooter>
                    <Button type="submit" className="w-full bg-[#0077B6] hover:bg-[#005580] text-white">Guardar Profesor</Button>
                  </SheetFooter>
                </form>
              </Form>
            )}
  
            {sheetType === 'course' && (
              <Form {...courseForm}>
                <form onSubmit={courseForm.handleSubmit(handleAddCourse)} className="space-y-4 py-4">
                  <FormField
                    control={courseForm.control} name="name"
                    render={({ field }) => (<FormItem><FormLabel>Nombre del Curso</FormLabel><FormControl><Input placeholder="Ej. Matemáticas 2do Año" {...field} className="border-gray-300 focus:border-[#0077B6]" /></FormControl><FormMessage /></FormItem>)}
                  />
                  <FormField
                    control={courseForm.control} name="assignedTeacher"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Profesor a cargo</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="border-gray-300 focus:border-[#0077B6]">
                              <SelectValue placeholder="Selecciona un profesor" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {teachers.map(teacher => <SelectItem key={teacher.id} value={teacher.id}>{teacher.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <SheetFooter>
                    <Button type="submit" className="w-full bg-[#0077B6] hover:bg-[#005580] text-white">Guardar Curso</Button>
                  </SheetFooter>
                </form>
              </Form>
            )}
  
            {(sheetType === 'estrategia' || sheetType === 'tecnica' || sheetType === 'instrumento') && (
              <Form {...evalItemForm}>
                <form onSubmit={evalItemForm.handleSubmit(handleAddEvalItem)} className="space-y-4 py-4">
                  <FormField
                    control={evalItemForm.control} name="name"
                    render={({ field }) => (<FormItem><FormLabel>Nombre</FormLabel><FormControl><Input placeholder="Ej. Presentación Oral" {...field} className="border-gray-300 focus:border-[#0077B6]" /></FormControl><FormMessage /></FormItem>)}
                  />
                  <SheetFooter>
                    <Button type="submit" className="w-full bg-[#0077B6] hover:bg-[#005580] text-white">Guardar</Button>
                  </SheetFooter>
                </form>
              </Form>
            )}
          </SheetContent>
        </Sheet>
      </div>
    );
  }