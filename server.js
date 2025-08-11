const express = require("express");
const multer = require("multer");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const session = require("express-session");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname)); // Serve static files from root directory
app.use("/uploads", express.static("uploads"));

app.use(
	session({
		secret: "madzia-secret-key-change-this-in-production",
		resave: false,
		saveUninitialized: false,
		cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }, // 24 hours
	})
);

// Database setup
const db = new sqlite3.Database("portfolio.db");

// Initialize database
db.serialize(() => {
	// Users table
	db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

	// Categories table
	db.run(`CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        sort_order INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

	// Images table
	db.run(`CREATE TABLE IF NOT EXISTS images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT NOT NULL,
        original_name TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

	// Create default admin user (password: admin123)
	const hashedPassword = bcrypt.hashSync("admin123", 10);
	db.run(`INSERT OR IGNORE INTO users (username, password) VALUES (?, ?)`, [
		"admin",
		hashedPassword,
	]);

	// Insert default categories
	const defaultCategories = [];

	defaultCategories.forEach((cat, index) => {
		db.run(
			`INSERT OR IGNORE INTO categories (key, name, sort_order) VALUES (?, ?, ?)`,
			[cat.key, cat.name, cat.sort_order]
		);
	});
});

// Create uploads directory
if (!fs.existsSync("uploads")) {
	fs.mkdirSync("uploads");
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "uploads/");
	},
	filename: (req, file, cb) => {
		const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
		cb(null, uniqueSuffix + path.extname(file.originalname));
	},
});

const upload = multer({
	storage: storage,
	limits: {
		fileSize: 10 * 1024 * 1024, // 10MB limit
	},
	fileFilter: (req, file, cb) => {
		const allowedTypes = /jpeg|jpg|png|webp/;
		const extname = allowedTypes.test(
			path.extname(file.originalname).toLowerCase()
		);
		const mimetype = allowedTypes.test(file.mimetype);

		if (mimetype && extname) {
			return cb(null, true);
		} else {
			cb(
				new Error(
					"Tylko pliki graficzne są dozwolone (JPEG, JPG, PNG, WebP)"
				)
			);
		}
	},
});

// Authentication middleware
const requireAuth = (req, res, next) => {
	if (req.session.userId) {
		next();
	} else {
		res.status(401).json({ error: "Unauthorized" });
	}
};

// Password strength validation
function validatePassword(password) {
	const minLength = 8;
	const hasUpperCase = /[A-Z]/.test(password);
	const hasLowerCase = /[a-z]/.test(password);
	const hasNumbers = /\d/.test(password);
	const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

	const errors = [];

	if (password.length < minLength) {
		errors.push(`Hasło musi mieć co najmniej ${minLength} znaków`);
	}
	if (!hasUpperCase) {
		errors.push("Hasło musi zawierać co najmniej jedną wielką literę");
	}
	if (!hasLowerCase) {
		errors.push("Hasło musi zawierać co najmniej jedną małą literę");
	}
	if (!hasNumbers) {
		errors.push("Hasło musi zawierać co najmniej jedną cyfrę");
	}
	if (!hasSpecialChar) {
		errors.push(
			'Hasło musi zawierać co najmniej jeden znak specjalny (!@#$%^&*(),.?":{}|<>'
		);
	}

	return {
		isValid: errors.length === 0,
		errors: errors,
	};
}

// Routes

// Serve main page
app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "index.html"));
});

// Serve admin page
app.get("/admin", (req, res) => {
	res.sendFile(path.join(__dirname, "admin.html"));
});

// API Routes

// Login
app.post("/api/login", (req, res) => {
	const { username, password } = req.body;

	db.get(
		"SELECT * FROM users WHERE username = ?",
		[username],
		(err, user) => {
			if (err) {
				return res.status(500).json({ error: "Database error" });
			}

			if (!user || !bcrypt.compareSync(password, user.password)) {
				return res
					.status(401)
					.json({ error: "Nieprawidłowe dane logowania" });
			}

			req.session.userId = user.id;
			res.json({ success: true, message: "Zalogowano pomyślnie" });
		}
	);
});

// Logout
app.post("/api/logout", (req, res) => {
	req.session.destroy();
	res.json({ success: true, message: "Wylogowano pomyślnie" });
});

// Check auth status
app.get("/api/auth/check", (req, res) => {
	res.json({ authenticated: !!req.session.userId });
});

// Get all images
app.get("/api/images", (req, res) => {
	const { category } = req.query;
	let query = "SELECT * FROM images ORDER BY created_at DESC";
	let params = [];

	if (category && category !== "all") {
		query =
			"SELECT * FROM images WHERE category = ? ORDER BY created_at DESC";
		params = [category];
	}

	db.all(query, params, (err, images) => {
		if (err) {
			return res.status(500).json({ error: "Database error" });
		}

		const imagesWithUrls = images.map((img) => ({
			...img,
			src: `/uploads/${img.filename}`,
		}));

		res.json(imagesWithUrls);
	});
});

// Upload image
app.post(
	"/api/images/upload",
	requireAuth,
	upload.single("image"),
	async (req, res) => {
		try {
			if (!req.file) {
				return res.status(400).json({ error: "Nie wybrano pliku" });
			}

			const { title, description, category } = req.body;

			if (!title || !category) {
				return res
					.status(400)
					.json({ error: "Tytuł i kategoria są wymagane" });
			}

			// Check if category exists
			db.get(
				"SELECT * FROM categories WHERE key = ?",
				[category],
				async (err, cat) => {
					if (err) {
						return res
							.status(500)
							.json({ error: "Database error" });
					}

					if (!cat) {
						return res
							.status(400)
							.json({ error: "Kategoria nie istnieje" });
					}

					try {
						// Optimize image with Sharp
						const optimizedFilename = "opt_" + req.file.filename;
						await sharp(req.file.path)
							.resize(1200, 1200, {
								fit: "inside",
								withoutEnlargement: true,
							})
							.jpeg({ quality: 85 })
							.toFile(path.join("uploads", optimizedFilename));

						// Remove original file
						fs.unlinkSync(req.file.path);

						// Save to database
						db.run(
							"INSERT INTO images (filename, original_name, title, description, category) VALUES (?, ?, ?, ?, ?)",
							[
								optimizedFilename,
								req.file.originalname,
								title,
								description,
								category,
							],
							function (err) {
								if (err) {
									return res
										.status(500)
										.json({ error: "Database error" });
								}

								res.json({
									success: true,
									message: "Zdjęcie zostało dodane pomyślnie",
									image: {
										id: this.lastID,
										filename: optimizedFilename,
										title,
										description,
										category,
										src: `/uploads/${optimizedFilename}`,
									},
								});
							}
						);
					} catch (error) {
						console.error("Image processing error:", error);
						res.status(500).json({
							error: "Błąd podczas przetwarzania zdjęcia",
						});
					}
				}
			);
		} catch (error) {
			console.error("Upload error:", error);
			res.status(500).json({
				error: "Błąd podczas przetwarzania zdjęcia",
			});
		}
	}
);

// Delete image
app.delete("/api/images/:id", requireAuth, (req, res) => {
	const imageId = req.params.id;

	// First get the image to delete the file
	db.get(
		"SELECT filename FROM images WHERE id = ?",
		[imageId],
		(err, image) => {
			if (err) {
				return res.status(500).json({ error: "Database error" });
			}

			if (!image) {
				return res
					.status(404)
					.json({ error: "Zdjęcie nie zostało znalezione" });
			}

			// Delete from database
			db.run("DELETE FROM images WHERE id = ?", [imageId], (err) => {
				if (err) {
					return res.status(500).json({ error: "Database error" });
				}

				// Delete file
				const filePath = path.join("uploads", image.filename);
				if (fs.existsSync(filePath)) {
					fs.unlinkSync(filePath);
				}

				res.json({
					success: true,
					message: "Zdjęcie zostało usunięte",
				});
			});
		}
	);
});

// Update image
app.put("/api/images/:id", requireAuth, (req, res) => {
	const imageId = req.params.id;
	const { title, description, category } = req.body;

	if (!title || !category) {
		return res.status(400).json({ error: "Tytuł i kategoria są wymagane" });
	}

	// Check if category exists
	db.get("SELECT * FROM categories WHERE key = ?", [category], (err, cat) => {
		if (err) {
			return res.status(500).json({ error: "Database error" });
		}

		if (!cat) {
			return res.status(400).json({ error: "Kategoria nie istnieje" });
		}

		db.run(
			"UPDATE images SET title = ?, description = ?, category = ? WHERE id = ?",
			[title, description, category, imageId],
			function (err) {
				if (err) {
					return res.status(500).json({ error: "Database error" });
				}

				if (this.changes === 0) {
					return res
						.status(404)
						.json({ error: "Zdjęcie nie zostało znalezione" });
				}

				res.json({
					success: true,
					message: "Zdjęcie zostało zaktualizowane",
				});
			}
		);
	});
});

// Get image statistics
app.get("/api/stats", requireAuth, (req, res) => {
	db.all(
		`
        SELECT 
            category,
            COUNT(*) as count
        FROM images 
        GROUP BY category
    `,
		(err, stats) => {
			if (err) {
				return res.status(500).json({ error: "Database error" });
			}

			db.get("SELECT COUNT(*) as total FROM images", (err, total) => {
				if (err) {
					return res.status(500).json({ error: "Database error" });
				}

				res.json({
					totalImages: total.total,
					byCategory: stats,
				});
			});
		}
	);
});

// Get categories - Now from database!
app.get("/api/categories", (req, res) => {
	db.all(
		"SELECT * FROM categories ORDER BY sort_order, name",
		(err, categories) => {
			if (err) {
				console.error("Database error:", err);
				return res.status(500).json({ error: "Database error" });
			}

			res.json(categories);
		}
	);
});

// Add category - Now saves to database!
app.post("/api/categories", requireAuth, (req, res) => {
	const { name } = req.body;

	if (!name || !name.trim()) {
		return res.status(400).json({ error: "Nazwa kategorii jest wymagana" });
	}

	const trimmedName = name.trim();
	const key = trimmedName; // Use name as key for simplicity

	// Check if category already exists
	db.get(
		"SELECT * FROM categories WHERE key = ? OR name = ?",
		[key, trimmedName],
		(err, existing) => {
			if (err) {
				return res.status(500).json({ error: "Database error" });
			}

			if (existing) {
				return res.status(400).json({
					error: "Kategoria o tej nazwie już istnieje",
				});
			}

			// Get the highest sort_order to add new category at the end
			db.get(
				"SELECT MAX(sort_order) as max_order FROM categories",
				(err, result) => {
					if (err) {
						return res
							.status(500)
							.json({ error: "Database error" });
					}

					const sortOrder = (result.max_order || 0) + 1;

					db.run(
						"INSERT INTO categories (key, name, sort_order) VALUES (?, ?, ?)",
						[key, trimmedName, sortOrder],
						function (err) {
							if (err) {
								console.error("Insert error:", err);
								return res
									.status(500)
									.json({ error: "Database error" });
							}

							res.json({
								success: true,
								message: "Kategoria została dodana",
								category: {
									id: this.lastID,
									key: key,
									name: trimmedName,
									sort_order: sortOrder,
								},
							});
						}
					);
				}
			);
		}
	);
});

// Update category - Now updates database!
app.put("/api/categories/:key", requireAuth, (req, res) => {
	const { key } = req.params;
	const { name } = req.body;

	if (!name || !name.trim()) {
		return res.status(400).json({ error: "Nazwa kategorii jest wymagana" });
	}

	const trimmedName = name.trim();

	// Check if the new name already exists (but not for the current category)
	db.get(
		"SELECT * FROM categories WHERE name = ? AND key != ?",
		[trimmedName, key],
		(err, existing) => {
			if (err) {
				return res.status(500).json({ error: "Database error" });
			}

			if (existing) {
				return res.status(400).json({
					error: "Kategoria o tej nazwie już istnieje",
				});
			}

			// Update the category
			db.run(
				"UPDATE categories SET name = ?, key = ? WHERE key = ?",
				[trimmedName, trimmedName, key],
				function (err) {
					if (err) {
						console.error("Update error:", err);
						return res
							.status(500)
							.json({ error: "Database error" });
					}

					if (this.changes === 0) {
						return res.status(404).json({
							error: "Kategoria nie została znaleziona",
						});
					}

					// Also update any images that use this category
					db.run(
						"UPDATE images SET category = ? WHERE category = ?",
						[trimmedName, key],
						(err) => {
							if (err) {
								console.error("Update images error:", err);
								// Don't fail the request, just log the error
							}

							res.json({
								success: true,
								message: "Kategoria została zaktualizowana",
								category: {
									key: trimmedName,
									name: trimmedName,
								},
							});
						}
					);
				}
			);
		}
	);
});

// Delete category - Now deletes from database!
app.delete("/api/categories/:key", requireAuth, (req, res) => {
	const { key } = req.params;

	// Check if any images use this category
	db.get(
		"SELECT COUNT(*) as count FROM images WHERE category = ?",
		[key],
		(err, result) => {
			if (err) {
				return res.status(500).json({ error: "Database error" });
			}

			if (result.count > 0) {
				return res.status(400).json({
					error: `Nie można usunąć kategorii. ${result.count} zdjęć używa tej kategorii.`,
				});
			}

			// Delete the category
			db.run(
				"DELETE FROM categories WHERE key = ?",
				[key],
				function (err) {
					if (err) {
						console.error("Delete error:", err);
						return res
							.status(500)
							.json({ error: "Database error" });
					}

					if (this.changes === 0) {
						return res.status(404).json({
							error: "Kategoria nie została znaleziona",
						});
					}

					res.json({
						success: true,
						message: "Kategoria została usunięta",
					});
				}
			);
		}
	);
});

// Change password endpoint
app.post("/api/change-password", requireAuth, (req, res) => {
	const { currentPassword, newPassword } = req.body;

	if (!currentPassword || !newPassword) {
		return res
			.status(400)
			.json({ error: "Obecne i nowe hasło są wymagane" });
	}

	// Validate password strength
	const passwordValidation = validatePassword(newPassword);
	if (!passwordValidation.isValid) {
		return res.status(400).json({
			error: "Hasło nie spełnia wymagań bezpieczeństwa",
			details: passwordValidation.errors,
		});
	}

	// Get current user
	db.get(
		"SELECT * FROM users WHERE id = ?",
		[req.session.userId],
		(err, user) => {
			if (err) {
				return res.status(500).json({ error: "Database error" });
			}

			if (!user || !bcrypt.compareSync(currentPassword, user.password)) {
				return res
					.status(401)
					.json({ error: "Obecne hasło jest nieprawidłowe" });
			}

			// Hash new password
			const hashedNewPassword = bcrypt.hashSync(newPassword, 10);

			// Update password
			db.run(
				"UPDATE users SET password = ? WHERE id = ?",
				[hashedNewPassword, req.session.userId],
				function (err) {
					if (err) {
						return res
							.status(500)
							.json({ error: "Database error" });
					}

					res.json({
						success: true,
						message: "Hasło zostało zmienione pomyślnie",
					});
				}
			);
		}
	);
});

// Change username endpoint
app.post("/api/change-username", requireAuth, (req, res) => {
	const { currentPassword, newUsername } = req.body;

	if (!currentPassword || !newUsername) {
		return res
			.status(400)
			.json({ error: "Obecne hasło i nowy login są wymagane" });
	}

	if (newUsername.length < 3) {
		return res
			.status(400)
			.json({ error: "Login musi mieć co najmniej 3 znaki" });
	}

	if (!/^[a-zA-Z0-9_-]+$/.test(newUsername)) {
		return res
			.status(400)
			.json({ error: "Login może zawierać tylko litery, cyfry, _ i -" });
	}

	// Get current user
	db.get(
		"SELECT * FROM users WHERE id = ?",
		[req.session.userId],
		(err, user) => {
			if (err) {
				return res.status(500).json({ error: "Database error" });
			}

			if (!user || !bcrypt.compareSync(currentPassword, user.password)) {
				return res
					.status(401)
					.json({ error: "Obecne hasło jest nieprawidłowe" });
			}

			// Check if username already exists
			db.get(
				"SELECT * FROM users WHERE username = ? AND id != ?",
				[newUsername, req.session.userId],
				(err, existingUser) => {
					if (err) {
						return res
							.status(500)
							.json({ error: "Database error" });
					}

					if (existingUser) {
						return res
							.status(400)
							.json({ error: "Ten login jest już zajęty" });
					}

					// Update username
					db.run(
						"UPDATE users SET username = ? WHERE id = ?",
						[newUsername, req.session.userId],
						function (err) {
							if (err) {
								return res
									.status(500)
									.json({ error: "Database error" });
							}

							res.json({
								success: true,
								message: "Login został zmieniony pomyślnie",
								newUsername: newUsername,
							});
						}
					);
				}
			);
		}
	);
});

// Get current user info
app.get("/api/user", requireAuth, (req, res) => {
	db.get(
		"SELECT id, username, created_at FROM users WHERE id = ?",
		[req.session.userId],
		(err, user) => {
			if (err) {
				return res.status(500).json({ error: "Database error" });
			}

			if (!user) {
				return res
					.status(404)
					.json({ error: "Użytkownik nie został znaleziony" });
			}

			res.json(user);
		}
	);
});

// Error handling
app.use((error, req, res, next) => {
	if (error instanceof multer.MulterError) {
		if (error.code === "LIMIT_FILE_SIZE") {
			return res
				.status(400)
				.json({ error: "Plik jest za duży (maksymalnie 10MB)" });
		}
	}
	res.status(500).json({ error: error.message });
});

// Start server
const server = app.listen(PORT, (err) => {
	if (err) {
		console.error("Error starting server:", err);
		process.exit(1);
	}
	console.log(`Server running on http://localhost:${PORT}`);
	console.log(`Admin panel: http://localhost:${PORT}/admin`);
	console.log("Default login - Username: admin, Password: admin123");
});

server.on("error", (err) => {
	if (err.code === "EADDRINUSE") {
		console.log(`\n❌ Port ${PORT} is already in use!`);
		console.log("\n🔧 Solutions:");
		console.log(`   1. Kill the process using port ${PORT}:`);
		console.log(`      lsof -ti:${PORT} | xargs kill -9`);
		console.log(`   2. Use a different port:`);
		console.log(`      PORT=3001 npm start`);
		console.log(`   3. Find what's using the port:`);
		console.log(`      lsof -i:${PORT}`);
		console.log("\n");
		process.exit(1);
	} else {
		console.error("Server error:", err);
		process.exit(1);
	}
});
