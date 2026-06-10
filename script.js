document.addEventListener('DOMContentLoaded', () => {
    const guestsSelect = document.getElementById('guests-count');
    const guestsContainer = document.getElementById('dynamic-guests-container');
    const form = document.getElementById('wedding-form');
    
    // CAMBIA ESTO POR TU URL DE GOOGLE SCRIPT:
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwX-o1rKdV9iHUY9XDCVaS_YJpEQecLpFHakYoARofblexsZVl5Nl7FF69-RE47fvi7/exec';

    // 1. Lógica dinámica de acompañantes (la que ya tenías)
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

    // 2. NUEVA LÓGICA: Envío de datos a Google Sheets
    form.addEventListener('submit', (e) => {
        e.preventDefault(); // Evitamos que la página se recargue

        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.textContent = 'Enviando...';
        submitButton.disabled = true;

        // Capturamos todos los campos del formulario automáticamente
        const formData = new FormData(form);

        // Enviamos los datos a Google usando fetch
        fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.result === 'success') {
                alert('¡Gracias! Tu confirmación fue enviada con éxito.');
                form.reset(); // Limpiamos el formulario
                guestsContainer.innerHTML = ''; // Limpiamos los campos dinámicos
            } else {
                alert('Hubo un error al enviar. Por favor, intentá de nuevo.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Ocurrió un error de conexión.');
        })
        .finally(() => {
            submitButton.textContent = 'Confirmar Asistencia';
            submitButton.disabled = false;
        });
    });
    // ==========================================================================
// LÓGICA DEL RELOJ DE CUENTA REGRESIVA
// ==========================================================================

// 1. CONFIGURÁ ACÁ LA FECHA DE LA BODA (Año, Mes [0-11], Día, Hora, Minuto)
// Nota: En JavaScript los meses van de 0 a 11 (Enero es 0, Noviembre es 10)
const weddingDate = new Date(2026, 10, 14, 18, 30, 0).getTime();

const countdownTimer = setInterval(() => {
    // Obtenemos la fecha y hora exacta de este instante
    const now = new Date().getTime();
    
    // Calculamos la distancia / diferencia entre las dos fechas
    const distance = weddingDate - now;
    
    // Si la fecha ya pasó, frenamos el reloj
    if (distance < 0) {
        clearInterval(countdownTimer);
        document.getElementById('days').textContent = '00';
        document.getElementById('hours').textContent = '00';
        document.getElementById('minutes').textContent = '00';
        document.getElementById('seconds').textContent = '00';
        return;
    }
    
    // Cálculos matemáticos para transformar los milisegundos a Días, Horas, Minutos y Segundos
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    
    // Metemos los números en el HTML. 
    // Usamos .toString().padStart(2, '0') para que si el número es menor a 10, muestre un cero adelante (ej: '05' en vez de '5').
    document.getElementById('days').textContent = days.toString().padStart(2, '0');
    document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
    document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
    document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');

}, 1000); // El número 1000 significa que este bloque se ejecuta cada 1000 milisegundos (1 segundo)
});