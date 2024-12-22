const admin = require("firebase-admin");

// Correct path to serviceAccountKey.json
const serviceAccount = require("./serviceAccountKey.json");

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://potluck-app-336bd-default-rtdb.firebaseio.com/",
    });
}

const db = admin.database();

exports.handler = async (event) => {
    if (event.httpMethod === "GET") {
        try {
            // Fetch food items from Firebase Realtime Database
            const snapshot = await db.ref("foodItems").once("value");
            const foodItems = snapshot.val();

            return {
                statusCode: 200,
                body: JSON.stringify(foodItems),
            };
        } catch (error) {
            return {
                statusCode: 500,
                body: JSON.stringify({ message: "Error fetching data", error: error.message }),
            };
        }
    }

    if (event.httpMethod === "POST") {
        try {
            const { id } = JSON.parse(event.body);

            if (!id) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({ message: "Item ID is required" }),
                };
            }

            // Update item availability in Firebase
            await db.ref(`foodItems/${id}`).update({ available: false });

            return {
                statusCode: 200,
                body: JSON.stringify({ message: "Item updated successfully" }),
            };
        } catch (error) {
            return {
                statusCode: 500,
                body: JSON.stringify({ message: "Error updating item", error: error.message }),
            };
        }
    }

    return {
        statusCode: 405,
        body: JSON.stringify({ message: "Method Not Allowed" }),
    };
};
