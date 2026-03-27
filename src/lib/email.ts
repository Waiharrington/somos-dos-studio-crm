import { Resend } from 'resend';

// Inicialización diferida para evitar errores de compilación/tiempo de ejecución si falta la KEY
let resend: Resend | null = null;

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("ADVERTENCIA: RESEND_API_KEY no configurada. Los correos no se enviarán.");
    return null;
  }
  if (!resend) {
    resend = new Resend(apiKey);
  }
  return resend;
}

/**
 * Envía una notificación a la Somos Dos Studio cuando se registra un nuevo cliente.
 */
export async function sendNewPatientNotification(patientData: {
  firstName: string;
  lastName: string;
  idNumber: string;
  treatmentType: string;
}) {
  try {
    const client = getResendClient();
    if (!client) return { success: false, error: "Resend no configurado" };

    const { firstName, lastName, idNumber, treatmentType } = patientData;

    const { data, error } = await client.emails.send({
      from: 'Somos Dos Studio CRM <onboarding@resend.dev>', // Usando el dominio de prueba de Resend
      to: 'waikoloahb@gmail.com', // El correo que vimos en la captura del usuario
      subject: `🆕 Nuevo Registro: ${firstName} ${lastName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #fce7f3; border-radius: 12px; overflow: hidden;">
          <div style="background-color: #9D4D76; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">¡Nuevo cliente Registrado!</h1>
          </div>
          <div style="padding: 30px; color: #374151;">
            <p style="font-size: 16px;">Hola Somos Dos Studio, tienes un nuevo registro desde el formulario público:</p>
            
            <div style="background-color: #fdf2f8; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Nombre:</strong> ${firstName} ${lastName}</p>
              <p style="margin: 5px 0;"><strong>Identificación:</strong> ${idNumber}</p>
              <p style="margin: 5px 0;"><strong>servicio:</strong> ${treatmentType}</p>
            </div>

            <p style="font-size: 14px; color: #6b7280;">Puedes ver el expediente completo entrando al dashboard del administrador.</p>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="https://Somos Dos Studio-crm.vercel.app/admin/clientes" style="background-color: #D685A9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 30px; font-weight: bold; font-size: 14px;">Ir al Dashboard</a>
            </div>
          </div>
          <div style="background-color: #f9fafb; padding: 15px; text-align: center; font-size: 12px; color: #9ca3af;">
            Este es un mensaje automático de Somos Dos Studio CRM.
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Error enviando email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Email Exception:', err);
    return { success: false, error: err };
  }
}
