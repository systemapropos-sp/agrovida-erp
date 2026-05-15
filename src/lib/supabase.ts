import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function uploadLogoToSupabase(file: File, businessId: string): Promise<string> {
  const ext = file.name.split('.').pop() || 'png';
  const path = `business-logos/${businessId}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from('logos')
    .upload(path, file, { upsert: true, contentType: file.type });
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from('logos').getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Send email notification to admin when a new registration is submitted.
 * Uses Supabase Edge Function (if available) or fallback to no-op.
 */
export async function sendRegistrationNotification(registration: {
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  businessType: string;
}): Promise<void> {
  try {
    // Try calling a Supabase Edge Function for email
    const { error } = await supabase.functions.invoke('send-notification', {
      body: {
        to: import.meta.env.VITE_NOTIFY_EMAIL || 'systemapropos@gmail.com',
        subject: `Nueva solicitud de registro: ${registration.businessName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #16A34A, #22C55E); padding: 24px; border-radius: 8px 8px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 22px;">🌱 AgroVida ERP</h1>
              <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">Nueva solicitud de registro</p>
            </div>
            <div style="background: #f9f9f9; padding: 24px; border: 1px solid #e5e5e5;">
              <h2 style="color: #18181B; font-size: 18px; margin-bottom: 16px;">Detalles del Negocio</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 8px 0; color: #52525B; font-size: 14px;"><strong>Negocio:</strong></td><td style="padding: 8px 0; color: #18181B; font-size: 14px;">${registration.businessName}</td></tr>
                <tr><td style="padding: 8px 0; color: #52525B; font-size: 14px;"><strong>Contacto:</strong></td><td style="padding: 8px 0; color: #18181B; font-size: 14px;">${registration.contactName}</td></tr>
                <tr><td style="padding: 8px 0; color: #52525B; font-size: 14px;"><strong>Email:</strong></td><td style="padding: 8px 0; color: #18181B; font-size: 14px;">${registration.email}</td></tr>
                <tr><td style="padding: 8px 0; color: #52525B; font-size: 14px;"><strong>Teléfono:</strong></td><td style="padding: 8px 0; color: #18181B; font-size: 14px;">${registration.phone}</td></tr>
                <tr><td style="padding: 8px 0; color: #52525B; font-size: 14px;"><strong>Tipo de Negocio:</strong></td><td style="padding: 8px 0; color: #18181B; font-size: 14px;">${registration.businessType}</td></tr>
              </table>
              <div style="margin-top: 20px; padding: 16px; background: #DCFCE7; border-radius: 8px; border: 1px solid #BBF7D0;">
                <p style="color: #15803D; margin: 0; font-size: 14px;">
                  ✅ <strong>Acción requerida:</strong> Inicia sesión en el panel de administración para aprobar o rechazar esta solicitud.
                </p>
              </div>
              <div style="margin-top: 20px;">
                <a href="https://agrovidapro.com/admin" style="background: linear-gradient(135deg, #16A34A, #22C55E); color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 600;">
                  Ir al Panel Admin
                </a>
              </div>
            </div>
            <div style="padding: 16px; text-align: center; color: #A1A1AA; font-size: 12px;">
              AgroVida ERP — agrovidapro.com
            </div>
          </div>
        `,
      },
    });
    if (error) console.warn('[notification] Edge function not available:', error.message);
  } catch (err) {
    // Silently fail - the registration is still saved to the database
    console.warn('[notification] Could not send email notification:', err);
  }
}
