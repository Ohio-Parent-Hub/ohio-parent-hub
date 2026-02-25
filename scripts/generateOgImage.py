from pathlib import Path
from typing import List, Union
from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 630
bg = (244, 241, 236)
primary = (107, 143, 149)
secondary = (159, 184, 163)
accent = (214, 162, 30)
dark = (74, 96, 99)

img = Image.new("RGB", (W, H), bg)

blob_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
blob_draw = ImageDraw.Draw(blob_layer)
blob_draw.ellipse((-120, -160, 620, 560), fill=(*primary, 35))
blob_draw.ellipse((760, 240, 1320, 900), fill=(*secondary, 45))
blob_draw.ellipse((640, -220, 1320, 420), fill=(*accent, 28))
img = Image.alpha_composite(img.convert("RGBA"), blob_layer)

panel_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
panel_draw = ImageDraw.Draw(panel_layer)
panel_draw.rounded_rectangle(
    (70, 70, W - 70, H - 70),
    radius=36,
    fill=(248, 247, 244, 250),
    outline=(173, 191, 194, 180),
    width=3,
)
img = Image.alpha_composite(img, panel_layer).convert("RGB")

draw = ImageDraw.Draw(img)

font_candidates = [
    "/System/Library/Fonts/Supplemental/Georgia Bold.ttf",
    "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
    "/System/Library/Fonts/Supplemental/Times New Roman Bold.ttf",
]
body_candidates = [
    "/System/Library/Fonts/Supplemental/Arial.ttf",
    "/System/Library/Fonts/Supplemental/Helvetica.ttc",
]


def load_font(candidates: List[str], size: int) -> Union[ImageFont.FreeTypeFont, ImageFont.ImageFont]:
    for font_path in candidates:
        if Path(font_path).exists():
            return ImageFont.truetype(font_path, size)
    return ImageFont.load_default()


def text_width(draw_ctx: ImageDraw.ImageDraw, text: str, font: Union[ImageFont.FreeTypeFont, ImageFont.ImageFont]) -> int:
    left, _, right, _ = draw_ctx.textbbox((0, 0), text, font=font)
    return right - left


def wrap_text(
    draw_ctx: ImageDraw.ImageDraw,
    text: str,
    font: Union[ImageFont.FreeTypeFont, ImageFont.ImageFont],
    max_width: int,
) -> List[str]:
    words = text.split()
    if not words:
        return []

    lines: List[str] = []
    current = words[0]

    for word in words[1:]:
        candidate = f"{current} {word}"
        if text_width(draw_ctx, candidate, font) <= max_width:
            current = candidate
        else:
            lines.append(current)
            current = word

    lines.append(current)
    return lines


def fit_wrapped_font(
    draw_ctx: ImageDraw.ImageDraw,
    text: str,
    candidates: List[str],
    start_size: int,
    min_size: int,
    max_width: int,
    max_lines: int,
) -> tuple[Union[ImageFont.FreeTypeFont, ImageFont.ImageFont], List[str]]:
    for size in range(start_size, min_size - 1, -1):
        font = load_font(candidates, size)
        lines = wrap_text(draw_ctx, text, font, max_width)
        if len(lines) <= max_lines:
            return font, lines

    fallback_font = load_font(candidates, min_size)
    fallback_lines = wrap_text(draw_ctx, text, fallback_font, max_width)
    return fallback_font, fallback_lines[:max_lines]


serif_big = load_font(font_candidates, 72)
sans = load_font(body_candidates, 34)
small = load_font(body_candidates, 28)

logo = Image.open("app/icon.png").convert("RGBA")
logo_size = 220
logo = logo.resize((logo_size, logo_size), Image.Resampling.LANCZOS)
mask = Image.new("L", (logo_size, logo_size), 0)
mask_draw = ImageDraw.Draw(mask)
mask_draw.ellipse((0, 0, logo_size, logo_size), fill=255)

badge = Image.new("RGBA", (logo_size + 30, logo_size + 30), (0, 0, 0, 0))
badge_draw = ImageDraw.Draw(badge)
badge_draw.ellipse(
    (0, 0, logo_size + 30, logo_size + 30),
    fill=(255, 255, 255, 255),
    outline=(*primary, 220),
    width=6,
)
badge.paste(logo, (15, 15), mask)
img.paste(badge, (120, 200), badge)

draw.text((380, 160), "Ohio Parent Hub", fill=dark, font=serif_big)

subtitle_text = "Licensed Daycare & Family Resources"
subtitle_x = 382
subtitle_y = 250
subtitle_max_width = 700

subtitle_font, subtitle_lines = fit_wrapped_font(
    draw,
    subtitle_text,
    font_candidates,
    start_size=50,
    min_size=36,
    max_width=subtitle_max_width,
    max_lines=2,
)

line_height = 0
for index, line in enumerate(subtitle_lines):
    y = subtitle_y + (index * 54)
    draw.text((subtitle_x, y), line, fill=primary, font=subtitle_font)
    _, top, _, bottom = draw.textbbox((subtitle_x, y), line, font=subtitle_font)
    line_height = max(line_height, bottom - top)

subtitle_block_height = max(line_height, 46) * max(len(subtitle_lines), 1)
body_start_y = subtitle_y + subtitle_block_height + 28

draw.text((382, body_start_y), "Find trusted Ohio childcare by city, county,", fill=dark, font=sans)
draw.text((382, body_start_y + 45), "SUTQ rating, and program details.", fill=dark, font=sans)

draw.rounded_rectangle((380, 470, 1030, 522), radius=20, fill=accent)
draw.text((410, 480), "Search 8,000+ licensed programs statewide", fill=(255, 255, 255), font=small)

output = Path("public/og-default.png")
output.parent.mkdir(parents=True, exist_ok=True)
img.save(output, format="PNG", optimize=True)
print(f"Created {output} ({output.stat().st_size} bytes)")
