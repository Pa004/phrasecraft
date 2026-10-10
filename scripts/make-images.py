"""Iconos PWA y OG demo con palabras fijas de ejemplo (nunca escena de usuario)."""

from PIL import Image, ImageDraw, ImageFont

INK = (26, 26, 46)
PAPER = (250, 247, 240)
ACCENT = (228, 88, 46)
GREEN_FAR = (127, 176, 105)
GREEN_NEAR = (74, 124, 89)


def font(size):
    for candidate in (
        "C:\\Windows\\Fonts\\arial.ttf",
        "C:\\Windows\\Fonts\\DejaVuSans.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    ):
        try:
            return ImageFont.truetype(candidate, size)
        except OSError:
            continue
    try:
        return ImageFont.load_default(size=size)
    except TypeError:
        return ImageFont.load_default()


def app_icon(px, path):
    img = Image.new("RGB", (px, px), ACCENT)
    d = ImageDraw.Draw(img)
    r = px // 2
    d.rounded_rectangle([0, 0, px, px], radius=px // 5, fill=ACCENT)
    for i, (dx, dy) in enumerate([(0.32, 0.36), (0.68, 0.36), (0.5, 0.66)]):
        cx, cy, cr = int(px * dx), int(px * dy), int(px * 0.13)
        d.ellipse([cx - cr, cy - cr, cx + cr, cy + cr], fill=PAPER)
        d.text((cx, cy), str(i + 1), fill=ACCENT, font=font(px // 10), anchor="mm")
    img.save(path)


def og_demo(path):
    w, h = 1200, 630
    img = Image.new("RGB", (w, h), PAPER)
    d = ImageDraw.Draw(img)
    d.ellipse([-300, 420, 700, 900], fill=GREEN_FAR)
    d.ellipse([600, 450, 1500, 950], fill=GREEN_NEAR)
    demo = ["pulpo", "luna", "tambor"]
    for i, word in enumerate(demo):
        cx = 250 + i * 350
        cy = 300
        cr = 110
        d.ellipse([cx - cr, cy - cr, cx + cr, cy + cr], fill=(255, 255, 255), outline=INK, width=6)
        d.text((cx, cy - 10), str(i + 1), fill=ACCENT, font=font(90), anchor="mm")
        d.text((cx, cy + 130), word, fill=INK, font=font(56), anchor="mm")
    d.text((60, 40), "phrasecraft", fill=INK, font=font(64))
    d.text((60, 560), "Escena de demostración con palabras de ejemplo", fill=INK, font=font(36))
    img.save(path)


app_icon(192, "public/icon-192.png")
app_icon(512, "public/icon-512.png")
og_demo("public/og-demo.png")
print("iconos + og-demo generados")
