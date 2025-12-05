// =====================================================
// APOS CONECTA — PROTOTIPO HSDU v3.0
// Cumple con normativas HSI/FHIR (Simulado)
// =====================================================

(() => {
    // --- ESTADO Y DATOS SIMULADOS ---
    
    // Usuarios con RBAC (Role Based Access Control)
    const users = [
      { username: "admin", password: "admin123", role: "admin", name: "Administrador Sistema" },
      { username: "auditor", password: "auditor123", role: "auditor", name: "Dr. Roberto Auditor" },
      { username: "prestador", password: "prestador123", role: "prestador", name: "Dr. Facundo Prestador" },
      { username: "operador", password: "operator123", role: "prestador", name: "Lic. Clara Operadora" }
    ];
  
    let userList = [...users];
  
    // Pacientes con estructura alineada a FHIR (simplificada)
    const patients = [
      {
        id: "p1",
        resourceType: "Patient",
        name: { family: "González", given: "María" },
        identifier: { value: "23456789", system: "DNI" },
        birthDate: "1976-04-12",
        gender: "female",
        telecom: "3804-123456",
        managingOrganization: { display: "APOS - 12345678900" },
        // Contenedores de recursos clínicos (Composition)
        clinicalData: {
          ambulatorio: [],
          internacion: { active: false, history: [] },
          farmacia: [],
          laboratorio: [],
          kinesiologia: [],
          odontologia: []
        }
      },
      {
        id: "p2",
        resourceType: "Patient",
        name: { family: "Pérez", given: "Juan" },
        identifier: { value: "30987654", system: "DNI" },
        birthDate: "1988-11-02",
        gender: "male",
        telecom: "3804-369874",
        managingOrganization: { display: "APOS - 130987654" },
        clinicalData: { ambulatorio: [], internacion: { active: false, history: [] }, farmacia: [], laboratorio: [], kinesiologia: [], odontologia: [] }
      }
    ];
  
    // Mock SNOMED CT (Terminología Standard)
    const snomedMock = [
      { code: "44054006", display: "Diabetes Mellitus tipo 2" },
      { code: "195967001", display: "Hipertensión arterial" },
      { code: "38341003", display: "Neumonía adquirida en la comunidad" },
      { code: "422034002", display: "Cefalea tensional" },
      { code: "22298006", display: "Infarto agudo de miocardio" },
      { code: "43878008", display: "Gastritis aguda" }
    ];
  
    // Variables de Estado
    let currentUser = null;
    let currentPatient = null;
  
    // --- REFERENCIAS DOM ---
    const dom = {
      login: {
        screen: document.getElementById("login-screen"),
        form: document.getElementById("login-form"),
        user: document.getElementById("username"),
        pass: document.getElementById("password")
      },
      main: {
        screen: document.getElementById("main-screen"),
        userLabel: document.getElementById("current-user"),
        roleLabel: document.getElementById("current-role"),
        logout: document.getElementById("logout-btn"),
        navItems: document.querySelectorAll(".nav-item")
      },
      patient: {
        banner: document.getElementById("patient-banner"),
        name: document.getElementById("patient-name"),
        dni: document.getElementById("patient-dni"),
        age: document.getElementById("patient-age"),
        os: document.getElementById("patient-os"),
        list: document.getElementById("patient-list"),
        filter: document.getElementById("patient-filter"),
        modules: document.getElementById("patient-modules") // Sidebar group
      },
      views: {
        search: document.getElementById("view-search"),
        moduleContainer: document.getElementById("module-content"),
        allModules: document.querySelectorAll(".module")
      },
      admin: {
        modules: document.getElementById("admin-modules"),
        list: document.getElementById("admin-user-list"),
        form: document.getElementById("admin-user-form")
      }
    };
  
    // --- INICIALIZACIÓN Y EVENTOS ---
  
    // Login
    dom.login.form.addEventListener("submit", (e) => {
      e.preventDefault();
      const u = dom.login.user.value.trim();
      const p = dom.login.pass.value.trim();
      
      const found = userList.find(x => x.username === u && x.password === p);
      if (found) {
        login(found);
      } else {
        alert("Credenciales incorrectas. Pruebe los usuarios demo mostrados.");
      }
    });
  
    dom.main.logout.addEventListener("click", logout);
  
    // Navegación Sidebar
    dom.main.navItems.forEach(btn => {
      btn.addEventListener("click", () => {
        // Remover clase active de todos
        dom.main.navItems.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
  
        const viewName = btn.dataset.view;
        const moduleName = btn.dataset.module;
  
        if (viewName === "search") {
          showSearch();
        } else if (moduleName) {
            if(!currentPatient && moduleName !== 'admin') {
                alert("Primero debe seleccionar un afiliado.");
                showSearch();
                return;
            }
            showModule(moduleName);
        }
      });
    });
  
    // Búsqueda de Pacientes
    dom.patient.filter.addEventListener("input", (e) => renderPatientList(e.target.value));
  
    // --- FUNCIONES LOGICAS ---
  
    function login(user) {
      currentUser = user;
      dom.login.screen.classList.add("hidden");
      dom.main.screen.classList.remove("hidden");
      
      dom.main.userLabel.textContent = user.name;
      dom.main.roleLabel.textContent = user.role.toUpperCase();
  
      // RBAC: Mostrar u ocultar acceso Admin
      if (user.role === 'admin') {
          dom.admin.modules.classList.remove("hidden");
      } else {
          dom.admin.modules.classList.add("hidden");
      }
  
      renderPatientList("");
      showSearch();
    }
  
    function logout() {
      currentUser = null;
      currentPatient = null;
      dom.login.screen.classList.remove("hidden");
      dom.main.screen.classList.add("hidden");
      dom.login.user.value = "";
      dom.login.pass.value = "";
      dom.patient.banner.classList.add("hidden");
      dom.patient.modules.classList.add("hidden");
    }
  
    // --- GESTIÓN DE VISTAS ---
  
    function showSearch() {
      dom.views.search.classList.add("active");
      dom.views.moduleContainer.classList.add("hidden");
      dom.views.search.classList.remove("hidden");
    }
  
    function showModule(moduleId) {
      dom.views.search.classList.add("hidden");
      dom.views.moduleContainer.classList.remove("hidden");
      
      dom.views.allModules.forEach(m => m.classList.remove("active"));
      const target = document.getElementById(moduleId);
      if(target) target.classList.add("active");
  
      // Refresh de datos específicos si es necesario
      if(moduleId === 'admin') renderAdminUsers();
      else refreshClinicalData();
    }
  
    // --- GESTIÓN PACIENTES ---
  
    function renderPatientList(query) {
      const q = query.toLowerCase();
      dom.patient.list.innerHTML = "";
  
      const filtered = patients.filter(p => 
        p.name.family.toLowerCase().includes(q) || 
        p.name.given.toLowerCase().includes(q) || 
        p.identifier.value.includes(q)
      );
  
      filtered.forEach(p => {
        const li = document.createElement("li");
        li.innerHTML = `
          <div>
            <strong>${p.name.family}, ${p.name.given}</strong>
            <div class="muted">DNI: ${p.identifier.value}</div>
          </div>
          <div><i class="ph ph-caret-right"></i></div>
        `;
        li.addEventListener("click", () => selectPatient(p));
        dom.patient.list.appendChild(li);
      });
    }
  
    function selectPatient(p) {
      currentPatient = p;
      
      // Update Banner
      dom.patient.name.textContent = `${p.name.family}, ${p.name.given}`;
      dom.patient.dni.innerHTML = `<i class="ph ph-identification-card"></i> ${p.identifier.value}`;
      
      const age = new Date().getFullYear() - new Date(p.birthDate).getFullYear();
      dom.patient.age.innerHTML = `<i class="ph ph-cake"></i> ${age} años`;
      
      dom.patient.os.textContent = p.managingOrganization.display;
  
      dom.patient.banner.classList.remove("hidden");
      dom.patient.modules.classList.remove("hidden"); // Show clinical menu
      
      // Ir al resumen por defecto
      document.querySelector('[data-module="resumen"]').click();
    }
  
    // --- HSI LOGIC & RENDERING ---
  
    function refreshClinicalData() {
        if(!currentPatient) return;
        const data = currentPatient.clinicalData;
  
        // 1. Resumen
        const lastAmb = data.ambulatorio.slice(-1)[0];
        document.getElementById("resumen-last-activity").innerHTML = lastAmb 
            ? `<strong>${lastAmb.date}</strong> - ${lastAmb.reason}<br><span class="muted">${lastAmb.diagnosis.display}</span>` 
            : "No hay consultas recientes.";
  
        // 2. Ambulatorio (Feed)
        const ambList = document.getElementById("ambulatorio-list");
        ambList.innerHTML = "";
        data.ambulatorio.slice().reverse().forEach(item => {
            ambList.innerHTML += createActivityCard(item.date, "Consulta Ambulatoria", `
                <strong>Motivo:</strong> ${item.reason}<br>
                <strong>Dx (SNOMED):</strong> ${item.diagnosis.display} (${item.diagnosis.code})<br>
                <em>${item.plan}</em>
            `, item.author);
        });
  
        // 3. Internación
        const intDiv = document.getElementById("internacion-current");
        const timeline = document.getElementById("evoluciones-timeline");
        
        if (data.internacion.active) {
            const adm = data.internacion.activeData;
            intDiv.innerHTML = `<div class="card" style="border-left: 4px solid var(--secondary); background:#ecfeff;">
                <strong><i class="ph ph-bed"></i> Internado en ${adm.service} - Cama ${adm.bed}</strong><br>
                Ingreso: ${adm.date}<br>
                Dx: ${adm.diagnosis.display}
            </div>`;
        } else {
            intDiv.innerHTML = `<div class="muted p-2">El paciente no se encuentra internado actualmente.</div>`;
        }
  
        timeline.innerHTML = "";
        if (data.internacion.history.length > 0) {
            // Unify admission and progress notes
            // Simplified logic for prototype
            data.internacion.history.forEach(h => {
               timeline.innerHTML += `
               <div class="timeline-item">
                 <div class="timeline-date">${h.date} - ${h.author}</div>
                 <div class="timeline-content">
                    ${h.note}
                    <div class="worm-badge"><i class="ph ph-shield-check"></i> WORM: Block #${Math.floor(Math.random() * 90000)+10000}</div>
                 </div>
               </div>`;
            });
        }
  
        // 4. Farmacia
        renderSimpleFeed("farmacia-list", data.farmacia, (i) => 
            `<strong>${i.medication}</strong> (Cant: ${i.quantity})`);
            
        // 5. Lab
        renderSimpleFeed("lab-list", data.laboratorio, (i) => 
            `<strong>${i.study}</strong><br>Res: ${i.result}`);
            
        // 6. Odonto
        renderSimpleFeed("odonto-list", data.odontologia, (i) => 
            `Pieza ${i.tooth} - ${i.procedure}`);
            
        // 7. Kine
        renderSimpleFeed("kine-list", data.kinesiologia, (i) => 
            `${i.technique}`);
    }
  
    function createActivityCard(date, title, htmlContent, author) {
        // Simulamos visualmente un registro firmado (WORM)
        const wormHash = "0x" + Math.random().toString(16).substr(2, 8);
        return `
        <li>
            <div class="activity-header">
                <span><i class="ph ph-calendar-blank"></i> ${formatDate(date)}</span>
                <span>${author || 'Desconocido'}</span>
            </div>
            <div class="activity-title">${title}</div>
            <div style="margin-top:5px; font-size:0.9rem">${htmlContent}</div>
            <div class="worm-badge" title="Registro Inalterable"><i class="ph ph-shield-check"></i> WORM Sig: ${wormHash}</div>
        </li>`;
    }
  
    function renderSimpleFeed(elementId, arrayData, contentFn) {
        const el = document.getElementById(elementId);
        el.innerHTML = "";
        if(!arrayData.length) { el.innerHTML = "<div class='muted'>Sin registros.</div>"; return; }
        
        arrayData.slice().reverse().forEach(item => {
            el.innerHTML += createActivityCard(item.date, "", contentFn(item), item.author);
        });
    }
  
    function formatDate(isoString) {
        if(!isoString) return "";
        return isoString.replace("T", " ");
    }
  
    // --- MANEJO DE FORMULARIOS ---
  
    // Ambulatorio
    handleForm("form-ambulatorio", (fd) => {
        const dxCode = document.getElementById("snomed-results-amb").value;
        const dxText = document.getElementById("snomed-search-amb").value;
        
        if(!dxCode) return alert("Debe seleccionar un diagnóstico SNOMED válido.");
  
        currentPatient.clinicalData.ambulatorio.push({
            date: fd.get("fecha"),
            reason: fd.get("motivo"),
            plan: fd.get("plan"),
            diagnosis: { code: dxCode, display: dxText },
            author: currentUser.name
        });
    });
  
    // Internación (Ingreso)
    handleForm("form-internacion", (fd) => {
        const dxCode = document.getElementById("snomed-results-int").value;
        if(!dxCode) return alert("Debe seleccionar un diagnóstico SNOMED válido.");
  
        currentPatient.clinicalData.internacion.active = true;
        currentPatient.clinicalData.internacion.activeData = {
            date: fd.get("ingreso"),
            type: fd.get("tipo"),
            service: fd.get("servicio"),
            bed: fd.get("cama"),
            diagnosis: { code: dxCode, display: document.getElementById("snomed-search-int").value }
        };
        // Log ingreso as history event
        currentPatient.clinicalData.internacion.history.push({
            date: fd.get("ingreso"),
            author: currentUser.name,
            note: `INGRESO A INTERNACIÓN: ${fd.get("servicio")} - Cama ${fd.get("cama")}`
        });
    });
  
    // Evolución
    handleForm("form-evolucion", (fd) => {
         currentPatient.clinicalData.internacion.history.push({
            date: fd.get("fecha"),
            author: currentUser.name,
            note: fd.get("evo")
        });
    });
  
    // Genéricos
    handleForm("form-farmacia", (fd) => {
        currentPatient.clinicalData.farmacia.push({
            date: fd.get("fecha"), medication: fd.get("medicamento"), quantity: fd.get("cantidad"), author: currentUser.name
        });
    });
    handleForm("form-lab", (fd) => {
        currentPatient.clinicalData.laboratorio.push({
            date: fd.get("fecha"), study: fd.get("estudio"), result: fd.get("resultado"), author: currentUser.name
        });
    });
    handleForm("form-kine", (fd) => {
        currentPatient.clinicalData.kinesiologia.push({
            date: fd.get("fecha"), technique: fd.get("tecnica"), author: currentUser.name
        });
    });
     handleForm("form-odonto", (fd) => {
        currentPatient.clinicalData.odontologia.push({
            date: fd.get("fecha"), tooth: fd.get("pieza"), procedure: fd.get("practica"), author: currentUser.name
        });
    });
  
    function handleForm(id, callback) {
        const form = document.getElementById(id);
        form.addEventListener("submit", e => {
            e.preventDefault();
            if(!currentPatient) return alert("Error: Paciente no seleccionado");
            
            const fd = new FormData(form);
            callback(fd);
            
            form.reset();
            refreshClinicalData();
            alert("Registro guardado exitosamente en HSDU.");
        });
    }
  
    // --- SNOMED SEARCH SIMULATION ---
    function setupSnomed(inputId, selectId) {
        const input = document.getElementById(inputId);
        const select = document.getElementById(selectId);
        
        input.addEventListener("input", (e) => {
            const val = e.target.value.toLowerCase();
            select.innerHTML = "";
            const matches = snomedMock.filter(s => s.display.toLowerCase().includes(val));
            
            if(matches.length === 0 && val.length > 0) {
                 const opt = document.createElement("option");
                 opt.text = "Buscando en servidor terminológico...";
                 select.add(opt);
            }
            
            matches.forEach(m => {
                const opt = document.createElement("option");
                opt.value = m.code;
                opt.text = m.display;
                select.add(opt);
            });
        });
  
        // Al hacer click en check button, pasar texto del select al input
        const btn = input.nextElementSibling.nextElementSibling; // El boton
        btn.addEventListener("click", () => {
             if(select.selectedIndex >= 0) {
                 input.value = select.options[select.selectedIndex].text;
             }
        });
    }
  
    setupSnomed("snomed-search-amb", "snomed-results-amb");
    setupSnomed("snomed-search-int", "snomed-results-int");
  
    // --- ADMIN USERS ---
    function renderAdminUsers() {
        const list = document.getElementById("admin-user-list");
        list.innerHTML = "";
        userList.forEach((u, idx) => {
            list.innerHTML += `<li style="display:flex; justify-content:space-between; padding:10px; border-bottom:1px solid #eee;">
                <span><strong>${u.username}</strong> (${u.role})</span>
                <button class="btn btn-outline" onclick="alert('Funcionalidad demo')">Editar</button>
            </li>`;
        });
    }
  
    document.getElementById("admin-user-form").addEventListener("submit", (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        userList.push({
            username: fd.get("username"), role: fd.get("role"), name: "Usuario Nuevo", password: fd.get("password")
        });
        e.target.reset();
        renderAdminUsers();
    });
  
  })();