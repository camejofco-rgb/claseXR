const container = document.getElementById('viewer3d');
const fallback = document.getElementById('viewerFallback');
const status = document.getElementById('viewerStatus');

function fail(message) {
  if (status) status.textContent = message;
  if (fallback) fallback.style.display = 'flex';
}

async function bootViewer() {
  if (!container) return;
  if (!window.WebGLRenderingContext && !window.WebGL2RenderingContext) {
    fail('Este navegador no ofrece WebGL. Mostrando referencia estática.');
    return;
  }
  try {
    const THREE = await import('https://esm.sh/three@0.180.0');
    const { GLTFLoader } = await import('https://esm.sh/three@0.180.0/examples/jsm/loaders/GLTFLoader.js');
    const { OrbitControls } = await import('https://esm.sh/three@0.180.0/examples/jsm/controls/OrbitControls.js');

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.01, 100);
    camera.position.set(2.8, 1.9, 3.4);

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch (e) {
      fail('WebGL no pudo inicializarse. Mostrando referencia estática.');
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.055;
    controls.enablePan = false;
    controls.minDistance = 1.1;
    controls.maxDistance = 8;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.55;
    let userInteracted = false;
    const stopAuto = () => { if (!userInteracted) { userInteracted = true; controls.autoRotate = false; } };
    controls.addEventListener('start', stopAuto);

    scene.add(new THREE.HemisphereLight(0xcfeeff, 0x1a1a22, 2.2));
    const key = new THREE.DirectionalLight(0xffffff, 4.2); key.position.set(3,4,5); scene.add(key);
    const fill = new THREE.DirectionalLight(0x79cfff, 2.0); fill.position.set(-4,1,2); scene.add(fill);
    const rim = new THREE.DirectionalLight(0xb8d7ff, 2.4); rim.position.set(0,3,-5); scene.add(rim);

    const loader = new GLTFLoader();
    loader.load('assets/models/hololink.glb', gltf => {
      const model = gltf.scene;
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      model.position.sub(center);
      const longest = Math.max(size.x, size.y, size.z) || 1;
      const targetSize = 2.25;
      const scale = targetSize / longest;
      model.scale.setScalar(scale);
      scene.add(model);

      const normalizedBox = new THREE.Box3().setFromObject(model);
      const sphere = normalizedBox.getBoundingSphere(new THREE.Sphere());
      const radius = Math.max(sphere.radius, .6);
      camera.near = Math.max(radius / 100, .01);
      camera.far = radius * 100;
      const dist = radius / Math.sin(THREE.MathUtils.degToRad(camera.fov / 2));
      camera.position.set(dist * .72, dist * .46, dist * .9);
      camera.lookAt(0, 0, 0);
      controls.target.set(0,0,0);
      controls.minDistance = radius * 1.35;
      controls.maxDistance = radius * 6;
      controls.update();
      camera.updateProjectionMatrix();

      if (fallback) fallback.style.display = 'none';
    }, xhr => {
      if (xhr.total && status) status.textContent = `Cargando modelo 3D · ${Math.round(xhr.loaded / xhr.total * 100)}%`;
    }, err => {
      console.warn('HoloLink GLB load failed', err);
      fail('El modelo 3D no pudo cargarse. La página continúa con la referencia visual.');
    });

    const resize = () => {
      const w = Math.max(container.clientWidth, 1);
      const h = Math.max(container.clientHeight, 1);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    let running = true;
    const observer = new IntersectionObserver(entries => { running = entries[0]?.isIntersecting ?? true; }, { threshold: 0 });
    observer.observe(container);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) resize(); });

    function animate() {
      requestAnimationFrame(animate);
      if (!running || document.hidden) return;
      controls.update();
      renderer.render(scene, camera);
    }
    animate();
  } catch (err) {
    console.warn('Three.js/CDN viewer unavailable', err);
    fail('El visor 3D no está disponible en este momento. El resto del sitio sigue funcionando.');
  }
}

bootViewer();
