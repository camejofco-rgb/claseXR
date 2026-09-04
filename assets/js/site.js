document.documentElement.classList.add('js');

(() => {
  const items = document.querySelectorAll('.premise, .object-section, .viewer-section, .system-intro, .principles article, .future-grid, .timeline, .gallery, .ar-section');
  items.forEach(el => el.classList.add('reveal'));
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    items.forEach(el => el.classList.add('is-visible'));
  } else {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: .08, rootMargin: '0px 0px -5% 0px' });
    items.forEach(el => io.observe(el));
  }
})();

(() => {
  const viewer = document.getElementById('hololinkAR');
  const status = document.getElementById('arStatus');
  const triggers = document.querySelectorAll('.ar-trigger');
  const quickLook = document.getElementById('quickLookFallback');

  if (!viewer || !status || !triggers.length) return;

  const ua = navigator.userAgent || '';
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isAndroid = /Android/i.test(ua);

  const setStatus = (message, state = '') => {
    status.textContent = message;
    status.dataset.state = state;
  };

  const modelViewerReady = () => customElements.get('model-viewer') && typeof viewer.activateAR === 'function';

  const updateCapabilityMessage = () => {
    if (!modelViewerReady()) {
      setStatus('El módulo de RA no pudo cargarse. El visor 3D del sitio sigue disponible.', 'warning');
      return;
    }

    if (viewer.canActivateAR) {
      if (isIOS) setStatus('Dispositivo compatible. Se abrirá Apple Quick Look con el modelo USDZ.', 'ready');
      else if (isAndroid) setStatus('Dispositivo compatible. Se usará WebXR o Google Scene Viewer con el modelo GLB.', 'ready');
      else setStatus('Este dispositivo informa soporte de realidad aumentada.', 'ready');
    } else if (isIOS) {
      setStatus('Puedes intentar abrir el modelo USDZ con Apple Quick Look.', 'info');
    } else if (isAndroid) {
      setStatus('La RA requiere un dispositivo Android compatible con ARCore/Scene Viewer. Puedes seguir explorando el modelo en 3D.', 'info');
    } else {
      setStatus('La RA móvil requiere un dispositivo compatible. En este equipo puedes explorar HoloLink en 3D.', 'info');
    }
  };

  const activateAR = async () => {
    if (modelViewerReady() && viewer.canActivateAR) {
      try {
        await viewer.activateAR();
        return;
      } catch (error) {
        console.warn('No se pudo iniciar RA desde model-viewer:', error);
      }
    }

    // Fallback fiable para iOS: Quick Look necesita un enlace rel="ar" real.
    if (isIOS && quickLook) {
      quickLook.click();
      return;
    }

    document.getElementById('ar')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    updateCapabilityMessage();
  };

  triggers.forEach(button => button.addEventListener('click', activateAR));

  viewer.addEventListener('load', updateCapabilityMessage);
  viewer.addEventListener('error', () => {
    setStatus('No se pudo cargar el modelo para RA. El resto del micrositio continúa funcionando.', 'warning');
  });
  viewer.addEventListener('ar-status', event => {
    if (event.detail?.status === 'failed') {
      setStatus('El dispositivo no pudo iniciar la sesión de RA. Prueba con Chrome en Android compatible o Safari en iPhone/iPad.', 'warning');
    }
  });

  if ('customElements' in window) {
    Promise.race([
      customElements.whenDefined('model-viewer'),
      new Promise(resolve => setTimeout(resolve, 5000))
    ]).then(updateCapabilityMessage);
  } else {
    setStatus('Este navegador no admite el componente de RA. El visor 3D sigue disponible.', 'warning');
  }
})();
