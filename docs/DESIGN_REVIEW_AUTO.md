# Automated Design Quality Review

**Site:** fcarsenal-92.tilda.ws (FC Arsenal Sevastopol - Children's Football Club)  
**Date:** 2026-04-12  
**Auditor:** Automated Design Pattern Detector  
**Platform:** Tilda Website Builder  

---

## Summary

| Category | Checked | Found | Not Found |
|----------|---------|-------|-----------|
| AI Slop Tells (1-13) | 13 | 2 | 11 |
| General Quality Issues (14-25) | 12 | 10 | 2 |
| **Total** | **25** | **12** | **13** |

**Overall Design Health Score: 52/100** (12 of 25 anti-patterns detected)

The site is free from AI-generated aesthetic patterns but suffers from significant accessibility, semantic HTML, and form validation deficiencies typical of template-based Tilda builds.

---

## AI Slop Tells (13 checks)

### 1. Generic gradient text effects
- **Status:** NOT FOUND
- **Evidence:** Text throughout uses solid colors (white on dark hero, black/dark on light sections). No CSS gradient text-fill effects detected anywhere.

### 2. Dark mode with colored glows/neon
- **Status:** NOT FOUND
- **Evidence:** The site uses a predominantly light theme (bgColor `rgb(245, 245, 245)` on most sections). Dark backgrounds appear only on the hero cover and the bottom contact form cover, both using photographic backgrounds rather than neon/glow effects.

### 3. Glassmorphism (frosted glass cards)
- **Status:** NOT FOUND
- **Evidence:** No frosted-glass, backdrop-blur, or translucent card effects visible in the screenshot or audit data. Cards and sections use opaque solid backgrounds.

### 4. Hero section with 3-4 metric boxes
- **Status:** FOUND (Low Severity)
- **Location:** Section `rec542757209` (offset ~3340px) -- three icon boxes below the "About" section
- **Evidence:** Three boxes with SVG icons (whistle.svg, field.svg, win.svg) paired with text: "Regular sessions with professional coach," "Training at school #61 sports complex," "Participation in competitions and friendly matches." While these are feature highlights (not vanity metrics), the 3-icon-box pattern is a common template trope.

### 5. Identical card grids with same layout
- **Status:** FOUND (Low Severity)
- **Location:** Pricing section `rec542757221` (offset ~8640px) and Shop section `rec545923848` (offset ~10897px)
- **Evidence:** The pricing section uses three identical cards for subscription tiers (12 sessions, 12+4 sessions, unlimited). The shop section uses three identical product cards (boots, summer uniform, winter jacket). Both follow the standard Tilda card grid template with identical layout per row.

### 6. Generic stock photography feel
- **Status:** NOT FOUND
- **Evidence:** Images are authentic club photographs -- real team photos on football fields (13_1.jpg, 47.jpg showing actual kids), a real portrait of the head coach (igor_3.jpg), and genuine product photos (promo_1.jpg showing a Nike jacket with tags). No stock photography detected.

### 7. Bento grid layout
- **Status:** NOT FOUND
- **Evidence:** The site uses a straightforward single-column vertical stack layout. No bento/masonry grid patterns visible.

### 8. Purple-blue-pink gradient palette
- **Status:** NOT FOUND
- **Evidence:** Color palette is red (`#e10005`, `#cf1026`, `rgb(207, 16, 16)`), navy blue (`#101a7a`), black, white, and light gray (`rgb(245, 245, 245)`) -- consistent with a football club brand identity. No purple-pink gradients.

### 9. "Powered by AI" aesthetic
- **Status:** NOT FOUND
- **Evidence:** The site has a traditional sports club website feel. No AI-themed decorations, no futuristic UI elements, no tech-startup aesthetics.

### 10. Floating decorative orbs/circles
- **Status:** NOT FOUND
- **Evidence:** No floating orbs, blurred circles, or decorative geometric shapes visible in the screenshot or referenced in the DOM structure.

### 11. Generic sans-serif (Inter/DM Sans) with no personality
- **Status:** NOT FOUND
- **Evidence:** The site uses "TildaSans" (loaded from `fonts-tildasans.css`) -- Tilda's proprietary font. While it is a sans-serif and not deeply distinctive, it is platform-specific rather than the AI-slop typical Inter/DM Sans/Poppins. The site is in Russian, which limits font choices.

### 12. Excessive border-radius on everything
- **Status:** NOT FOUND
- **Evidence:** Button border-radius values are moderate and varied: 10px on CTA buttons, 7px on the contact form submit, 5px on shop "Order" buttons. No excessive rounding (no pill shapes, no 50% radius on squares).

### 13. Dark theme with accent gradients
- **Status:** NOT FOUND
- **Evidence:** The site is predominantly light-themed (`rgb(245, 245, 245)` background). The two dark sections use photographic covers with solid color overlays, not gradient accents.

---

## General Quality Issues (12 checks)

### 14. Missing or poor visual hierarchy (no clear focal point)
- **Status:** FOUND (Medium Severity)
- **Location:** Entire page, particularly the "About" section and features listing
- **Evidence:** With 0 heading tags (H1-H6) across the entire page, the visual hierarchy relies entirely on font-size styling via CSS classes rather than semantic heading structure. The screenshot shows text blocks of similar visual weight stacked vertically, making it difficult to scan the page and identify sections at a glance. The "About" section has a massive text wall with no clear heading to anchor it.

### 15. Inconsistent spacing/padding between sections
- **Status:** FOUND (Low Severity)
- **Location:** Various sections throughout the page
- **Evidence:** Padding values vary significantly across sections without clear rationale:
  - `pt_0 pb_0` (hero cover)
  - `pt_30 pb_30` (about, shop, sponsors)
  - `pt_120 pb_45` (features icons)
  - `pt_60 pb_0` (director intro)
  - `pt_45 pb_60` (director text)
  - `pt_45 pb_90` (news)
  - `pt_60 pb_60` (footer)
  
  The 120px top padding on the icons section creates an awkward gap, while the 0px bottom on the director intro creates a jarring transition.

### 16. Text over images without proper contrast/overlay
- **Status:** FOUND (Medium Severity)
- **Location:** Hero section `rec542757206` (top of page) and contact form cover `rec542757226` (offset ~11745px)
- **Evidence:** Both cover sections use background images (`47_1.jpg` and `20.jpg`) with text overlaid. The hero section has white text over a video/photo background of what appears to be a football field. While Tilda applies a dark overlay (bgColor `rgb(0, 0, 0)`), the low-resolution placeholder image (`/resize/20x/47_1.jpg`) suggests the overlay may not guarantee adequate contrast in all loading states. The contact form cover has similar construction.

### 17. Buttons with inconsistent styles
- **Status:** FOUND (Medium Severity)
- **Location:** Throughout the page
- **Evidence:** At least 4 distinct button styles exist:
  - **Hero CTA:** (inferred from navigation) links to `#form`
  - **Green form submit:** Black bg (`#000000`), white text, 10px radius -- in the green (`rgb(19, 206, 102)`) signup section
  - **Red CTA buttons:** Red bg (`#e10005`), white text, 10px radius -- on pricing cards
  - **Navy blue buttons:** Navy bg (`#101a7a`), white text, 10px radius -- on pricing mid-tier and shop "Order" buttons
  - **Red submit button:** Dark red bg (`#cf1026`), white text, 7px radius -- contact form
  - **Shop order buttons:** Navy bg (`#101a7a`), 5px radius
  
  Three different border-radius values (5px, 7px, 10px) and four different background colors across functionally similar CTA buttons indicate no unified design system.

### 18. Missing hover/focus states
- **Status:** NOT FOUND (Partial)
- **Evidence:** Buttons include CSS transition properties (`transition-duration:0.2s; transition-property:background-color,color,border-color,box-shadow,opacity,transform; transition-timing-function:ease-in-out`), indicating hover states are implemented. Slider arrows also have hover states on polyline strokes. However, this cannot be fully verified from static audit data alone.

### 19. Poor mobile responsiveness indicators
- **Status:** NOT FOUND
- **Evidence:** The viewport meta tag is correctly set (`width=device-width, initial-scale=1.0`), Tilda's responsive grid CSS (`tilda-grid-3.0.min.css`) is loaded, and the platform handles responsive layouts natively. The page width is 1234px on desktop with standard Tilda responsive breakpoints.

### 20. Excessive content density (wall of text)
- **Status:** FOUND (High Severity)
- **Location:** Section `rec1246624301` (offset ~1355px, height 1985px) and section `rec552899753` (offset ~5890px, height 1454px)
- **Evidence:** The "About the school" section contains a single text block of approximately 1,200 characters enumerating 10 benefits with emoji bullet points -- then repeats each benefit as a separate expandable text block (11 additional text entries in the same section). The section spans nearly 2000px in height. The director's section (`rec552899753`) contains two dense paragraphs of approximately 800 characters each with no visual breaks, subheadings, or whitespace relief. Total page height is 13,304px with most of that being text-heavy sections.

### 21. Missing loading states or feedback
- **Status:** FOUND (Medium Severity)
- **Location:** Both form sections (`rec542757213` and `rec542757226`)
- **Evidence:** Neither form has reCAPTCHA (`hasRecaptcha: false`). No loading spinners, success states, or error message patterns are visible in the audit data. The forms post to the Tilda backend (`https://fcarsenal-92.tilda.ws/`), but there is no indication of inline validation, loading indicators during submission, or success/error feedback beyond what Tilda provides by default.

### 22. Inaccessible color contrast (< 4.5:1 ratio)
- **Status:** FOUND (Medium Severity)
- **Location:** Green signup section `rec542757213` (offset ~7878px)
- **Evidence:** The section background is bright green (`rgb(19, 206, 102)`) which is a high-luminance green. While the form submit button uses black (`#000000`) on this green, any body text or labels appearing on this background may fail WCAG AA contrast requirements depending on text color. White text on `rgb(19, 206, 102)` yields a contrast ratio of approximately 2.3:1, well below the 4.5:1 minimum. If the section uses dark text, this would be acceptable, but the bright green is inherently problematic for readability.

### 23. Missing alt text on images (confirmed: 0 alt texts)
- **Status:** FOUND (High Severity)
- **Location:** All 7 images across the entire site
- **Evidence:** Every single image has `alt: ""` (empty string):
  1. `Logo_Arsenal_2.jpg` -- Club logo (should have alt like "FC Arsenal Sevastopol logo")
  2. `whistle.svg` -- Feature icon (should have alt like "Whistle icon - professional coaching")
  3. `field.svg` -- Feature icon (should have alt like "Football field icon - training facilities")
  4. `win.svg` -- Feature icon (should have alt like "Trophy icon - competitive matches")
  5. `medobory_logo.png` -- Sponsor logo (should have alt like "Medobory - sponsor logo")
  6. `1756323661504.png` -- Brand logo (should have alt describing the brand)
  7. `tildacopy.png` -- Tilda watermark
  
  This is a WCAG Level A violation (Success Criterion 1.1.1 Non-text Content). Screen readers will skip all images or announce them as empty, making the site inaccessible to visually impaired users.

### 24. No semantic HTML headings (confirmed: 0 H1-H6 tags)
- **Status:** FOUND (High Severity)
- **Location:** Entire page -- all sections
- **Evidence:** The audit confirms zero heading tags:
  ```json
  "headings": { "h1": [], "h2": [], "h3": [], "h4": [], "h5": [], "h6": [] }
  ```
  Every section's `headings` array is empty. This means:
  - No H1 for the page title ("FC Arsenal Sevastopol - Children's Football School")
  - No H2s for section titles ("About Us," "Schedule," "Pricing," "News," "Shop," "Contact")
  - No H3s for subsection content
  
  This is a critical accessibility failure (WCAG 1.3.1 Info and Relationships). Screen reader users cannot navigate by headings. Search engines cannot properly parse content hierarchy. This is a Tilda template configuration issue -- Tilda supports heading tags but they were not configured by the site builder.

### 25. Forms without proper validation/required fields
- **Status:** FOUND (High Severity)
- **Location:** Both forms -- green signup form (`rec542757213`) and contact cover form (`rec542757226`)
- **Evidence:** 
  **Form 1 (Signup):** 4 fields, all with `required: false`
  - Email (type: email) -- NOT required
  - Phone (type: tel) -- NOT required
  - Name (type: text) -- NOT required
  - Hidden comments field -- NOT required
  
  **Form 2 (Contact):** 3 fields, all with `required: false`
  - Phone number (type: tel) -- NOT required
  - Name (type: text) -- NOT required
  - Hidden comments field -- NOT required
  
  Users can submit completely empty forms. Neither form has reCAPTCHA, making them vulnerable to spam. The phone field has a basic `pattern="[0-9]*"` but no minlength/maxlength constraints. The email field in Form 1 has HTML5 type="email" which provides minimal browser validation, but since it is not required, it can be bypassed entirely.

---

## Performance & Bloat Analysis

### DOM Elements: 791
- **Verdict:** Moderate for a single-page site
- **Context:** Google recommends keeping DOM under 1,500 elements. At 791, this is within acceptable range but higher than ideal for a simple informational site. The Tilda framework contributes significant wrapper elements.

### Scripts: 40 total (17 unique external + inline)
- **Verdict:** Bloated (High Severity)
- **Evidence:** 17 unique JavaScript files loaded, primarily Tilda framework scripts:
  - Core platform: `tilda-scripts-3.0`, `tilda-polyfill`, `tilda-stat`, `tilda-fallback`
  - Feature-specific: `tilda-forms`, `tilda-cards`, `tilda-slds` (slider), `tilda-cover`, `tilda-menu`, `tilda-zoom`, `tilda-video-processor`, `tilda-lazyload`, `tilda-text-clamp`, `tilda-skiplink`, `tilda-events`, `tilda-t431-table`, `hammer.min.js`
  - Page-specific: `tilda-blocks-page33581642.min.js`
  - Plus inline analytics: Google Analytics, Yandex Metrika, Facebook Pixel, VK Pixel
  
  For a site that is essentially a brochure with two forms, 40 script loads is excessive. Many scripts (zoom, table, video-processor) may not be necessary for the actual content.

### Images: Only 2 of 7 use lazy loading
- **Verdict:** Suboptimal (Medium Severity)
- **Evidence:** Only the sponsor logos (`medobory_logo.png` and `1756323661504.png`) have lazy loading. The club logo (1072x1037 pixels), all three SVG icons, and the Tilda watermark load eagerly. The large club logo in particular should be optimized -- it is rendered in the header/nav area, which is above the fold, so eager loading is acceptable, but the image dimensions (1072x1037) suggest it is oversized for its display context.

### Missing `lang` attribute
- **Verdict:** Accessibility issue (Medium Severity)
- **Evidence:** `"lang": ""` -- the HTML element has no language attribute. For a Russian-language site, `lang="ru"` is required for screen readers to use correct pronunciation and for browsers to offer appropriate translations.

### Additional SEO Concerns
- `robots: "nofollow"` -- all outbound links pass no SEO value
- No structured data (JSON-LD) for LocalBusiness schema
- No Twitter Cards metadata
- Title tag is generic: "Football Club" instead of "FC Arsenal Sevastopol -- Children's Football School"
- Canonical URL uses HTTP, not HTTPS

---

## Findings by Severity

### High Severity (4 issues)
| # | Pattern | Impact |
|---|---------|--------|
| 23 | Missing alt text on all 7 images | WCAG Level A violation, screen readers cannot interpret images |
| 24 | Zero semantic headings (H1-H6) | WCAG violation, no navigable structure, poor SEO |
| 25 | Forms with no required fields | Empty submissions possible, spam vulnerability, no reCAPTCHA |
| 20 | Excessive content density | 2000px text wall in "About" section, poor scannability |

### Medium Severity (5 issues)
| # | Pattern | Impact |
|---|---------|--------|
| 14 | Poor visual hierarchy | No focal points, all text similar weight |
| 16 | Text over images without guaranteed contrast | Hero and contact covers may fail contrast checks |
| 17 | Inconsistent button styles | 4 colors, 3 radius values across similar CTAs |
| 21 | Missing loading/feedback states | No visible form submission feedback |
| 22 | Potential contrast issues on green section | Bright green bg may fail WCAG AA |

### Low Severity (3 issues)
| # | Pattern | Impact |
|---|---------|--------|
| 4 | 3-icon feature boxes (template pattern) | Minor template feel, not damaging |
| 5 | Identical card grids | Standard layout, expected for pricing/shop |
| 15 | Inconsistent spacing | Varying padding without clear system |

---

## Priority Remediation Plan

### P0 -- Fix Immediately
1. Add `alt` text to all 7 images with descriptive Russian text
2. Add semantic headings (H1 for page title, H2 for each section, H3 for subsections)
3. Set `required="true"` on Name and Phone fields in both forms
4. Add `lang="ru"` to the HTML element

### P1 -- Fix This Sprint
5. Add reCAPTCHA to both forms
6. Break up the "About" section wall of text with headings, spacing, and collapsible content
7. Standardize button styles to 2 variants maximum (primary red, secondary navy)
8. Review and fix color contrast on the green signup section

### P2 -- Fix This Quarter
9. Reduce script payload -- audit which Tilda modules are actually needed
10. Enable lazy loading on above-the-fold images that are below initial viewport
11. Add structured data (LocalBusiness schema) for local SEO
12. Update meta title to include full club name and location
13. Switch canonical URL to HTTPS
