// ============================================
// HAMBURGER MENU - jQuery Implementation
// ============================================

$(document).ready(function() {
    const $hamburgerMenu = $('#hamburgerMenu');
    const $navMenu = $('#navMenu');
    const $body = $('body');
    const $navLinks = $navMenu.find('a');

    // Function to close menu
    function closeMenu() {
        $hamburgerMenu.removeClass('active');
        $navMenu.removeClass('active');
        $body.removeClass('menu-open');
    }

    // Function to open menu
    function openMenu() {
        $hamburgerMenu.addClass('active');
        $navMenu.addClass('active');
        $body.addClass('menu-open');
    }

    // Toggle menu when hamburger button is clicked
    $hamburgerMenu.on('click', function(e) {
        e.stopPropagation();
        if ($navMenu.hasClass('active')) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    // Close menu when a navigation link is clicked
    $navLinks.on('click', function(e) {
        closeMenu();
    });

    // Close menu when clicking outside of it
    $(document).on('click', function(event) {
        const $clickTarget = $(event.target);
        const isClickInsideNav = $clickTarget.closest('.nav-menu').length > 0;
        const isClickOnHamburger = $clickTarget.closest('.hamburger-menu').length > 0;
        
        if (!isClickInsideNav && !isClickOnHamburger && $navMenu.hasClass('active')) {
            closeMenu();
        }
    });

    // ============================================
    // CAROUSEL - jQuery Implementation
    // ============================================
    
    const $productSlider = $('.product-slider');
    const $productCards = $('.product-card');
    const $leftArrow = $('.left-arrow');
    const $rightArrow = $('.right-arrow');
    const $slideCounter = $('.slide-counter');
    
    let currentIndex = 0;
    const totalCards = $productCards.length;
    
    // Determine visible cards based on screen width
    function getVisibleCards() {
        const screenWidth = $(window).width();
        if (screenWidth <= 768) {
            return 1; // Mobile: 1 card
        } else if (screenWidth <= 1024) {
            return 2; // Tablet: 2 cards
        }
        return 3; // Desktop: 3 cards
    }
    
    // Calculate card width dynamically
    function getCardWidth() {
        if ($productCards.length === 0) return 0;
        return $productCards.eq(0).outerWidth(true);
    }
    
    // Update slide counter display
    function updateSlideCounter() {
        const displayIndex = (currentIndex % totalCards) + 1;
        $slideCounter.text(`Showing ${displayIndex} of ${totalCards}`);
    }
    
    // Function to update scrollbar position based on carousel scroll
    function updateScrollbarPosition() {
        const $scrollBar = $('.scroll-bar');
        const sliderScrollLeft = $productSlider.scrollLeft();
        const sliderScrollWidth = $productSlider[0].scrollWidth;
        const sliderClientWidth = $productSlider[0].clientWidth;
        const maxScroll = sliderScrollWidth - sliderClientWidth;
        
        // Calculate percentage of scroll
        const scrollPercentage = maxScroll > 0 ? (sliderScrollLeft / maxScroll) * 100 : 0;
        
        // Move scrollbar: bar width is 33.333% (3 cards on desktop)
        // So maximum left position is 66.667%
        const maxScrollbarLeft = 66.667;
        const scrollbarLeft = (scrollPercentage / 100) * maxScrollbarLeft;
        
        $scrollBar.css('left', scrollbarLeft + '%');
    }
    
    // Scroll to current position
    function scrollToPosition() {
        const cardWidth = getCardWidth();
        const scrollAmount = currentIndex * cardWidth;
        
        $productSlider.animate({ 
            scrollLeft: scrollAmount 
        }, 600, 'swing', function() {
            updateSlideCounter();
            updateScrollbarPosition();
        });
    }
    
    // Next button functionality - infinite loop
    function nextSlide() {
        currentIndex = (currentIndex + 1) % totalCards;
        scrollToPosition();
    }
    
    // Previous button functionality - infinite loop with proper wrapping
    function prevSlide() {
        currentIndex = (currentIndex - 1 + totalCards) % totalCards;
        scrollToPosition();
    }
    
    // Click handlers for Previous/Next buttons
    $leftArrow.on('click', function() {
        stopAutoPlay();
        prevSlide();
        resumeAutoPlay();
    });
    
    $rightArrow.on('click', function() {
        stopAutoPlay();
        nextSlide();
        resumeAutoPlay();
    });
    
    // ============================================
    // AUTO-PLAY FUNCTIONALITY
    // ============================================
    
    let autoPlayInterval;
    const autoPlayDelay = 5000; // 5 seconds
    
    function startAutoPlay() {
        autoPlayInterval = setInterval(function() {
            nextSlide();
        }, autoPlayDelay);
    }
    
    function stopAutoPlay() {
        clearInterval(autoPlayInterval);
    }
    
    function resumeAutoPlay() {
        stopAutoPlay();
        startAutoPlay();
    }
    
    // ============================================
    // PAUSE ON HOVER - jQuery mouseenter/mouseleave
    // ============================================
    
    $productSlider.on('mouseenter', function() {
        stopAutoPlay();
    });
    
    $productSlider.on('mouseleave', function() {
        startAutoPlay();
    });
    
    // Update scrollbar on manual scroll and slide changes
    $productSlider.on('scroll', function() {
        updateScrollbarPosition();
    });
    
    // Handle responsive resize
    $(window).on('resize', function() {
        // Adjust carousel on resize if needed
        currentIndex = 0;
        scrollToPosition();
        updateScrollbarPosition();
    });
    
    // Initialize carousel
    updateSlideCounter();
    updateScrollbarPosition();
    startAutoPlay();

    // ============================================
    // BRIDAL CAROUSEL - jQuery Implementation
    // ============================================
    
    const $bridalGrid = $('.bridal-grid');
    const $bridalItems = $('.bridal-item');
    const $bridalLeftArrow = $('.bridal-left-arrow');
    const $bridalRightArrow = $('.bridal-right-arrow');
    const $bridalSlideCounter = $('.bridal-slide-counter');
    
    let bridalCurrentIndex = 0;
    const bridalTotalCards = $bridalItems.length;
    
    // Calculate card width dynamically for bridal carousel
    function getBridalCardWidth() {
        if ($bridalItems.length === 0) return 0;
        return $bridalItems.eq(0).outerWidth(true);
    }
    
    // Update bridal slide counter display
    function updateBridalSlideCounter() {
        const displayIndex = (bridalCurrentIndex % bridalTotalCards) + 1;
        $bridalSlideCounter.text(`Showing ${displayIndex} of ${bridalTotalCards}`);
    }
    
    // Function to update bridal scrollbar position
    function updateBridalScrollbarPosition() {
        const $bridalScrollBar = $('.bridal-scroll-bar');
        const gridScrollLeft = $bridalGrid.scrollLeft();
        const gridScrollWidth = $bridalGrid[0].scrollWidth;
        const gridClientWidth = $bridalGrid[0].clientWidth;
        const maxScroll = gridScrollWidth - gridClientWidth;
        
        // Calculate percentage of scroll
        const scrollPercentage = maxScroll > 0 ? (gridScrollLeft / maxScroll) * 100 : 0;
        
        // Move scrollbar: bar width is 33.333% (3 cards on desktop)
        const maxScrollbarLeft = 66.667;
        const scrollbarLeft = (scrollPercentage / 100) * maxScrollbarLeft;
        
        $bridalScrollBar.css('left', scrollbarLeft + '%');
    }
    
    // Scroll to current position for bridal carousel
    function bridalScrollToPosition() {
        const cardWidth = getBridalCardWidth();
        const scrollAmount = bridalCurrentIndex * cardWidth;
        
        $bridalGrid.animate({ 
            scrollLeft: scrollAmount 
        }, 600, 'swing', function() {
            updateBridalSlideCounter();
            updateBridalScrollbarPosition();
        });
    }
    
    // Next button functionality for bridal carousel - infinite loop
    function bridalNextSlide() {
        bridalCurrentIndex = (bridalCurrentIndex + 1) % bridalTotalCards;
        bridalScrollToPosition();
    }
    
    // Previous button functionality for bridal carousel - infinite loop
    function bridalPrevSlide() {
        bridalCurrentIndex = (bridalCurrentIndex - 1 + bridalTotalCards) % bridalTotalCards;
        bridalScrollToPosition();
    }
    
    // Click handlers for bridal carousel arrows
    $bridalLeftArrow.on('click', function() {
        bridalStopAutoPlay();
        bridalPrevSlide();
        bridalResumeAutoPlay();
    });
    
    $bridalRightArrow.on('click', function() {
        bridalStopAutoPlay();
        bridalNextSlide();
        bridalResumeAutoPlay();
    });
    
    // ============================================
    // BRIDAL AUTO-PLAY FUNCTIONALITY
    // ============================================
    
    let bridalAutoPlayInterval;
    const bridalAutoPlayDelay = 5000; // 5 seconds
    
    function bridalStartAutoPlay() {
        bridalAutoPlayInterval = setInterval(function() {
            bridalNextSlide();
        }, bridalAutoPlayDelay);
    }
    
    function bridalStopAutoPlay() {
        clearInterval(bridalAutoPlayInterval);
    }
    
    function bridalResumeAutoPlay() {
        bridalStopAutoPlay();
        bridalStartAutoPlay();
    }
    
    // ============================================
    // BRIDAL PAUSE ON HOVER
    // ============================================
    
    $bridalGrid.on('mouseenter', function() {
        bridalStopAutoPlay();
    });
    
    $bridalGrid.on('mouseleave', function() {
        bridalStartAutoPlay();
    });
    
    // Update bridal scrollbar on scroll
    $bridalGrid.on('scroll', function() {
        updateBridalScrollbarPosition();
    });
    
    // Initialize bridal carousel
    updateBridalSlideCounter();
    updateBridalScrollbarPosition();
    bridalStartAutoPlay();
});

