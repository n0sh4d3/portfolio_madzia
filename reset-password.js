const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const readline = require("readline");

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

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
			'Hasło musi zawierać co najmniej jeden znak specjalny (!@#$%^&*(),.?":{}|<>)'
		);
	}

	return {
		isValid: errors.length === 0,
		errors: errors,
	};
}

function askPassword() {
	return new Promise((resolve) => {
		rl.question("Wprowadź nowe hasło: ", (password) => {
			resolve(password);
		});
	});
}

function askConfirmPassword() {
	return new Promise((resolve) => {
		rl.question("Potwierdź nowe hasło: ", (password) => {
			resolve(password);
		});
	});
}

function askUsername() {
	return new Promise((resolve) => {
		rl.question(
			'Wprowadź nowy login (lub naciśnij Enter dla "admin"): ',
			(username) => {
				resolve(username || "admin");
			}
		);
	});
}

async function resetPassword() {
	console.log("\n🔐 Reset hasła administratora\n");

	try {
		// Połącz z bazą danych
		const db = new sqlite3.Database("portfolio.db");

		// Pobierz nowy login
		const newUsername = await askUsername();
		console.log(`\nLogin: ${newUsername}`);

		let password, confirmPassword;
		let passwordValid = false;

		while (!passwordValid) {
			password = await askPassword();
			confirmPassword = await askConfirmPassword();

			if (password !== confirmPassword) {
				console.log(
					"\n❌ Hasła nie są identyczne! Spróbuj ponownie.\n"
				);
				continue;
			}

			const validation = validatePassword(password);
			if (!validation.isValid) {
				console.log("\n❌ Hasło nie spełnia wymagań:");
				validation.errors.forEach((error) =>
					console.log(`   - ${error}`)
				);
				console.log("\nWymagania:");
				console.log("   ✓ Co najmniej 8 znaków");
				console.log("   ✓ Wielka litera (A-Z)");
				console.log("   ✓ Mała litera (a-z)");
				console.log("   ✓ Cyfra (0-9)");
				console.log('   ✓ Znak specjalny (!@#$%^&*(),.?":{}|<>)');
				console.log("");
				continue;
			}

			passwordValid = true;
		}

		// Zahashuj hasło
		const hashedPassword = bcrypt.hashSync(password, 10);

		// Sprawdź czy użytkownik istnieje
		db.get("SELECT * FROM users WHERE id = 1", (err, user) => {
			if (err) {
				console.error("❌ Błąd bazy danych:", err);
				process.exit(1);
			}

			if (user) {
				// Aktualizuj istniejącego użytkownika
				db.run(
					"UPDATE users SET username = ?, password = ? WHERE id = 1",
					[newUsername, hashedPassword],
					function (err) {
						if (err) {
							console.error("❌ Błąd podczas aktualizacji:", err);
							process.exit(1);
						}

						console.log(
							"\n✅ Hasło zostało pomyślnie zresetowane!"
						);
						console.log(`📝 Nowy login: ${newUsername}`);
						console.log(
							"🔗 Przejdź na: http://localhost:3000/admin"
						);
						console.log("\n");

						db.close();
						rl.close();
					}
				);
			} else {
				// Utwórz nowego użytkownika
				db.run(
					"INSERT INTO users (username, password) VALUES (?, ?)",
					[newUsername, hashedPassword],
					function (err) {
						if (err) {
							console.error(
								"❌ Błąd podczas tworzenia użytkownika:",
								err
							);
							process.exit(1);
						}

						console.log(
							"\n✅ Nowy administrator został utworzony!"
						);
						console.log(`📝 Login: ${newUsername}`);
						console.log(
							"🔗 Przejdź na: http://localhost:3000/admin"
						);
						console.log("\n");

						db.close();
						rl.close();
					}
				);
			}
		});
	} catch (error) {
		console.error("❌ Błąd:", error);
		process.exit(1);
	}
}

// Obsługa Ctrl+C
rl.on("SIGINT", () => {
	console.log("\n\n👋 Anulowano reset hasła.");
	process.exit(0);
});

// Uruchom reset
resetPassword();
