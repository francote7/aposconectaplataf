// =====================================================
// APOS CONECTA — LÓGICA DE NEGOCIO Y DATOS (MOCK)
// =====================================================

(() => {
    // --- 1. ESTADO GLOBAL ---
    const state = {
        currentUser: null,
        currentView: 'home',
        pendingUser: null
    };

    // --- 2. DATOS DE USUARIOS (Prestadores) ---
    const users = [
      { username: "medico", role: "prestador", name: "Dr. Julián G.", especialidad: "Clínica Médica", pass: "123" },
      { username: "admin", role: "admin", name: "Admin Central", especialidad: "Sistemas", pass: "admin" }
    ];

    // --- 3. PADRÓN DE AFILIADOS (MPI - Master Patient Index) ---
    const patients = [
      {
        id: "p1",
        dni: "24.567.890",
        affiliateNumber: "12456789001",
        name: "MERCADO, Graciela del Valle",
        birthDate: "1975-04-12", // 49 años
        gender: "Femenino",
        location: "B° Facundo Quiroga, La Rioja Capital",
        plan: "Plan Único - Activo - Plan DBT",
        tags: ["Hipertensión", "Diabetes T2"],
        riskLevel: "high"
      },
      {
        id: "p2",
        dni: "38.123.456",
        affiliateNumber: "13812345600",
        name: "PAEZ, Carlos Esteban",
        birthDate: "1994-08-20", // 30 años
        gender: "Masculino",
        location: "Chilecito, La Rioja",
        plan: "Plan Único - Activo",
        tags: ["Post-Op Traumatología"],
        riskLevel: "medium"
      },
      {
        id: "p3",
        dni: "55.987.654",
        affiliateNumber: "12598765402",
        name: "HERRERA, Sofía",
        birthDate: "2020-02-15", // 4 años
        gender: "Femenino",
        location: "Aimogasta, Arauco",
        plan: "Plan Único - Activo - Materno Infantil",
        tags: ["Niño Sano", "Esquema Vacunación"],
        riskLevel: "low"
      }
    ];

    // --- 4. HISTORIA CLÍNICA UNIFICADA (Recursos FHIR Simplificados) ---
    const healthRecords = {
        "p1": [ // Graciela (Crónica)
            {
                date: "2025-06-15",
                type: "prescription",
                title: "Receta Digital - Crónicos",
                doctor: "Dr. Pedro Banegas (Cardiología)",
                facility: "Inst. Mercado Luna",
                detail: "Losartán 50mg comp. x 30 | Metformina 850mg comp. x 60.",
                status: "dispensed", // Dispensado en farmacia
                snomed: "38341003 | Hipertensión"
            },
            {
                date: "2025-05-10",
                type: "lab",
                title: "Laboratorio Trimestral",
                doctor: "Bioq. Ana Fuentes",
                facility: "Apos 24 - Laboratorio Bioquímico",
                detail: "Glucemia: 110 mg/dl (Estable). Hemoglobina Glicosilada: 6.5%.",
                status: "validated",
                worm: true // Dato inalterable
            },
            {
                date: "2024-12-20",
                type: "consultation",
                title: "Control Diabetológico",
                doctor: "Dra. Laura Díaz",
                facility: "APOS 24 - Consultorios Externos",
                detail: "Paciente refiere buena adherencia a la dieta. Se ajusta dosis de insulina nocturna.",
                status: "completed"
            }
        ],
        "p2": [ // Carlos (Trauma)
            {
                date: "2025-07-02",
                type: "image",
                title: "Rayos X - Tobillo Der.",
                doctor: "Téc. Mario Rizzi",
                facility: "Clínica ERI",
                detail: "Consolidación ósea favorable en peroné distal. Se retira bota walker.",
                status: "validated",
                attachment: "Rxtobillo.jpg"
            },
            {
                date: "2025-06-01",
                type: "consultation",
                title: "Guardia Traumatología",
                doctor: "Dr. Jorge Casas",
                facility: "Hospital Eleazar Herrera Motta (Chilecito)",
                detail: "Esguince severo tobillo derecho tras actividad deportiva. Se solicita RX.",
                status: "completed",
                snomed: "19130008 | Traumatismo de tobillo"
            }
        ],
        "p3": [ // Sofía (Pediatría)
            {
                date: "2025-03-10",
                type: "vaccine",
                title: "Inmunización - Ingreso Escolar",
                doctor: "Enf. Sara Ocampo",
                facility: "CAPS Antártida Argentina",
                detail: "Aplicación Triple Viral + Sabin Oral. Carnet digital actualizado.",
                status: "validated",
                worm: true
            },
            {
                date: "2024-08-15",
                type: "consultation",
                title: "Control Niño Sano",
                doctor: "Dra. Mónica Flores",
                facility: "Hospital de la Madre y el Niño",
                detail: "Percentiles de crecimiento normales. Peso: 18kg. Talla: 105cm.",
                status: "completed"
            }
        ]
    };

    // --- 5. LÓGICA DE LOGIN (2FA) ---
    const loginScreen = document.getElementById("login-screen");
    const mainLayout = document.getElementById("main-layout");
    const formStep1 = document.getElementById("login-form-step1");
    const formStep2 = document.getElementById("login-form-step2");

    // Paso 1: Usuario/Pass
    formStep1.addEventListener("submit", (e) => {
        e.preventDefault();
        const u = users.find(user => user.username === e.target.username.value && user.pass === e.target.password.value);
        if(u) {
            state.pendingUser = u;
            formStep1.classList.add("hidden");
            formStep2.classList.remove("hidden");
            // Simular SMS enviado
            setTimeout(() => document.getElementById("otp").focus(), 100);
        } else {
            alert("Error: Usuario/Pass incorrectos. (Prueba: medico / 123)");
        }
    });

    // Botón volver
    document.getElementById("back-to-step1").addEventListener("click", () => {
        formStep2.classList.add("hidden");
        formStep1.classList.remove("hidden");
    });

    // Paso 2: Token (Simulado)
    formStep2.addEventListener("submit", (e) => {
        e.preventDefault();
        if(e.target.otp.value === "123456") {
            initApp(state.pendingUser);
        } else {
            alert("Token inválido (Use 123456)");
        }
    });

    function initApp(user) {
        state.currentUser = user;
        loginScreen.classList.add("hidden");
        mainLayout.classList.remove("hidden");
        document.getElementById("user-name-display").textContent = user.name;
        document.getElementById("user-role-display").textContent = user.especialidad;
        document.getElementById("user-avatar").textContent = user.name.substring(0,2).toUpperCase();
    }

    document.getElementById("logout-btn").addEventListener("click", () => location.reload());

    // --- 6. NAVEGACIÓN ---
    document.querySelectorAll(".nav-item").forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            // Reset active classes
            document.querySelectorAll(".nav-item").forEach(l => l.classList.remove("active"));
            link.classList.add("active");
            
            const viewName = link.dataset.view;
            showView(viewName);
        });
    });

    function showView(viewId) {
        // Ocultar todas las vistas
        document.querySelectorAll(".view-section").forEach(el => el.classList.remove("active"));
        
        // Mostrar vista específica
        const target = document.getElementById(`view-${viewId}`);
        if(target) target.classList.add("active");
        
        // Actualizar Título de la Página
        const titles = {
            'home': 'Escritorio Médico',
            'search': 'Padrón de Afiliados',
            'patient-detail': 'Historia de Salud Digital (HSDU)',
            'appointments': 'Agenda de Turnos'
        };
        document.getElementById("page-title").textContent = titles[viewId] || 'APOS Conecta';
    }

    // --- 7. BÚSQUEDA DE PACIENTES ---
    document.getElementById("btn-search-patient").addEventListener("click", () => {
        const q = document.getElementById("patient-search-input").value.toLowerCase();
        
        // Filtro simple
        const results = patients.filter(p => 
            p.name.toLowerCase().includes(q) || p.dni.includes(q)
        );
        renderResults(results);
    });

    function renderResults(list) {
        const container = document.getElementById("patient-results");
        if(list.length === 0) {
            container.innerHTML = `<div class="empty-state"><i class="ph ph-warning"></i><p>No se encontraron afiliados. Pruebe con 'Mercado' o 'Paez'.</p></div>`;
            return;
        }

        container.innerHTML = list.map(p => `
            <div class="card result-card">
                <div class="patient-header-mini">
                    <div class="avatar-circle ${p.gender === 'Femenino' ? 'bg-pink' : 'bg-blue'}">
                        ${p.name.charAt(0)}
                    </div>
                    <div>
                        <h3>${p.name}</h3>
                        <p>DNI: ${p.dni} <span class="badge-mpi">Validado RENAPER</span></p>
                    </div>
                    <button class="btn-login btn-sm" onclick="window.loadPatient('${p.id}')">
                        Acceder a HSDU
                    </button>
                </div>
                <div class="patient-tags">
                    ${p.tags.map(t => `<span class="tag">${t}</span>`).join('')}
                    <span class="location-tag"><i class="ph ph-map-pin"></i> ${p.location}</span>
                </div>
            </div>
        `).join('');
    }

    // --- 8. CARGA DE HISTORIA CLÍNICA (CORE DEL SISTEMA) ---
    // Esta función se llama desde el botón "Acceder a HSDU" en los resultados
    window.loadPatient = (id) => {
        const patient = patients.find(p => p.id === id);
        const records = healthRecords[id] || [];
        
        // Inyectar datos del paciente en el encabezado
        document.getElementById("detail-name").textContent = patient.name;
        document.getElementById("detail-affiliate").textContent = `N°: ${patient.affiliateNumber} | ${patient.plan}`;
        document.getElementById("detail-age").textContent = `${formatDate(patient.birthDate)} (${calculateAge(patient.birthDate)} años)`;
        
        // Renderizar Timeline
        const timeline = document.getElementById("medical-timeline");
        if(records.length === 0) {
            timeline.innerHTML = `<p class="text-center text-muted">No hay registros históricos disponibles.</p>`;
        } else {
            timeline.innerHTML = records.map(rec => `
                <div class="timeline-item">
                    <div class="timeline-icon ${getTypeIcon(rec.type).color}">
                        <i class="ph ${getTypeIcon(rec.type).icon}"></i>
                    </div>
                    <div class="timeline-content">
                        <div class="timeline-header">
                            <span class="date">${formatDate(rec.date)}</span>
                            <span class="badge-type">${rec.title}</span>
                            ${rec.worm ? '<span class="badge-worm" title="Inalterable - WORM"><i class="ph ph-lock-key"></i> Seguro</span>' : ''}
                        </div>
                        <h4 class="doctor-name">${rec.doctor} <small>en ${rec.facility}</small></h4>
                        <p class="clinical-note">${rec.detail}</p>
                        ${rec.snomed ? `<div class="snomed-code"><i class="ph ph-hash"></i> SNOMED CT: ${rec.snomed}</div>` : ''}
                        ${rec.status === 'dispensed' ? '<div class="dispensed-stamp">ENTREGADO FARMACIA</div>' : ''}
                        ${rec.attachment ? `<div class="mt-4"><button class="btn-small"><i class="ph ph-file-image"></i> Ver Adjunto (${rec.attachment})</button></div>` : ''}
                    </div>
                </div>
            `).join('');
        }

        // Cambiar vista al detalle
        showView('patient-detail');
    };

    // Helpers
    function calculateAge(dateString) {
        const today = new Date();
        const birthDate = new Date(dateString);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
        return age;
    }

    function formatDate(dateStr) {
        const [y, m, d] = dateStr.split('-');
        return `${d}/${m}/${y}`;
    }

    function getTypeIcon(type) {
        switch(type) {
            case 'prescription': return { icon: 'ph-prescription', color: 'bg-purple' };
            case 'lab': return { icon: 'ph-flask', color: 'bg-red' };
            case 'image': return { icon: 'ph-image', color: 'bg-blue' };
            case 'vaccine': return { icon: 'ph-syringe', color: 'bg-green' };
            default: return { icon: 'ph-stethoscope', color: 'bg-orange' };
        }
    }

})();