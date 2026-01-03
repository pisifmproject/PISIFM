# Deployment Guide

## Setelah Pull dari GitHub

Jalankan perintah berikut secara berurutan:

```powershell
# 1. Install dependencies frontend
cd pisifmfe/frontend
npm install

# 2. Install dependencies backend
cd ../../pisifmbe
npm install

# 3. Kembali ke root dan deploy
cd ..
.\deploy.ps1
```

Atau jalankan script otomatis:

```powershell
.\setup-after-pull.ps1
```

## Quick Commands

| Aksi | Command |
|------|---------|
| Setup setelah pull | `.\setup-after-pull.ps1` |
| Deploy saja | `.\deploy.ps1` |
| Start backend | `.\start-backend.ps1` |
| Restart Apache | `.\restart-apache-admin.bat` |

## Troubleshooting

### Website Blank
1. Pastikan `npm install` sudah dijalankan di kedua folder
2. Pastikan `npm run build` berhasil
3. Cek console browser untuk error

### Backend Error
1. Cek file `.env` di `pisifmbe/`
2. Pastikan PostgreSQL running
3. Cek port 3001 tidak dipakai

## Git Pull Command (Reference)

```powershell
git remote add smartrepo https://github.com/halohai932-arch/Smart-Monitoring-Plant.git
git fetch smartrepo
git reset --hard smartrepo/smartcopy
git push origin experiment --force
git remote remove smartrepo
```
