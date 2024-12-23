const admin = require("firebase-admin");

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
    const serviceAccount = require("./serviceAccountKey.json");
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://potluck-app-336bd-default-rtdb.firebaseio.com/",
    });
}

const db = admin.database();

exports.handler = async (event) => {
    if (event.httpMethod === "GET") {
        try {
            // Fetch all food items
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

            // Get the current food item
            const itemRef = db.ref(`foodItems/${id}`);
            const itemSnapshot = await itemRef.once("value");
            const itemData = itemSnapshot.val();

            if (!itemData) {
                return {
                    statusCode: 404,
                    body: JSON.stringify({ message: "Item not found" }),
                };
            }

            if (itemData.signedUp >= itemData.needed) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({ message: "All slots for this item are filled" }),
                };
            }

            // Increment the signedUp count
            await itemRef.update({ signedUp: itemData.signedUp + 1 });

            return {
                statusCode: 200,
                body: JSON.stringify({ message: "Signed up successfully" }),
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
