document.addEventListener('DOMContentLoaded', () => {
    const guestsSelect = document.getElementById('guests-count');
    const guestsContainer = document.getElementById('dynamic-guests-container');
    const form = document.getElementById('wedding-form');
    
    // URL DE TU GOOGLE SCRIPT:
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwX-o1rKdV9iHUY9XDCVaS_YJpEQecLpFHakYoARofblexsZVl5Nl7FF69-RE47fvi7/exec';

    // 1. LÓGICA DINÁMICA DE ACOMPAÑANTES
    guestsSelect.addEventListener('change', (e) => {
        const count = parseInt(e.target.value);
        guestsContainer.innerHTML = '';

        if (count > 0) {
            const title = document.createElement('p');
            title.textContent = 'Datos de tus acompañantes:';
            title.className = 'form-label';
            title.style.color = 'var(--accent-color)';
            title.style.marginBottom = '15px';
            guestsContainer.appendChild(title);

            for (let i = 1; i <= count; i++) {
                const formGroup = document.createElement('div');
                formGroup.className = 'form-group';
                formGroup.style.paddingLeft = '15px';
                formGroup.style.borderLeft = '2px solid var(--border-color)';
                formGroup.style.marginBottom = '15px';

                formGroup.innerHTML = `
                    <label class="form-label" style="font-size: 0.7rem;">Acompañante #${i}</label>
                    <input type="text" name="guest_name_${i}" required placeholder="Nombre completo" class="form-input" style="margin-bottom: 10px;">
                    
                    <select name="guest_menu_${i}" class="form-select" style="font-size: 0.85rem; padding: 8px 12px;">
                        <option value="Tradicional">Menú Tradicional</option>
                        <option value="Vegetariano">Vegetariano / Vegano</option>
                        <option value="Celíaco">Celíaco (Sin TACC)</option>
                        <option value="Infantil">Menú Infantil</option>
                    </select>
                `;
                guestsContainer.appendChild(formGroup);
            }
        }
    });

    // 2. ENVÍO DE DATOS A GOOGLE SHEETS EN SEGUNDO PLANO
    form.addEventListener('submit', (e) => {
        e.preventDefault(); // Evitamos que la página se recargue

        const submitButton = form.querySelector('button[type="submit"]');
        const successMessage = document.getElementById('success-message');
        const rsvpHeader = document.getElementById('rsvp-header');

        submitButton.textContent = 'Enviando...';
        submitButton.disabled = true;

        // Capturamos todos los campos del formulario automáticamente
        const formData = new FormData(form);

        // Enviamos los datos a Google
        fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.result === 'success') {
                // Ocultamos el título y subtítulo de la sección
                if (rsvpHeader) rsvpHeader.style.display = 'none';

                // Ocultamos el formulario por completo
                form.style.display = 'none';
                
                // Mostramos la tarjeta blanca de agradecimiento
                successMessage.style.display = 'block';
                
                // Hace que la pantalla se acomode suavemente en el mensaje
                successMessage.scrollIntoView({ behavior: 'smooth' });
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

    // ==========================================================================
    // 3. LÓGICA DEL RELOJ DE CUENTA REGRESIVA
    // ==========================================================================
    const weddingDate = new Date(2026, 10, 14, 18, 30, 0).getTime();

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
});