// Get hamburger menu button and nav menu elements
const hamburgerMenu = document.getElementById('hamburgerMenu');
const navMenu = document.getElementById('navMenu');
const body = document.body;

// Check if elements exist
if (!hamburgerMenu || !navMenu) {
    console.error('Menu elements not found. Check HTML IDs.');
} else {
    const navLinks = navMenu.querySelectorAll('a');

    // Function to close menu
    function closeMenu() {
        hamburgerMenu.classList.remove('active');
        navMenu.classList.remove('active');
        body.classList.remove('menu-open');
    }

    // Function to open menu
    function openMenu() {
        hamburgerMenu.classList.add('active');
        navMenu.classList.add('active');
        body.classList.add('menu-open');
    }

    // Toggle menu when hamburger button is clicked
    hamburgerMenu.addEventListener('click', function(e) {
        e.stopPropagation();
        if (navMenu.classList.contains('active')) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    // Close menu when a navigation link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            closeMenu();
        });
    });

    // Close menu when clicking outside of it
    document.addEventListener('click', function(event) {
        const isClickInsideNav = event.target.closest('.nav-menu');
        const isClickOnHamburger = event.target.closest('.hamburger-menu');
        
        // Close menu if click is outside both nav menu and hamburger button
        if (!isClickInsideNav && !isClickOnHamburger && navMenu.classList.contains('active')) {
            closeMenu();
        }
    });
}