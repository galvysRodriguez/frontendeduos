// components/Sidebar.jsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Book,
  Calendar,
  ClipboardList,
  User,
  LayoutDashboard,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home, roles: ["student", "teacher"] },
  { href: "/grades", label: "Mis Calificaciones", icon: Book, roles: ["student"] },
  { href: "/teacher/grades", label: "Cargar Notas", icon: Book, roles: ["teacher"] },
  { href: "/schedule", label: "Horario", icon: Calendar, roles: ["student", "teacher"] },
  { href: "/teacher/schedule", label: "Gestionar Horarios", icon: Calendar, roles: ["teacher"] },
  { href: "/evaluation-plan", label: "Plan de Evaluación", icon: ClipboardList, roles: ["student", "teacher"] },
  { href: "/profile", label: "Mi Perfil", icon: User, roles: ["student", "teacher"] },
];

export function Sidebar({ userRole = "student" }) {
  const pathname = usePathname();

  return (
    <aside className="hidden md:block w-64 bg-gray-50 border-r border-gray-200 min-h-screen p-4">
      <div className="flex items-center space-x-2 px-2 py-4">
        <LayoutDashboard className="h-6 w-6 text-blue-600" />
        <span className="text-xl font-bold">EduSys</span>
      </div>
      <nav className="mt-8">
        <ul className="space-y-1">
          {navItems
            .filter((item) => item.roles.includes(userRole))
            .map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors duration-200
                      ${isActive ? "bg-blue-100 text-blue-700 font-semibold" : "text-gray-600 hover:bg-gray-200"}
                    `}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
        </ul>
      </nav>
    </aside>
  );
}