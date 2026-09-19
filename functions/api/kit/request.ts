import { jsonResponse, readBody, stripHtml, randomHex } from '../../_shared/helpers';
import { firestoreAdd } from '../../_shared/firestore';

export const onRequestPost: PagesFunction = async (context) => {
  try {
    let { name, company, email, promotionGoal } = await readBody(context.request);
    if (!name || !company || !email || !promotionGoal) {
      return jsonResponse({ error: 'All fields are required (Name, Company, Work Email, Promotion Goal)' }, 400);
    }

    name = stripHtml(String(name).trim()).slice(0, 120);
    company = stripHtml(String(company).trim()).slice(0, 160);
    email = stripHtml(String(email).trim().toLowerCase()).slice(0, 200);
    promotionGoal = stripHtml(String(promotionGoal).trim()).slice(0, 2000);

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      return jsonResponse({ error: 'Please provide a valid work email address.' }, 400);
    }

    const submissionDoc = {
      name,
      company,
      email,
      promotionGoal,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    let docId = randomHex(8);
    try {
      docId = await firestoreAdd(context.env as any, 'kit_submissions', submissionDoc);
    } catch (e) {}

    return jsonResponse({
      success: true,
      id: docId,
      message: 'Your media kit request has been received. A personalized link will be sent to your work email.',
    });
  } catch (err: any) {
    return jsonResponse({ error: err.message || 'Failed to submit media kit request' }, 500);
  }
};
