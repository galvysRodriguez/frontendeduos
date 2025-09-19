import { GradesTable } from "./components/GradesTable";


export default function GradesPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Mis Calificaciones</h1>
      <GradesTable />
    </div>
  );
}