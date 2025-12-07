import ApiClient from "./index.js";

(async function () {
  const c = new ApiClient();
  try {
    console.log("Contacting gateway at", c.base);
    const h = await c.health();
    console.log("Health:");
    console.log(JSON.stringify(h, null, 2));

    console.log("\nRequesting user list via gateway (/users):");
    const users = await c.listUsers();
    console.log(JSON.stringify(users, null, 2));
  } catch (err) {
    console.error("Demo error:", err);
    process.exitCode = 1;
  }
})();
