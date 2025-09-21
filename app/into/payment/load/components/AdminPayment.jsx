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
import { Button } from "app/components/ui/button";
import { Input } from "app/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
    DialogFooter
} from "app/components/ui/dialog";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "app/components/ui/tabs";
import { Switch } from "app/components/ui/switch";
import toast, { Toaster } from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Trash2, Edit } from "lucide-react";

// --- VALIDATION AND DATA STRUCTURES ---
const initialStudents = [
    { id: 1, name: "María Rodríguez", studentId: "12345678" },
    { id: 2, name: "Carlos Gómez", studentId: "87654321" },
    { id: 3, name: "Ana Pérez", studentId: "11223344" },
];

const initialPaymentPlans = [
    { id: 'p1', name: 'Mensualidad Enero', price: 50, description: 'Pago de la mensualidad de enero.', isActive: true, createdAt: '2025-01-01' },
    { id: 'p2', name: 'Mensualidad Febrero', price: 50, description: 'Pago de la mensualidad de febrero.', isActive: true, createdAt: '2025-02-01' },
    { id: 'p3', name: 'Inscripción Anual', price: 200, description: 'Costo de la inscripción para el año escolar.', isActive: false, createdAt: '2024-12-01' },
];

const initialPayments = [
    { id: 'pay1', studentName: 'María Rodríguez', plan: 'Mensualidad Enero', amount: 50, method: 'Transferencia', date: '2025-01-05', time: '10:30 AM' },
    { id: 'pay2', studentName: 'Carlos Gómez', plan: 'Mensualidad Enero', amount: 50, method: 'Pago Móvil', date: '2025-01-10', time: '09:00 AM' },
    { id: 'pay3', studentName: 'Ana Pérez', plan: 'Inscripción Anual', amount: 200, method: 'Tarjeta de Crédito', date: '2024-12-15', time: '03:45 PM' },
];

const paymentFormSchema = z.object({
    studentId: z.string().min(1, "Selecciona un estudiante."),
    planId: z.string().min(1, "Selecciona un plan de pago."),
    amount: z.coerce.number().min(1, "La cantidad debe ser mayor a 0."),
    method: z.string().min(1, "Selecciona un método de pago."),
    date: z.string().min(1, "La fecha es requerida."),
});

const planFormSchema = z.object({
    name: z.string().min(2, "El nombre del plan es requerido."),
    price: z.coerce.number().min(1, "El precio debe ser mayor a 0."),
    description: z.string().optional(),
});

// --- PDF EXPORT FUNCTION ---
const handleExportPayments = (payments, dollarRate) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.setTextColor("#003366");
    doc.text("Reporte de Pagos", 14, 20);
    doc.setFontSize(10);
    doc.setTextColor("#666666");
    doc.text(`Tasa del Dólar: ${dollarRate} USD`, 14, 26);
    doc.text(`Fecha del Reporte: ${new Date().toLocaleDateString()}`, 14, 32);

    autoTable(doc, {
        startY: 40,
        head: [['Estudiante', 'Plan', 'Monto ($)', 'Método', 'Fecha', 'Hora']],
        body: payments.map(payment => [
            payment.studentName,
            payment.plan,
            `$${payment.amount}`,
            payment.method,
            payment.date,
            payment.time,
        ]),
        styles: { fontSize: 10, textColor: "#333333" },
        headStyles: { fillColor: "#003366", textColor: "#FFFFFF", fontStyle: "bold" },
        alternateRowStyles: { fillColor: "#F0F8FF" }
    });

    doc.save("reporte_pagos.pdf");
    toast.success("Reporte de pagos exportado.");
};

// --- MAIN COMPONENT ---
export function AdminPaymentDashboard() {
    const [payments, setPayments] = useState(initialPayments);
    const [paymentPlans, setPaymentPlans] = useState(initialPaymentPlans);
    const [isRegisteringPayment, setIsRegisteringPayment] = useState(false);
    const [isManagingPlans, setIsManagingPlans] = useState(false);
    const [dollarRate, setDollarRate] = useState(38.5); // Fixed dollar rate

    const paymentForm = useForm({
        resolver: zodResolver(paymentFormSchema),
        defaultValues: {
            studentId: "",
            planId: "",
            amount: "",
            method: "Transferencia",
            date: new Date().toISOString().substring(0, 10),
        },
    });

    const planForm = useForm({
        resolver: zodResolver(planFormSchema),
        defaultValues: {
            name: "",
            price: 0,
            description: "",
        },
    });

    const onSubmitPayment = (values) => {
        const student = initialStudents.find(s => s.id === parseInt(values.studentId));
        const plan = paymentPlans.find(p => p.id === values.planId);

        if (!student || !plan) {
            toast.error("Datos de estudiante o plan inválidos.");
            return;
        }

        const now = new Date();
        const newPayment = {
            id: `pay${payments.length + 1}`,
            studentName: student.name,
            plan: plan.name,
            amount: values.amount,
            method: values.method,
            date: values.date,
            time: now.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' }),
        };

        setPayments(prev => [...prev, newPayment]);
        paymentForm.reset();
        setIsRegisteringPayment(false);
        toast.success("Pago registrado exitosamente.");
    };

    const onSubmitNewPlan = (values) => {
        const newPlan = {
            id: `p${paymentPlans.length + 1}`,
            name: values.name,
            price: values.price,
            description: values.description,
            isActive: true,
            createdAt: new Date().toISOString().substring(0, 10),
        };
        setPaymentPlans(prev => [...prev, newPlan]);
        planForm.reset();
        setIsManagingPlans(false);
        toast.success("Plan de pago creado.");
    };

    const handleTogglePlanStatus = (id) => {
        setPaymentPlans(prev =>
            prev.map(plan =>
                plan.id === id ? { ...plan, isActive: !plan.isActive } : plan
            )
        );
        toast.success("Estado del plan actualizado.");
    };

    const handleDeletePlan = (id) => {
        setPaymentPlans(paymentPlans.filter(plan => plan.id !== id));
        toast.success("Plan de pago eliminado.");
    };

    const renderPaymentsTab = () => (
        <>
            <div className="flex justify-between items-center mb-6 p-4 bg-[#F8FDFE] rounded-lg shadow-sm">
                <h2 className="text-2xl font-bold text-[#003366]">Historial de Pagos</h2>
                <div className="flex space-x-2">
                    <Dialog open={isRegisteringPayment} onOpenChange={setIsRegisteringPayment}>
                        <DialogTrigger asChild>
                            <Button className="bg-[#0077B6] hover:bg-[#005580] text-white"><Plus className="h-4 w-4 mr-2" /> Registrar Pago</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle className="text-[#003366]">Registrar Nuevo Pago</DialogTitle>
                                <DialogDescription className="text-gray-600">
                                    Completa los campos para registrar un pago.
                                </DialogDescription>
                            </DialogHeader>
                            <Form {...paymentForm}>
                                <form onSubmit={paymentForm.handleSubmit(onSubmitPayment)} className="space-y-4">
                                    <FormField
                                        control={paymentForm.control} name="studentId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Estudiante</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Selecciona un estudiante" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {initialStudents.map(student => (
                                                            <SelectItem key={student.id} value={student.id.toString()}>{student.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={paymentForm.control} name="planId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Plan de Pago</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Selecciona un plan" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {paymentPlans.filter(plan => plan.isActive).map(plan => (
                                                            <SelectItem key={plan.id} value={plan.id}>{plan.name} (${plan.price})</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={paymentForm.control} name="amount"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Cantidad Pagada ($)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" placeholder="Ej. 50" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={paymentForm.control} name="method"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Método de Pago</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Selecciona un método" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="Transferencia">Transferencia</SelectItem>
                                                        <SelectItem value="Pago Móvil">Pago Móvil</SelectItem>
                                                        <SelectItem value="Tarjeta de Crédito">Tarjeta de Crédito</SelectItem>
                                                        <SelectItem value="Efectivo">Efectivo</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={paymentForm.control} name="date"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Fecha</FormLabel>
                                                <FormControl>
                                                    <Input type="date" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <DialogFooter>
                                        <Button type="submit" className="w-full bg-[#0077B6] hover:bg-[#005580]">Registrar Pago</Button>
                                    </DialogFooter>
                                </form>
                            </Form>
                        </DialogContent>
                    </Dialog>
                    <Button onClick={() => handleExportPayments(payments, dollarRate)} variant="outline" className="border-[#003366] text-[#003366] hover:bg-[#E0F2F7]">Exportar Reporte a PDF</Button>
                </div>
            </div>

            <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm mb-8">
                <Table>
                    <TableHeader className="bg-[#E0F2F7]">
                        <TableRow>
                            <TableHead className="text-[#003366]">Estudiante</TableHead>
                            <TableHead className="text-[#003366]">Plan</TableHead>
                            <TableHead className="text-[#003366]">Monto ($)</TableHead>
                            <TableHead className="text-[#003366]">Método</TableHead>
                            <TableHead className="text-[#003366]">Fecha</TableHead>
                            <TableHead className="text-[#003366]">Hora</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="bg-white divide-y divide-gray-100">
                        {payments.map(payment => (
                            <TableRow key={payment.id} className="hover:bg-[#F8FDFE]">
                                <TableCell>{payment.studentName}</TableCell>
                                <TableCell>{payment.plan}</TableCell>
                                <TableCell>${payment.amount}</TableCell>
                                <TableCell>{payment.method}</TableCell>
                                <TableCell>{payment.date}</TableCell>
                                <TableCell>{payment.time}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </>
    );

    const renderPlansTab = () => (
        <>
            <div className="flex justify-between items-center mb-6 p-4 bg-[#F8FDFE] rounded-lg shadow-sm">
                <h2 className="text-2xl font-bold text-[#003366]">Planes de Pago</h2>
                <Dialog open={isManagingPlans} onOpenChange={setIsManagingPlans}>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="border-[#003366] text-[#003366] hover:bg-[#E0F2F7]"><Plus className="h-4 w-4 mr-2" /> Crear Nuevo Plan</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle className="text-[#003366]">Crear Nuevo Plan de Pago</DialogTitle>
                            <DialogDescription className="text-gray-600">
                                Define un nuevo plan con su nombre, precio y descripción.
                            </DialogDescription>
                        </DialogHeader>
                        <Form {...planForm}>
                            <form onSubmit={planForm.handleSubmit(onSubmitNewPlan)} className="space-y-4">
                                <FormField
                                    control={planForm.control} name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nombre del Plan</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Ej. Mensualidad Marzo" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={planForm.control} name="price"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Precio ($)</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="Ej. 50" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={planForm.control} name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Descripción</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Opcional" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <DialogFooter>
                                    <Button type="submit" className="w-full bg-[#0077B6] hover:bg-[#005580]">Crear Plan</Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
                <Table>
                    <TableHeader className="bg-[#E0F2F7]">
                        <TableRow>
                            <TableHead className="text-[#003366]">Nombre del Plan</TableHead>
                            <TableHead className="text-[#003366]">Precio ($)</TableHead>
                            <TableHead className="text-[#003366]">Descripción</TableHead>
                            <TableHead className="text-center text-[#003366]">Fecha de Creación</TableHead>
                            <TableHead className="text-center text-[#003366]">Estado</TableHead>
                            <TableHead className="text-center text-[#003366]">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="bg-white divide-y divide-gray-100">
                        {paymentPlans.map(plan => (
                            <TableRow key={plan.id} className="hover:bg-[#F8FDFE]">
                                <TableCell className="font-medium text-gray-700">{plan.name}</TableCell>
                                <TableCell>${plan.price}</TableCell>
                                <TableCell>{plan.description || '-'}</TableCell>
                                <TableCell className="text-center">{plan.createdAt}</TableCell>
                                <TableCell className="text-center">
                                    <Switch
                                        checked={plan.isActive}
                                        onCheckedChange={() => handleTogglePlanStatus(plan.id)}
                                        className="data-[state=checked]:bg-[#0077B6] data-[state=unchecked]:bg-gray-400"
                                    />
                                </TableCell>
                                <TableCell className="text-center">
                                    <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50" onClick={() => handleDeletePlan(plan.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </>
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
                    <h1 className="text-4xl font-extrabold mb-2 text-[#003366]">PANEL DE PAGOS</h1>
                </div>


                <Tabs defaultValue="payments" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-[#E0F2F7] rounded-lg p-1">
                        <TabsTrigger
                            value="payments"
                            className="data-[state=active]:bg-[#0077B6] data-[state=active]:text-white data-[state=active]:shadow-sm text-[#003366] hover:text-[#005580] text-sm"
                        >
                            Pagos Registrados
                        </TabsTrigger>
                        <TabsTrigger
                            value="plans"
                            className="data-[state=active]:bg-[#0077B6] data-[state=active]:text-white data-[state=active]:shadow-sm text-[#003366] hover:text-[#005580] text-sm"
                        >
                            Planes de Pago
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="payments" className="mt-6 p-4 bg-[#FDFEFF] rounded-lg shadow-sm">
                        {renderPaymentsTab()}
                    </TabsContent>
                    <TabsContent value="plans" className="mt-6 p-4 bg-[#FDFEFF] rounded-lg shadow-sm">
                        {renderPlansTab()}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}