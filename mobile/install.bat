@echo off
echo Installation de l'application mobile Otaku App
echo ================================================

:: Verification de Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js n'est pas installe. Veuillez l'installer d'abord.
    pause
    exit /b 1
)

:: Verification de npm
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo npm n'est pas installe. Veuillez l'installer d'abord.
    pause
    exit /b 1
)

echo Node.js et npm detectes

:: Installation d'Expo CLI globalement
echo Installation d'Expo CLI...
npm install -g @expo/cli

:: Installation des dependances du projet
echo Installation des dependances du projet...
npm install --force

:: Creation du fichier .env s'il n'existe pas
if not exist .env (
    echo Creation du fichier de configuration .env...
    (
        echo # Configuration de l'API
        echo API_BASE_URL=http://localhost:5000/api
        echo.
        echo # Autres configurations
        echo APP_NAME=Otaku App
        echo APP_VERSION=1.0.0
    ) > .env
    echo Fichier .env cree avec la configuration par defaut
)

echo.
echo Installation terminee!
echo.
echo Pour lancer l'application:
echo   npm start
echo.
echo Pour scanner le QR code:
echo   1. Installez 'Expo Go' sur votre telephone
echo   2. Scannez le QR code qui apparaitra
echo   3. L'app s'ouvrira automatiquement
echo.
echo Configuration:
echo   - Modifiez l'URL de l'API dans .env si necessaire
echo   - Assurez-vous que votre serveur web fonctionne
echo.
pause