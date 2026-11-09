# Maksat Workspace - DICOM & Goralan Lukmançylyk Portaly

Bu taslama lukmançylyk şekillendiriş faýllaryny (DICOM / PACS) howpsuz görnüşde kabul etmek, anonimleşdirmek, web interfeýsinde ýokary öndürijilikli seljermek we tassyklanan ulanyjylara paýlamak üçin döredilen önümçilik derejesindäki web ulgamydyr.

## 🌟 Esasy Aýratynlyklar

- **DICOM Web Workstation Viewer:** Brauzerde W/L (Window/Level), Pan, Zoom, Invert we çyzgyç gurallary.
- **Awotomatik Anonimizasiýa (Client-side PHI Filter):** Näsagyň şahsy maglumatlaryny serwere ýüklenmezden öň brauzerde arassalamak.
- **Resumable Chunked Upload:** Uly göwrümli CT/MRI faýllaryny bölekleýin ýüklemek we SHA-256 bütewilik barlagy.
- **Two-tier RBAC & Admin Approval:** ChatGPT SSO integrasiýasy we admin tassyklamasy bolmadyk hasaplara çäklendirilen giriş.
- **Tamper-evident Audit Logs:** Lukmançylyk kadalaryna laýyklykda ähli hereketleriň üýtgedilip bilinmeýän taryhy.
- **Docker Compose Orchestration:** Nginx, FastAPI, PostgreSQL 16 we MinIO S3 ammaryny bir buýruk bilen işletmek.

## 🚀 Çalt Başlangyç (Quick Start)

### Talaplar
- Docker we Docker Compose

### Gurnamak we Işletmek
```bash
# 1. Repozitoriýany klonlaň
git clone https://github.com/<ulanyjy-adyňyz>/maksat-workspace.git
cd maksat-workspace

# 2. Ähli konteýnerleri işe giriziň
docker compose up -d --build

# 3. Brauzerde açyň:
# Web interfeýsi: http://localhost
# DICOM Import: http://localhost/#importPanel
# MinIO S3 Console: http://localhost:9001
```

## 📁 Bukja Gurluşy

```text
maksat-workspace/
├── .github/workflows/deploy.yml # GitHub Actions CI/CD
├── backend/                     # FastAPI asinkron REST & WebSocket serweri
│   ├── Dockerfile
│   ├── main.py
│   └── requirements.txt
├── database/                    # PostgreSQL init we audit şemasy
│   └── init.sql
├── frontend/                    # Single Page Application (HTML5/Canvas/CSS)
│   ├── app.js
│   ├── index.html
│   └── style.css
├── nginx/                       # Nginx reverse proxy & CSP header-leri
│   └── nginx.conf
├── .gitignore
├── docker-compose.yml
└── README.md
```

## 🔐 Howpsuzlyk Düzgünleri
* Admin tassyklamasy her bir serwer soragynda barlanýar.
* "Admin tassyklamasy özbaşdak kliniki ygtyýarnama däldir."
