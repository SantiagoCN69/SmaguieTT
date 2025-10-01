document.addEventListener('DOMContentLoaded', function() {
    // Esperar 2 segundos antes de inicializar el zoom
    setTimeout(() => {
        const img = document.getElementById('producto-imagen');
        const zoom = document.getElementById('zoom');
        const zoomImg = zoom ? zoom.querySelector('img') : null;
        
        if (img && zoom && zoomImg) {

        function actualizarZoom() {
            zoomImg.src = img.src;
        }
        
        const observer = new MutationObserver(actualizarZoom);
        observer.observe(img, { attributes: true, attributeFilter: ['src'] });
        
        actualizarZoom();
        
        img.addEventListener('mouseenter', function() {
            zoom.style.display = 'block';
        });
        
        img.addEventListener('mouseleave', function() {
            zoom.style.display = 'none';
        });
        img.addEventListener('mousemove', function(e) {
            const rect = img.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const zoomX = (x / img.offsetWidth) * 100;
            const zoomY = (y / img.offsetHeight) * 100;
            
            zoomImg.style.transformOrigin = `${zoomX}% ${zoomY}%`;
            zoomImg.style.transform = 'scale(2)';
        });
        
        } else {
            console.error('No se encontraron los elementos necesarios para el zoom');
        }
    }, 1000); 
});
