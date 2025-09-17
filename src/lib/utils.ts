import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function formatCurrency(amount: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('it-IT').format(date);
}

export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('it-IT', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function calculateDaysBetween(startDate: Date, endDate: Date): number {
  const timeDiff = endDate.getTime() - startDate.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
}

export function getOrderStatusColor(status: string): string {
  const colors = {
    'bozza': 'bg-gray-100 text-gray-800',
    'inviato': 'bg-blue-100 text-blue-800',
    'confermato': 'bg-green-100 text-green-800',
    'in-produzione': 'bg-yellow-100 text-yellow-800',
    'controllo-qualita': 'bg-purple-100 text-purple-800',
    'spedito': 'bg-indigo-100 text-indigo-800',
    'consegnato': 'bg-emerald-100 text-emerald-800',
    'completato': 'bg-green-200 text-green-900',
    'annullato': 'bg-red-100 text-red-800',
  };
  return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
}

export function getQualityGradeColor(grade: string): string {
  const colors = {
    'A': 'bg-green-100 text-green-800',
    'B': 'bg-yellow-100 text-yellow-800',
    'C': 'bg-orange-100 text-orange-800',
    'scarto': 'bg-red-100 text-red-800',
  };
  return colors[grade as keyof typeof colors] || 'bg-gray-100 text-gray-800';
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}