import type { Post, PostContent, EmotionType, Product } from './types';
import { checkClaims, appendDisclaimer, DEFAULT_DISCLAIMER } from './claimsFilter';
import { getInstagramHashtags, getLinkedinHashtags, getYoutubeTags } from './hashtagProvider';
import { getAllProducts } from './pkb';
import productImages from '@/data/product-images.json';

// ── Per-soap content templates ─────────────────────────────────────────────────
// Each post follows an emotional arc: Fear → Feel → Dream → Why → Zeshto
// hooks     = FEAR  — the scroll-stopping pain point
// relate    = FEEL  — deep empathy, customer feels seen
// transformation = DREAM — the vivid happy outcome they could have
// insight   = WHY   — the "aha" that explains the problem
// solution  = ZESHTO — why THIS specific soap is the answer
interface SoapTemplates {
  hooks: Record<EmotionType, string[]>;
  relate: string[];
  insight: string[];
  solution: string[];
  transformation: string[];
}

const SOAP_TEMPLATES: Record<string, SoapTemplates> = {

  'golden-exfolia': {
    hooks: {
      fear: [
        "Your skin is trying to glow. Dead skin cells are the only thing standing in its way.",
        "That ₹2,000 brightening serum is sitting on a layer of dead skin. It can't reach what it can't penetrate.",
        "If your skin looks dull even after cleansing, the problem isn't your serum. It's the step you're skipping.",
      ],
      frustration: [
        "You drink the water. You sleep 8 hours. You follow the routine. Your skin still looks flat. Why?",
        "Three months of the brightening serum everyone recommended. Still grey. Still dull. Still tired-looking.",
        "Consistent with your skincare for months. No glow. Not lazy — just using the wrong first step.",
      ],
      hope: [
        "Your skin actually wants to glow. It just needs someone to clear the path.",
        "The glow you've been chasing isn't in a serum. It's already under your skin — waiting to come through.",
        "Turmeric has supported brighter skin in Indian homes for 3,000 years. There's a reason it's still here.",
      ],
      desire: [
        "Skin so bright and fresh that people ask if you just came back from a holiday.",
        "That effortless glow that makes you want to leave the house without foundation — it's possible.",
        "Imagine looking in the mirror and actually liking what you see. Every single morning. No filter needed.",
      ],
      educational: [
        "Your skin sheds 30,000 dead cells per hour. Without exfoliation, they pile up and block your glow.",
        "Turmeric's brightening power isn't a myth — it's curcumin, a compound Ayurveda has trusted for centuries.",
        "Why brightening serums don't work without exfoliation first — the step most people are skipping.",
      ],
    },
    relate: [
      "You're doing everything right. Moisturiser in the morning. SPF always. A face wash that cost more than it should. And your skin still looks flat. Not glowing. Not fresh. Just there. It's exhausting when effort doesn't show up on your face.",
      "Your skin tone is uneven. You reach for the colour corrector every morning. You've spent on brightening products that promised results by week four. Week twelve — nothing. It's not your fault. The approach was wrong from the start.",
      "There's a dull, grey look to your skin that makeup can cover but never quite fix. You know what it feels like to look in good lighting and still feel disappointed. You're not imagining it — and it's fixable.",
    ],
    transformation: [
      "Imagine washing your face in the morning and actually seeing it — brighter, fresher, more even. No filter needed. No colour corrector reaching for automatically. Just your skin, uncovered. That's what consistent exfoliation with the right ingredients looks like.",
      "Six weeks from now, you could be the person people ask 'what are you using?' about. Not because you bought something expensive. Because you finally cleared the path for your skin's natural glow to come through. It was always there.",
      "That feeling of looking in the mirror and genuinely liking your skin — no makeup on, morning light, no hiding — it's within reach. Your skin was designed to glow. Golden Exfolia just helps it get there.",
    ],
    insight: [
      "Dead skin cells build up over 28 days — and India's hard water and pollution slow down your skin's natural shedding. Your glow is literally buried. No amount of serum applied on top of that layer will fully break through.",
      "Brightening actives work at the cellular level — but only if they can get there. Most people apply vitamin C or niacinamide on a surface still covered in dead cells. The active does almost nothing. Exfoliating first changes everything.",
      "Your skin renews itself constantly — but the dead cells don't always shed evenly. The result is the patchy, flat, uneven look that moisturising alone never fixes. Gentle, consistent exfoliation at the cleansing step is the missing piece.",
    ],
    solution: [
      "Zeshto Golden Exfolia uses turmeric, raw honey, and colloidal oats — three ingredients with a combined history of over 3,000 years in Indian brightening rituals. Turmeric for Ayurvedic radiance support. Honey for moisture while it works. Oats to gently buff away what's blocking your glow. No microbeads. No harsh chemicals. One bar. Every shower.",
      "Golden Exfolia is cold-process handmade — every ingredient stays active and in its natural form. Turmeric for Ayurvedic radiance. Raw honey as a natural humectant. Oats to physically clear away dead cells. Two minutes in the shower, every day, building cumulative results. At ₹174 — less than one brightening serum.",
      "Unlike chemical exfoliants that can cause sensitivity, Golden Exfolia uses oats — one of the gentlest physical exfoliants on Earth. Combined with turmeric and honey, it supports a brighter complexion without ever damaging the skin barrier. This is what daily brightening looks like when done right.",
    ],
  },

  'heritage-glow': {
    hooks: {
      fear: [
        "Dry skin in your 20s or 30s isn't just uncomfortable. It accelerates the appearance of ageing. What you cleanse with is the first place to fix this.",
        "If your skin feels tight 20 minutes after washing, your cleanser is stripping more than just dirt.",
        "The moisturiser you apply twice a day can't keep up with what your cleanser strips away each time.",
      ],
      frustration: [
        "You moisturise faithfully. By noon, your skin is tight again. The routine feels endless — and it's not working.",
        "Switching between gentle cleansers for years. Still dry. Still reactive. Still searching.",
        "Dry skin that makes you look tired even after a full night of sleep. Foundation settles into patches. Concealer doesn't help.",
      ],
      hope: [
        "What if the answer to dry, dull skin has been sitting in Ayurvedic texts for 3,000 years? Kesar and sandalwood suggest yes.",
        "Dry skin doesn't have to be your permanent reality. It often just needs the right cleanser — not another moisturiser.",
        "Your grandmother's skin was luminous at 50. Her secret wasn't a ₹3,000 serum. It was kesar, turmeric, and chandan.",
      ],
      desire: [
        "Skin so soft and nourished that touching your own face feels like a luxury.",
        "That wedding glow — but every single morning. Not just for special occasions.",
        "Luminous, comfortable, glowing skin that needs almost nothing on top. That's what the right ingredients can give you.",
      ],
      educational: [
        "Kesar (saffron) has been used in Indian households for centuries to support a luminous complexion. Here's why it still works.",
        "Why almond oil is one of the most skin-compatible fats — and what that means for dry, sensitive skin.",
        "Hard water plus harsh cleansers equals accelerated dry skin. Here's what most people miss about their daily wash.",
      ],
    },
    relate: [
      "Dry skin that tightens the moment you wash it. Patches that no moisturiser fully fixes. A complexion that looks older than you are. You've tried switching cleansers, adding oils, layering serums. The dryness always wins. It feels like your skin is working against you.",
      "Sensitive and dry at the same time — the combination that rules out most products. Too delicate for strong actives, too dry for anything lightweight. You read every ingredient list. You still react to half of them. It's not high-maintenance — it's a skin type that needs to be taken seriously.",
      "You look tired on days you're not. Your skin looks dull on days you've done everything right. Foundation settles into dry patches. Concealer doesn't cover the texture. This is a skin barrier problem — and it starts with what you wash your face with.",
    ],
    transformation: [
      "Six weeks from now, you could stop dreading the mirror after washing your face. No more tightness. No more dull, papery look by 11am. Just comfortable, luminous skin that looks like it's been taken care of. Because it has been.",
      "Imagine waking up and your skin already looking rested before you've done anything to it. Not tight. Not dull. Soft to the touch. Ready. That's what consistent nourishment from the right cleanser actually feels like.",
      "Your grandmother had luminous skin at 60. She cleansed with ingredients that worked with her skin, not against it. You can have the same — not through a complicated 12-step routine, but by changing the very first step: your daily bar.",
    ],
    insight: [
      "Dry skin isn't just about moisture — it's about what strips the skin barrier with every wash. Most cleansers, even gentle ones, disrupt the skin's acid mantle and wash away natural oils. When you wash with a bar infused with almond oil and kesar, you're supporting the barrier instead of stripping it.",
      "Kesar's history in Indian beauty isn't just tradition — its carotenoid compounds have been studied for potential effects on melanin processes. Combined with turmeric and sandalwood, it creates a cleanse that works on dullness at the source, not just on the surface.",
      "Hard water — common across most of India — reacts with soap to form residue that strips the skin. Cold-process handmade soap, unlike commercial bars, contains natural glycerine that counteracts this. That's why handmade soap leaves skin feeling better than any 'moisturising' bar from a pharmacy.",
    ],
    solution: [
      "Zeshto Heritage Glow brings together kesar, turmeric, sandalwood, and almond oil in a cold-process bar. These four ingredients are Ayurveda's most trusted combination for dry, sensitive, dull skin — in a daily cleanser that nourishes while it washes. Not a mask. Not a serum. Your morning routine, transformed.",
      "Heritage Glow is superfatted with almond oil — meaning the bar leaves a trace of nourishing oil on the skin even after rinsing. You get the deep clean AND the moisture in one step. At ₹174, it replaces both a cleanser and a step in your moisturising routine.",
      "Kesar. Turmeric. Sandalwood. Three ingredients your grandmother would recognise immediately. Cold-process, handmade in small batches. No harsh surfactants. No mineral oil. Heritage Glow is what daily skincare looks like when you trust ingredients over marketing.",
    ],
  },

  'radiance-glow': {
    hooks: {
      fear: [
        "Those dark spots aren't permanent — but the wrong products can make them worse. Are yours doing that?",
        "Pigmentation from stress, sun, and old breakouts is normal. Not fading after months of treatment isn't.",
        "If your brightening serum is causing sensitivity, it's fighting your skin — not supporting it.",
      ],
      frustration: [
        "Dark spots from a breakout eight months ago. You've been patient. You've been consistent. They're still there.",
        "Uneven skin tone that shows in every photo, in every lighting, on every camera. Foundation covers it. Nothing fixes it.",
        "You went for the strong vitamin C. Sensitivity. Redness. Peeling. Stopped. Spots came back. Sound familiar?",
      ],
      hope: [
        "Milk has been used to brighten and even skin tone for centuries — from ancient Egypt to Indian bridal rituals. It works. Gently.",
        "Your skin can look more even. Not overnight — but with the right daily support, the change is real and lasting.",
        "Brightening doesn't have to hurt. The most effective brightening is consistent, gentle, and starts at the cleansing step.",
      ],
      desire: [
        "Skin so even-toned you stop looking for the smooth-skin filter before posting. Every single photo.",
        "Waking up and seeing a clear, even complexion in the mirror without foundation. That is not a fantasy.",
        "The kind of natural clarity that makes people think you're wearing a filter when you're not.",
      ],
      educational: [
        "Lactic acid in milk is one of the gentlest natural exfoliants — and it's been brightening skin since ancient Egypt. Here's why it's still unsurpassed.",
        "Why post-inflammatory hyperpigmentation (the dark spots from old breakouts) is so stubborn — and what actually works.",
        "Saffron in skincare: what 3,000 years of Ayurvedic use and modern carotenoid research have in common.",
      ],
    },
    relate: [
      "Old breakout marks that take months to fade. Sun spots that show up every summer and never fully leave. Uneven patches that make your skin look blotchy no matter how much you blend. You've tried vitamin C, niacinamide, kojic acid. Some helped a little. None of them cleared it. You're tired of covering, not correcting.",
      "Pigmentation that arrived during pregnancy, during stress, during that one terrible breakout month — and never left. You didn't do anything wrong. But most products address it on the surface. The real fix has to start at the cleansing step.",
      "Uneven skin tone that foundation covers but never improves. Every evening you're covering. Every morning you're hoping it'll be better. It looks the same. You've spent thousands trying. It's not about spending more — it's about the right ingredients, consistently, from the very first step.",
    ],
    transformation: [
      "Four weeks from now, you could be reaching for your phone to take a photo without thinking about your skin first. Six weeks from now, someone might ask what you've been doing differently. Not because you bought something expensive. Because you finally started brightening from the right place.",
      "Imagine looking in the mirror and seeing an even, clear complexion — not because foundation is covering something, but because there's genuinely less to cover. Your skin, clearer. Your mornings, easier.",
      "The women in your family who had naturally luminous skin didn't have a 10-step routine. They had kesar, milk, and consistency. That knowledge is still available. Radiance Glow is what it looks like in a modern daily bar.",
    ],
    insight: [
      "Pigmentation is produced by melanocytes responding to inflammation — UV, breakouts, stress, pollution. To fade it, you need gentle exfoliation AND ingredient support for a more even melanin process. Milk's natural lactic acid handles the first. Saffron's carotenoids support the second. Together, they work from the cleansing step — every day, without irritation.",
      "Most brightening actives work on the skin's surface — but they can only penetrate what isn't blocked by dead cells. Using a gentle exfoliating brightening cleanser means you're clearing the path for every product that follows. Radiance Glow's milk proteins do this at the cellular level — gently, without the sensitivity risk of stronger acids.",
      "Kesar and zafran have been used together in Indian bridal skincare for centuries specifically for their combined effect on complexion tone. Modern research points to saffron's crocetin and crocin compounds as relevant to skin brightness. Pair that with goat milk's natural lactic acid and you have a daily ritual that genuinely earns its brightening claim.",
    ],
    solution: [
      "Zeshto Radiance Glow uses goat milk (a natural source of lactic acid), kesar, and zafran — three brightening-tradition ingredients from the oldest beauty cultures on Earth. Cold-process, handmade, with no bleaching agents. Your daily wash becomes a daily brightening ritual. Two minutes every morning, building results over weeks.",
      "Radiance Glow works while you wash. Goat milk exfoliates and brightens gently. Kesar supports complexion evenness. Zafran carries three generations of Indian bridal beauty knowledge. At ₹259 — less than one brightening serum. And more effective because it's working from the first step, not the fifth.",
      "Radiance Glow replaces the expensive brightening serum you're applying on skin that isn't ready to receive it. Start at the cleansing step. Clear the surface. Support the process from the beginning. Then see how much better everything else performs — if you still need it.",
    ],
  },

  'rose-revive': {
    hooks: {
      fear: [
        "If your skin reacts to 'sensitive' products, something in those formulas is still triggering it. Most likely: synthetic fragrance.",
        "A disrupted skin barrier doesn't just cause sensitivity — over time, it makes skin age faster. What you wash with matters more than you think.",
        "Redness that keeps returning isn't just sensitive skin. It's often a specific ingredient in your routine causing repeated, low-level irritation.",
      ],
      frustration: [
        "You switched to fragrance-free. Your skin still goes red. You've run out of things to try.",
        "Sensitive skin that reacts to everything — including the gentle, dermatologist-recommended products. The exhaustion is real.",
        "You've narrowed your routine to almost nothing. And still, every few days, your skin flares up for no obvious reason.",
      ],
      hope: [
        "Rose has been used to soothe sensitive, reactive skin for over 5,000 years — from Persian hammams to Indian beauty rituals. It works.",
        "Sensitive skin isn't a life sentence. It often just needs the right two ingredients and nothing else.",
        "Your skin wants to be calm. It just needs someone to stop throwing ingredients at it and start listening.",
      ],
      desire: [
        "Skin so settled and comfortable that you stop thinking about it. That level of ease — it's possible.",
        "Washing your face and it staying comfortable all day. No tightness. No redness. No monitoring.",
        "Imagine your skin just cooperating — not reacting, not flaring, not needing constant management. Just calm.",
      ],
      educational: [
        "Synthetic fragrance is the number one cause of skin sensitisation in adults — even in products labelled 'natural'.",
        "Why sensitive skin often reacts to 'gentle' cleansers — the pH mismatch most brands never mention.",
        "Rose water in skincare: 5,000 years of documented use, and the botanical science behind why it soothes reactive skin.",
      ],
    },
    relate: [
      "You've tried every gentle cleanser. You've cut out fragrance, alcohol, sulphates. Your skin still reacts. Not dramatically — just a persistent low-level irritation that won't fully clear. Products that worked for months suddenly stop. You're afraid to try new things. You've run out of things to try.",
      "Sensitive skin means you can't just pick up any product. You read every ingredient list. You patch test everything. And yet — every few days, your skin flushes, tightens, and reminds you that it's in charge. The frustration of doing everything right and still reacting is something only sensitive-skin people understand.",
      "Redness that won't fully go. Tightness that comes back within 20 minutes of washing. Products you've used for years that suddenly start causing reactions. It feels like your skin is getting more reactive over time, not less. You need something that won't fight back.",
    ],
    transformation: [
      "A few weeks of Rose Revive and your skin might just settle. No tightness after washing. No morning redness. No flare-ups from your own cleanser. Just the quiet confidence of skin that's finally getting what it actually needs.",
      "Imagine washing your face and immediately feeling comfortable — not waiting to see if it reacts. Imagine going through a full day without thinking about your skin once. That's what calm skin feels like. Rose Revive exists to get you there.",
      "Sensitive skin made simple. Two ingredients. Ancient wisdom. One bar. And a version of yourself who doesn't dread the bathroom mirror anymore.",
    ],
    insight: [
      "Reactive skin is usually a barrier issue. When the skin barrier is compromised — by harsh surfactants, pH-disrupting cleansers, or ingredient overload — allergens and irritants penetrate more easily, causing the redness and tightness you keep experiencing. A gentle, minimal cleanser that respects the barrier stops the cycle instead of feeding it.",
      "Rose hip oil's fatty acid profile is remarkable — it closely mirrors the lipid composition of the skin barrier itself. This is why rose-based products have been used for sensitive skin for millennia. It's not just gentleness — it's biological compatibility.",
      "Most sensitive skin products still contain synthetic fragrance compounds because natural fragrance is more expensive. Rose Revive uses only naturally-derived rose fragrance. Not marketing — a formulation decision with real implications for reactive skin.",
    ],
    solution: [
      "Zeshto Rose Revive contains two ingredients: rose and dried rose petals. No complex fragrance compounds. No synthetic additives. Cold-process, with rose hip oil and rose water at its foundation. When your skin has said no to everything else, two ingredients it's been saying yes to for 5,000 years is the answer.",
      "Rose Revive is Zeshto's response to overcomplicated sensitive skin products. Real rose water. Real rose hip oil. Real dried rose petals. A bar that cleans without disrupting. That hydrates while it rinses. That's been doing exactly this for skin like yours for thousands of years.",
      "At ₹174, Rose Revive costs less than one bottle of the sensitive skin serum your skin reacted to last month. Two ingredients you can trust. Handmade. Tested to not disrupt. For skin that deserves a break from being experimented on.",
    ],
  },

  'royal-essence': {
    hooks: {
      fear: [
        "Your luxury body wash is probably stripping your skin's natural moisture barrier twice a day. Most people don't realise this until their 40s.",
        "Dry, tight skin after every shower isn't just discomfort. Over time, it's how skin starts looking older, faster.",
        "The body wash that smells amazing? Check the ingredient list. Most luxury cleansers strip the same barrier they claim to nourish.",
      ],
      frustration: [
        "You spent on the premium body wash. Your skin still feels dry an hour after showering. The cycle never ends.",
        "Moisturiser immediately after showering — and still dry by evening. You're compensating for stripping, not treating dryness.",
        "Dry skin that just isn't responding anymore. You've added oils, switched creams, changed your diet. Nothing is holding.",
      ],
      hope: [
        "Oudh is one of the rarest botanical ingredients in the world — and in a properly formulated cold-process bar, it does far more than smell extraordinary.",
        "A soap can nourish your skin during the wash, not just clean it. Cold-process with real shea butter is how.",
        "Dry, mature-looking skin responds remarkably well to the right oil balance in a cleanser. Most people have never experienced what that feels like.",
      ],
      desire: [
        "A shower that feels like a spa ritual. Skin that comes out nourished, not stripped. An experience you actually look forward to.",
        "The kind of fragrance that lingers — not from a spray, but from your soap. Rich, warm, unmistakably luxurious.",
        "Skin that feels genuinely cared for after the shower — not just clean. Soft, comfortable, nourished. Every single day.",
      ],
      educational: [
        "What is oudh (agarwood)? One of the world's rarest and most prized botanical materials — and why it belongs in your daily shower.",
        "The cold-process difference: why handmade soap retains natural glycerine and unsaponified oils — and what that does for very dry skin.",
        "Shea butter in a cold-process bar behaves completely differently from shea in a lotion. Here's why — and why it matters for dry and mature skin.",
      ],
    },
    relate: [
      "Dry skin that needs attention morning and night. Tight, uncomfortable after every shower. Moisturiser that lasts two hours. A routine that feels endless — because every product is compensating for what the previous one stripped away. You've tried switching products. Nothing changes the cycle.",
      "You want to feel luxurious in your own bathroom. To use something that smells extraordinary and leaves skin feeling genuinely nourished — not just momentarily moisturised. Most luxury washes claim this. Almost none of them deliver it. You're still searching.",
      "Mature-looking skin that feels drier and less supple every year. You've tried premium moisturisers, body oils, expensive lotions. The skin is still thirsty. What nobody mentions is that the stripping cleanser used twice daily undoes most of what the moisturiser tries to do.",
    ],
    transformation: [
      "Your shower becomes something you look forward to. Skin that comes out soft, fragrant, and genuinely comfortable. No immediate reaching for moisturiser. No tightness by evening. Just the quiet confidence of skin that has been properly looked after — from the very first step.",
      "Imagine stepping out of the shower and your skin feeling like you've applied body oil — before you've put anything on. That's what a properly formulated cold-process soap with real shea and oudh actually does. It's not luxury marketing. It's just the right formulation.",
      "Dry, high-maintenance skin turned into skin that takes care of itself — because you stopped stripping it first. Royal Essence doesn't promise magic. It just promises that what touches your skin twice a day will actually work for it.",
    ],
    insight: [
      "Cold-process soap retains the natural glycerine produced during saponification. This glycerine draws moisture to the skin during the wash. Combined with a superfatted shea butter formula, Royal Essence leaves a trace of nourishing fat on the skin even after rinsing — actively supporting moisture during the cleansing step itself.",
      "Oudh (agarwood) has been used in Middle Eastern and South Asian beauty rituals for over 3,000 years. Its rich resinous compounds are different from any synthetic recreation. The warmth you smell is the warmth your skin feels — and it's earned through three millennia of use.",
      "Shea butter in a cold-process soap is superfatted — meaning a portion of it remains unsaponified and is delivered to the skin during the wash. The fatty acid profile of shea (high stearic and oleic acid) is deeply compatible with dry, mature skin. This is fundamentally different from a rinse-off lotion.",
    ],
    solution: [
      "Zeshto Royal Essence uses real oudh extract, superfatted shea butter, and kaolin clay in a cold-process bar. Oudh for an incomparable luxury experience. Shea for nourishment during the wash. Kaolin for the cleanest finish. This isn't a soap that pretends to nourish. It actually does — from the first lather.",
      "Royal Essence is cold-process, meaning no high-heat processing that destroys skin-beneficial compounds. Superfatted, meaning the shea butter is doing real work during your shower. And scented with real oudh — meaning your bathroom smells like it belongs somewhere far more expensive.",
      "At ₹259, Royal Essence is less than one bottle of most premium body washes — and it nourishes during the cleansing step instead of stripping and compensating. Swap the commercial bar for one that actually supports dry, mature skin. The cycle ends here.",
    ],
  },

  'calm-essence': {
    hooks: {
      fear: [
        "Most gentle cleansers still have a pH above 7. Your skin's natural pH is 4.5. That gap is why your skin keeps reacting.",
        "If your cleanser causes redness that 'calms down after a few minutes' — it's not calming. It's causing repeated micro-irritation every single day.",
        "Synthetic lavender fragrance is one of the most common skin sensitisers. Most 'lavender' skincare uses it. Here's how to know the difference.",
      ],
      frustration: [
        "You picked the one for sensitive skin. The gentle one. Your face is still red after washing. You're losing faith in every label.",
        "Reactive skin that never fully settles. Good days and bad days with no pattern you can find. You've adjusted everything. Still reactive.",
        "Every natural and organic product you try causes a reaction. You're starting to think nothing will work for your skin.",
      ],
      hope: [
        "Goat milk has a pH of 6.4 — closer to your skin's natural pH than almost any commercial cleanser. That compatibility is why it's been used for sensitive skin since ancient Egypt.",
        "When your skin finally gets what it's compatible with, it stops fighting. Calm Essence is two ingredients your skin actually recognises.",
        "Real lavender essential oil has one of the most documented calming botanical profiles in skincare history. Your sensitive skin knows the difference from synthetic.",
      ],
      desire: [
        "Skin that stays comfortable from morning wash to bedtime. No monitoring. No wondering if it'll flare up again.",
        "Washing your face and feeling nothing but clean. No redness. No tightness. Just skin doing what it's supposed to do.",
        "Imagine actually enjoying your skincare routine instead of dreading it. Skin that cooperates — every day.",
      ],
      educational: [
        "Why pH matters more than 'fragrance-free' for sensitive skin — and why most gentle cleansers still disrupt your acid mantle.",
        "Goat milk in skincare: the pH science that explains why sensitive skin has been using it for thousands of years.",
        "The difference between lavender essential oil and lavender fragrance — and why it matters for reactive skin more than any other type.",
      ],
    },
    relate: [
      "Your skin reacts to almost everything. You've cut out every possible trigger. You use one cleanser, one moisturiser, and still — twice a month, a flare. Redness that takes days to calm. You're careful, consistent, and still can't get ahead of it. It feels unfair. Because it is.",
      "Sensitive skin is exhausting — not because it looks bad, but because it controls what you can and can't use. You envy people who can just pick up a product without worry. Every new thing is a risk. You need something with so few ingredients that there's almost nothing left to react to.",
      "Good skin days and bad ones with no pattern. You wake up and check your face like it's going to tell you what kind of day it'll be. Redness, tightness, that uncomfortable pull — you've learned to manage it, but you're never quite ahead of it.",
    ],
    transformation: [
      "A few weeks from now, you could stop checking your face every morning wondering what kind of day it'll be. Your skin, consistently calm. Your routine, actually enjoyable. The relief of not having to manage your skin every single day — that's where Calm Essence takes you.",
      "Imagine washing your face and having it feel immediately comfortable. No waiting to see. No checking in ten minutes. Just clean, calm, cooperative skin that asks nothing from you for the rest of the day.",
      "Calm skin feels different from reactive skin — not just physically, but mentally. You stop thinking about it constantly. You stop planning around it. You can just live. Calm Essence is a simple, two-ingredient step toward that.",
    ],
    insight: [
      "Reactive skin is almost always a pH problem at its root. Most cleansers — even gentle ones — have a pH of 8–10. Your skin's natural pH is 4.5–5.5. Every wash raises the surface pH and disrupts the acid mantle. Goat milk's pH of 6.4 is the closest any natural cleanser ingredient gets to skin compatibility. Less disruption means less reactivity.",
      "Most commercial lavender products use synthetic linalool — an isolated compound, not the full essential oil. Real lavender essential oil contains over 100 compounds in natural ratios, including linalool and linalyl acetate, which work together in a way synthetic versions can't replicate. For reactive skin, this distinction is everything.",
      "Sensitive skin often isn't sensitised to specific ingredients — it's sensitised to cumulative disruption. Too many actives, too many fragrances, too many preservatives. The more complex the formula, the more chances for something to trigger. Calm Essence has two hero ingredients. There is almost nothing to react to.",
    ],
    solution: [
      "Zeshto Calm Essence uses real goat milk and true lavender essential oil — not synthetic versions of either. Cold-process, handmade, with nothing unnecessary. For skin that has reacted to everything else, this is the bar that finally has almost nowhere to go wrong.",
      "Calm Essence works in two ways simultaneously: goat milk supports the skin's natural pH during the wash, reducing the inflammatory cycle that causes reactivity. Lavender's natural compounds calm the skin's surface response. Two ingredients. Centuries of use for exactly this skin type.",
      "At ₹174, Calm Essence is the most uncomplicated thing you can do for reactive skin. Fewer ingredients than any product you've tried. The two that remain are the ones sensitive skin has said yes to for thousands of years.",
    ],
  },

  'fresh-blizz': {
    hooks: {
      fear: [
        "If you're washing oily skin twice a day with a stripping cleanser, you're not reducing oil — you're triggering more production.",
        "Vitamin C in a ₹3,000 serum doesn't work if you're applying it on skin that hasn't been properly prepped. Here's what's blocking it.",
        "Oily AND dull at the same time? Most oil-control cleansers make both worse by stripping and causing a rebound effect.",
      ],
      frustration: [
        "Shiny by 10am despite washing twice. Blotting sheets by noon. Touch-ups at 3pm. Your skin is in control. Not you.",
        "Oily skin that looks dull instead of glowing — the worst combination. You've tried mattifiers, oil-control washes, everything. Still the same.",
        "You can't remember the last time your skin looked fresh and bright past midmorning. You're not asking for much. Just balance.",
      ],
      hope: [
        "Oily skin isn't the enemy. Stripped skin that overproduces to compensate — that's the problem. A balanced cleanser fixes this.",
        "Fresh, mattified, actually bright skin is possible. Just not the way most oil-control products approach it.",
        "Kaolin clay has been used for centuries to absorb excess oil without stripping. The reason it's still the benchmark is simple — it works.",
      ],
      desire: [
        "Skin that looks fresh and bright all the way to dinner — without a blotting sheet, without a touch-up, without thinking about it.",
        "That morning-after-a-good-night's-sleep skin, but every day. Balanced. Clear. Actually bright.",
        "A complexion that photographs beautifully without a filter because it's genuinely fresh — not just freshly touched up.",
      ],
      educational: [
        "The over-cleansing oil rebound: why stripping oily skin with harsh cleansers makes it produce more sebum, not less.",
        "Vitamin C in a cleanser vs a serum: why daily cleansing with vitamin C can be more effective than a high-concentration leave-on.",
        "Kaolin clay 101: the mildest, most studied clay for daily oil control — and why it beats harsher clays for sensitive or combination skin.",
      ],
    },
    relate: [
      "Oily, congested skin that looks flat and dull in photos. You wash twice a day. You use the oil-control products. By 11am, you're shiny. By 2pm, you're blotting. By evening, your pores look more visible than when you started. The routine isn't working — it's probably making things worse.",
      "Dull AND oily — the combination nobody tells you is actually very common. You're looking for something that brightens without drying, controls oil without stripping, and makes your skin look genuinely fresh. Most products address one of those things. None of them address all three.",
      "You've been washing your face thinking you're solving the oil problem. But the stripping creates rebound. The rebound creates shine. The shine creates more washing. You're in a cycle — and the exit isn't another oil-control product that does the same thing harder.",
    ],
    transformation: [
      "Imagine washing your face and it staying that way — not for an hour, but through the afternoon. Fresh. Bright. Balanced. Without touching up, without blotting, without thinking about your skin. That's what balanced oil production actually feels like.",
      "Two months from now, your morning routine could take five minutes less — because you won't need to layer on the oil-control products that compensate for what your cleanser is stripping. One bar. And your skin starts working with you.",
      "Clear, mattified, actually glowing skin — not in photos with a filter, but in person, in whatever lighting you're in. That's oily skin finally in balance. Fresh Blizz is one step in that direction.",
    ],
    insight: [
      "When oily skin is stripped by harsh surfactants, the sebaceous glands interpret it as a signal to produce more oil to compensate. This is the over-cleansing rebound cycle. Breaking it requires a cleanser that removes excess oil without stripping the barrier — which is exactly what kaolin clay does. It absorbs surface sebum gently, without sending the rebound signal.",
      "Vitamin C (ascorbic acid) is one of the most studied brightening ingredients in skincare. In a daily cleanser, it supports brightening at the wash itself — without the sensitivity risk of high-concentration leave-on serums. For oily, dull skin, this is often the most efficient delivery method available.",
      "Lemon essential oil has been used in skincare for its refreshing, astringent properties for centuries. In Fresh Blizz, combined with kaolin and vitamin C, it supports a genuinely fresh complexion — not just a temporarily washed one. The difference shows up three hours after the shower.",
    ],
    solution: [
      "Zeshto Fresh Blizz combines kaolin clay for daily oil balance, vitamin C for brightening support, and the sharp freshness of lemon and mushk. Cold-process, handmade. For oily, dull skin that needs balance AND brightness — not just mattification and not just brightening. One bar. Two minutes. Every morning.",
      "Fresh Blizz is the first step in breaking the oil-strip-rebound cycle. Kaolin absorbs excess sebum without triggering more production. Vitamin C supports a brighter complexion from the wash itself. Mushk and lemon make every wash feel like a proper reset. ₹259 for a bar that replaces the cycle.",
      "Most oil-control products claim to mattify. Fresh Blizz actually does — by working with your skin's oil balance instead of fighting it. One bar. Kaolin, vitamin C, lemon, mushk. Two minutes every morning. And by 2pm, you might not need the blotting sheet.",
    ],
  },

  'purity-guard': {
    hooks: {
      fear: [
        "The viral acne-fighting cleanser you're using strips your skin barrier — the very thing that keeps breakouts from forming in the first place.",
        "Adult acne that started in your 20s and hasn't left — it's not just hormones. Your cleanser is very possibly involved.",
        "Harsh acne cleansers create a cycle: they strip the skin, the barrier weakens, more bacteria penetrate, more breakouts follow. Sound familiar?",
      ],
      frustration: [
        "You've tried the viral acne wash. The medicated gel. The salicylic acid toner. Three months later — still breaking out. Now dry and tight on top of it.",
        "Adult acne is different from teenage acne. It's not about being dirty. Not about diet. Not about stress. It's still there.",
        "A breakout fades. Another arrives. You never get a fully clear week. You've accepted it as your skin type. But what if it isn't?",
      ],
      hope: [
        "Neem and tulsi have been used as India's skin guardians for generations — before modern acne actives existed, before dermatology, before skincare brands. They worked then. They work now.",
        "Breakout-prone skin that looks consistently clearer isn't a dream. It just needs the right ingredient relationship — not the most aggressive one.",
        "Your skin barrier is the thing that keeps acne-causing bacteria out. Protecting it is as important as clearing what's already there.",
      ],
      desire: [
        "Clear skin that you actually trust — not just on good days, not just under flattering lighting.",
        "Waking up and not immediately checking your face for new breakouts. That level of calm. That level of confidence.",
        "Looking in the mirror without scanning for what's new, what's worse, what you need to cover. Just clear skin.",
      ],
      educational: [
        "Neem: one of Ayurveda's most documented botanical ingredients. Here's what the actual research says — and why it's been in Indian households since before skincare brands existed.",
        "Why aggressive acne cleansers often make breakouts worse in the long run — the barrier disruption cycle explained.",
        "Tulsi (holy basil) in skincare: its traditionally documented compounds and why neem plus tulsi is the most logical pairing for acne-prone skin.",
      ],
    },
    relate: [
      "Breakouts that arrive without warning and leave marks that stay for weeks. A face that never looks fully clear — not in good lighting, not in bad. You've been careful. You've been consistent. You've done everything the internet says. Still there. Purity Guard exists for exactly this skin.",
      "Adult acne hits differently. It's not the teenage pimples you expected to age out of. These are stubborn, often stress-triggered — and made worse by cleansers that strip the skin barrier and leave it open to more. You need something that works with your skin's natural defence, not against it.",
      "You've spent more on face wash than on actual food some months. Dermatologist recommendations, pharmacy brands, viral products. Each with a big claim. Each with a limited result. What you need isn't the strongest — it's the most consistent. And consistency starts with ingredients your skin tolerates.",
    ],
    transformation: [
      "A month from now, you might stop checking your face first thing in the morning. Not because you've given up — but because there's less to check. Consistently clearer. Gradually calmer. That's what the right ingredients, used daily, actually look like over time.",
      "Imagine a clear week. Then another. A complexion you can look at in direct sunlight without wincing. No new breakouts every other day. No marks accumulating faster than they're fading. Just skin, improving — because you stopped fighting it and started supporting it.",
      "The skin you want is possible. Not through the most aggressive cleanser on the shelf, but through the most compatible one. Neem and tulsi have been doing this for Indian skin since before any modern skincare brand existed. Your skin always had an answer. It was always neem.",
    ],
    insight: [
      "Neem (Azadirachta indica) contains nimbidin and azadirachtin — compounds with some of the strongest documented botanical properties for supporting clearer skin in Ayurvedic medicine. Unlike harsh actives, neem works in cooperation with the skin microbiome rather than disrupting it. Tulsi adds its own traditionally documented support. Together, they don't fight your skin — they support it.",
      "The skin barrier is your first line of defence against acne-causing bacteria. When it's disrupted by harsh surfactants, bacteria have easier access to the follicle. That's why aggressive acne washes can cause more breakouts, not fewer. Purity Guard cleanses without stripping — because a healthy barrier is the best long-term defence.",
      "India's Ayurvedic tradition figured out neem and tulsi for skin clarity long before modern pharmaceutical actives. The reason they remained in use across generations isn't tradition for its own sake — it's that they worked. Consistently. Without the irritation, dryness, and peeling that comes with most modern acne treatments.",
    ],
    solution: [
      "Zeshto Purity Guard uses neem and tulsi — India's most trusted skin-clearing botanicals — in a cold-process bar formulated for daily use. No harsh surfactants that strip the barrier. No synthetic actives that cause peeling. Just two ingredients with centuries of use, doing what they've always done.",
      "Purity Guard is the answer for acne-prone skin that's been through the aggressive approach and found it wanting. Neem for its Ayurvedic reputation as a skin guardian. Tulsi for its documented complementary properties. Cold-process to preserve every compound. Daily use to build the consistency that actually makes breakouts less frequent.",
      "At ₹174, Purity Guard is less than one tube of the medicated gel that dried your skin out last month. Two ingredients. Three thousand years of documented use. One bar that your skin recognises, tolerates, and over time, responds to.",
    ],
  },

  'charluna-glow': {
    hooks: {
      fear: [
        "Your pores look congested the day after washing. Whatever you're using isn't reaching what's actually inside them.",
        "Most activated charcoal products use so little, it's purely cosmetic. The amount in CharLuna Glow is actually functional.",
        "Surface-clean and deep-clean are very different things. If your skin always looks a little congested, you're getting the first kind.",
      ],
      frustration: [
        "Your skin never looks fully clear. Not the day after washing, not after a mask, not after every pore-minimising product you've tried.",
        "Oily, breakout-prone, and sensitive at the same time — the combination that makes every strong product off-limits and every gentle one ineffective.",
        "Enlarged pores that keep looking bigger. Congested texture that never fully clears. Products that claim to help but never seem to.",
      ],
      hope: [
        "Activated charcoal works like a magnet for the look of surface impurities. Combined with kaolin clay, it gives you the deepest clean that's still gentle enough for daily use.",
        "You can have genuinely deep-clean pores and a happy skin barrier at the same time. CharLuna Glow is what that combination looks like.",
        "Congested skin isn't a permanent state. It's a result of surface buildup that the right daily cleanser can address — consistently.",
      ],
      desire: [
        "That deep-clean feeling that actually lasts — past midmorning, past noon, all the way to evening.",
        "Pores that look smaller because they're actually clear — not because you've blurred them with makeup.",
        "Skin that looks visibly cleaner after washing. Not just washed — actually, noticeably clear.",
      ],
      educational: [
        "How activated charcoal actually works: the adsorption science, what it can and can't do, and why the amount in a formula matters.",
        "Kaolin vs bentonite clay: why kaolin is the better choice for daily use on sensitive, acne-prone skin.",
        "Lily extract and vetiver in skincare: how these two botanical ingredients balance a deep-cleansing formula beautifully.",
      ],
    },
    relate: [
      "Congested pores, uneven texture, skin that never looks fully clear no matter how often you wash. Foundation doesn't sit evenly. Pores seem to keep getting bigger. Every deep-clean product either works for three days or irritates. You need something that reaches deeper — without the irritation.",
      "You wash your face at night. Wake up and already feel like your skin needs cleaning again. That never-clean feeling isn't about how often you wash. It's about what your cleanser is actually reaching. Surface dirt is easy. Sebum inside the follicle is where CharLuna Glow works.",
      "Breakout-prone AND sensitive — the combination that makes most acne cleansers too aggressive and most gentle cleansers useless. You need the deep clean without the barrier disruption. Charcoal and kaolin clay, in the right formulation, is the answer.",
    ],
    transformation: [
      "A month of CharLuna Glow and you might notice your pores look different. Not through a filter — in the mirror, under bathroom light. Actually clearer. That's what happens when you stop surface-cleaning and start deep-cleaning. Every day.",
      "Imagine looking at your skin three weeks from now and seeing less congestion, less texture, a genuinely clearer complexion. Not because you tried a 10-step routine — but because you changed the one step that matters most: the daily cleanse.",
      "Congested skin isn't your skin type. It's a surface condition that builds up faster than your current cleanser clears it. CharLuna Glow changes that balance. And once the surface is genuinely clear — everything else you apply works better.",
    ],
    insight: [
      "Activated charcoal works through adsorption — it attracts and binds to small molecules, drawing out the look of impurities at the skin surface and just inside pores. Kaolin clay works differently: it absorbs excess sebum and creates a physical drawing effect. Together, they clean at two levels that most cleansers never reach.",
      "The reason most deep-cleanse products disappoint is that they rely on surfactants alone — which clean the surface but don't address the sebum inside the follicle. Charcoal adsorbs from the inside out. That's physical chemistry, not marketing. And it's why pores look visibly clearer after a proper charcoal wash.",
      "Vetiver essential oil has a long history in Ayurvedic and Southeast Asian skincare for its grounding, balancing properties. In CharLuna Glow, it does something specific: it balances the deep-cleansing action of charcoal and clay, preventing that over-stripped feeling that most deep-cleanse products leave behind.",
    ],
    solution: [
      "Zeshto CharLuna Glow uses activated charcoal, kaolin clay, lily extract, and vetiver in a cold-process bar. Charcoal adsorbs. Kaolin absorbs. Lily soothes. Vetiver balances. For skin that needs a genuine deep clean without the irritation that usually comes with it — this is that bar.",
      "CharLuna Glow is the bar for skin that has always felt somewhat congested and never known what to do about it. Charcoal and clay at a level that actually does something. Lily and vetiver to make sure the barrier doesn't pay the price. Cold-process, handmade, ₹259.",
      "Most charcoal soaps are black for marketing reasons. CharLuna Glow is black because the charcoal content is functional — high enough to genuinely adsorb. Paired with kaolin, lily, and vetiver, it's the most complete deep-cleanse bar in the Zeshto range.",
    ],
  },

  'amber-calm': {
    hooks: {
      fear: [
        "A week of pollution, stress, and bad air is sitting on your skin right now. Your regular cleanser isn't removing all of it.",
        "Dry AND congested at the same time — and most detox products only address one while making the other worse.",
        "Harsh detox masks strip the barrier that's supposed to protect your skin. Is your detox routine actually harming you?",
      ],
      frustration: [
        "You used the charcoal mask. Skin looked clearer for two days. Then back to the same flat, congested look. It never holds.",
        "Skin that never fully resets. Even after good sleep, clean eating, consistent routine — there's always a layer of the week sitting on it.",
        "Congested AND dry — the combination no product seems designed for. Heavy creams clog. Light gels don't nourish. Nothing quite works.",
      ],
      hope: [
        "Some skin needs a warm, grounding reset — not a harsh strip. Patchouli, cedar, and clove have been providing exactly that for centuries.",
        "A detox routine can feel luxurious. The most effective reset is often also the most sensory — Amber Calm is both.",
        "Charcoal and kaolin together can give you the deep clean of a weekly mask as part of your daily bar. No extra steps needed.",
      ],
      desire: [
        "A shower that changes your whole day — not just your cleanliness, but your mood, your energy, your sense of yourself.",
        "Skin that feels genuinely fresh and reset at the start of every day — not just surface clean, but actually free of the week's buildup.",
        "That spa-retreat feeling, from your daily shower. Amber Calm is what that smells like, feels like, and works like.",
      ],
      educational: [
        "Why patchouli, clove, and cedarwood aren't just fragrance — their documented use in Ayurvedic and aromatherapeutic skin rituals for centuries.",
        "Charcoal and kaolin together: how they work at different levels for a more complete detox than either ingredient alone.",
        "What skin detox actually means biologically — and why a warming, grounding cleanser is more effective than a harsh stripping one.",
      ],
    },
    relate: [
      "By mid-week, your skin feels like it's wearing the week. Pollution, indoor air, screen exposure, stress — it shows as a flat, congested, tired look that your regular cleanser doesn't touch. You need a genuine reset. Not a harsh one. A warm, deep one that clears what's built up without stripping what belongs.",
      "Dry skin that also looks congested. The combination that makes no sense and yet is very real. Heavy products clog. Light ones don't nourish. Detox masks strip. Regular bars don't reach deep enough. Amber Calm was formulated specifically for skin caught between these two needs.",
      "You've done the charcoal mask routine. It works for a day or two, then the skin is back to looking congested and flat. What you need isn't a weekly treatment — it's a daily bar that provides the detox effect without the disruption.",
    ],
    transformation: [
      "Your shower stops being a task and starts being a ritual. Skin that feels genuinely clean — not just surface-rinsed. A complexion that looks clearer by the end of the week because the buildup isn't accumulating faster than the cleanse. And a warm, amber scent that follows you out of the bathroom into your morning.",
      "By week three, the flat, congested look starts to lift. Not from a mask you had to schedule — just from showing up every day with a bar that reaches deeper than your last cleanser did. Amber Calm is a daily detox that compounds. The longer you use it, the more your skin reflects that.",
      "You stop needing the weekly face mask. You stop feeling like your skin is carrying the week. You just step out of the shower feeling like you've reset — every single morning. That's what the right daily detox looks like.",
    ],
    insight: [
      "Activated charcoal adsorbs surface molecules and draws out the look of impurities. Kaolin clay absorbs excess sebum from inside pores. Together, they create a detox at two levels — without the over-stripping that comes from harsher treatments. Amber Calm's charcoal plus clay combination delivers this in a daily bar that's warm, grounding, and sensory.",
      "Patchouli and cedarwood essential oils have been used in Ayurvedic and aromatherapeutic skincare specifically for their balancing, grounding properties. They're not just fragrance — they're functional botanicals that support a balanced skin feel while charcoal and clay do the cleansing work.",
      "The warmth of amber, vanilla, and clove in Amber Calm isn't arbitrary. These ingredients have been used in Ayurvedic body rituals for centuries because warmth in a skincare product supports circulation and absorption. The sensory experience is also therapeutic — an intentional formulation choice, not an afterthought.",
    ],
    solution: [
      "Zeshto Amber Calm brings together activated charcoal, kaolin clay, patchouli, clove, cedarwood, amber, and vanilla in a cold-process bar. Deep cleanse power with warm, grounding botanical support. For skin that needs a genuine daily detox — and deserves to feel luxurious while getting it.",
      "Amber Calm is Zeshto's full-sensory reset bar. Charcoal and kaolin work at the pore level. Patchouli, cedar, and amber turn the shower into a ritual. Vanilla and clove ground the experience in warmth. Your bathroom smells like a spa. Your skin comes out genuinely clearer. Every single day.",
      "At ₹259, Amber Calm replaces both your regular cleanser and your weekly detox mask. One bar, daily use, a deep-clean that accumulates. And every shower smells warm, rich, and completely unlike anything from a commercial shelf.",
    ],
  },

  'sandal-radiance': {
    hooks: {
      fear: [
        "Chemical brightening agents can cause rebound darkening if the skin barrier isn't protected. Are your brightening products creating more pigmentation than they're fading?",
        "Hyperpigmentation treated aggressively can trigger more inflammation — which creates more pigmentation. The exit isn't a stronger product.",
        "If your brightening products are causing sensitivity or peeling, they're working against your skin barrier — the thing you need most to fade dark spots.",
      ],
      frustration: [
        "You've tried every DIY sandal paste your mother recommended. Some helped a little. Nothing lasted. The modern alternatives were either too harsh or did nothing.",
        "Pigmentation that fades slowly, then comes straight back after the next sun exposure or breakout. Progress that feels invisible because it almost is.",
        "Uneven tone that you've been covering for years. Not because you've given up — because nothing has actually worked consistently enough.",
      ],
      hope: [
        "Sandalwood has been used in Indian skincare for over 3,000 years. Not because of tradition alone — but because it worked, consistently, for generations of Indian skin.",
        "The Indian glow that generations of women built with sandalwood is not just for brides or special occasions. It's what daily use of the right ingredients builds.",
        "Kokum butter — from India's Western Ghats — may be the most underrated brightening and nourishing ingredient your skin has never tried.",
      ],
      desire: [
        "Skin so even and luminous that your foundation stays in the drawer. Not because you're hiding something — because there's less to hide.",
        "That photographs-beautifully-in-natural-light complexion. No filter. No editing. Just sandalwood and time.",
        "The classic Indian glow — clear, even, radiant skin that generations of women built with chandan. Yours to have.",
      ],
      educational: [
        "Alpha-santalol in sandalwood: the compound that 3,000 years of Ayurvedic use and modern skincare research are both pointing to for brightening and skin tone support.",
        "Red sandalwood (rakta chandan) vs white sandalwood: the differences, the compounds, and why Sandal Radiance uses both.",
        "Kokum butter: India's most underrated indigenous beauty ingredient — and why it outperforms imported alternatives for nourishment and skin tone support.",
      ],
    },
    relate: [
      "Hyperpigmentation that arrived after sun exposure, after stress, after a breakout month — and hasn't fully faded since. You've done the vitamin C, the SPF, the brightening masks. Slow progress that reverses with one bad week. It's not that your skin can't be clearer. It's that you haven't found the right daily approach.",
      "Uneven skin tone that you've stopped thinking of as fixable. Dark patches near the hairline, sun spots that show in photos, old marks that are fading but never quite finish fading. You've accepted them. But the acceptance isn't the same as being okay with them.",
      "You grew up hearing about sandal paste as the Indian answer to luminous skin. You tried the DIY versions. Mixed results, lots of mess. What nobody told you was that sandal works best when used consistently, in a formulation that lets the active compounds actually reach the skin — which a cold-process soap does better than any paste.",
    ],
    transformation: [
      "Six weeks of Sandal Radiance and your skin starts looking different in natural light. More even. More luminous. Not dramatically — gradually. The way skin brightens when you support it consistently from the cleansing step. The way it's always been done, just with a bar instead of a paste.",
      "The Indian glow isn't a filter. It's what skin looks like when it's been consistently supported with the right botanical ingredients over time. Your grandmother had it. You can too. Not from a clinic, not from a chemical treatment — from the same ingredients she used, in a better formulation.",
      "Imagine putting down the colour corrector. Not because you've given up — because there's genuinely less to correct. An even, luminous complexion that you didn't have to fight for. You just had to start with the right daily bar.",
    ],
    insight: [
      "Sandalwood (Santalum album) contains alpha-santalol, a compound studied for potential effects on melanin-related processes. Red sandalwood adds pterostilbene — related to resveratrol. Together, they support what traditional Indian cosmetics have known for centuries: the combination of both sandals is more effective than either alone. Kokum butter provides the nourishment that keeps the barrier intact while this work happens.",
      "Most brightening approaches work aggressively — forcing cellular turnover or suppressing melanin production chemically. Sandal Radiance takes a different path: supporting the skin's natural brightening process from the cleansing step up, without disrupting the barrier. Slower, gentler, more sustainable. Exactly how Indian skin has been brightened for thousands of years.",
      "Kokum butter (Garcinia indica) comes from a fruit native to India's Western Ghats. Its stearic and oleic acid content is deeply compatible with skin — it nourishes without greasiness and has been used in Indian cosmetic preparations for centuries. In Sandal Radiance, it provides the moisture that keeps the skin barrier healthy while the sandal compounds support brightness.",
    ],
    solution: [
      "Zeshto Sandal Radiance uses both white sandalwood (chandan) and red sandalwood (rakta chandan) — a combination traditional Indian cosmetics have used specifically for tone support — along with kokum butter for deep nourishment. Cold-process, handmade. Your daily wash becomes a brightening ritual that's been trusted for 3,000 years.",
      "Sandal Radiance is the most complete Ayurvedic brightening cleanser in the Zeshto range. Two forms of sandalwood for layered tone support. Kokum butter for barrier nourishment. Cold-process to preserve every active compound. Daily use to build cumulative results. This is what the Indian glow looks like in a daily bar.",
      "At ₹174, Sandal Radiance costs less than one brightening clinic consultation — and builds the same results from your daily wash. No peeling. No sensitivity. Just chandan and kokum, twice a day, accumulating over weeks into a complexion you're proud of.",
    ],
  },

  'hair-vitalizer': {
    hooks: {
      fear: [
        "The SLS in your shampoo strips the scalp's natural oil balance with every wash. Over time, this weakens the hair follicle environment — slowly, invisibly.",
        "If your scalp is never quite balanced — always too oily or too dry — the surfactant in your shampoo is very likely why.",
        "Hair that looks great right after washing but limp within 24 hours isn't just a styling problem. It's a scalp problem your current shampoo is creating.",
      ],
      frustration: [
        "Oily roots, dry lengths, never balanced. You've tried every shampoo in every price range. The problem moves, but never resolves.",
        "Hair that used to be thick and shiny and now just isn't. Products claim to restore it. Nothing does. The decline feels slow but steady.",
        "Washing your hair every other day because it gets greasy so fast. Then wondering why it's breaking and dry. Your shampoo is doing both.",
      ],
      hope: [
        "Reetha, amla, and shikakai — the Ayurvedic hair care trinity that Indian women used for generations before synthetic shampoos existed. They didn't have limp, over-processed hair. There's a connection.",
        "Natural scalp cleansing doesn't mean weak lather or ineffective cleaning. Reetha produces its own natural saponins — nature's own surfactant.",
        "Your scalp has a natural oil balance it's trying to maintain. Give it ingredients that support that balance — and watch what happens over four to six weeks.",
      ],
      desire: [
        "Hair that feels clean without that squeaky, stripped sensation. Soft, manageable, naturally fragrant. Washing it feels like a ritual — not just a task.",
        "The hair your grandmother had — thick, naturally shiny, controlled without ten products. It wasn't genetics. It was reetha.",
        "Strong, bouncy, naturally glossy hair that doesn't need dry shampoo by day two. That's what a balanced scalp produces.",
      ],
      educational: [
        "What SLS and SLES actually do to your scalp — and why the clean feeling they create is a sign of stripping, not cleaning.",
        "The Ayurvedic hair care trio — reetha, amla, shikakai — and the specific role each ingredient plays. A proper breakdown.",
        "Scalp health 101: why what happens at the root determines the quality of the hair that grows from it — and what natural cleansing does differently.",
      ],
    },
    relate: [
      "Scalp that's always a little bit wrong. Oily at the roots within 24 hours. Dry at the ends by day three. Dandruff after some shampoos. Greasiness after others. You've spent more on shampoos than on most things in your bathroom — and none of them have actually fixed the balance. They've just managed it, expensively.",
      "Hair that looks thinner and flatter than it used to. Breakage at the ends, oily scalp, less volume. Not because you're ageing — because what you wash with is slowly changing your scalp environment. SLS-based shampoos work for some hair types. For Indian hair, with its complex oil balance, they often cause the exact problems you're experiencing.",
      "You've tried the expensive salon shampoo. The Ayurvedic brand from the pharmacy. The imported natural one. Some work better than others. None of them have resolved the question of whether your scalp is truly balanced. Hair Vitalizer is three ingredients that have been answering that question for Indian scalps since before shampoo was a product category.",
    ],
    transformation: [
      "Six weeks from now, you might be washing your hair less often — not because it's dirty, but because your scalp is balanced. The over-production that made you wash every other day calms down when you stop stripping it. Hair that stays fresher, longer. That's what reetha actually delivers.",
      "Imagine looking at your hair in the mirror and it having the quality your grandmother's had — natural gloss, volume at the root, no dry ends, no limp flattening by day two. Not from a product that promises it. From three ingredients that deliver it through consistent use.",
      "Strong scalp, strong hair. That's the Ayurvedic logic — and it's been proven right across generations of Indian women. Hair Vitalizer is where that journey starts.",
    ],
    insight: [
      "Reetha (soapnut) contains natural saponins — plant compounds that lather and cleanse without stripping the scalp's natural oils. Unlike SLS, which ionically binds to sebum and removes everything, reetha saponins cleanse selectively, preserving the scalp's protective balance. That's why hair washed with reetha doesn't rebound into excess oil production.",
      "Amla is one of the richest plant sources of Vitamin C and has been used in Ayurvedic medicine specifically for hair and scalp health for centuries. Shikakai (Acacia concinna) has a naturally acidic pH — close to the scalp's own — making it exceptionally well-suited to scalp cleansing without the alkaline disruption most modern shampoos cause.",
      "The reason reetha-washed hair looks different isn't marketing. It's that the scalp's sebaceous glands stop over-producing when they stop being repeatedly stripped. Within four to six weeks of switching from SLS to reetha, most people notice their scalp needs washing less often — because it's finally in balance.",
    ],
    solution: [
      "Zeshto Hair Vitalizer is a shampoo bar — not a body bar — formulated specifically for the scalp. Reetha as the base surfactant. Amla for traditionally documented hair strength support. Shikakai for pH-compatible scalp cleansing. No SLS. No SLES. Just three ingredients that India's grandmothers trusted, made convenient.",
      "Hair Vitalizer brings the Ayurvedic hair care trinity into your daily routine without the mess of powders or pastes. One bar. Cold-process, handmade. Use it the way you use shampoo — and let reetha, amla, and shikakai do what they've done for Indian hair for centuries.",
      "At ₹304, Hair Vitalizer is priced higher than most pharmacy shampoos because it works differently. No synthetic surfactants. No fillers. Just three ingredients with documented evidence of supporting scalp health and hair appearance — and the cold-process method that keeps them active.",
    ],
  },

  'mint-aura': {
    hooks: {
      fear: [
        "Oily, dull, tired skin by midmorning — your current cleanser isn't giving your skin the daily revival it needs.",
        "Charcoal that's added for colour versus charcoal that actually works are two very different things. Most 'detox' soaps are the first kind.",
        "If your skin looks the same after washing as it did before, your cleanser is doing the minimum. Your skin deserves more.",
      ],
      frustration: [
        "Dull, tired, oily skin that no amount of washing seems to actually revive. You feel like your skin is permanently fatigued.",
        "You need your skin to wake up in the morning — not just get clean. Your current wash doesn't do that.",
        "Oily skin that somehow also looks dull, flat, and lifeless. The two shouldn't coexist. Yet here you are.",
      ],
      hope: [
        "Mint's cooling, skin-awakening properties have been used in skincare for centuries. There's a reason it's still the gold standard for refreshed skin.",
        "Charcoal plus mint — deep cleanse and instant revival in one bar. Your morning wash can do both.",
        "Dull, oily skin isn't a permanent condition. The right daily cleanse changes everything — and it starts immediately.",
      ],
      desire: [
        "The kind of wake-up that starts in the shower — skin that comes out feeling alive, revived, and genuinely refreshed.",
        "Skin that looks bright and awake before your coffee is ready. Fresh, clear, and actually mattified all morning.",
        "That sharp, cool, clean feeling that tells your skin — and your mind — that today is starting right.",
      ],
      educational: [
        "Mint's menthol content improves circulation at the skin surface — which is why mint cleansers produce that immediate feeling of refreshed, revived skin.",
        "Why combining charcoal and mint produces better results than either alone — the deep-cleanse plus surface-revival combination.",
        "How daily use of the right detox ingredients accumulates over weeks to visibly reduce oil and improve skin clarity.",
      ],
    },
    relate: [
      "Oily, flat-looking, somehow simultaneously dull skin that no product has fully cracked. You wash. It looks the same. You moisturise. By noon, the shine is back. You're not asking for much — just skin that actually looks awake and fresh for more than an hour.",
      "Your morning routine is supposed to make you feel ready. But your cleanser is leaving you with skin that just looks washed — not revived, not brightened, not ready for anything. Mint Aura is what a morning wash should actually feel like.",
      "Dull and oily — the combination that seems like it shouldn't exist but is more common than any skincare brand admits. You need deep-clean for the oiliness AND instant revival for the dullness. One bar. Both.",
    ],
    transformation: [
      "A month from now, your morning shower could change the way you start the day. Skin that comes out cool, clear, and actually awake. No midmorning shine. No blotting by noon. Just refreshed skin that holds. That's Mint Aura, daily.",
      "Imagine stepping out of the shower and your skin feeling genuinely alive — not just clean. Cool, refreshed, bright. The kind of start to the day that makes everything else easier. That's what mint and charcoal do together, every morning.",
      "Oily, dull skin turned into skin that looks awake, clear, and balanced all day. Not through a complicated routine — through the right one step, done consistently. Mint Aura is that step.",
    ],
    insight: [
      "Mint (menthol) improves blood circulation at the skin surface — creating that immediate feeling of refreshed, revived skin that no other ingredient matches. Activated charcoal simultaneously adsorbs surface impurities and draws out congestion from pores. Together, they address dull oiliness at two levels simultaneously.",
      "The cooling sensation from mint isn't just sensory — it signals genuine physiological change at the skin surface. Increased circulation supports the skin's natural detoxification process, which is why mint-cleansed skin consistently looks brighter and more alive than skin washed with a standard bar.",
      "Most cleansers address either oiliness or dullness — but the two problems have different causes and need different solutions. Charcoal absorbs excess sebum and draws out congestion. Mint stimulates surface circulation and provides immediate brightness. In one bar, Mint Aura addresses both without needing two products.",
    ],
    solution: [
      "Zeshto Mint Aura combines activated charcoal for deep pore cleansing with the cooling, reviving power of mint — in a cold-process bar formulated for oily, dull, tired skin. Deep-cleanse power. Instant revival. One bar. Every morning. At ₹259.",
      "Mint Aura is the bar for skin that needs to wake up, not just get clean. Activated charcoal draws out what's congesting your pores. Mint revives your skin's surface circulation and colour. Cold-process preserves every active compound. Your morning shower becomes your most effective skincare step.",
      "At ₹259, Mint Aura does what three separate products try to do — deep cleanse, oil control, and skin revival — in one cold-process bar. Two minutes in the shower. Skin that looks awake by the time you reach for your towel.",
    ],
  },

};

const CTA = "✨ Real ingredients. Handmade with love. Made for Indian skin.\n🌿 Shop → zeshto.com | Follow us @zeshto on Instagram";
const TRANSFORMATIONS_GENERIC = [
  "Imagine skin that actually responds to your routine — not because you added more products, but because you finally got the first step right.",
  "This is what changes when you stop looking for the strongest product and start looking for the most compatible one.",
];

// ── Post generation ────────────────────────────────────────────────────────────
function pickFrom<T>(arr: T[], index: number): T {
  return arr[index % arr.length];
}

export function generatePost(dayNumber: number): Post {
  const products = getAllProducts();
  const soapIndex = (dayNumber - 1) % products.length;
  const product = products[soapIndex];

  const templates = SOAP_TEMPLATES[product.id];
  if (!templates) {
    throw new Error(`No templates found for product: ${product.id}`);
  }

  const emotionTypes: EmotionType[] = ['fear', 'frustration', 'hope', 'desire', 'educational'];
  const cycleInSoap = Math.floor((dayNumber - 1) / products.length);
  const emotionType = emotionTypes[cycleInSoap % emotionTypes.length];

  const variantIndex = cycleInSoap;

  const hookText = pickFrom(templates.hooks[emotionType], variantIndex);
  const relateText = pickFrom(templates.relate, variantIndex);
  const insightText = pickFrom(templates.insight, variantIndex);
  const solutionText = pickFrom(templates.solution, variantIndex);
  const transformationText = pickFrom(
    templates.transformation.length > 0 ? templates.transformation : TRANSFORMATIONS_GENERIC,
    variantIndex
  );

  const content: PostContent = {
    hookText,
    relateText,
    insightText,
    solutionText,
    transformationText,
    ctaText: CTA,
    disclaimer: DEFAULT_DISCLAIMER,
  };

  // Run claims safety check on all text
  const allText = [hookText, relateText, insightText, solutionText].join(' ');
  const claimsResult = checkClaims(allText);
  if (!claimsResult.isSafe) {
    content.solutionText = claimsResult.sanitized.slice(
      claimsResult.sanitized.indexOf(solutionText) >= 0
        ? claimsResult.sanitized.indexOf(solutionText)
        : 0
    );
  }

  const seedIndex = dayNumber;
  const instagramHashtags = getInstagramHashtags(
    product.heroIngredients,
    product.skinConcerns,
    seedIndex
  );
  const linkedinHashtags = getLinkedinHashtags(seedIndex);
  const youtubeTags = getYoutubeTags(product.name, product.heroIngredients, product.skinConcerns);

  const shopifyData = (productImages as Record<string, { imageUrl: string; handle: string; shopifyId: string; priceINR: number }>)[product.id];
  const priceINR = shopifyData?.priceINR ?? product.priceINR;
  const productImageUrl = shopifyData?.imageUrl;
  const shopifyHandle = shopifyData?.handle;

  const ingredientLine = product.heroIngredients.slice(0, 3).join(' · ');
  const shopLink = shopifyHandle ? `https://zeshto.com/products/${shopifyHandle}` : 'https://zeshto.com';

  // Caption arc: Fear → Feel → Dream → Why → Zeshto → Shop → CTA
  const instagramCaption = [
    hookText,
    relateText,
    transformationText,
    insightText,
    solutionText,
    `🌿 ${product.name} by Zeshto\n✨ Key ingredients: ${ingredientLine}\n🛒 Shop: ${shopLink}`,
    CTA,
  ].join('\n\n');

  const linkedinCaption = [
    hookText,
    relateText,
    transformationText,
    insightText,
    solutionText,
    `About ${product.name} by Zeshto:\n• Key ingredients: ${ingredientLine}\n• Shop: ${shopLink}`,
    CTA,
    `—\n${DEFAULT_DISCLAIMER}`,
  ].join('\n\n');

  const youtubeScript = `[OPENING — 0–3 sec]\n${hookText}\n\n[RELATE — 3–8 sec]\n${relateText}\n\n[DREAM — 8–12 sec]\n${transformationText}\n\n[INSIGHT — 12–17 sec]\n${insightText}\n\n[WHY ZESHTO — 17–22 sec]\n${solutionText}\n\n[CTA — 22–25 sec]\n${CTA}`;
  const youtubeTitle = `${hookText.slice(0, 60)} | Zeshto ${product.name}`;
  const youtubeDescription = `${linkedinCaption}\n\nShop Zeshto: zeshto.com\n\nTags: ${youtubeTags.join(', ')}`;

  const backgroundIndex = (dayNumber - 1) % 38;

  const now = new Date().toISOString();
  return {
    id: `post-day-${dayNumber}`,
    dayNumber,
    title: `Day ${dayNumber} — ${product.name} — ${emotionType.charAt(0).toUpperCase() + emotionType.slice(1)}`,
    productId: product.id,
    productName: product.name,
    productImageUrl,
    productPriceINR: priceINR,
    shopifyHandle,
    emotionType,
    content,
    instagram: {
      caption: instagramCaption,
      hashtags: instagramHashtags,
    },
    linkedin: {
      caption: linkedinCaption,
      hashtags: linkedinHashtags,
    },
    youtube: {
      script: youtubeScript,
      title: youtubeTitle,
      description: youtubeDescription,
      tags: youtubeTags,
    },
    backgroundIndex,
    isEdited: false,
    createdAt: now,
    updatedAt: now,
  };
}

export function generateAllPosts(): Post[] {
  return Array.from({ length: 150 }, (_, i) => generatePost(i + 1));
}
