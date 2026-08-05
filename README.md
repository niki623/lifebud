# 🌱 LifeBud

LifeBud is a personal life management app designed to help users reflect, organize, and preserve meaningful moments. Instead of focusing solely on productivity, LifeBud combines journaling, goal tracking, accomplishments, and collections into one space that encourages long-term personal growth.

## Features

### 📝 Life Log

* Create journal entries with optional titles and photos.
* Edit entries directly in place.
* Delete entries.
* Organize entries into collections.
* Feature selected entries on your profile.

### 🎯 Goals

* Create and manage personal goals.
* Mark goals as completed.
* Edit goals without leaving the page.
* Organize goals into collections.

### 🏆 Accomplishments

* Record achievements and milestones.
* Edit and delete accomplishments.
* Organize accomplishments into collections.

### 📚 Collections

* Group related entries, goals, and accomplishments.
* Rename or delete collections.
* View all items within a collection.

### 👤 Profile

* Customize your profile information.
* Upload a profile picture.
* Showcase featured journal entries.

## Technologies Used

* React
* JavaScript (ES6+)
* Firebase Authentication
* Cloud Firestore
* Firebase Storage
* CSS

## Screenshots

*Add screenshots here.*

## Installation

1. Clone the repository.

```bash
git clone https://github.com/yourusername/lifebud.git
```

2. Install dependencies.

```bash
npm install
```

3. Create a Firebase project and configure:

* Authentication
* Cloud Firestore
* Storage

4. Create a `.env` file and add your Firebase configuration.

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

5. Start the development server.

```bash
npm run dev
```

## Future Improvements

* Search across all content
* Timeline view
* Memory reminders ("On This Day")
* Rich text editor
* Export and backup options
* Improved profile dashboard
* Mobile responsiveness

## Motivation

LifeBud began as a personal project to explore React and Firebase while designing an application centered around reflection rather than social media. Throughout development, I focused on creating an editing experience that feels natural by allowing users to edit entries directly within the post instead of switching to separate forms.

## License

This project is for educational and portfolio purposes.
