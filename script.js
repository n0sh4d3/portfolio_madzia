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
