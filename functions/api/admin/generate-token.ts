import { jsonResponse, readBody, stripHtml, randomHex } from '../../_shared/helpers';
import { requireAdmin } from '../../_shared/auth';
import { kvSet, kvGet } from '../../_shared/kv';

export const onRequestPost: PagesFunction = async (context) => {
  const auth = await requireAdmin(context.request, context.env);
  if (auth instanceof Response) return auth;

  try {
    const {
      submissionId,
      brandName,
      company,
      email,
      expiryDays,
      customExpiryDate,
      dedicatedPrice,
      integratedPrice,
      commercialUsagePrice,
    } = await readBody(context.request);

    if (!brandName && !company) {
      return jsonResponse({ error: 'Brand name or company is required' }, 400);
    }

    const token = randomHex(16);
    let expiresAt: string;

    const customDate = customExpiryDate ? new Date(customExpiryDate) : null;
    if (customDate && !isNaN(customDate.getTime())) {
      expiresAt = customDate.toISOString();
    } else {
      const days = Number(expiryDays) || 14;
      const expDate = new Date();
      expDate.setDate(expDate.getDate() + days);
      expiresAt = expDate.toISOString();
    }

    const parsedDedicatedPrice = dedicatedPrice !== undefined && !isNaN(Number(dedicatedPrice))
      ? Math.max(500, Math.min(50000, Number(dedicatedPrice)))
      : 1200;
    const parsedIntegratedPrice = integratedPrice !== undefined && !isNaN(Number(integratedPrice))
      ? Math.max(500, Math.min(50000, Number(integratedPrice)))
      : 600;
    const parsedCommercialUsagePrice = commercialUsagePrice !== undefined && !isNaN(Number(commercialUsagePrice))
      ? Math.max(0, Math.min(20000, Number(commercialUsagePrice)))
      : 350;

    const tokenDoc = {
      token,
      submissionId: submissionId || '',
      brandName: stripHtml(String(brandName || company).trim()).slice(0, 160),
      company: company ? stripHtml(String(company).trim()).slice(0, 160) : '',
      email: email ? stripHtml(String(email).trim().toLowerCase()).slice(0, 200) : '',
      createdAt: new Date().toISOString(),
      expiresAt,
      revoked: false,
      dedicatedPrice: parsedDedicatedPrice,
      integratedPrice: parsedIntegratedPrice,
      commercialUsagePrice: parsedCommercialUsagePrice,
    };

    const kv = (context.env as any).APP_KV;
    await kvSet(kv, 'kit_tokens', token, tokenDoc);
    if (submissionId) {
      try {
        const existingSub = await kvGet(kv, 'kit_submissions', submissionId);
        if (existingSub) {
          existingSub.status = 'token_generated';
          existingSub.token = token;
          existingSub.expiresAt = expiresAt;
          existingSub.link = `/kit/${token}`;
          await kvSet(kv, 'kit_submissions', submissionId, existingSub);
        }
      } catch (e) {
        // Submission update is best-effort; the token itself was already saved successfully above.
      }
    }

    return jsonResponse({
      success: true,
      token,
      expiresAt,
      link: `/kit/${token}`,
      brandName: tokenDoc.brandName,
      dedicatedPrice: parsedDedicatedPrice,
      integratedPrice: parsedIntegratedPrice,
      commercialUsagePrice: parsedCommercialUsagePrice,
    });
  } catch (err: any) {
    return jsonResponse({ error: err.message || 'Failed to generate token' }, 500);
  }
};
