/**
 * Genera un link de WhatsApp con mensaje pre-escrito.
 * Formatea el número para Venezuela (+58).
 */
export function buildWhatsAppUrl(
  phone: string,
  patientName: string,
  treatment: string,
  dateStr: string
): string {
  const digits = phone.replace(/\D/g, "");

  let intlPhone = digits;
  if (digits.startsWith("0")) {
    intlPhone = "58" + digits.slice(1);
  } else if (!digits.startsWith("58")) {
    intlPhone = "58" + digits;
  }

  const date = new Date(dateStr + "T12:00:00");
  const formattedDate = date.toLocaleDateString("es-VE", {
    weekday: "long",
    day:     "numeric",
    month:   "long",
  });

  const firstName = patientName.split(" ")[0];
  const message = `Hola ${firstName}! 😊 Le escribimos del consultorio de la Somos Dos Studio para recordarle su próxima sesión de *${treatment}* programada para el *${formattedDate}*. Por favor confirme su asistencia. ¡La esperamos!`;

  return `https://wa.me/${intlPhone}?text=${encodeURIComponent(message)}`;
}
