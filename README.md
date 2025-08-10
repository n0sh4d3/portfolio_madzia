# Madzia Photography Portfolio

Kompletny system portfolio fotograficznego z panelem administracyjnym.

## Instalacja

1. **Zainstaluj Node.js** (wersja 14 lub nowsza)

2. **Zainstaluj zależności:**

```bash
npm install
```

3. **Uruchom serwer:**

```bash
npm start
```

lub w trybie deweloperskim:

```bash
npm run dev
```

4. **Otwórz w przeglądarce:**
    - Strona główna: http://localhost:3000
    - Panel administracyjny: http://localhost:3000/admin

## Domyślne dane logowania

**Nazwa użytkownika:** admin  
**Hasło:** admin123

⚠️ **KRYTYCZNE:** Natychmiast zmień login i hasło po pierwszym zalogowaniu!

## Rozwiązywanie problemów z portem

Jeśli widzisz błąd `EADDRINUSE: address already in use :::3000`:

### Szybkie rozwiązanie:

```bash
# Zabij proces na porcie 3000
npm run kill-port

# Lub uruchom na innym porcie
npm run start:3001  # Port 3001
npm run start:3002  # Port 3002

# Lub ustaw własny port
PORT=8080 npm start
```

## 🔐 Reset hasła administratora

Jeśli zapomniałeś hasła lub chcesz je zresetować:

```bash
npm run reset-password
```

Skrypt przeprowadzi Cię przez proces:

1. **Wprowadź nowy login** (lub naciśnij Enter dla "admin")
2. **Ustaw nowe hasło** spełniające wymagania bezpieczeństwa:
    - Co najmniej 8 znaków
    - Wielka litera (A-Z)
    - Mała litera (a-z)
    - Cyfra (0-9)
    - Znak specjalny (!@#$%^&\*(),.?":{}|<>)
3. **Potwierdź hasło**
4. **Gotowe!** - możesz się zalogować nowymi danymi

### Przykład użycia:

```bash
~/portfolio ❯ npm run reset-password

🔐 Reset hasła administratora

Wprowadź nowy login (lub naciśnij Enter dla "admin"): madzia_admin
Login: madzia_admin

Wprowadź nowe hasło: MoneBezpieczneHaslo123!
Potwierdź nowe hasło: MoneBezpieczneHaslo123!

✅ Hasło zostało pomyślnie zresetowane!
📝 Nowy login: madzia_admin
🔗 Przejdź na: http://localhost:3000/admin
```

## Funkcje

### Strona główna

-   ✅ Responsywny design (mobile-first)
-   ✅ Animacje i przejścia
-   ✅ Dynamiczne ładowanie zdjęć z bazy danych
-   ✅ Filtrowanie kategorii
-   ✅ Modal do przeglądania zdjęć
-   ✅ Sekcja kontaktowa

### Panel administracyjny

-   ✅ Elegancki design w stylu landing page
-   ✅ Bezpieczne logowanie
-   ✅ **Zmiana hasła** - bezpiecznie przez panel admin
-   ✅ **Zarządzanie kategoriami** - dodawanie, edycja, usuwanie
-   ✅ Dodawanie nowych zdjęć
-   ✅ Automatyczna optymalizacja obrazów
-   ✅ Edycja informacji o zdjęciach
-   ✅ Usuwanie zdjęć
-   ✅ Kategoryzacja z niestandardowymi kategoriami
-   ✅ Statystyki z podziałem na kategorie
-   ✅ Filtrowanie i wyszukiwanie
-   ✅ Podgląd strony głównej
-   ✅ Responsywny design
-   ✅ Animowane tło

## Nowe funkcje v2.0

### Zarządzanie kategoriami

-   **Dodawanie kategorii**: Twórz własne kategorie (tylko nazwa po polsku)
-   **Edycja kategorii**: Modyfikuj nazwy istniejących kategorii
-   **Usuwanie kategorii**: Usuń niepotrzebne kategorie (z zabezpieczeniem przed usunięciem używanych)
-   **Kolorowe identyfikatory**: Każda kategoria ma przypisany kolor

### Bezpieczeństwo i zarządzanie kontem

-   **Zmiana loginu**: Bezpieczna zmiana nazwy użytkownika
-   **Zmiana hasła**: Z silną polityką haseł
-   **Walidacja loginów**: Minimum 3 znaki, tylko bezpieczne znaki
-   **Silna polityka haseł**:
    -   Minimum 8 znaków
    -   Wielka litera
    -   Mała litera
    -   Cyfra
    -   Znak specjalny
-   **Wizualny wskaźnik siły hasła**: Real-time sprawdzanie wymagań
-   **Szyfrowanie**: Hasła szyfrowane bcrypt

### Ulepszony design panelu admin

-   **Glassmorphism**: Nowoczesny efekt szkła z rozmyciem tła
-   **Animowane tło**: Subtelne animacje floating elementów
-   **Responsywny layout**: Idealnie dopasowany do wszystkich urządzeń
-   **Jednolity styl**: Spójny z designem strony głównej

## Struktura plików

```
portfolio/
├── server.js              # Główny plik serwera
├── package.json           # Konfiguracja Node.js
├── portfolio.db           # Baza danych SQLite (tworzona automatycznie)
├── index.html             # Strona główna
├── admin.html             # Panel administracyjny
├── styles.css             # Style CSS
├── script.js              # JavaScript strony głównej
├── uploads/               # Folder na przesłane zdjęcia
└── README.md              # Ten plik
```

## API Endpoints

### Publiczne

-   `GET /` - Strona główna
-   `GET /api/images` - Lista wszystkich zdjęć
-   `GET /api/images?category=portrait` - Zdjęcia z kategorii
-   `GET /api/categories` - Lista kategorii

### Wymagające autoryzacji

-   `POST /api/login` - Logowanie
-   `POST /api/logout` - Wylogowanie
-   `GET /api/auth/check` - Sprawdzenie autoryzacji
-   `GET /api/user` - Informacje o użytkowniku
-   `POST /api/change-username` - Zmiana loginu
-   `POST /api/change-password` - Zmiana hasła
-   `POST /api/images/upload` - Przesyłanie zdjęć
-   `PUT /api/images/:id` - Edycja zdjęcia
-   `DELETE /api/images/:id` - Usunięcie zdjęcia
-   `GET /api/stats` - Statystyki
-   `POST /api/categories` - Dodawanie kategorii
-   `PUT /api/categories/:key` - Edycja kategorii
-   `DELETE /api/categories/:key` - Usuwanie kategorii

## Domyślne kategorie

1. **Portrety** - Zdjęcia portretowe
2. **Krajobrazy** - Fotografia krajobrazowa
3. **Wydarzenia** - Eventy i uroczystości

_Możesz dodać własne kategorie przez panel administracyjny!_

## Bezpieczeństwo

-   **Silna polityka haseł** z walidacją w czasie rzeczywistym
-   **Bezpieczne loginy** z walidacją znaków
-   Hasła są szyfrowane za pomocą bcrypt
-   Sesje użytkowników z timeoutem
-   Walidacja plików (tylko JPEG, PNG, WebP)
-   Limit rozmiaru pliku (10MB)
-   Automatyczna optymalizacja obrazów
-   Zabezpieczenie przed usunięciem używanych kategorii
-   **Wymuszona zmiana domyślnych danych logowania**

## Instrukcja dla klienta

### Logowanie do panelu

1. Przejdź na adres: **twoja-domena.com/admin**
2. Zaloguj się danymi: **admin** / **admin123**
3. **Zmień hasło**: Kliknij "Zmień hasło" w prawym górnym rogu

### Zmiana hasła

1. Po zalogowaniu kliknij przycisk "Zmień hasło"
2. Wprowadź obecne hasło
3. Wprowadź nowe hasło (minimum 6 znaków)
4. Potwierdź nowe hasło
5. Kliknij "Zmień hasło"

### Zarządzanie kategoriami

1. W sekcji "Zarządzaj kategoriami" możesz:
    - **Dodać nową kategorię**: Kliknij "Dodaj kategorię" i wprowadź nazwę po polsku
    - **Edytować**: Kliknij "Edytuj" przy kategorii
    - **Usunąć**: Kliknij "Usuń" (możliwe tylko gdy żadne zdjęcie nie używa tej kategorii)

### Dodawanie zdjęć

1. W sekcji "Dodaj nowe zdjęcie":
    - Przeciągnij plik lub kliknij, aby wybrać
    - Wypełnij tytuł (wymagane)
    - Dodaj opis (opcjonalnie)
    - Wybierz kategorię
    - Kliknij "Dodaj zdjęcie"

### Zarządzanie zdjęciami

1. W sekcji "Zarządzaj zdjęciami":
    - Filtruj po kategorii
    - Edytuj informacje o zdjęciu
    - Usuń niepotrzebne zdjęcia

## Konfiguracja produkcyjna

1. **Zmień klucz sesji** w `server.js`:

```javascript
secret: "twoj-unikalny-klucz-sesji";
```

2. **Ustaw PORT** jako zmienną środowiskową:

```bash
export PORT=8080
```

3. **Backup bazy danych:**

```bash
cp portfolio.db portfolio_backup.db
```

## Hosting

### Heroku

1. Zainstaluj Heroku CLI
2. `heroku create nazwa-aplikacji`
3. `git push heroku main`

### VPS/Serwer dedykowany

1. Zainstaluj Node.js na serwerze
2. Prześlij pliki
3. `npm install --production`
4. Użyj PM2 do zarządzania procesem:

```bash
npm install -g pm2
pm2 start server.js --name "madzia-portfolio"
pm2 startup
pm2 save
```

## Troubleshooting

### Zapomniałem hasła do panelu admin

```bash
npm run reset-password
```

Skrypt automatycznie przeprowadzi reset hasła z nowymi wymaganiami bezpieczeństwa.

### Port jest zajęty (EADDRINUSE)

```bash
# Sprawdź co używa portu 3000
lsof -i:3000

# Zabij proces na porcie 3000
npm run kill-port

# Lub uruchom na innym porcie
PORT=3001 npm start
```

### Błąd "Cannot find module"

```bash
rm -rf node_modules
npm install
```

### Problemy z uprawnieniami do plików

```bash
chmod 755 uploads/
```

### Baza danych jest zablokowana

Restartuj serwer:

```bash
npm start
```

## Wsparcie

W razie problemów:

1. Sprawdź logi w konsoli
2. Sprawdź czy wszystkie zależności są zainstalowane
3. Sprawdź uprawnienia do folderów
4. **Sprawdź czy port nie jest zajęty** - użyj `npm run check-port`

**GRATULACJE! 🎉**  
Teraz klient ma pełną kontrolę nad swoim portfolio z najwyższymi standardami bezpieczeństwa!
