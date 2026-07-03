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
                    submitButton.textContent = 'Confirmar Asistencia';
                    submitButton.disabled = false;
                } else {
                    alert('Hubo un error al enviar. Por favor, intentá de nuevo.');
                    submitButton.textContent = 'Confirmar Asistencia';
                    submitButton.disabled = false;
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Ocurrió un error de conexión.');
                submitButton.textContent = 'Confirmar Asistencia';
                submitButton.disabled = false;
            });
        });
    }

    // ==========================================================================
    // 2. LÓGICA DEL RELOJ DE CUENTA REGRESIVA
    // ==========================================================================
    const weddingDate = new Date(2026, 9, 9, 18, 30, 0).getTime();

    const countdownTimer = setInterval(() => {
        const now = new Date().getTime();
        const distance = weddingDate - now;
        
        if (distance < 0) {
            clearInterval(countdownTimer);
            document.getElementById('days').textContent = '00';
            document.getElementById('hours').textContent = '00';
            document.getElementById('minutes').textContent = '00';
            document.getElementById('seconds').textContent = '00';
            return;
        }
        
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        document.getElementById('days').textContent = days.toString().padStart(2, '0');
        document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
        document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
        document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');

    }, 1000);

    // ==========================================================================
    // 3. LÓGICA DEL CARRUSEL AUTOMÁTICO
    // ==========================================================================
    const slides = document.querySelectorAll('.slide');
    let currentSlide = 0;
    const slideInterval = 4000;

    function nextSlide() {
        if (slides.length === 0) return;
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    }

    if (slides.length > 0) {
        setInterval(nextSlide, slideInterval);
    }
});