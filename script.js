document.addEventListener("DOMContentLoaded", function () {
	// Enhanced mobile navigation
	const navToggle = document.querySelector(".nav-toggle");
	const navMenu = document.querySelector(".nav-menu");
	const navLinks = document.querySelectorAll(".nav-link");
	const nav = document.querySelector(".nav");

	navToggle.addEventListener("click", () => {
		navMenu.classList.toggle("active");
		navToggle.classList.toggle("active");
		document.body.style.overflow = navMenu.classList.contains("active")
			? "hidden"
			: "";
	});

	navLinks.forEach((link, index) => {
		link.addEventListener("click", () => {
			navMenu.classList.remove("active");
			navToggle.classList.remove("active");
			document.body.style.overflow = "";
		});

		// Stagger animation for menu items
		link.style.transitionDelay = `${index * 0.1}s`;
	});

	// Enhanced smooth scrolling
	document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
		anchor.addEventListener("click", function (e) {
			e.preventDefault();
			const target = document.querySelector(this.getAttribute("href"));
			if (target) {
				const offsetTop = target.offsetTop - 80;
				window.scrollTo({
					top: offsetTop,
					behavior: "smooth",
				});
			}
		});
	});

	// Portfolio functionality with API integration
	const portfolioGrid = document.querySelector(".portfolio-grid");
	const filterBtns = document.querySelectorAll(".filter-btn");
	let currentImages = [];

	// Load images from API
	async function loadPortfolioImages() {
		try {
			const response = await fetch("/api/images");
			const images = await response.json();
			currentImages = images;
			createPortfolioItems(images);
		} catch (error) {
			console.error("Error loading images:", error);
			// Fallback to placeholder images if API fails
			currentImages = [
				{
					src: "https://picsum.photos/400/350?random=1",
					category: "Portrety",
					title: "Sesja Portretowa",
					description: "Naturalne wyrazy twarzy",
				},
				{
					src: "https://picsum.photos/400/350?random=2",
					category: "Krajobrazy",
					title: "Górski Widok",
					description: "Złota godzina w górach",
				},
				{
					src: "https://picsum.photos/400/350?random=3",
					category: "Wydarzenia",
					title: "Dzień Ślubu",
					description: "Wyjątkowe chwile",
				},
				{
					src: "https://picsum.photos/400/350?random=4",
					category: "Portrety",
					title: "Portret Studyjny",
					description: "Profesjonalne zdjęcia",
				},
				{
					src: "https://picsum.photos/400/350?random=5",
					category: "Krajobrazy",
					title: "Zachód nad Oceanem",
					description: "Fotografia wybrzeża",
				},
				{
					src: "https://picsum.photos/400/350?random=6",
					category: "Wydarzenia",
					title: "Wydarzenie Korporacyjne",
					description: "Profesjonalna relacja",
				},
				{
					src: "https://picsum.photos/400/350?random=7",
					category: "Portrety",
					title: "Portret Rodzinny",
					description: "Cenne rodzinne chwile",
				},
				{
					src: "https://picsum.photos/400/350?random=8",
					category: "Krajobrazy",
					title: "Ścieżka w Lesie",
					description: "Fotografia przyrodnicza",
				},
				{
					src: "https://picsum.photos/400/350?random=9",
					category: "Wydarzenia",
					title: "Fotografia Koncertowa",
					description: "Muzyczne momenty",
				},
			];
			createPortfolioItems(currentImages);
		}
	}

	function createPortfolioItems(items) {
		portfolioGrid.innerHTML = "";
		items.forEach((item, index) => {
			const portfolioItem = document.createElement("div");
			portfolioItem.className = `portfolio-item ${item.category}`;
			portfolioItem.innerHTML = `
                <img src="${item.src}" alt="${item.title}" loading="lazy">
                <div class="portfolio-overlay">
                    <div class="portfolio-info">
                        <h3>${item.title}</h3>
                        <p>${item.description}</p>
                    </div>
                </div>
            `;

			portfolioItem.addEventListener("click", () => {
				openImageModal(item.src, item.title);
			});

			portfolioGrid.appendChild(portfolioItem);

			// Enhanced stagger animation
			setTimeout(() => {
				portfolioItem.classList.add("visible");
			}, index * 150);
		});
	}

	// Enhanced filter functionality
	filterBtns.forEach((btn) => {
		btn.addEventListener("click", () => {
			const filter = btn.dataset.filter;

			filterBtns.forEach((b) => b.classList.remove("active"));
			btn.classList.add("active");

			const filteredItems =
				filter === "all"
					? currentImages
					: currentImages.filter((item) => item.category === filter);

			// Enhanced fade out animation
			const currentItems = document.querySelectorAll(".portfolio-item");
			currentItems.forEach((item, index) => {
				setTimeout(() => {
					item.style.opacity = "0";
					item.style.transform = "translateY(30px) scale(0.9)";
				}, index * 50);
			});

			setTimeout(() => {
				createPortfolioItems(filteredItems);
			}, currentItems.length * 50 + 200);
		});
	});

	// Initialize portfolio
	loadPortfolioImages();

	// Enhanced image modal
	const imageModal = document.querySelector(".image-modal");
	const modalImage = document.querySelector(".modal-image");
	const modalClose = document.querySelector(".modal-close");

	function openImageModal(src, alt) {
		modalImage.src = src;
		modalImage.alt = alt;
		imageModal.classList.add("active");
		document.body.style.overflow = "hidden";
	}

	function closeImageModal() {
		imageModal.classList.remove("active");
		document.body.style.overflow = "";
	}

	modalClose.addEventListener("click", closeImageModal);
	imageModal.addEventListener("click", (e) => {
		if (e.target === imageModal) {
			closeImageModal();
		}
	});

	document.addEventListener("keydown", (e) => {
		if (e.key === "Escape") {
			closeImageModal();
		}
	});

	// Enhanced intersection observer
	const observerOptions = {
		threshold: 0.1,
		rootMargin: "0px 0px -100px 0px",
	};

	const observer = new IntersectionObserver((entries) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				entry.target.classList.add("visible");

				// Special handling for skill items
				if (entry.target.classList.contains("about-skills")) {
					const skillItems =
						entry.target.querySelectorAll(".skill-item");
					skillItems.forEach((item, index) => {
						setTimeout(() => {
							item.classList.add("visible");
						}, index * 200);
					});
				}

				// Special handling for contact items
				if (entry.target.classList.contains("contact-info")) {
					const contactItems =
						entry.target.querySelectorAll(".contact-item");
					contactItems.forEach((item, index) => {
						setTimeout(() => {
							item.classList.add("visible");
						}, index * 200);
					});
				}

				// Special handling for about paragraphs
				if (entry.target.classList.contains("about-text")) {
					const paragraphs =
						entry.target.querySelectorAll(".about-paragraph");
					paragraphs.forEach((p, index) => {
						setTimeout(() => {
							p.classList.add("visible");
						}, index * 300);
					});
				}
			}
		});
	}, observerOptions);

	// Observe elements for animations
	document
		.querySelectorAll(
			".section-title, .about-text, .about-skills, .contact-info, .contact-form"
		)
		.forEach((el) => {
			observer.observe(el);
		});

	// Enhanced parallax and scroll effects
	let ticking = false;

	function updateScrollEffects() {
		const scrolled = window.pageYOffset;
		const hero = document.querySelector(".hero");
		const heroContent = document.querySelector(".hero-content");

		if (hero && heroContent) {
			const heroHeight = hero.offsetHeight;
			const scrollPercent = scrolled / heroHeight;

			if (scrollPercent <= 1) {
				heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
				heroContent.style.opacity = 1 - scrollPercent * 0.5;
			}
		}

		// Navigation background effect
		if (scrolled > 100) {
			nav.classList.add("scrolled");
		} else {
			nav.classList.remove("scrolled");
		}

		ticking = false;
	}

	window.addEventListener("scroll", () => {
		if (!ticking) {
			requestAnimationFrame(updateScrollEffects);
			ticking = true;
		}
	});

	// Enhanced form submission
	const contactForm = document.querySelector(".contact-form");
	contactForm.addEventListener("submit", (e) => {
		e.preventDefault();

		const button = e.target.querySelector("button");
		const originalText = button.querySelector("span").textContent;

		button.querySelector("span").textContent = "Wysyłanie...";
		button.disabled = true;

		// Simulate form submission
		setTimeout(() => {
			alert("Dziękuję za wiadomość! Skontaktuję się z Tobą wkrótce.");
			contactForm.reset();
			button.querySelector("span").textContent = originalText;
			button.disabled = false;
		}, 2000);
	});

	// Mouse cursor effects for portfolio items
	const portfolioItems = document.querySelectorAll(".portfolio-item");
	portfolioItems.forEach((item) => {
		item.addEventListener("mouseenter", (e) => {
			e.target.style.transform =
				"translateY(-10px) scale(1.02) rotateY(5deg)";
		});

		item.addEventListener("mouseleave", (e) => {
			e.target.style.transform = "translateY(0) scale(1) rotateY(0deg)";
		});
	});

	// Smooth scroll to top on logo click
	document.querySelector(".nav-logo").addEventListener("click", (e) => {
		e.preventDefault();
		window.scrollTo({
			top: 0,
			behavior: "smooth",
		});
	});

	// Hero scroll indicator click
	document.querySelector(".hero-scroll").addEventListener("click", () => {
		document.querySelector("#portfolio").scrollIntoView({
			behavior: "smooth",
		});
	});
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
	anchor.addEventListener("click", function (e) {
		e.preventDefault();

		const target = document.querySelector(this.getAttribute("href"));
		if (target) {
			target.scrollIntoView({
				behavior: "smooth",
				block: "start",
			});
		}
	});
});

// Mobile navigation toggle
const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector(".nav-menu");

navToggle.addEventListener("click", () => {
	navMenu.classList.toggle("active");
	navToggle.classList.toggle("active");
});

// Close mobile menu when clicking on a link
document.querySelectorAll(".nav-link").forEach((link) => {
	link.addEventListener("click", () => {
		navMenu.classList.remove("active");
		navToggle.classList.remove("active");
	});
});

// Navbar scroll effect
window.addEventListener("scroll", () => {
	const nav = document.querySelector(".nav");
	if (window.scrollY > 50) {
		nav.classList.add("scrolled");
	} else {
		nav.classList.remove("scrolled");
	}
});

// Variables for dynamic content
let allImages = [];
let categories = [];
let currentFilter = "all";

// Load categories from API
async function loadCategories() {
	try {
		console.log("Loading categories from API...");
		const response = await fetch("/api/categories");
		if (response.ok) {
			categories = await response.json();
			console.log("Categories loaded:", categories);
			setupPortfolioFilters();
		} else {
			console.error("Failed to load categories:", response.status);
			setupPortfolioFilters();
		}
	} catch (error) {
		console.error("Error loading categories:", error);
		// Fallback to default categories
		setupPortfolioFilters();
	}
}

// Setup portfolio filters dynamically
function setupPortfolioFilters() {
	const filtersContainer = document.querySelector(".portfolio-filters");
	if (!filtersContainer) return;

	// Clear existing filters
	filtersContainer.innerHTML = "";

	// Add "All" filter
	const allButton = document.createElement("button");
	allButton.className = "filter-btn active";
	allButton.setAttribute("data-filter", "all");
	allButton.textContent = "Wszystkie";
	filtersContainer.appendChild(allButton);

	// Add category filters
	categories.forEach((category) => {
		const button = document.createElement("button");
		button.className = "filter-btn";
		button.setAttribute("data-filter", category.key);
		button.textContent = category.name;
		filtersContainer.appendChild(button);
	});

	// Setup filter event listeners
	setupFilterListeners();
}

// Setup filter event listeners
function setupFilterListeners() {
	const filterButtons = document.querySelectorAll(".filter-btn");

	filterButtons.forEach((button) => {
		button.addEventListener("click", function () {
			// Remove active class from all buttons
			filterButtons.forEach((btn) => btn.classList.remove("active"));

			// Add active class to clicked button
			this.classList.add("active");

			// Get filter value
			const filter = this.getAttribute("data-filter");
			currentFilter = filter;

			// Filter and display images
			filterAndDisplayImages(filter);
		});
	});
}

// Load images from API
async function loadImages() {
	try {
		console.log("Loading images from API...");
		const response = await fetch("/api/images");
		if (response.ok) {
			allImages = await response.json();
			console.log("Images loaded:", allImages.length);
			filterAndDisplayImages(currentFilter);
		} else {
			console.error("Failed to load images:", response.status);
			displayNoImages();
		}
	} catch (error) {
		console.error("Error loading images:", error);
		displayNoImages();
	}
}

// Filter and display images
function filterAndDisplayImages(filter) {
	let imagesToShow = allImages;

	if (filter !== "all") {
		imagesToShow = allImages.filter((image) => image.category === filter);
	}

	displayImages(imagesToShow);
}

// Display images in the portfolio grid
function displayImages(images) {
	const portfolioGrid = document.querySelector(".portfolio-grid");
	if (!portfolioGrid) return;

	if (images.length === 0) {
		displayNoImages();
		return;
	}

	portfolioGrid.innerHTML = images
		.map(
			(image) => `
        <div class="portfolio-item" data-category="${image.category}">
            <img src="${image.src}" alt="${image.title}" loading="lazy">
            <div class="portfolio-overlay">
                <div class="portfolio-info">
                    <h3>${image.title}</h3>
                    <p>${getCategoryName(image.category)}</p>
                    ${
						image.description
							? `<span>${image.description}</span>`
							: ""
					}
                </div>
            </div>
        </div>
    `
		)
		.join("");

	// Add click handlers for lightbox
	setupImageClickHandlers();

	// Animate items in
	animatePortfolioItems();
}

// Display no images message
function displayNoImages() {
	const portfolioGrid = document.querySelector(".portfolio-grid");
	if (!portfolioGrid) return;

	portfolioGrid.innerHTML = `
        <div class="no-images">
            <p>Brak zdjęć w tej kategorii</p>
        </div>
    `;
}

// Get category name by key
function getCategoryName(categoryKey) {
	const category = categories.find((cat) => cat.key === categoryKey);
	return category ? category.name : categoryKey;
}

// Setup image click handlers for lightbox
function setupImageClickHandlers() {
	const portfolioItems = document.querySelectorAll(".portfolio-item");

	portfolioItems.forEach((item, index) => {
		item.addEventListener("click", () => {
			const img = item.querySelector("img");
			if (img) {
				openImageModal(img.src, img.alt, index);
			}
		});
	});
}

// Animate portfolio items
function animatePortfolioItems() {
	const items = document.querySelectorAll(".portfolio-item");

	items.forEach((item, index) => {
		item.style.opacity = "0";
		item.style.transform = "translateY(20px)";

		setTimeout(() => {
			item.style.transition = "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)";
			item.style.opacity = "1";
			item.style.transform = "translateY(0)";
		}, index * 100);
	});
}

// Image modal/lightbox functionality
const imageModal = document.querySelector(".image-modal");
const modalImage = document.querySelector(".modal-image");
const modalClose = document.querySelector(".modal-close");
const modalBg = document.querySelector(".modal-bg");

let currentImageIndex = 0;
let currentImages = [];

function openImageModal(src, alt, index = 0) {
	currentImageIndex = index;
	currentImages = Array.from(
		document.querySelectorAll(".portfolio-item img")
	);

	modalImage.src = src;
	modalImage.alt = alt;
	imageModal.classList.add("active");
	document.body.style.overflow = "hidden";
}

function closeImageModal() {
	imageModal.classList.remove("active");
	document.body.style.overflow = "";
}

// Modal event listeners
if (modalClose) {
	modalClose.addEventListener("click", closeImageModal);
}

if (modalBg) {
	modalBg.addEventListener("click", closeImageModal);
}

// Keyboard navigation for modal
document.addEventListener("keydown", (e) => {
	if (!imageModal.classList.contains("active")) return;

	if (e.key === "Escape") {
		closeImageModal();
	} else if (e.key === "ArrowLeft") {
		navigateModal(-1);
	} else if (e.key === "ArrowRight") {
		navigateModal(1);
	}
});

function navigateModal(direction) {
	currentImageIndex += direction;

	if (currentImageIndex < 0) {
		currentImageIndex = currentImages.length - 1;
	} else if (currentImageIndex >= currentImages.length) {
		currentImageIndex = 0;
	}

	const img = currentImages[currentImageIndex];
	modalImage.src = img.src;
	modalImage.alt = img.alt;
}

// Contact form handling
const contactForm = document.querySelector(".contact-form");
if (contactForm) {
	contactForm.addEventListener("submit", function (e) {
		e.preventDefault();

		// Get form data
		const formData = new FormData(this);
		const name =
			formData.get("name") ||
			this.querySelector('input[type="text"]').value;
		const email =
			formData.get("email") ||
			this.querySelector('input[type="email"]').value;
		const message =
			formData.get("message") || this.querySelector("textarea").value;

		// Simple validation
		if (!name || !email || !message) {
			alert("Proszę wypełnić wszystkie pola");
			return;
		}

		// Here you would typically send the data to your server
		// For now, we'll just show a success message
		alert("Dziękuję za wiadomość! Odpiszę wkrótce.");
		this.reset();
	});
}

// Intersection Observer for scroll animations
const observerOptions = {
	threshold: 0.1,
	rootMargin: "0px 0px -50px 0px",
};

const observer = new IntersectionObserver((entries) => {
	entries.forEach((entry) => {
		if (entry.isIntersecting) {
			entry.target.classList.add("animate");
		}
	});
}, observerOptions);

// Observe elements for scroll animations
document.addEventListener("DOMContentLoaded", () => {
	// Elements to animate on scroll
	const elementsToAnimate = document.querySelectorAll(
		".section-title, .about-text, .about-image, .contact-info, .contact-form"
	);

	elementsToAnimate.forEach((el) => {
		observer.observe(el);
	});
});

// Hero scroll indicator
const heroScroll = document.querySelector(".hero-scroll");
if (heroScroll) {
	heroScroll.addEventListener("click", () => {
		document.querySelector("#portfolio").scrollIntoView({
			behavior: "smooth",
		});
	});
}

// Initialize everything when DOM is loaded
document.addEventListener("DOMContentLoaded", async () => {
	console.log("DOM loaded, initializing main site...");

	// Load categories first, then images
	await loadCategories();
	await loadImages();

	console.log("Main site initialized successfully");
});
