import { db } from "./firebase.js";

try {
  const products = await db.collection("products").limit(1).get();
  console.log(`Firebase authentication and Firestore access succeeded (${products.size} product found in the sample read).`);
} catch (error) {
  const message = String(error?.message ?? "");
  const code = error?.code ?? error?.name ?? "unknown";
  let hint = "Check that Cloud Firestore is enabled and the service account has Firestore access.";

  if (/invalid_grant|invalid signature|private key|invalid credential/i.test(message)) {
    hint = "The Firebase service-account credentials are invalid or expired.";
  } else if (/permission|forbidden|unauthorized|403/i.test(message)) {
    hint = "The service account is valid but does not have permission to read Firestore.";
  } else if (String(code) === "14" || /UNAVAILABLE|ENOTFOUND|ECONN|network|timeout|fetch failed/i.test(message)) {
    hint = "The API could not reach Firebase over the network.";
  }

  console.error(`Firebase connection failed (${code}). ${hint}`);
  process.exitCode = 1;
}
