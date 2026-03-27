interface ExportPatient {
  id: string;
  first_name: string;
  last_name: string;
  id_number: string;
  age?: number | string;
  phone: string;
  email?: string;
  address?: string;
  last_visit_date?: string;
  total_sessions?: number;
  status?: string;
  alert_level?: number;
  created_at: string;
}

/**
 * Convierte un arreglo de objetos de clientes a una descarga de archivo CSV.
 */
export function exportPatientsToCSV(patients: ExportPatient[]) {
  if (!patients || patients.length === 0) return;

  // Definir las columnas que queremos exportar
  const headers = [
    "ID",
    "Nombre completo",
    "Cédula/ID",
    "Edad",
    "Teléfono",
    "Email",
    "Dirección",
    "Última Visita",
    "Sesiones Totales",
    "Estado",
    "Nivel Alerta",
    "Fecha Registro"
  ];

  // Mapear los datos a filas
  const rows = patients.map((p) => [
    p.id,
    `${p.first_name} ${p.last_name}`,
    `"${p.id_number}"`, // Escapado para evitar que Excel lo tome como número científico
    p.age || "",
    `"${p.phone}"`,
    p.email || "",
    `"${p.address?.replace(/\n/g, ' ')}"`, // Limpiar saltos de línea
    p.last_visit_date || "Nunca",
    p.total_sessions || 0,
    p.status || "Activo",
    p.alert_level || 0,
    new Date(p.created_at).toLocaleDateString()
  ]);

  // Construir el cuerpo del CSV (usando punto y coma para mejor compatibilidad con Excel en español)
  const csvContent = [
    headers.join(";"),
    ...rows.map((row) => row.join(";"))
  ].join("\n");

  // Crear el blob y descargar
  const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  
  const dateStr = new Date().toISOString().split('T')[0];
  link.setAttribute("href", url);
  link.setAttribute("download", `Somos Dos Studio_clientes_${dateStr}.csv`);
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
