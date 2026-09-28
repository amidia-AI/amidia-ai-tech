import { LineItemKey, PricingLineItem } from '../types';

interface LineItemTemplate {
  key: LineItemKey;
  label: string;
  description: string;
  unitLabel: string;
  badge?: string;
  defaultPrice: number;
  defaultQuantity?: number;
}

export const LINE_ITEM_TEMPLATES: Record<Exclude<LineItemKey, 'custom'>, LineItemTemplate> = {
  dedicated: {
    key: 'dedicated',
    label: 'Dedicated Deep-Dive Video',
    description: 'A standalone 10–18 minute comprehensive build or review focusing 100% on your developer tool, SDK, or AI workflow.',
    unitLabel: 'flat rate per produced video',
    badge: 'Full Feature',
    defaultPrice: 1200,
  },
  integrated: {
    key: 'integrated',
    label: 'Integrated Segment (60–90s)',
    description: 'A seamless mid-roll or organic problem-solving showcase embedded directly into a major architectural tutorial.',
    unitLabel: 'flat rate per segment placement',
    badge: 'High Impact',
    defaultPrice: 600,
  },
  commercialUsage: {
    key: 'commercialUsage',
    label: 'Commercial Usage Rights',
    description: '60-day paid advertising & whitelisting rights to cut, run, and repurpose video segments on your brand social channels and landing pages.',
    unitLabel: 'add-on license',
    badge: 'Add-On',
    defaultPrice: 350,
  },
  shots: {
    key: 'shots',
    label: 'Short Form Content',
    description: 'A bundle of short-form vertical videos (Reels, Shorts, TikTok-style cuts) featuring your product for fast, high-frequency visibility.',
    unitLabel: 'per video',
    badge: 'Short-Form',
    defaultPrice: 100,
    defaultQuantity: 1,
  },
  adRead: {
    key: 'adRead',
    label: 'Ad Read / Sponsored Mention',
    description: 'A scripted, straight-to-camera or voiceover ad read/shoutout naturally worked into the video, separate from a full product segment.',
    unitLabel: 'flat rate per ad read',
    badge: 'Sponsored',
    defaultPrice: 400,
  },
};

let counter = 0;
function nextId(key: string) {
  counter += 1;
  return `item_${key}_${Date.now()}_${counter}`;
}

export function createLineItem(key: LineItemKey, overrides: Partial<PricingLineItem> = {}): PricingLineItem {
  if (key === 'custom') {
    return {
      id: nextId('custom'),
      key: 'custom',
      label: 'Custom Line Item',
      description: '',
      price: 0,
      unitLabel: 'flat rate',
      enabled: true,
      ...overrides,
    };
  }
  const t = LINE_ITEM_TEMPLATES[key];
  return {
    id: nextId(key),
    key: t.key,
    label: t.label,
    description: t.description,
    unitLabel: t.unitLabel,
    badge: t.badge,
    price: t.defaultPrice,
    quantity: t.defaultQuantity,
    enabled: true,
    ...overrides,
  };
}

export function defaultLineItems(): PricingLineItem[] {
  return [createLineItem('dedicated'), createLineItem('shots'), createLineItem('integrated'), createLineItem('adRead')];
}

export function lineItemTotal(item: PricingLineItem): number {
  return item.quantity ? item.price * item.quantity : item.price;
}

export function legacyTokenToLineItems(tok: { dedicatedPrice?: any; integratedPrice?: any; commercialUsagePrice?: any }): PricingLineItem[] {
  return [
    createLineItem('dedicated', { price: Number(tok.dedicatedPrice) || 1200 }),
    createLineItem('shots'),
    createLineItem('integrated', { price: Number(tok.integratedPrice) || 600 }),
    createLineItem('adRead'),
  ];
}

export const LINE_ITEM_COLOR_THEMES = ['sky', 'indigo', 'amber', 'emerald', 'rose', 'violet'] as const;
