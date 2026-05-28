# Next.js Portfolio + CMS

Website portfolio satu halaman untuk Fullstack Web Developer, dibangun dengan Next.js App Router.

## Fitur

- Halaman portfolio (`/`) berisi profil, daftar project, dan form kirim email.
- Halaman CMS (`/cms`) untuk mengubah konten portfolio tanpa edit kode.
- Konten CMS disimpan di Supabase agar sinkron antar device.
- Endpoint update CMS dilindungi dengan token (`CMS_ACCESS_TOKEN`).

## Environment Variables

Buat file `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
CMS_ACCESS_TOKEN=your-strong-random-token
```

## Menjalankan Project

```bash
npm install
npm run dev
```

Buka `http://localhost:3000`.
