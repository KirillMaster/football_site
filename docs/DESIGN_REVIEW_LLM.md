# Design Director Review: FC Arsenal Sevastopol (Children's Football School)

**Reviewer**: Senior Design Director  
**Date**: 2026-04-12  
**Site**: fcarsenal-92.tilda.ws  
**Platform**: Tilda (template-based builder)  
**Target audience**: Parents of children ages 6--14 seeking football instruction in Sevastopol  
**Color palette**: Red #E10005, Dark Blue #101A7A, Black #111, Light Gray #F5F5F5, Green Accent #13CE66  
**Font**: TildaSans (proprietary)

---

## 1. AI Slop Detection

**Verdict: Not AI-generated, but deeply template-generic.**

This is not AI slop in the ChatGPT/Midjourney sense -- there are no gradient text headings, no glassmorphism cards, no "hero illustration of diverse children kicking a ball in flat design." It is worse in its own way: it is a Tilda template assembled with near-zero customization, producing a site that could belong to any children's sport school in any CIS city.

Specific signals of template-generic construction:

- **Identical card grids**: The "advantages" section uses Tilda's icon-card block with stock SVG icons (whistle.svg, field.svg, win.svg from tildaicon library). These are not custom -- they are Tilda's built-in icon set, instantly recognizable to anyone who has seen a Tilda site.
- **Pricing cards**: Three-column pricing layout is the most overused Tilda pattern. Red / Blue / Red color coding with "Zapisatsya" buttons is the default card template with minimal color swaps.
- **Photo gallery**: The gallery section uses Tilda's built-in slider block with dark backgrounds -- a standard zero-config block.
- **Cover section with video overlay**: The hero uses Tilda's t-cover component with a dark-overlay video -- this is literally the first block Tilda suggests when you create a new page.
- **Testimonial slider**: Standard Tilda testimonial carousel, no avatars, no social proof links, no verification.
- **Green CTA band**: The full-width green (#13CE66) form section is a Tilda "call to action" block with the default layout. Zero design thinking went into why green was chosen here.
- **Footer with Tilda branding**: The site runs on Tilda's free/basic tier -- the "Made on Tilda" watermark is visible, which undermines trust for a paying service.

**What is NOT AI slop but IS a problem**: The long-form text blocks (especially the "About" section and director's letter) are clearly human-written with genuine personality and passion. This authentic content is trapped inside a template that does nothing to elevate it.

---

## 2. Visual Hierarchy

**Rating: Weak (3/10)**

**Eye flow analysis (top to bottom):**

1. **Hero**: Dark video background with Arsenal logo centered. The CTA "Zapisatsya na besplatnye zanyatiya" (Sign up for free classes) is present but competes with the logo for primacy. The logo itself is a JPG on a dark background, not a proper SVG or transparent PNG, creating a visible light-colored rectangle.
2. **About text block**: A massive wall of text on light gray. No clear heading (the audit confirms: zero H1-H6 tags on the entire page). The eye has nowhere to land.
3. **Advantages (icons)**: Three icons in a row -- this is the first scannable content, but it is buried 700px+ below the fold. The icons are generic and small.
4. **Gallery**: Dark photo grid -- absorbs attention through darkness contrast but communicates nothing specific.
5. **Testimonials**: Appears mid-page, low contrast, easy to skip.
6. **Pricing**: The three-card pricing section is the most structurally clear element on the page, which is good. But pricing without context (no monthly amounts visible in the audit data) makes it hard to evaluate.

**Primary action clarity**: The site has multiple CTAs ("Zapisatsya na besplatnye zanyatiya", green form, bottom form) but no single dominant conversion path. A parent landing here would not immediately know what to do first.

**What grabs attention first**: The dark hero video and logo. Unfortunately, the logo is for "Arsenal" which, without geographic context visible in the hero, could be confused with Arsenal FC London.

---

## 3. Information Architecture

**Rating: 4/10**

**Navigation**: O shkole / Raspisaniye / Tarify / Novosti / Magazin -- five items, which is reasonable.

**Problems:**

- **No clear page hierarchy**: Everything is on one scrolling page. There is no separation between "convince me to join" content and "I already joined, show me the schedule" content.
- **Cognitive load**: The "About" section dumps an enormous amount of text (UEFA licenses, training methodology, group formation philosophy, facility details, tournament participation, equipment, training schedule flexibility, partner academies -- all in one undifferentiated block). This is ~800+ words of dense text with emoji bullets as the only visual differentiation.
- **No progressive disclosure**: Every detail about every aspect of the school is presented simultaneously. A parent must process everything to find what matters to them.
- **Schedule is hidden**: The schedule section ("Season: Sept 2025 -- June 2026, Mon--Fri 18:00--19:30, Sat 12:00--13:30") is buried deep in the page with minimal visual weight. This is the single most important piece of information for a deciding parent.
- **Pricing lacks prices**: The three subscription tiers describe what is included but the actual cost is not visible in the audit data, meaning either the prices are in images (inaccessible, not crawlable) or they are simply missing.
- **Shop section is unexpected**: A merchandise shop (boots, uniforms, winter jackets) appears in the flow, mixing commerce with enrollment, creating confusion about the site's primary purpose.

**Missing information that parents need:**
- Coach qualifications with photos and bios (only the director is named)
- Trial class booking flow (mentioned but not a clear funnel)
- FAQ section
- Age group breakdown with specific schedules per group
- Location map (the audit shows hasMap: false for all sections)
- Parent contact / WhatsApp group link
- Safety and insurance information

---

## 4. Emotional Resonance

**Rating: 5/10 -- Split verdict.**

**What works emotionally:**
- The director's letter (Kuliev Igor Ramizovich) is genuinely passionate and personal. Lines like "We don't promise your children will become champions" and "We believe in every child" are powerful and authentic.
- The philosophy of "all children play, not just the strongest" is a differentiator that would resonate strongly with parents of less athletic kids.
- Partner academy connections (Krasnodar, Rostov, CSKA) suggest legitimate professional pathways.

**What fails emotionally:**
- The visual design communicates "amateur club with a website" not "professional academy investing in your child's future." Parents comparing this to a well-designed competitor will subconsciously rank Arsenal lower.
- Zero photos of actual children training. The gallery appears to show field/facility images, but no smiling kids, no action shots, no "my child could be there" moments.
- The Tilda watermark ("Made on Tilda") at the bottom destroys the professional veneer.
- The generic stock SVG icons in the advantages section feel impersonal.
- No social proof with faces -- testimonials are text-only with no parent photos or child names.
- The director's photo section exists but relies on a single image with a long text block -- it reads more like a LinkedIn profile than a trust-building element.

**Brand-audience fit**: The emotional tone of the WRITING is excellent -- warm, honest, ambitious without being arrogant. The emotional tone of the DESIGN undermines this completely. There is a severe disconnect between the authentic voice and the generic container.

---

## 5. Typography

**Rating: 3/10**

- **Font choice**: TildaSans is a clean geometric sans-serif. It is perfectly adequate but completely anonymous -- it could be on a dental clinic website or a coworking space landing page.
- **Hierarchy**: Critically broken. The audit reveals ZERO semantic headings (no H1, H2, H3, H4, H5, H6 tags). All text appears to use styled `<div>` elements. This is both an accessibility disaster and a visual hierarchy failure.
- **Body text**: The long "about" section paragraphs appear to run at a single size with emoji prefixes as the only differentiator. There is no variation in weight, size, or color to guide scanning.
- **Line length**: On a 1234px wide viewport, the text columns appear to span nearly the full container width, likely exceeding 80 characters per line -- well beyond the optimal 55-75 character range.
- **Spacing**: Tilda's default paragraph spacing appears to be used throughout. No deliberate typographic rhythm.
- **Russian typography**: No obvious issues with Cyrillic rendering in TildaSans, but the lack of a strong display typeface for headings makes the Russian text feel flat.

---

## 6. Color Usage

**Rating: 4/10**

**Palette analysis:**
- **Red #E10005**: Used on pricing buttons and final CTA -- semantically appropriate for "Arsenal" branding, but it appears infrequently and inconsistently. The bottom form uses #CF1026 (a slightly different red), breaking brand consistency.
- **Dark Blue #101A7A**: Used on the middle pricing card and shop buttons. This is a strong color but its relationship to the brand is unclear -- is it a "premium tier" indicator? The reasoning is not communicated.
- **Black #111**: Default text color. Fine.
- **Light Gray #F5F5F5**: The dominant background color for most sections. Creates a monotonous sameness.
- **Green #13CE66**: Used for the mid-page CTA form band. This is a jarring color in the palette. It does not appear in the Arsenal brand, it does not match the football-club aesthetic, and it creates a visual "break" that feels like a different website was spliced in. This appears to be Tilda's default "success/action" green -- it was never deliberately chosen.

**Accessibility:**
- White text on green (#13CE66) background likely fails WCAG AA contrast for normal text (4.5:1 required; white-on-#13CE66 is approximately 2.2:1 -- a hard fail).
- White text on red (#E10005) buttons should pass at larger sizes but is borderline.
- The dark photo gallery sections likely have adequate contrast since text is white on dark overlays.

**Cohesion**: The palette is fractured. Red, blue, green, and gray compete without a clear hierarchy of meaning. A professional football academy should feel unified in its color language.

---

## 7. Composition

**Rating: 3/10**

- **Balance**: The page is vertically monotonous. Every section is a full-width block stacked on top of the next with minimal variation in rhythm. The pattern is: gray section, dark section, gray section, dark section, green section, gray section -- alternating light and dark with mechanical regularity.
- **Whitespace**: Tilda's default padding (30px, 45px, 60px, 120px top/bottom) creates inconsistent vertical rhythm. Some sections have 30px padding (cramped), while the icon section has 120px top padding (generous). There is no deliberate system.
- **Section heights**: The page totals approximately 13,300px in height -- extremely long for what is essentially an enrollment landing page. A parent on mobile would need to scroll through ~20+ screen-heights of content.
- **Photo/text ratio**: The page is overwhelmingly text-heavy. Only 7 images total on the entire page (and two of those are partner logos, one is the Tilda watermark). For a children's sports school, this is a critical failure -- parents want to SEE the experience, not read about it.
- **Grid**: Standard Tilda 12-column grid. No creative use of asymmetry, overlap, or non-standard layouts. Every block sits politely in its container.
- **Rhythm**: There is no visual rhythm. The page does not "breathe." Dense text blocks are followed by more dense text blocks. The gallery section provides the only real visual break, but it is constrained to standard Tilda card dimensions.

---

## 8. Nielsen's 10 Usability Heuristics

| # | Heuristic | Score (0-4) | Notes |
|---|-----------|-------------|-------|
| 1 | Visibility of System Status | 1 | No loading indicators, no form validation feedback visible, no indication of current section while scrolling. No sticky nav active-state highlighting. |
| 2 | Match Between System and Real World | 3 | Language is natural Russian, terminology matches what parents expect. Sport-specific terms are used appropriately. Navigation labels are clear. |
| 3 | User Control and Freedom | 1 | Single-page scroll with no "back to top" button. No way to undo a form submission. No clear escape from deep-scroll positions. Anchor nav exists but provides limited control. |
| 4 | Consistency and Standards | 2 | Mixed red values (#E10005 vs #CF1026). Mixed button styles (rounded corners vary between 5px, 7px, 10px). Two separate forms with different field sets (one has email, the other does not). Navigation follows standard patterns but inconsistencies in visual details. |
| 5 | Error Prevention | 1 | Form fields have no required attributes (all `required: false`). No input validation visible. No reCAPTCHA on either form. Phone field has pattern `[0-9]*` but name/email fields have no validation. A parent could submit a completely empty form. |
| 6 | Recognition Rather Than Recall | 2 | Navigation labels are clear and recognizable. However, the single-page structure means users must remember where information was located to find it again. No search function. |
| 7 | Flexibility and Efficiency | 1 | No shortcuts, no search, no quick-access to pricing or schedule. No "call now" floating button for mobile. No saved state for returning visitors. |
| 8 | Aesthetic and Minimalist Design | 2 | The design is minimal but not aesthetic. Excessive text in the "about" section overwhelms. Template blocks are used without curation. The green CTA band is visually noisy. |
| 9 | Error Recovery | 1 | No visible error states for forms. No confirmation messages described in the audit. If form submission fails, the user has no guidance. |
| 10 | Help and Documentation | 1 | No FAQ section. No chatbot. No help text. No tooltips on form fields. The phone number in the header is the only support channel on the page itself. |

**Total: 15/40 (37.5%) -- Below acceptable threshold.**

---

## 9. What Is Working

### 9.1. Authentic Director's Voice
The personal letter from Igor Ramizovich Kuliev is the strongest asset on this site. It is honest ("we don't promise champions"), philosophically clear ("all children play, not just the strongest ones"), and emotionally resonant. This voice is a genuine differentiator that no competitor can replicate. It should be elevated, not buried in a text block.

### 9.2. Clear Value Proposition Structure
The tiered subscription model (3 tiers with clear feature differentiation: 12 sessions vs. 12+4 physical training vs. 5/week with internships) is well-structured. The logical progression from "beginner" to "academy track" makes decision-making intuitive. The "first 2 classes free" trial is prominently featured.

### 9.3. Professional Network as Social Proof
The named connections to real academy partner clubs (Krasnodar, Rostov, CSKA, Lokomotiv, Strogino, Akron-Konoplyov Academy, etc.) provide legitimate professional credibility. This is concrete, verifiable proof that the school has pathways to elite football. No competitor in Sevastopol is likely to match this list.

---

## 10. Priority Issues

### P0 -- CRITICAL: No Semantic Headings (H1-H6)
- **What**: The entire page has zero HTML heading tags. All text uses styled divs.
- **Why this matters**: Catastrophic for SEO (Google cannot understand page structure), accessibility (screen readers cannot navigate), and visual hierarchy (users cannot scan). The site is invisible to search engines for structural content.
- **Fix**: Implement proper heading hierarchy: H1 for the school name/hero, H2 for each major section (About, Schedule, Pricing, News, Shop), H3 for subsections within those.

### P0 -- CRITICAL: Form Fields Not Required, No Validation
- **What**: Both forms have all fields set to `required: false`. No reCAPTCHA. Empty form submissions are possible.
- **Why this matters**: Leads will be garbage-quality. Bot spam will fill the inbox. Parents who accidentally submit incomplete forms get no feedback. This directly impacts revenue.
- **Fix**: Set Name and Phone to `required: true`. Add input validation (phone format, email format). Add reCAPTCHA or honeypot. Add clear success/error states post-submission.

### P1 -- HIGH: Wall of Text in About Section (~800+ words, no structure)
- **What**: The advantages/philosophy section dumps 10+ emoji-bulleted paragraphs in a single undifferentiated block. On mobile this would be 15+ screens of scrolling text.
- **Why this matters**: Parents will not read it. The most compelling selling points (UEFA-licensed coaches, partner academies, individual approach) are buried in a wall of text. Bounce rate at this section is likely very high.
- **Fix**: Restructure into expandable accordion or tabbed interface. Lead with the 3 strongest points as visual cards. Move the rest to a dedicated "Philosophy" subpage or progressive disclosure pattern.

### P1 -- HIGH: No Location Map
- **What**: The address is mentioned in text ("Kosareva 12, Sports Complex School No.61") but there is no embedded map. `hasMap: false` across all sections.
- **Why this matters**: Parents need to evaluate commute feasibility. "Where is this?" is a top-3 question for any local business. Without a map, parents must leave the site to search, increasing the chance they never return.
- **Fix**: Add a Yandex Maps or Google Maps embed showing the exact location, nearby transit stops (routes 5, 16, 83, 84, 110 are mentioned in text but should be visualized), and parking.

### P2 -- MEDIUM: No Photos of Children/Training in Action
- **What**: Only 7 images total; none appear to be action photos of children training. Gallery appears to show facilities/landscape. No coach photos beyond the director.
- **Why this matters**: Parents decide emotionally. "Will my child be happy here?" requires seeing children. Stock icons and text cannot answer this question. Competitor schools with vibrant photo galleries will win the emotional comparison.
- **Fix**: Invest in a professional photo session (or curate the best smartphone photos from training). Show: kids training, kids celebrating, coaches interacting with children, facility shots, tournament moments. Minimum 15-20 real photos.

### P3 -- LOW: Tilda Watermark / Free Tier Indicators
- **What**: "Made on Tilda" block visible at the bottom. Site URL is fcarsenal-92.tilda.ws (subdomain).
- **Why this matters**: Signals budget constraints that conflict with "professional academy" positioning. Parents subconsciously register "this organization can't afford a proper website" as a quality signal.
- **Fix**: Upgrade to Tilda Business plan to remove watermark. Connect a custom domain (e.g., arsenal-sevastopol.ru or dfc-arsenal.ru).

---

## 11. Persona Red Flags

### Maria, 35 -- First-time Visitor, Comparing Schools, Mobile Phone

- **Red flag 1: Mobile experience is likely dire.** At 13,300px total height, mobile scroll is approximately 25+ screens. The massive text blocks have no responsive restructuring. Maria will scroll past the hero, hit the text wall, and leave.
- **Red flag 2: No comparison-friendly information.** Maria is comparing 2-3 schools. She needs: price, schedule, location, trial class booking -- all within 10 seconds. Price is not immediately visible. Schedule is buried. Location has no map. Trial booking requires scrolling to a form.
- **Red flag 3: No quick contact option.** No WhatsApp button, no floating phone button, no chat widget. Maria would need to scroll to find the phone number or a form. On mobile, she wants to tap once and talk to someone.
- **Red flag 4: No "for parents" tone in the first screen.** The hero says "Football club" -- it does not immediately communicate "children's football school for ages 6-14." Maria might not realize this is a kids' school vs. an adult amateur club in the first 2 seconds.

### Andrey, 40 -- Busy Dad, Wants Schedule and Price, No Patience

- **Red flag 1: Schedule takes 8+ seconds to find.** Andrey will click "Raspisaniye" in the nav, but the schedule section contains just two lines of text. No visual timetable, no per-age-group breakdown, no calendar view. He gets: "Mon-Fri 18:00-19:30, Sat 12:00-13:30." That is not enough to plan his family's week.
- **Red flag 2: Pricing lacks the actual price.** Andrey clicks "Tarify," sees three cards describing features, but may not see an actual ruble amount (prices may be embedded in images or absent). If he has to call to find out the price, he will likely call the school that shows prices on their site instead.
- **Red flag 3: Two forms with no clear purpose distinction.** The green form mid-page asks for email + phone + name. The bottom form asks only for phone + name. Which one should Andrey use? Why are there two? This creates friction for an impatient user.

### International Parent -- Looking at Internship Programs, Needs English

- **Red flag 1: Zero English content.** The site is entirely in Russian with no language toggle. The HTML `lang` attribute is empty (not set). An international parent relying on browser translation will get a degraded experience with untranslated form labels and buttons.
- **Red flag 2: Internship information is buried in a bullet point.** The partner academy connections (Krasnodar, Rostov, CSKA, etc.) and internship opportunities are mentioned as one of 10+ emoji bullet points in the text wall. An international parent specifically seeking internship pathways would need to read ~500 words to find this.
- **Red flag 3: No dedicated "Internships & Partnerships" section.** This is arguably the school's most unique value proposition for international families. It deserves its own page or prominent section with details: which academies, selection process, past success stories, costs, timing.
- **Red flag 4: No English meta description or OG tags.** The og:description is "Detskiy futbolny klub Arsenal" -- untranslated. International search or social shares will not communicate the school's offering.

---

## 12. Questions to Consider

1. **Why does this site have zero headings?** Is there a Tilda configuration issue, or was the entire page assembled from "text" blocks instead of "heading + text" blocks? This single technical decision undermines SEO, accessibility, and visual hierarchy simultaneously.

2. **Who is the primary conversion action -- and why are there two forms?** The green form mid-page and the dark form at the bottom create ambiguity. Consider: one clear CTA ("Book a free trial") repeated in a visually consistent way throughout, with a single form destination.

3. **If a parent can only see one thing on this site, what should it be?** Right now the answer is "the Arsenal logo on a dark background." Should it instead be: "Your child trains with UEFA-licensed coaches alongside future academy players -- first 2 sessions free"?

4. **Where are the children?** A children's football school website with no children visible is like a restaurant website with no food photos. The absence is conspicuous. Is there a photo rights / consent concern, or was this simply overlooked?

5. **The director's letter is the best content on the site -- so why is it the 6th section?** Consider leading with Igor's philosophy as the emotional hook, not the generic "qualified school of football in Sevastopol" opener.

6. **Why is there a merchandise shop on an enrollment landing page?** The shop section (boots, uniforms, jackets) serves existing members, not prospective parents. It adds 850px of scroll depth for content irrelevant to 80%+ of visitors. Should this be a separate page?

7. **The green (#13CE66) CTA band -- why green?** Arsenal's brand colors are red, blue, and black. The green is a Tilda default that was never questioned. Replacing it with brand red or blue would unify the visual identity.

8. **What does "Arsenal" mean to parents in Sevastopol?** Is there brand confusion with Arsenal FC London? Is the name an asset (prestige by association) or a liability (perceived pretension)? The site does nothing to address this -- no origin story, no explanation of why the name was chosen.

9. **The "robots: nofollow" meta tag -- is this intentional?** This tells search engines not to follow any links on the page, which severely limits SEO. Combined with zero headings and a tilda.ws subdomain, this site is essentially invisible to organic search.

10. **What would it take to make this the best football school website in Crimea?** Not the best Tilda site -- the best website. The content quality (director's philosophy, academy partnerships, training methodology) already exceeds most competitors. The design is the bottleneck holding exceptional content hostage in a generic container.

---

## Summary

This site contains genuinely compelling content -- a passionate director's philosophy, legitimate UEFA credentials, impressive academy partnerships, and a clear three-tier enrollment structure -- all trapped inside an unmodified Tilda template that communicates "we spent 3 hours on this." The disconnect between content quality and design quality is the central problem. The technical foundations are weak (no headings, no form validation, no map, no required fields, poor contrast), and the visual composition does nothing to differentiate Arsenal from any other children's sports school in any CIS city. The rebuild should preserve and elevate the authentic voice while replacing the generic container with purposeful design that matches the school's actual ambition.
