const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // I'll check if this exists or use a simpler way

// Actually, I can't easily use admin SDK without the key.
// I'll try to find where the courses are stored by looking at the fetch logic in other pages.

// Let's check EnrolledCourses.jsx to see where it gets the course data from.
