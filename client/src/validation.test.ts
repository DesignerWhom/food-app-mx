import { describe, it, expect } from 'vitest';

// Función simple de validación (simulación de lógica de negocio)
const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

describe('Validación de Email', () => {
    it('debería aceptar un correo válido', () => {
        expect(isValidEmail('usuario@ejemplo.com')).toBe(true);
    });

    it('debería rechazar un correo sin @', () => {
        expect(isValidEmail('usuarioejemplo.com')).toBe(false);
    });

    it('debería rechazar un correo vacío', () => {
        expect(isValidEmail('')).toBe(false);
    });
});