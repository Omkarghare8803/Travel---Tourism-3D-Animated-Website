/* 
Project Name: Travel & Tourism 3D Animated Website
Project Owner/Auther: OG -> Omkar R. Ghare
Project Technologies: HTML, CSS & JS.
*/

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
    
    // Service Worker Registration
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/js/service-worker.js')
            .then(registration => {
                console.log('Service Worker registered successfully:', registration);
                // Check for updates periodically
                setInterval(() => {
                    registration.update();
                }, 3600000); // Check every hour
            })
            .catch(error => {
                console.log('Service Worker registration failed:', error);
            });
    }
    
    // Loader - Ensure proper visibility and fallback
    const loader = document.querySelector('.loader');
    const loaderTimeout = setTimeout(() => {
        if(loader) {
            loader.classList.add('hidden');
            console.log('✓ Preloader hidden successfully');
        }
        initAnimations();
    }, 2000);
    
    // Hide loader on page load if resources load faster
    window.addEventListener('load', () => {
        if(loader && !loader.classList.contains('hidden')) {
            loader.classList.add('hidden');
            clearTimeout(loaderTimeout);
            console.log('✓ Page loaded - Preloader hidden');
        }
    });

    // Enhanced Mobile Menu - State Management & Responsive
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    let mobileMenuOpen = false;

    if (hamburger && navLinks) {
        // Toggle menu on hamburger click
        hamburger.addEventListener('click', (e) => {
            e.stopPropagation();
            mobileMenuOpen = !mobileMenuOpen;
            
            if (mobileMenuOpen) {
                // Open menu
                navLinks.classList.add('active');
                hamburger.classList.add('active');
                console.log('✓ Mobile menu opened');
            } else {
                // Close menu
                navLinks.classList.remove('active');
                hamburger.classList.remove('active');
                console.log('✓ Mobile menu closed');
            }
        });
        
        // Close menu when clicking on nav links or button
        navLinks.querySelectorAll('a, .nav-btn-mobile button').forEach(element => {
            element.addEventListener('click', () => {
                mobileMenuOpen = false;
                navLinks.classList.remove('active');
                hamburger.classList.remove('active');
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (mobileMenuOpen && !hamburger.contains(e.target) && !navLinks.contains(e.target)) {
                mobileMenuOpen = false;
                navLinks.classList.remove('active');
                hamburger.classList.remove('active');
            }
        });
    }

    // Three.js Globe
    initGlobe();

    // Tilt Effect
    VanillaTilt.init(document.querySelectorAll("[data-tilt]"), {
        max: 15,
        speed: 400,
        glare: true,
        "max-glare": 0.2,
    });

    // Booking Tabs
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            // Logic to switch forms can be added here
        });
    });

    // 3D Hero Illustrator - Interactive Mouse Tracking & Tilt Effect
    const heroIllustrator = document.querySelector('.hero-illustrator');
    const heroIllustrationWrapper = document.querySelector('.hero-illustrator-wrapper');
    
    if (heroIllustrator && heroIllustrationWrapper) {
        let mouseX = 0;
        let mouseY = 0;
        let targetRotateX = 0;
        let targetRotateY = 0;
        let currentRotateX = 0;
        let currentRotateY = 0;
        
        // Track mouse movement for 3D tilt
        document.addEventListener('mousemove', (e) => {
            // Calculate mouse position relative to center (-1 to 1)
            mouseX = (e.clientX / window.innerWidth) * 2 - 1;
            mouseY = (e.clientY / window.innerHeight) * 2 - 1;
            
            // Calculate target rotation (subtle 3D tilt effect)
            targetRotateY = mouseX * 12; // Max 12 degrees on Y axis
            targetRotateX = -mouseY * 12; // Max 12 degrees on X axis (inverted for natural feel)
        });
        
        // Reset rotation on mouse leave
        document.addEventListener('mouseleave', () => {
            targetRotateX = 0;
            targetRotateY = 0;
        });
        
        // Smooth animation to target rotation (lerp effect)
        const animateRotation = () => {
            // Smooth interpolation (lerp) for smooth transitions
            currentRotateX += (targetRotateX - currentRotateX) * 0.1;
            currentRotateY += (targetRotateY - currentRotateY) * 0.1;
            
            // Apply 3D perspective transform
            heroIllustrator.style.transform = `perspective(1200px) rotateX(${currentRotateX}deg) rotateY(${currentRotateY}deg) scale(1)`;
            
            requestAnimationFrame(animateRotation);
        };
        animateRotation();
        
        console.log('✓ 3D Hero Illustrator interactive mouse tracking enabled');
    }
});

/* Globe initialization function (DISABLED - replaced with 3D hero illustrator)
function initGlobe() {
    const container = document.getElementById('globe-container');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Globe Group
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // Wireframe Sphere
    const geometry = new THREE.IcosahedronGeometry(10, 2);
    const material = new THREE.MeshBasicMaterial({ 
        color: 0x1f4068, 
        wireframe: true,
        transparent: true,
        opacity: 0.3
    });
    const sphere = new THREE.Mesh(geometry, material);
    globeGroup.add(sphere);

    // Points Sphere (Stars/Cities)
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1000;
    const posArray = new Float32Array(particlesCount * 3);

    for(let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 25;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.05,
        color: 0xd4af37,
        transparent: true,
        opacity: 0.8
    });
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    globeGroup.add(particlesMesh);

    // Atmosphere Glow
    const atmosphereGeometry = new THREE.SphereGeometry(10, 50, 50);
    const atmosphereMaterial = new THREE.ShaderMaterial({
        vertexShader: `
            varying vec3 vNormal;
            void main() {
                vNormal = normalize(normalMatrix * normal);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            varying vec3 vNormal;
            void main() {
                float intensity = pow(0.6 - dot(vNormal, vec3(0, 0, 1.0)), 2.0);
                gl_FragColor = vec4(0.06, 0.2, 0.38, 1.0) * intensity;
            }
        `,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide
    });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    atmosphere.scale.set(1.2, 1.2, 1.2);
    scene.add(atmosphere);

    // Orbiting Plane/Satellite
    const planeGeometry = new THREE.ConeGeometry(0.2, 0.8, 8);
    const planeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    const planeGroup = new THREE.Group();
    planeGroup.add(plane);
    scene.add(planeGroup);
    
    plane.position.set(12, 0, 0);
    plane.rotation.z = -Math.PI / 2;

    camera.position.z = 20;

    // Animation Loop
    function animate() {
        requestAnimationFrame(animate);
        
        sphere.rotation.y += 0.002;
        particlesMesh.rotation.y += 0.001;
        
        // Rotate Plane
        planeGroup.rotation.y -= 0.01;
        planeGroup.rotation.z += 0.005;
        
        renderer.render(scene, camera);
    }
    animate();

    // Handle Resize
    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
}
*/

function initAnimations() {
    gsap.registerPlugin(ScrollTrigger);

    // Hero Animation
    const tl = gsap.timeline();
    tl.from('.hero-title', {
        y: 100,
        opacity: 0,
        duration: 1,
        ease: 'power4.out'
    })
    .from('.hero-subtitle', {
        y: 50,
        opacity: 0,
        duration: 1,
        ease: 'power3.out'
    }, '-=0.5')
    .from('.hero-btns', {
        y: 50,
        opacity: 0,
        duration: 1,
        ease: 'power3.out'
    }, '-=0.5')
    .from('.nav-links li', {
        y: -20,
        opacity: 0,
        stagger: 0.1,
        duration: 0.8
    }, '-=1');

    // Scroll Animations
    
    // Destinations
    gsap.from('.dest-card', {
        scrollTrigger: {
            trigger: '.destinations',
            start: 'top 80%',
        },
        y: 100,
        opacity: 0,
        stagger: 0.2,
        duration: 1,
        ease: 'power3.out'
    });

    // Parallax Section
    gsap.to('.parallax-bg', {
        scrollTrigger: {
            trigger: '.parallax-section',
            start: 'top bottom',
            end: 'bottom top',
            scrub: true
        },
        y: '20%'
    });

    // Packages
    gsap.from('.package-card', {
        scrollTrigger: {
            trigger: '.packages',
            start: 'top 80%',
        },
        y: 100,
        opacity: 0,
        stagger: 0.2,
        duration: 1,
        ease: 'power3.out'
    });

    // Gallery
    gsap.from('.gallery-item', {
        scrollTrigger: {
            trigger: '.gallery',
            start: 'top 80%',
        },
        scale: 0.8,
        opacity: 0,
        stagger: 0.1,
        duration: 0.8,
        ease: 'back.out(1.7)'
    });

    // Reviews
    gsap.from('.review-card', {
        scrollTrigger: {
            trigger: '.reviews',
            start: 'top 80%',
        },
        y: 50,
        opacity: 0,
        stagger: 0.2,
        duration: 1,
        ease: 'power3.out'
    });

    // Blogs
    gsap.from('.blog-card', {
        scrollTrigger: {
            trigger: '.blogs',
            start: 'top 80%',
        },
        y: 50,
        opacity: 0,
        stagger: 0.2,
        duration: 1,
        ease: 'power3.out'
    });

    // Why Choose Us Section
    gsap.from('.feature-card', {
        scrollTrigger: {
            trigger: '.why-us',
            start: 'top 80%',
        },
        y: 80,
        opacity: 0,
        stagger: 0.15,
        duration: 0.8,
        ease: 'back.out(1.5)'
    });

    // Special Offers Section
    gsap.from('.offer-card', {
        scrollTrigger: {
            trigger: '.special-offers',
            start: 'top 80%',
        },
        x: -50,
        opacity: 0,
        stagger: 0.2,
        duration: 1,
        ease: 'power3.out'
    });

    // Team Section
    gsap.from('.team-card', {
        scrollTrigger: {
            trigger: '.team',
            start: 'top 80%',
        },
        y: 100,
        opacity: 0,
        stagger: 0.15,
        duration: 0.9,
        ease: 'power3.out'
    });

    // Contact Section
    gsap.from('.contact-form', {
        scrollTrigger: {
            trigger: '.contact',
            start: 'top 80%',
        },
        x: 50,
        opacity: 0,
        duration: 1,
        ease: 'power3.out'
    });

    gsap.from('.info-card', {
        scrollTrigger: {
            trigger: '.contact',
            start: 'top 80%',
        },
        x: -50,
        opacity: 0,
        stagger: 0.15,
        duration: 1,
        ease: 'power3.out'
    });

    // Number Counter Animation
    const counterElements = document.querySelectorAll('[data-counter]');
    if(counterElements.length > 0) {
        counterElements.forEach(element => {
            const target = parseInt(element.getAttribute('data-counter'));
            gsap.to(element, {
                scrollTrigger: {
                    trigger: element.parentElement,
                    start: 'top 80%',
                },
                textContent: target,
                duration: 2,
                ease: 'power2.out',
                snap: { textContent: 1 }
            });
        });
    }
}

// Form Submission Handler
function initFormHandler() {
    const contactForm = document.querySelector('.contact-form');
    if(contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Thank you for reaching out! We will get back to you soon.');
            this.reset();
        });
    }
}

// Smooth Scroll Enhancement
function enhanceSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if(target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

// Initialize on Page Load
window.addEventListener('load', () => {
    initFormHandler();
    enhanceSmoothScroll();
});
