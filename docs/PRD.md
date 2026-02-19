# Student Management System (SMS)
## Product Requirements Document (PRD)

---

## 1. Purpose

Ovaj PRD definiše **functional requirements** i **user flows** za Multi-Tenant Student Management System (SMS). Usaglašen je sa [BRD.md](./BRD.md) i trenutnom implementacijom.

Cilj je:
- centralizovati upravljanje studentskim i administrativnim podacima više obrazovnih institucija
- omogućiti role-based pristup (Platform Admin, School Admin, Professor, Student)
- pružiti intuitivan web UI (Vue 3 + Quasar) sa drawer pattern-om za CRUD

---

## 2. Actors

| Actor | Opis |
|-------|------|
| **Platform Admin** | Upravlja tenantima, kreira i upravlja korisnicima u bilo kom tenantu, vidi sve tikete |
| **School Admin** | Upravlja studentima, programima, kursevima, ispitima, finansijama u svom tenantu; vidi tikete tenanta |
| **Professor** | Kreira studente, upravlja kursevima i ispitima u tenantima kojima pripada; prima obaveštenja o izmenama svog naloga |
| **Student** | Vidi svoje enrollmente, ispite, transkripte, finansije; prijavljuje bagove |

---

## 3. Multi-Tenancy

- Svaka **institucija** (univerzitet, fakultet, škola) je **tenant**.
- Tenant ima: `name`, `code` (jedinstven), `isActive`.
- Svi podaci su izolovani po `tenantId`.
- Platform Admin može prebacivati tenant kontekst (tenant switcher u header-u).
- School Admin, Professor, Student koriste svoj `tenantId` iz JWT.

---

## 4. Tenant Management (BRD §7.0)

### 4.1 Pravila

- Samo **Platform Admin** može kreirati, ažurirati ili deaktivirati tenante.
- Školski admin, profesor i student nemaju pristup tenant CRUD-u.

### 4.2 UI

- **Navigacija**: stavka "Tenants" samo za Platform Admin.
- **Lista**: QTable sa kolonama name, code, isActive, akcije.
- **Kreiranje / izmena**: desni drawer sa formom (name, code; za izmenu i isActive checkbox).
- **Deaktivacija**: preko isActive = false (nema hard delete).

### 4.3 API

- `GET /api/tenants` – lista svih tenanata (Platform Admin only)
- `POST /api/tenants` – kreiranje (name, code)
- `PATCH /api/tenants/:id` – izmena (name, code, isActive)

---

## 5. User Creation and Management (BRD §7.1)

### 5.1 Ko može koga kreirati

| Kreator | Može kreirati | Tenant scope |
|---------|---------------|--------------|
| Platform Admin | bilo koju ulogu | bilo koji tenant |
| School Admin | School Admin, Professor, Student | samo sopstveni tenant |
| Professor | Student | samo tenant(i) u kojima je profesor |
| Student | — | — |

### 5.2 UI

- **Platform Admin**: Users stranica, tenant selector, "Platform Admin users" opcija, drawer za create user.
- **School Admin**: Users stranica za svoj tenant, drawer za create user.
- **Professor**: samo "Create student" u meniju (bez liste korisnika).
- **Student**: nema kreiranje korisnika.

### 5.3 Pravila

- Nema javne registracije.
- Platform Admin pri kreiranju PLATFORM_ADMIN korisnika ne bira tenant (automatski se postavlja).
- Suspend = blokiran nalog; suspendovani korisnici dobijaju 403 pri loginu.
- Nije dozvoljeno brisanje sopstvenog naloga.

### 5.4 API

- `POST /auth/register` – kreiranje korisnika (auth obavezan)
- `GET /users?tenantId=` – lista korisnika tenanta
- `GET /users/platform-admins` – lista Platform Admin korisnika (Platform Admin only)
- `PATCH /users/:id` – izmena (firstName, lastName, role, suspended)
- `DELETE /users/:id` – brisanje korisnika

---

## 6. Bug Reporting and Tickets (BRD §7.2)

### 6.1 Polja

- Subject / Title (obavezno, 5–200 kar)
- Description (obavezno, 10–2000 kar)
- Page, Steps, Expected vs actual (opciono, sa min/max)

### 6.2 Pravila

- Bilo koji autentifikovani korisnik može prijaviti bag za trenutni tenant.
- Rate limit: cooldown između submisija (npr. 60s).
- Tiketi imaju status (NEW, IN_PROGRESS, RESOLVED) i isPriority.

### 6.3 Vidljivost

- **Platform Admin**: vidi sve tikete, uključujući platform-scoped (kreirane od Platform Admin-a).
- **School Admin**: vidi tikete samo svog tenanta, **bez** tiketa koje je kreirao Platform Admin.
- **Professor / Student**: ne vidi listu tiketa (samo može submitovati).

### 6.4 API

- `POST /api/tickets` – kreiranje tiketa
- `GET /api/tickets` – lista (Platform/School admin; filteri: status, priorityOnly)
- `PATCH /api/tickets/:id` – izmena statusa/prioriteta

---

## 7. Notifications (BRD §7.3)

### 7.1 Ticket Notifications

- Frontend poll-uje nove tikete (status NEW).
- Platform Admin vidi platform-tikete; School Admin vidi tikete tenanta (bez onih od Platform Admin-a).
- Profesor i Student ne primaju ticket obaveštenja.

### 7.2 User-Action Notifications

- **Platform Admin** kreira/ažurira/briše korisnika → svi **School Admin** tog tenanta dobijaju obaveštenje.
- **School Admin** ažurira korisnika → **taj korisnik** dobija obaveštenje (npr. "Your account was updated by School Admin").
- Profesor i Student vide samo obaveštenja koja se **tiču njih lično** (npr. izmena njihovog naloga).

### 7.3 UI

- Ikona zvona u header-u sa badge-om (broj nepročitanih).
- Stranica "Notifications" – lista ticket + user-action obaveštenja.
- "Mark all as read" – očisti lokalno i označi preko API-ja.

### 7.4 API

- `GET /api/notifications?unreadOnly=` – lista obaveštenja za trenutnog korisnika
- `POST /api/notifications/mark-read` – označavanje kao pročitano (body: `{ ids: [...] }`)

---

## 8. Students

- Student = osoba; enrollment = student u tenantu (StudentTenant).
- Jedan student može biti upisan u više institucija.
- Status: ACTIVE, GRADUATED, DROPPED, SUSPENDED.
- Platform Admin mora proslediti `tenantId` pri kreiranju; School Admin koristi svoj tenant.

---

## 9. Programs, Courses, Exams, Finance, Records

- **Programs**: CRUD, versioning, povezivanje sa kursevima.
- **Courses**: CRUD, course offerings (term, year), professor assignment, enrollments.
- **Exams**: Periods, Terms, Registrations, grading.
- **Finance**: Tuitions, Payments.
- **Records**: Transcripts, GPA.

Sve operacije su tenant-scoped. Frontend koristi drawer pattern za CRUD forme.

---

## 10. API & Integration Requirements

- RESTful, JSON
- JWT Bearer authentication
- `x-tenant-id` header za Platform Admin tenant switcher
- Validacija ulaza (express-validator)
- Standardni HTTP status kodovi

---

## 11. Non-Functional Requirements

- Responsive UI (desktop/tablet/mobile)
- i18n: en, sr-lat, sr-cyr
- Pristupačnost (WCAG 2.1 AA gde je moguće)
- Performanse: API odgovor \<200ms P95 (cilj)

---

## 12. Success Criteria

- Platform Admin može upravljati tenantima i korisnicima.
- School Admin može upravljati studentima, programima, kursevima, ispitima, finansijama.
- Profesor može kreirati studente i upravljati kursevima/ispitima.
- Student vidi svoje podatke i može prijaviti bag.
- Obaveštenja su ispravno filtrirana po ulozi (ticket + user-action).
- Multi-tenancy je uspešno izolovan.
