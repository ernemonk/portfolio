# ERNESTO MONGE
### Senior Full-Stack Systems Architect — Financial Platforms & Embedded Systems

San Francisco Bay Area · 📧 erne.monge.s@gmail.com · 🔗 [LinkedIn](https://www.linkedin.com/in/ernesto-monge-873728132/) · [GitHub](https://github.com/ernemonk)


---

## Professional Summary

**Senior Full-Stack Systems Architect with 10+ years of experience spanning two rarely overlapping domains: enterprise financial platforms and embedded hardware systems.** I lead the design and modernization of high-scale, regulated financial systems and have also built production IoT solutions from the PCB level up through cloud and mobile applications.

On the software side, I currently lead a team that is modernizing of a **$160B+ AUM advisor platform at AssetMark**, and have architected regulated data migration systems at **JPMorgan Chase** during a major bank acquisition, as well as treasury platforms at **First Republic Bank**. My core stack includes **C# ASP.NET Core, Python (FastAPI), gRPC microservices, and React.js**, with a focus on **data integrity, fault tolerance, and high-availability distributed systems**.

On the hardware side, I’ve shipped a full end-to-end IoT product: **designed and manufactured PCBs, developed C++ firmware on ESP8266 microcontrollers, integrated sensor systems, and built the cloud ingestion pipeline using Google IoT Core** — along with releasing production mobile apps. I’ve also implemented **binary protocol parsers for commercial GPS devices** and built the backend systems required to process that data at scale.

I bring a **hardware-informed approach to software architecture** — prioritizing reliability, failure modes, and real-world constraints — and a **software-engineering discipline to hardware systems**, emphasizing clean interfaces, testing, and scalable design.


---

## Core Technical Skills

| Category | Skills |
|---|---|
| **Backend** | C# · ASP.NET Core · Python (FastAPI, Flask, Django, Tornado) · gRPC · REST APIs · Microservices · WebSockets |
| **Frontend** | React.js · Angular · TypeScript · Redux · Next.js · HTML5 · CSS3 · Tailwind |
| **Mobile** | Flutter · React Native · Dart |
| **Databases** | PostgreSQL · Aurora · MySQL · Snowflake · MongoDB · Redis · Memcached |
| **Cloud / DevOps** | AWS (EC2, S3, Lambda, RDS) · Google Cloud (IoT Core, Pub/Sub, Cloud Functions, Firestore) · Docker · Jenkins · OpenShift · Git · CI/CD · ActiveBatch |
| **Hardware & Embedded** | PCB Design · C++ Firmware · ESP8266 · I2C · SPI · Sensor Integration · Google IoT Core · MQTT |
| **FinTech & Compliance** | Financial data integrity · Idempotency · JWT/LDAP auth · DocuSign eSignature · ETL pipelines · Audit trails |

---

## Professional Experience

### Senior Lead Full Stack Engineer · AssetMark
**Concord, CA · Jan 2025 – Present · Platform: $160B+ AUM**

AssetMark is a leading turnkey asset management platform (TAMP) overseeing $160B+ in assets for thousands of independent financial advisors. I lead engineering on two major initiatives within the platform.

#### eWealth Manager — Core Advisor Portal *(Jul 2025 – Present)*

eWealth Manager is AssetMark's flagship advisor portal — the central hub for client management, account administration, and portfolio oversight used by advisors nationwide. The underlying system is a 20-year-old C# ASP.NET Core monolith that powers most of AssetMark's core business.

- **Lead a cross-functional engineering team** decomposing a deeply coupled legacy financial monolith into independently deployable microservices — one of the most technically complex and business-critical modernization efforts in the company.
- Architecting and delivering core financial services: **Account Service, Parties Service, and Move Money Service** — each with well-defined domain boundaries, independent deployment pipelines, and strict data consistency guarantees.
- Implemented **gRPC** for high-performance, strongly-typed cross-service communication, replacing brittle REST patterns in latency-sensitive financial workflows.
- Integrated **DocuSign eSignature APIs** into advisor onboarding and account management flows; diagnosed and resolved critical production bugs across legacy DocuSign and account services that had existed in the codebase for years.
- Architecting **AI-driven workflow management systems** to automate advisor and client lifecycle processes at scale.
- Establishing incremental migration patterns that keep the business running while progressively dismantling a system that was never designed to be taken apart.

**Tech Stack:** C# · ASP.NET Core · gRPC · DocuSign API · React.js · TypeScript · PostgreSQL · Docker · Microservices

#### Data Migration Platform — Morningstar Acquisition *(Jan 2025 – Jul 2025)*

- Engineered **Python REST web services** orchestrating migration of critical client and advisor financial data from Morningstar-acquired systems — zero data-loss integrity maintained across the full transfer.
- Built **React.js / TypeScript** real-time monitoring dashboard enabling non-technical stakeholders to track pipeline status and approve data movements.
- Configured **ActiveBatch** event-driven job scheduling and developed PowerShell automation bridging legacy and modern system boundaries.

**Tech Stack:** Python · React.js · TypeScript · PostgreSQL · ActiveBatch · PowerShell · Bitbucket

---

### Full Stack Developer · JPMorgan Chase
**San Francisco, CA · May 2022 – Dec 2024**

#### FRB Data Migration Platform — First Republic Bank Acquisition

Following First Republic Bank's FDIC-managed collapse in May 2023, built the full-stack platform that enabled Chase to absorb FRB's critical banking data under strict regulatory timelines and compliance requirements.

- Architected **FastAPI (Python) REST microservices** with transactional guarantees, full validation layers, and audit trails — applying the same reliability mindset that embedded systems demand.
- Applied **idempotent API design**, validation checksums, and rollback procedures to protect financial data integrity throughout a high-stakes, non-reversible migration.
- Designed a **React.js / TypeScript** approval workflow UI enabling 100+ data owners to review, validate, and authorize table migrations — reducing errors and improving cross-team accountability.
- Maintained comprehensive **unit and integration test coverage**; operated CI/CD pipelines via **Jenkins and EC2**.

**Tech Stack:** Python · FastAPI · React.js · TypeScript · PostgreSQL · Aurora · Docker · Jenkins · EC2

---

### Full Stack Developer · First Republic Bank
**San Francisco, CA · Jan 2022 – May 2023**

#### Treasury Management Tracking System

- Built a **centralized treasury dashboard** providing real-time visibility across all department applications and products; streamlined client enrollment and new product onboarding workflows.
- Developed **FastAPI REST APIs** with JWT authentication; implemented **Redis / Memcached caching** and real-time **WebSocket** updates for high-concurrency performance under load.
- Designed dynamic JSON-driven forms stored in SQL, enabling rapid UI iteration without code deploys; produced Swagger API documentation for cross-team consumption.

**Tech Stack:** Python · FastAPI · React.js · TypeScript · PostgreSQL · MongoDB · Redis · Jenkins · OpenShift

#### Zipline Express — Self-Service Data Migration Tool

- Delivered a **self-service ETL platform** enabling non-technical finance teams to migrate CSV, Excel, SQL, and API data sources into a **Snowflake data warehouse** with no engineering support required.
- Built **Angular + Ngxs** frontend with LDAP authentication and role-based access control; applied **NumPy / Pandas** for time-series and tabular financial data transformation at scale.

**Tech Stack:** Python · FastAPI · Angular · TypeScript · Snowflake · Pandas · NumPy · Jenkins · OpenShift

---

### Full Stack Developer · Chekcar GPS Tracking Solutions
**Feb 2020 – Mar 2022**

#### Real-Time GPS Tracking Platform — 1,000+ Vehicles

A role that required understanding both the hardware (commercial GPS devices, binary protocols) and the software infrastructure to handle the data they generate at scale.

- Built a **Tornado async GPS server** parsing proprietary binary protocols from multiple commercial GPS hardware models — processing real-time tracking events for **1,000+ vehicles** continuously.
- Wrote **Python parsing scripts** tailored to each GPS device manufacturer's protocol format; implemented the full ingestion and normalization pipeline.
- Developed **Flask microservices** for health monitoring and alerting; deployed on **AWS EC2 / S3** with Apache on Ubuntu; implemented **MongoDB** NoSQL patterns for high-frequency write throughput.
- Built **React.js** admin and client dashboards; developed **Flutter mobile apps** for delivery drivers.

**Tech Stack:** Python · Tornado · Flask · React.js · Flutter · PostgreSQL · MongoDB · AWS (EC2, S3) · GPS protocols

---

### Full Stack Engineer · E-gas Technology
**Aug 2020 – Mar 2021**

#### IoT Propane Tank Monitoring System — End-to-End Product Ownership

The clearest demonstration of the hybrid profile: sole engineer responsible for hardware through cloud on a commercial IoT product that reached production and the app stores.

- **PCB Design & Manufacturing:** Designed schematics, selected components, laid out and manufactured PCB boards for the propane tank monitoring device — handling the full hardware development lifecycle.
- **Firmware Development:** Wrote **C++ firmware** for **ESP8266 microcontrollers** — implementing capacitive sensor reads, I2C/SPI communication, power optimization, and MQTT-based cloud data transmission.
- **Cloud Infrastructure:** Implemented **Google IoT Core, Pub/Sub, and Cloud Functions** to ingest, route, and process sensor telemetry in real time — triggering alerts and delivery logistics based on tank level thresholds.
- **Full-Stack Software:** Built **React.js (Redux)** admin dashboard for fleet management, **Python Django** backend, and **Flutter** client and driver mobile apps.
- **App Store Launch:** Packaged and released both mobile apps to **Play Store and Apple App Store** — managing certificates, provisioning, and release pipeline end to end.
- Used **C#** for backend service integrations and tooling across the platform.

**Tech Stack:** C++ · C# · ESP8266 · PCB Design · I2C/SPI · MQTT · Google IoT Core · Pub/Sub · Cloud Functions · Python · Django · React.js · Flutter · Firebase · AWS

---

### Full Stack Developer · Audiovalid
**Mar 2020 – Aug 2020**

#### Broadcast Monitoring & Audio Fingerprinting Platform

Contributed to patented technology auditing radio and television broadcasts to verify advertising campaign transmission for clients.

- Implemented **audio fingerprinting and recognition algorithms** in Python to identify and match broadcast segments against reference recordings.
- Developed monitoring and notification tools; built a **PyQt5 desktop app** for bulk media file download and processing.
- Applied **NumPy / Pandas** for signal processing and data analysis; retrieved large datasets from **Firebase Cloud Storage**.
- Handled client-side validation using **React.js**.

**Tech Stack:** Python · PyQt5 · React.js · Redux · NumPy · Pandas · Firebase · MySQL · Git

---

## Education

**Bachelor of Science — Mechatronic Systems Engineering**
Universidad La Salle Noroeste, Ciudad Obregón, Sonora, México · Graduated December 2018


---

*References available upon request*
