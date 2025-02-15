![HealthHubConnect UI](https://github.com/Ritik463/Health-Hub-Connect/raw/main/d8681d19-6853-4487-8292-0c72453e93b0.jpg)


npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
# OpenAI API Key for health assistance features
OPENAI_API_KEY=your_openai_api_key_here

# Session secret for Express session management (any random string)
SESSION_SECRET=your_session_secret_here

# Server port (optional, defaults to 5000)
PORT=5000
```

4. Start the development server:
```bash
npm run dev
```

The web application will be available at `http://localhost:5000`

### Mobile Application Setup

1. Navigate to the project root directory

2. Install Flutter dependencies:
```bash
flutter pub get
```

3. Run the app:
```bash
flutter run
```

## Usage

1. Web Application:
   - Open your browser and navigate to `http://localhost:5000`
   - Register for a new account or login
   - Access features from the dashboard

2. Mobile Application:
   - Launch the app on your emulator or device
   - Login or create a new account
   - Access all healthcare features through the mobile interface

## Features Guide

### Appointment Booking
- Browse available doctors
- Select preferred time slots
- Receive real-time notifications for appointments

### Health Assistant
- Describe your symptoms to get AI-powered health advice
- Request emergency services when needed
- Track your daily water intake

### Water Intake Tracking
- Log your daily water consumption
- Set reminders for regular water intake
- View your hydration history

## Environment Variables

Create a `.env` file with these variables:

```env
# OpenAI API Key for AI health assistant
OPENAI_API_KEY=your_openai_api_key_here

# Session secret (any random string)
SESSION_SECRET=your_session_secret_here

# Server port (optional)
PORT=5000
