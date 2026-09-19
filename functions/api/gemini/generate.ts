import { jsonResponse, readBody, stripHtml } from '../../_shared/helpers';
import { requireAdmin } from '../../_shared/auth';

export const onRequestPost: PagesFunction = async (context) => {
  const auth = await requireAdmin(context.request, context.env);
  if (auth instanceof Response) return auth;

  try {
    let { text, type } = await readBody(context.request);
    if (!text || !type) {
      return jsonResponse({ error: 'Text and type are required' }, 400);
    }

    const geminiKey = (context.env as any).GEMINI_API_KEY || '';
    const geminiModel = (context.env as any).GEMINI_MODEL || 'gemini-2.0-flash';

    if (!geminiKey) {
      return jsonResponse({ error: 'AI generation is unavailable: GEMINI_API_KEY is not configured on the server.' }, 503);
    }

    text = stripHtml(text);

    const prompt = `You are a technical content editor. Extract structured information from the provided raw notes/script.
Type of content: ${type}
Raw notes/script:
${text}

Extract the following:
- title: A concise, engaging title.
- description: A short, compelling description summarizing the content.
- coverTag: A short uppercase label (e.g., "AI & Automation", "TOPVIEW AI") for the category badge.
${type === 'challenge' ? '- checklist: An array of step-by-step checklist items, each represented by a string. Extract actionable steps from the text.' : ''}`;

    const schemaProperties: Record<string, any> = {
      title: { type: 'STRING', description: 'A concise, engaging title.' },
      description: { type: 'STRING', description: 'A short, compelling description.' },
      coverTag: { type: 'STRING', description: 'A short uppercase label for the category badge.' },
    };
    const required = ['title', 'description', 'coverTag'];

    if (type === 'challenge') {
      schemaProperties.checklist = {
        type: 'ARRAY',
        items: { type: 'STRING' },
        description: 'An array of step-by-step checklist items.',
      };
      required.push('checklist');
    }

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
            properties: schemaProperties,
            required,
          },
        },
      }),
    });

    const json: any = await res.json();
    const responseText = json.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    const result = JSON.parse(responseText);

    if (result.title) result.title = stripHtml(result.title);
    if (result.description) result.description = stripHtml(result.description);
    if (result.coverTag) result.coverTag = stripHtml(result.coverTag);
    if (result.checklist && Array.isArray(result.checklist)) {
      result.checklist = result.checklist.map((item: string) => stripHtml(item));
    }

    return jsonResponse(result);
  } catch (error: any) {
    return jsonResponse({ error: error.message || 'Failed to generate content' }, 500);
  }
};
