import { db } from "./firebase.js";

const products = [
  { id: "party-jollof-rice", name: "Party Jollof Rice", description: "Smoky Nigerian party jollof rice.", price: 4500, imageUrl: "/images/sign1.png", category: "Rice", rating: 4.8 },
  { id: "nigerian-fried-rice", name: "Nigerian Fried Rice", description: "Fried rice with vegetables and house seasoning.", price: 4000, imageUrl: "/images/sign2.png", category: "Rice", rating: 4.6 },
  { id: "grilled-chicken", name: "Grilled Chicken", description: "Seasoned chicken, grilled until tender.", price: 5000, imageUrl: "/images/sign3.png", category: "Proteins", rating: 4.7 },
  { id: "pounded-yam-and-egusi", name: "Pounded Yam and Egusi", description: "Pounded yam served with rich egusi soup.", price: 5500, imageUrl: "/images/sign4.png", category: "Swallow", rating: 4.5 },
  { id: "suya-platter", name: "Suya Platter", description: "Grilled suya with onions and fresh tomatoes.", price: 6500, imageUrl: "/images/sign5.png", category: "Platters", rating: 4.6 },
  { id: "pepper-soup", name: "Goat Meat Pepper Soup", description: "A warming pepper soup with goat meat.", price: 5000, imageUrl: "/images/sign6.png", category: "Soups", rating: 4.4 },
  { id: "chapman", name: "Chapman", description: "A chilled Nigerian fruit and bitters drink.", price: 1800, imageUrl: "/images/sign7.png", category: "Drinks", rating: 4.3 },
  { id: "puff-puff", name: "Puff Puff", description: "Soft, golden Nigerian puff puff.", price: 1500, imageUrl: "/images/sign8.png", category: "Snacks", rating: 4.2 },
];

const batch = db.batch();
for (const { id, ...product } of products) {
  batch.set(db.collection("products").doc(id), { ...product, available: true }, { merge: true });
}
await batch.commit();
console.log(`Seeded ${products.length} demo products. Update their prices and details for your restaurant.`);
process.exit(0);
