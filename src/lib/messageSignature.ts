// Appends a warm closing + clinic branding to outgoing WhatsApp messages the app
// generates by default (reminders, quick-send). Doctor-authored custom templates
// (communication_templates) are left as-is — this only touches the built-in defaults.
export function withClinicSignature(body: string, clinicName: string, mapsUrl?: string | null) {
  const lines = [body, "", `بالعافية 🌿`, `عيادة ${clinicName}`];
  if (mapsUrl) lines.push(`📍 موقعنا: ${mapsUrl}`);
  return lines.join("\n");
}
