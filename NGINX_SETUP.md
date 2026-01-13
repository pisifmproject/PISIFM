# 🚀 Nginx Configuration Setup - React Project

## ✅ Configuration Complete!

Konfigurasi Nginx telah berhasil dibuat dan diterapkan untuk project React Anda.

---

## 📋 Setup Details

### **Virtual Host Configuration**
- **Port**: `8080` (untuk project React Anda)
- **Default Port**: `80` (masih tersedia untuk default Nginx)
- **Backend API**: Port `5000` (Express server)

### **Directory Mapping**
- **Frontend**: `D:\Githhub Project\dist\` → Served as static files
- **Backend API**: `/api/*` → Proxied to `http://127.0.0.1:5000`

---

## 🌐 How to Access

### **Frontend (React App)**
```
http://localhost:8080
```

### **Backend API**
```
http://localhost:8080/api/health
http://localhost:8080/api/projects
http://localhost:8080/api/users
```

### **Default Nginx (Original)**
```
http://localhost:80
```

---

## 🔧 Configuration Features

### ✨ **Frontend Optimization**
- ✅ SPA routing support (`try_files` directive)
- ✅ Static asset caching (1 year for images, fonts, CSS, JS)
- ✅ Gzip compression enabled
- ✅ Cache headers for better performance

### 🔄 **Backend Proxy**
- ✅ Reverse proxy to Express server (port 5000)
- ✅ WebSocket support ready
- ✅ Proper headers forwarding (X-Real-IP, X-Forwarded-For)
- ✅ 60s timeout for API requests

### 📝 **Logging**
- ✅ Access logs: `C:\nginx\logs\project.access.log`
- ✅ Error logs: `C:\nginx\logs\project.error.log`

---

## 🎯 Next Steps

### 1️⃣ **Start Backend Server**
```bash
cd "D:\Githhub Project\server"
npm start
# or
node index.js
```
Server harus berjalan di port 5000

### 2️⃣ **Build Frontend (jika belum)**
```bash
cd "D:\Githhub Project"
npm run build
```
Ini akan generate folder `dist/` dengan file production-ready

### 3️⃣ **Test Application**
Buka browser dan akses:
- Frontend: `http://localhost:8080`
- API Health: `http://localhost:8080/api/health`

---

## 🛠️ Nginx Commands (Windows)

### **Test Configuration**
```powershell
cd C:\nginx
.\nginx.exe -t
```

### **Start Nginx**
```powershell
cd C:\nginx
start nginx
```

### **Reload Configuration** (tanpa downtime)
```powershell
cd C:\nginx
.\nginx.exe -s reload
```

### **Stop Nginx**
```powershell
cd C:\nginx
.\nginx.exe -s stop
```

### **Quit Nginx** (graceful shutdown)
```powershell
cd C:\nginx
.\nginx.exe -s quit
```

### **Check Nginx Process**
```powershell
Get-Process nginx
```

### **Kill Nginx Process** (jika stuck)
```powershell
taskkill /F /IM nginx.exe
```

---

## 📂 Configuration Files

### **Main Config**: `C:\nginx\conf\nginx.conf`
```nginx
# Virtual Host untuk React Project (Port 8080)
server {
    listen 8080;
    server_name localhost;
    
    # Frontend
    location / {
        root "D:/Githhub Project/dist";
        index index.html;
        try_files $uri $uri/ /index.html;
    }
    
    # Backend API Proxy
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        # ... other proxy settings
    }
}
```

---

## 🔍 Troubleshooting

### **Problem: Cannot access http://localhost:8080**
**Solutions:**
1. Check Nginx is running: `Get-Process nginx`
2. Check port 8080 is not used: `netstat -ano | findstr :8080`
3. Check error logs: `C:\nginx\logs\project.error.log`
4. Test config: `.\nginx.exe -t`

### **Problem: API calls fail (404 or 502)**
**Solutions:**
1. Ensure backend server is running on port 5000
2. Test backend directly: `http://localhost:5000/api/health`
3. Check proxy logs in error.log
4. Verify backend is listening: `netstat -ano | findstr :5000`

### **Problem: Static files not loading**
**Solutions:**
1. Verify dist folder exists: `D:\Githhub Project\dist\`
2. Check file permissions
3. Run `npm run build` to regenerate dist folder
4. Check access logs for 404 errors

### **Problem: Changes not reflected**
**Solutions:**
1. Clear browser cache (Ctrl + Shift + Delete)
2. Hard reload (Ctrl + F5)
3. Rebuild frontend: `npm run build`
4. Reload Nginx: `.\nginx.exe -s reload`

---

## 📊 Port Summary

| Service | Port | URL |
|---------|------|-----|
| Nginx Default | 80 | http://localhost |
| React App (via Nginx) | 8080 | http://localhost:8080 |
| Express Backend | 5000 | http://localhost:5000 (direct) |
| Express API (via Nginx) | 8080 | http://localhost:8080/api/* |

---

## 🔐 Security Notes

### **For Production:**
1. Change `server_name` from `localhost` to your domain
2. Enable HTTPS (SSL/TLS)
3. Add security headers
4. Configure firewall rules
5. Use environment-specific configurations
6. Enable rate limiting
7. Hide Nginx version

---

## 📝 Configuration Backup

Original config backed up at:
- `C:\nginx\conf\nginx.conf.backup` (if needed)

Current active config:
- `C:\nginx\conf\nginx.conf`

---

## ✅ Verification Checklist

- [x] Nginx configuration syntax valid
- [x] Nginx process running
- [x] Port 8080 listening
- [ ] Backend server running on port 5000
- [ ] Frontend dist folder exists
- [ ] Application accessible at http://localhost:8080
- [ ] API endpoints working via /api/*

---

## 📧 Support

Jika ada masalah atau pertanyaan:
1. Check logs: `C:\nginx\logs\`
2. Verify backend server status
3. Test configuration: `.\nginx.exe -t`
4. Restart Nginx if needed

---

**Created**: December 22, 2025
**Status**: ✅ Active and Running
**Last Updated**: December 22, 2025
