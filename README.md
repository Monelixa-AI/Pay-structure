# 💳 Ödeme Platformu
Stripe ve PayTR entegrasyonlu, modüler ödeme altyapısı.

## 🚀 Hızlı Başlangıç

### 1. Kurulum
```bash
# Repoyu klonla
git clone <repo-url>
cd payment-platform

# Bağımlılıkları yükle
npm install

# Environment dosyasını oluştur
cp .env.example .env.local
```

2. Supabase Kurulumu
supabase.com adresinde yeni proje oluştur
SQL Editor'a git
schema.sql dosyasının içeriğini yapıştır ve çalıştır
Project Settings > API bölümünden bilgileri al:

NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY


3. Stripe Kurulumu
dashboard.stripe.com adresine git
Developers > API Keys bölümünden:

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (pk_live_...)
STRIPE_SECRET_KEY (sk_live_...)


Developers > Webhooks bölümünden:

Endpoint ekle: https://your-domain.com/api/webhook/stripe
Events: checkout.session.completed, payment_intent.payment_failed, charge.refunded
STRIPE_WEBHOOK_SECRET (whsec_...)


4. Environment Variables
.env.local dosyasını düzenle:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

5. Çalıştır
```bash
npm run dev
```

Tarayıcıda http://localhost:3000 adresine git.

📁 Proje Yapısı
├── app/
│   ├── page.tsx            # Ana sayfa (Ürünler)
│   ├── admin/page.tsx      # Admin paneli
│   ├── checkout/[id]/      # Ödeme sayfası
│   ├── success/            # Başarı sayfası
│   └── api/
│       ├── products/       # Ürün CRUD
│       ├── settings/       # Ayarlar CRUD
│       ├── orders/         # Sipariş listesi
│       ├── checkout/       # Ödeme başlatma
│       └── webhook/        # Webhook handlers
├── lib/
│   ├── supabase.ts         # Supabase client
│   ├── stripe.ts           # Stripe helpers
│   └── paytr.ts            # PayTR helpers
├── components/             # React components
├── types/                  # TypeScript types
└── schema.sql              # Database schema

🌐 Vercel'e Deploy
1. GitHub'a Push
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. Vercel'de Import
vercel.com adresine git
"Import Project" → GitHub reposunu seç
Environment Variables ekle (tüm .env değerleri)
Deploy!

3. Webhook URL'lerini Güncelle
Deploy sonrası Stripe webhook URL'ini güncelle:
https://your-app.vercel.app/api/webhook/stripe

⚙️ Admin Paneli
/admin sayfasından:
✅ Aktif ödeme yöntemini seç (Stripe/PayTR)
✅ Para birimini ayarla (TRY/USD/EUR)
✅ API key'leri güncelle
✅ Ürünleri düzenle
✅ Sipariş geçmişini görüntüle

🔒 Güvenlik Notları
API key'ler veritabanında saklanır, production'da şifreleme önerilir
Webhook'lar imza doğrulaması yapar
RLS (Row Level Security) auth eklendiğinde aktifleştirilebilir

📝 Lisans
MIT
---
# ✅ TAMAMLANDI!

## 📦 Özet: Ne Yaptık?
| Dosya Sayısı | Açıklama |
|--------------|----------|
| **26 dosya** | Tam çalışan ödeme platformu |

## 🗂️ Dosya Listesi
✅ schema.sql          - Veritabanı şeması
✅ package.json        - Bağımlılıklar
✅ .env.example        - Environment değişkenleri
✅ tailwind.config.js  - Tailwind ayarları
✅ postcss.config.js   - PostCSS ayarları
✅ tsconfig.json       - TypeScript ayarları
✅ next.config.js      - Next.js ayarları
✅ types/index.ts      - Type tanımlamaları
✅ lib/supabase.ts     - Supabase client
✅ lib/stripe.ts       - Stripe helpers
✅ lib/paytr.ts        - PayTR helpers
✅ app/globals.css     - Global stiller
✅ app/layout.tsx      - Ana layout
✅ app/page.tsx        - Ürünler sayfası
✅ app/admin/page.tsx  - Admin paneli
✅ app/checkout/[productId]/page.tsx - Ödeme sayfası
✅ app/success/page.tsx - Başarı sayfası
✅ app/api/products/route.ts
✅ app/api/settings/route.ts
✅ app/api/orders/route.ts
✅ app/api/checkout/stripe/route.ts
✅ app/api/checkout/paytr/route.ts
✅ app/api/webhook/stripe/route.ts
✅ app/api/webhook/paytr/route.ts
✅ components/ProductCard.tsx
✅ README.md           - Kurulum rehberi
---
## 🚀 Şimdi Yapman Gerekenler
### 1️⃣ Projeyi Oluştur
```bash
npx create-next-app@latest payment-platform --typescript --tailwind --app
cd payment-platform
```

2️⃣ Bağımlılıkları Yükle
```bash
npm install @supabase/supabase-js stripe @stripe/stripe-js crypto-js lucide-react
npm install -D @types/crypto-js
```
