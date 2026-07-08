// ==========================================
// 🔑 CONFIGURACIÓN EXCLUSIVA DE CLOUDINARY
// ==========================================
const CLOUD_NAME = 'pd33pfq4'; 
const UPLOAD_PRESET = 'boda_preset'; 

// ==========================================================================
// 1. FUNCIONES GLOBALES DE NAVEGACIÓN Y VISOR (Accesibles por atributos onclick)
// ==========================================================================
function cambiarPestana(pestana) {
    // Control de botones activos en la barra superior
    document.getElementById('btn-inicio').classList.toggle('active', pestana === 'inicio');
    document.getElementById('btn-subir').classList.toggle('active', pestana === 'subir');
    document.getElementById('btn-galeria').classList.toggle('active', pestana === 'galeria');
    
    // Mostrar/Ocultar los bloques contenedores principales
    document.getElementById('seccion-inicio').classList.toggle('oculto', pestana !== 'inicio');
    document.getElementById('seccion-subir').classList.toggle('oculto', pestana !== 'subir');
    document.getElementById('seccion-galeria').classList.toggle('oculto', pestana !== 'galeria');
    
    // Renderizar la grilla optimizada al entrar al Muro
    if (pestana === 'galeria') {
        renderizarGaleria();
    }
}

function renderizarGaleria() {
    const contenedorGaleria = document.getElementById('contenedor-galeria');
    if (!contenedorGaleria) return;

    contenedorGaleria.innerHTML = '';
    const historialFotos = JSON.parse(localStorage.getItem('boda_fotos_urls')) || [];

    if (historialFotos.length === 0) {
        // Fix: Usamos la nueva clase CSS para que se centre en cualquier pantalla
        contenedorGaleria.innerHTML = `
            <p class="sin-fotos-alerta">
                Todavía nadie subió fotos en este dispositivo.<br>¡Sé el primero en compartir! 📸
            </p>`;
        return;
    }

    historialFotos.forEach(urlOriginal => {
        // Optimización Cloudinary al vuelo para miniaturas fluidas en móviles
        const urlOptimizada = urlOriginal.replace('/upload/', '/upload/w_300,c_scale,q_auto,f_auto/');

        const item = document.createElement('div');
        item.className = 'galeria-item';
        item.innerHTML = `<img src="${urlOptimizada}" alt="Foto Boda" loading="lazy">`;
        
        // Al interactuar, abre la imagen original en alta definición
        item.onclick = () => abrirVisor(urlOriginal);
        contenedorGaleria.appendChild(item);
    });
}

function abrirVisor(urlOriginal) {
    document.getElementById('modal-img').src = urlOriginal;
    document.getElementById('link-descarga').href = urlOriginal;
    document.getElementById('foto-modal').classList.remove('oculto');
}

function cerrarVisor() {
    document.getElementById('foto-modal').classList.add('oculto');
}

// ==========================================================================
// 2. INICIALIZACIÓN DE COMPONENTES DE LA INVITACIÓN (Al cargar el DOM)
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('wedding-form');
    const successMessage = document.getElementById('success-message');
    const rsvpHeader = document.getElementById('rsvp-header');
    
    // URL DE TU GOOGLE SCRIPT:
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwX-o1rKdV9iHUY9XDCVaS_YJpEQecLpFHakYoARofblexsZVl5Nl7FF69-RE47fvi7/exec';

    // 🌟 VALIDACIÓN DE UX: ¿Ya confirmó asistencia en este dispositivo?
    if (localStorage.getItem('wedding_rsvp_completed') === 'true') {
        if (rsvpHeader) rsvpHeader.style.display = 'none';
        if (form) form.style.display = 'none';
        if (successMessage) successMessage.style.display = 'block';
    }

    // ENVÍO DE DATOS A GOOGLE SHEETS EN SEGUNDO PLANO
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault(); 

            const submitButton = form.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;
            submitButton.textContent = 'Enviando...';
            submitButton.disabled = true;

            const formData = new FormData(form);

            fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.result === 'success') {
                    localStorage.setItem('wedding_rsvp_completed', 'true');

                    if (rsvpHeader) rsvpHeader.style.display = 'none';
                    form.style.display = 'none';
                    successMessage.style.display = 'block';
                    successMessage.scrollIntoView({ behavior: 'smooth' });
                } else if (data.message === 'already_exists') {
                    alert('Este nombre ya se encuentra registrado. Si te equivocaste, comunicate con los novios.');
                    submitButton.textContent = originalButtonText;
                    submitButton.disabled = false;
                } else {
                    alert('Hubo un error al enviar. Por favor, intentá de nuevo.');
                    submitButton.textContent = originalButtonText;
                    submitButton.disabled = false;
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Ocurrió un error de conexión.');
                submitButton.textContent = originalButtonText;
                submitButton.disabled = false;
            });
        });
    }

    // INTERCEPCIÓN Y SUBIDA DE IMÁGENES A CLOUDINARY (EN PARALELO)
    const fileInput = document.getElementById('fotos-input');
    const statusCarga = document.getElementById('status-carga');

    if (fileInput) {
        fileInput.addEventListener('change', async (e) => {
            const archivos = e.target.files;
            if (archivos.length === 0) return;

            statusCarga.innerHTML = `<span class="txt-loading">🔄 Subiendo ${archivos.length} archivo(s)...<br>Mantené esta pestaña abierta.</span>`;

            // Procesamiento asíncrono en lote utilizando Promesas
            const promesasSubida = Array.from(archivos).map(async (file) => {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('upload_preset', UPLOAD_PRESET);

                const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) throw new Error('Fallo en transferencia Cloudinary');
                
                const data = await response.json();
                return data.secure_url; 
            });

            try {
                const urlsSubidas = await Promise.all(promesasSubida);
                
                // Extraemos links viejos locales, sumamos los nuevos arriba (unshift) y salvamos estado
                let historialFotos = JSON.parse(localStorage.getItem('boda_fotos_urls')) || [];
                historialFotos = [...urlsSubidas, ...historialFotos];
                localStorage.setItem('boda_fotos_urls', JSON.stringify(historialFotos));

                statusCarga.innerHTML = `<span class="txt-success">🎉 ¡Subido con éxito!<br>Andá a la pestaña "Galería" para ver el muro. ❤️</span>`;
            } catch (error) {
                console.error('Error Cloudinary:', error);
                statusCarga.innerHTML = `<span class="txt-error">❌ Hubo un error al subir los archivos. Reintentá en unos instantes.</span>`;
            }

            fileInput.value = ''; // Blanqueamos el input
        });
    }

    // ==========================================================================
    // 3. LÓGICA DEL RELOJ DE CUENTA REGRESIVA
    // ==========================================================================
    const weddingDate = new Date(2026, 9, 9, 18, 30, 0).getTime();

    const countdownTimer = setInterval(() => {
        const now = new Date().getTime();
        const distance = weddingDate - now;
        
        const daysEl = document.getElementById('days');
        const hoursEl = document.getElementById('hours');
        const minutesEl = document.getElementById('minutes');
        const secondsEl = document.getElementById('seconds');

        if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

        if (distance < 0) {
            clearInterval(countdownTimer);
            daysEl.textContent = '00';
            hoursEl.textContent = '00';
            minutesEl.textContent = '00';
            secondsEl.textContent = '00';
            return;
        }
        
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        daysEl.textContent = days.toString().padStart(2, '0');
        hoursEl.textContent = hours.toString().padStart(2, '0');
        minutesEl.textContent = minutes.toString().padStart(2, '0');
        secondsEl.textContent = seconds.toString().padStart(2, '0');

    }, 1000);

    // ==========================================================================
    // 4. LÓGICA DEL CARRUSEL AUTOMÁTICO RESPONSIVE
    // ==========================================================================
    let currentSlide = 0;
    const slideInterval = 4000;

    function getVisibleSlides() {
        return Array.from(document.querySelectorAll('.slide')).filter(slide => {
            return window.getComputedStyle(slide).display !== 'none';
        });
    }

    function nextSlide() {
        const activeSlides = getVisibleSlides();
        
        if (activeSlides.length === 0) return;

        if (activeSlides[currentSlide]) {
            activeSlides[currentSlide].classList.remove('active');
        }
        
        currentSlide = (currentSlide + 1) % activeSlides.length;
        
        if (activeSlides[currentSlide]) {
            activeSlides[currentSlide].classList.add('active');
        }
    }

    setInterval(nextSlide, slideInterval);

    window.addEventListener('resize', () => {
        currentSlide = 0;
        const activeSlides = getVisibleSlides();
        document.querySelectorAll('.slide').forEach(s => s.classList.remove('active'));
        if (activeSlides[0]) {
            activeSlides[0].classList.add('active');
        }
    });
});