/**
 * Ready-made Gemini prompts for every image upload in the admin.
 *
 * The admin attaches an image they already have (old banner, phone photo, small logo) in Gemini,
 * pastes the prompt, and gets a sharp, correctly sized version back. The prompts ask Gemini to
 * redraw the SAME image at a higher resolution in the shape the site needs, not to redesign it,
 * with any wording on the image in Macedonian (logos, brand names and packaging stay as they are).
 */

const BASE = `I attached an image for the ProteiniSi sports-nutrition web shop. Make a high-resolution version of THIS SAME image for the website.

Do NOT redesign it:
- Keep the same concept, composition, products, packaging, people, colours, lighting and style.
- Do not add new objects, people, stickers, badges, prices, frames, borders or watermarks.

Language: the shop is in North Macedonia, so every text on the image must be in Macedonian, written in Macedonian Cyrillic.
- Text that is already in Macedonian: keep it exactly as it is (same words, same spelling, same font, same position).
- Text in any other language (for example English headlines, slogans, offers, buttons or descriptions): translate it into natural, correctly spelled Macedonian and put it in the same place, with the same font style, size, colour and emphasis.
- Use the proper Macedonian letters (ќ, ѓ, ј, љ, њ, ѕ, џ) and never Russian or Serbian spellings. If you are unsure about a word, choose the simplest correct Macedonian word.
- Do NOT translate or change logos, brand names, product names, or anything printed on product packaging: those stay exactly as on the original.
- Do not add any new text that is not on the original image.

Only improve the quality: sharp details, clean edges, crisp readable text, true-to-life colours. No blur, noise, JPEG artefacts, pixelation or plastic-looking AI skin. Keep photos photorealistic.

If the attached image has a different shape than the one below, reach the new shape by extending the existing background naturally (same scene, same light, same colours). Never stretch, squash or cut off important parts.`;

const TIPS = "Совет: во Gemini изберете го моделот за слики со најдобар квалитет (на пр. Nano Banana Pro) и 2K или 4K резолуција ако ја нуди. Пред да ја прикачите, проверете дали текстот на македонски е правилно напишан и дали логоата се исти како на оригиналот.";

const slot = (title, size, body) => ({ title, size, prompt: `${BASE}\n\n${body}` });

export const GEMINI_PROMPTS = {
  bannerDesktop: slot(
    "Homepage banner — desktop",
    "2400 × 800 px (3:1)",
    `Output: a wide homepage banner. Final size 2400 × 800 px (3:1).
Gemini has no 3:1 option, so generate it at 21:9 with the highest resolution available. The top and bottom will be cropped a little to reach 3:1, so keep all text, logos and products inside the middle horizontal band with comfortable margins.
Keep the bottom-centre strip free of important content (the slider dots sit there).`,
  ),
  bannerMobile: slot(
    "Homepage banner — phone",
    "1080 × 1080 px (1:1)",
    `Output: a square phone version of this banner. Final size 1080 × 1080 px (1:1), highest resolution available.
Use the same photo, products, text and style. Only reposition the existing elements so everything fits the square (for example product on top, text underneath) and the text stays large and easy to read on a phone. Do not add new wording; the text follows the language rules above (Macedonian).
Keep the bottom-centre strip free of important content (the slider dots sit there).`,
  ),
  productPhoto: slot(
    "Product photo",
    "2000 × 2000 px (1:1)",
    `Output: an e-commerce product photo. Square 1:1, 2000 × 2000 px, highest resolution available.
The product is centred and fully visible, with about 10% empty space on every side, on a pure white background (#FFFFFF) with a soft, natural shadow underneath.
The packaging must stay identical: same shape, colours, label design, flavour name, weight and every printed word. Do not change the product in any way.`,
  ),
  productGallery: slot(
    "Product gallery photo",
    "2000 × 2000 px (1:1)",
    `Output: an extra product gallery photo. Square 1:1, 2000 × 2000 px, highest resolution available.
If the attached image is a plain packshot, use a pure white background (#FFFFFF). If it is a lifestyle or detail photo, keep that same scene.
The packaging must stay identical: same shape, colours, label design, flavour name, weight and every printed word.`,
  ),
  brandHeader: slot(
    "Brand photo (header menu)",
    "1600 × 1200 px (4:3)",
    `Output: a landscape brand photo for the shop's menu. 4:3, 1600 × 1200 px, highest resolution available.
The website places a dark gradient, the brand logo and the brand name over the bottom of the photo, so keep the main subject in the upper and middle part and do not put text in the bottom quarter.`,
  ),
  brandLogo: slot(
    "Brand logo",
    "1000 × 1000 px (1:1)",
    `Output: the same logo, redrawn sharp. Square 1:1, 1000 × 1000 px, logo centred with about 15% empty space around it, on a plain pure white background (#FFFFFF).
The logo must be identical to the original: same shape, letters, colours and proportions. Flat and clean, no 3D effect, no shadow, no mockup.
(If the brand offers an official PNG or SVG logo, that is always better than an AI version.)`,
  ),
  partnerLogo: slot(
    "Partner logo",
    "1200 × 600 px (2:1)",
    `Output: the same logo, redrawn sharp. Landscape 2:1, 1200 × 600 px, logo centred with comfortable empty space around it, on a plain pure white background (#FFFFFF).
The logo must be identical to the original: same shape, letters, colours and proportions. Flat and clean, no 3D effect, no shadow, no mockup.
(If the partner can send an official PNG or SVG logo, that is always better than an AI version.)`,
  ),
  homeCard: slot(
    "Homepage section card",
    "1200 × 1500 px (4:5)",
    `Output: a homepage card photo. Portrait 4:5, 1200 × 1500 px, highest resolution available.
The site also shows this image as a square on some screens, so keep the main subject in the centre and leave some calm space around it.`,
  ),
  instagram: slot(
    "Instagram gallery picture",
    "1080 × 1080 px (1:1)",
    `Output: a square social media picture. 1:1, 1080 × 1080 px or larger, highest resolution available. Keep the main subject centred.`,
  ),
  tipCover: slot(
    "Tip / article cover",
    "1920 × 1200 px (16:10)",
    `Output: a blog article cover photo. Landscape 16:10, 1920 × 1200 px, highest resolution available.
The site crops this image a little differently on phones and computers, so keep the main subject in the centre and do not place text near the edges.`,
  ),
  youtubeThumb: slot(
    "YouTube video thumbnail",
    "1920 × 1080 px (16:9)",
    `Output: a video thumbnail. Landscape 16:9, 1920 × 1080 px, highest resolution available.
A play button may be shown in the middle, so keep faces and text slightly away from the exact centre.`,
  ),
  landing: slot(
    "Landing page image",
    "1920 × 1080 px (16:9)",
    `Output: a landscape landing page image. 16:9, 1920 × 1080 px, highest resolution available.`,
  ),
  about: slot(
    "About company image",
    "1920 × 1080 px (16:9)",
    `Output: a landscape photo for the About us page. 16:9, 1920 × 1080 px, highest resolution available. Keep it natural and authentic.`,
  ),
};

export const GEMINI_TIPS = TIPS;
