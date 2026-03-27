# Plan de Mejoras Técnicas - Aplicación Somos Dos Studio CRM

## Introducción

Este documento detalla una serie de mejoras recomendadas para la aplicación Somos Dos Studio CRM. El objetivo es aumentar la seguridad, fiabilidad, y mantenibilidad del código. Las acciones están priorizadas desde lo más crítico a mejoras generales de calidad.

---

## 1. Seguridad (Prioridad Crítica)

Las siguientes acciones son urgentes para proteger los datos sensibles de los clientes y prevenir vulnerabilidades.

### Acción 1.1: Añadir Control de Acceso a las Server Actions

- **Qué:** Implementar una verificación de sesión y rol de usuario al inicio de cada Server Action que maneje datos.
- **Por qué:** Actualmente, funciones como `getPatientsAction` y `getPatientByIdAction` son públicas, permitiendo que cualquiera acceda a la información de los clientes. Esta es una **brecha de seguridad grave**.
- **Cómo:**
    1.  Crear una función `helper` en el servidor que obtenga la sesión del usuario actual desde Supabase.
    2.  Esta función debe verificar si el usuario está autenticado y si tiene un rol permitido (ej. 'admin' o 'doctor').
    3.  Llamar a esta función al principio de cada `action` sensible. Si la verificación falla, la acción debe lanzar un error inmediatamente.

### Acción 1.2: Implementar Validación de Datos en el Servidor

- **Qué:** Validar todos los datos que llegan a las Server Actions usando los esquemas de Zod.
- **Por qué:** No se puede confiar en la validación del lado del cliente, ya que puede ser omitida. La validación en el servidor es la última línea de defensa contra datos malformados o maliciosos.
- **Cómo:** Dentro de `savePatientAction` y otras acciones que reciben datos, ejecutar `schema.parse(formData)` dentro de un bloque `try/catch`. Si la validación falla, retornar un error 400 (Bad Request).

---

## 2. Estrategia de Pruebas (Testing)

La ausencia de pruebas automatizadas es un riesgo alto para la estabilidad del proyecto a largo plazo.

### Acción 2.1: Implementar Pruebas Unitarias y de Integración

- **Qué:** Configurar un framework de testing como **Vitest** (moderno y rápido) o Jest.
- **Por qué:** Para verificar que las funciones individuales (especialmente las Server Actions) y los componentes de React funcionan como se espera, prevenir regresiones al hacer cambios y facilitar refactorizaciones seguras.
- **Cómo:**
    1.  Instalar `vitest` y `testing-library/react`.
    2.  Crear archivos de prueba (ej. `patients.test.ts`) para las actions.
    3.  Escribir casos de prueba que cubran tanto los casos de éxito como los de error para cada función.

### Acción 2.2: (Opcional) Añadir Pruebas End-to-End (E2E)

- **Qué:** Integrar una herramienta como **Playwright** o Cypress.
- **Por qué:** Para simular flujos de usuario completos en un navegador real (ej. registrar un cliente, iniciar sesión, generar un reporte), asegurando que la integración de todos los componentes de la aplicación funciona correctamente.
- **Cómo:** Instalar Playwright y crear scripts de prueba para los flujos de usuario más críticos.

---

## 3. Calidad de Código y Buenas Prácticas

Estas mejoras harán el código más robusto, eficiente y fácil de mantener.

### Acción 3.1: Centralizar el Manejo de Restricciones en la Base de Datos

- **Qué:** Eliminar el `SELECT` que comprueba duplicados antes de un `INSERT` en `savePatientAction`.
- **Por qué:** La base de datos ya previene duplicados con la restricción `UNIQUE`. Hacer un `SELECT` previo es menos eficiente y crea una "condición de carrera". Es más simple y robusto confiar en la base de datos.
- **Cómo:** Quitar la primera llamada a Supabase en `savePatientAction`. En su lugar, analizar el `error` devuelto por el `INSERT`. Si el error corresponde a una violación de la restricción `UNIQUE`, devolver un mensaje amigable al usuario.

### Acción 3.2: Eliminar "Magic Strings"

- **Qué:** Reemplazar valores fijos de tipo string (como el estado `'Activo'`) por constantes o enums.
- **Por qué:** Para evitar errores de tipeo y centralizar los valores posibles, facilitando cambios futuros.
- **Cómo:** Crear un archivo `src/lib/constants.ts` y exportar objetos con los valores.
    ```typescript
    export const PATIENT_STATUS = {
      ACTIVE: 'Activo',
      INACTIVE: 'Inactivo',
    } as const;
    ```
    Luego, usar `PATIENT_STATUS.ACTIVE` en el código.

### Acción 3.3: Mejorar el Script de `lint`

- **Qué:** Cambiar el script `lint` en `package.json`.
- **Por qué:** Para usar la configuración de ESLint integrada y recomendada por Next.js, que asegura una cobertura completa del proyecto.
- **Cómo:** Modificar `package.json` de `"lint": "eslint"` a `"lint": "next lint"`.

---

## 4. Gestión de Dependencias

### Acción 4.1: Revisar y Estabilizar Versiones

- **Qué:** Auditar las versiones de los paquetes en `package.json`.
- **Por qué:** Algunas dependencias (`next`, `react`, `tailwindcss`) están en versiones que podrían ser experimentales o futuras. Usar versiones estables (LTS) reduce el riesgo de encontrar bugs de la propia librería.
- **Cómo:** Investigar las últimas versiones estables recomendadas para los paquetes principales y actualizar `package.json` para usarlas.
