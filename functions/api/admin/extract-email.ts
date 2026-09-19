import { jsonResponse, readBody } from '../../_shared/helpers';
import { requireAdmin } from '../../_shared/auth';

export const onRequestPost: PagesFunction = async (context) => {
  const auth = await requireAdmin(context.request, context.env);
  if (auth instanceof Response) return auth;

  try {
    const { emailText } = await readBody(context.request);
    if (!emailText) {
      return jsonResponse({ error: 'Email text is required' }, 400);
    }

    const prompt = `Analyze this email text. Extract the sender's name (the specific person) and the company or brand name they represent.\nIf you can't confidently determine one of them, leave it blank. Return JSON with contactName and companyName keys.\n\nEmail Text:\n"""\n${emailText}\n"""`;

    let contactName = '';
    let companyName = '';

    const geminiKey = (context.env as any).GEMINI_API_KEY || '';
    const geminiModel = (context.env as any).GEMINI_MODEL || 'gemini-2.0-flash';

    if (geminiKey) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiKey}`;
        const res = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: 'application/json',
              responseSchema: {
                type: 'OBJECT',
                properties: {
                  contactName: { type: 'STRING' },
                  companyName: { type: 'STRING' },
                },
                required: ['contactName', 'companyName'],
              },
            },
          }),
        });
        const json: any = await res.json();
        const text = json.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
        const parsed = JSON.parse(text);
        contactName = parsed.contactName || '';
        companyName = parsed.companyName || '';
      } catch (e) {}
    }

    if (!contactName) {
      const nameMatch = emailText.match(/(?:(?:from|i'm|i am|this is|regards,?|sincerely,?|cheers,?|best,?|thanks,?)\s+)([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
      if (nameMatch && nameMatch[1]) contactName = nameMatch[1].trim();
    }

    if (!companyName) {
      const coMatch = emailText.match(/(?:at|from|representing|with)\s+([A-Z0-9][a-zA-Z0-9.\-_]+(?:\s+[A-Z0-9][a-zA-Z0-9.\-_]+)?)/i) ||
                      emailText.match(/@([a-zA-Z0-9\-]+)\.(?:com|io|co|ai|net|org|dev)/i);
      if (coMatch && coMatch[1]) {
        const rawCo = coMatch[1].trim();
        companyName = rawCo.charAt(0).toUpperCase() + rawCo.slice(1);
      }
    }

    return jsonResponse({ success: true, contactName, companyName });
  } catch (error: any) {
    return jsonResponse({ error: error.message || 'Failed to extract email info' }, 500);
  }
};
