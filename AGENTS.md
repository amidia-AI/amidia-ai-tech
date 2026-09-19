# Project Rules & Guidelines

## Analytics & Demographics Privacy
- **Strict Private / Gated Kit Only**: Never add demographics, gender, age brackets, geographic/country stats, retention curves, or YouTube Studio metrics to public pages (`Home.tsx`).
- **Gated Kit Placement**: All audience data, analytics, rate cards, and studio proofs belong strictly inside the gated media kit (`src/pages/GatedKit.tsx`).

## Screenshot & Image Handling
- **Real Images Only**: Never generate synthetic SVG mockups or simulated drawings in place of real screenshots. Always use real image files uploaded by the creator (via `/admin` or direct file upload).
- **High-Signal Information Only**: When extracting insights from screenshots (such as demographics, countries, retention), extract only the important, high-impact numbers. Do not clutter the interface with every minor percentage or fractional data point.
