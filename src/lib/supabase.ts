import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
const supabaseServiceRole = import.meta.env.VITE_SUPABASE_SERVICE_ROLE as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client — uses service role for creating auth users (admin operations only)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRole, {
  auth: { autoRefreshToken: false, persistSession: false },
});

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
 * Send email notification using Resend API.
 * Setup: Create free account at https://resend.com → get API key → add to .env as VITE_RESEND_API_KEY
 * Free tier: 3000 emails/month, no credit card required.
 */
export async function sendRegistrationNotification(registration: {
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  businessType: string;
}): Promise<void> {
  const resendKey = import.meta.env.VITE_RESEND_API_KEY;
  const notifyEmail = import.meta.env.VITE_NOTIFY_EMAIL || 'systemapropos@gmail.com';

  if (!resendKey || resendKey === 'your_resend_api_key_here') {
    console.warn('[email] VITE_RESEND_API_KEY not configured. Get free key at resend.com');
    return;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'AgroVida ERP <onboarding@resend.dev>',
        to: [notifyEmail],
        subject: `🌱 Nueva solicitud de registro: ${registration.businessName}`,
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
                <tr><td style="padding: 8px 0; color: #52525B; font-size: 14px;"><strong>Tipo:</strong></td><td style="padding: 8px 0; color: #18181B; font-size: 14px;">${registration.businessType}</td></tr>
              </table>
              <div style="margin-top: 20px; padding: 16px; background: #DCFCE7; border-radius: 8px; border: 1px solid #BBF7D0;">
                <p style="color: #15803D; margin: 0; font-size: 14px;">
                  ✅ <strong>Acción requerida:</strong> Entra al panel admin para aprobar o rechazar esta solicitud.
                </p>
              </div>
              <div style="margin-top: 20px;">
                <a href="https://agrovidapro.com" style="background: linear-gradient(135deg, #16A34A, #22C55E); color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 600; display: inline-block;">
                  Ir al Panel Admin →
                </a>
              </div>
            </div>
            <div style="padding: 16px; text-align: center; color: #A1A1AA; font-size: 12px;">
              AgroVida ERP — agrovidapro.com
            </div>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('[email] Resend error:', err);
    } else {
      console.log('[email] ✅ Notification sent to', notifyEmail);
    }
  } catch (err) {
    console.error('[email] Failed to send notification:', err);
  }
}
