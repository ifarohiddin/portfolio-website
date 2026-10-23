# 🌐 Portfolio — Farohiddin Isomidinov

Shaxsiy portfolio sayt: AI / ML va dasturlash loyihalarim, ko'nikmalarim va CV. Build jarayonisiz, sof HTML/CSS/JavaScript'da yozilgan.

## ✨ Xususiyatlar
- 🧠 Bosh sahifada **Three.js** bilan 3D neyron tarmoq animatsiyasi (WebGL bo'lmasa oddiy gradient ko'rsatiladi)
- 🌗 Qorong'i / yorug' rejim (tanlov brauzerda saqlanadi)
- 🌍 Ikki til: **English / O'zbekcha** (`data-en` / `data-uz` atributlari)
- 📄 CV yuklab olish tugmasi
- 📱 Mobil qurilmalarga moslashgan (responsive)

## 🛠️ Texnologiyalar
`HTML` · `CSS` · `JavaScript` · `Three.js` · Netlify

## 🚀 Ishga tushirish

Build kerak emas. Lokal ko'rish uchun:

```bash
git clone https://github.com/ifarohiddin/portfolio-website.git
cd portfolio-website
python -m http.server 8000      # so'ng http://localhost:8000
```

(`index.html` ni to'g'ridan-to'g'ri ochsa ham bo'ladi, lekin 3D sahna uchun lokal server qulayroq.)

## 📁 Tuzilma

```text
├── index.html           # Asosiy sahifa
├── netlify.toml         # Netlify: fayllarni to'g'ridan-to'g'ri tarqatish
└── assets/
    ├── css/style.css    # Stillar va ranglar
    ├── js/main.js       # Tema, til, forma
    ├── js/scene.js      # Three.js 3D sahna
    ├── images/          # Profil rasmi va loyiha rasmlari
    └── files/           # CV (yuklab olish tugmasi uchun)
```

## ✏️ Tahrirlash
- Loyiha yoki tajriba qo'shish uchun `index.html` dagi tegishli bloklarni nusxalang.
- Matnlar ikki tilda bo'lishi uchun `data-en` va `data-uz` ni to'ldiring.
- Ranglar `assets/css/style.css` ichida.

## 📬 Aloqa
Kontakt formasi hozircha faqat frontend (server qismi yo'q). Ishlashi uchun uni Formspree kabi xizmatga yoki o'z API'ngizga ulang. Hozircha aloqa uchun sahifadagi email va Telegram havolalaridan foydalaning.
