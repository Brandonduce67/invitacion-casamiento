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

    // 1. ENVÍO DE DATOS A GOOGLE SHEETS EN SEGUNDO PLANO
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault(); // Evitamos que la página se recargue

            const submitButton = form.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;
            submitButton.textContent = 'Enviando...';
            submitButton.disabled = true;

            // Capturamos los campos actuales (Name, Attendance, Message) automáticamente
            const formData = new FormData(form);

            // Enviamos los datos a Google
            fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.result === 'success') {
                    // 🌟 GUARDAR ESTADO: Marcamos que este dispositivo ya completó el RSVP
                    localStorage.setItem('wedding_rsvp_completed', 'true');

                    if (rsvpHeader) rsvpHeader.style.display = 'none';
                    form.style.display = 'none';
                    successMessage.style.display = 'block';
                    successMessage.scrollIntoView({ behavior: 'smooth' });
                } else if (data.message === 'already_exists') {
                    // 🌟 VALIDACIÓN DESDE EL BACKEND
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

    // ==========================================================================
    // 2. LÓGICA DEL RELOJ DE CUENTA REGRESIVA
    // ==========================================================================
    // Nota: El objeto Date de JavaScript cuenta los meses de 0 a 11.
    // 9 representa Octubre (0=Enero, 1=Febrero, ..., 9=Octubre).
    const weddingDate = new Date(2026, 9, 9, 18, 30, 0).getTime();

    const countdownTimer = setInterval(() => {
        const now = new Date().getTime();
        const distance = weddingDate - now;
        
        // Elementos del DOM del contador
        const daysEl = document.getElementById('days');
        const hoursEl = document.getElementById('hours');
        const minutesEl = document.getElementById('minutes');
        const secondsEl = document.getElementById('seconds');

        // Si los elementos no existen en el HTML actual, salimos para evitar errores de consola
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
    // 3. LÓGICA DEL CARRUSEL AUTOMÁTICO RESPONSIVE (CORREGIDO)
    // ==========================================================================
    let currentSlide = 0;
    const slideInterval = 4000;

    // Función que filtra y devuelve solo las imágenes visibles en pantalla actualmente
    function getVisibleSlides() {
        return Array.from(document.querySelectorAll('.slide')).filter(slide => {
            // Revisa si el CSS lo está ocultando con display: none (!important)
            return window.getComputedStyle(slide).display !== 'none';
        });
    }

    function nextSlide() {
        const activeSlides = getVisibleSlides();
        
        if (activeSlides.length === 0) return;

        // Quitamos la clase 'active' al slide que la tenga dentro de los visibles
        if (activeSlides[currentSlide]) {
            activeSlides[currentSlide].classList.remove('active');
        }
        
        // Calculamos el siguiente índice de forma segura
        currentSlide = (currentSlide + 1) % activeSlides.length;
        
        // Le agregamos la clase 'active' al nuevo slide visible
        if (activeSlides[currentSlide]) {
            activeSlides[currentSlide].classList.add('active');
        }
    }

    // Ejecuta el bucle del carrusel cada 4 segundos
    setInterval(nextSlide, slideInterval);

    // Resetear el índice si el usuario cambia el tamaño de la pantalla para evitar desajustes entre PC y Celu
    window.addEventListener('resize', () => {
        currentSlide = 0;
        const activeSlides = getVisibleSlides();
        document.querySelectorAll('.slide').forEach(s => s.classList.remove('active'));
        if (activeSlides[0]) {
            activeSlides[0].classList.add('active');
        }
    });
});