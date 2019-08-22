const neo4jDriver = require("neo4j-driver");
const {
  generateReturnStatements,
  generateChangePwStatement
} = require("./generate-queries.helpers");

const neo4j = neo4jDriver.v1;

const USERNAME = "test";
const PASSWORD = "test";
const BOLT_URL = "bolt://localhost";

function createDriver(u, p, url) {
  try {
    const driver = neo4j.driver(url, neo4j.auth.basic(u, p));
    return driver;
  } catch (e) {
    console.error(`Could not connect driver`);
    return null;
  }
}

async function runQ(driver, query, params = {}, name) {
  const session = driver.session();
  try {
    const res = await session.run(query, params);
    session.close();
    return res;
  } catch (e) {
    session.close();
    console.error(
      `[${name}] Query "${query}" with params "${JSON.stringify(
        params
      )}" failed with`,
      e
    );
    return null;
  }
}

function sendStatments(name, statements, driver) {
  statements.forEach((statement, i) => {
    runQ(driver, statement.query, statement.parameters, name).then(res => {
      console.log("-------------------------------------");
      console.log(
        `[${name}] Executed [${i}] "${statement.query}" "${JSON.stringify(
          statement.parameters
        )}"`
      );
    });
  });
}

async function main() {
  // Generate simple statements
  const statements = [...generateReturnStatements(20)];

  // Init and connect driver
  const driver = createDriver(USERNAME, PASSWORD, BOLT_URL);
  if (!driver) {
    return;
  }

  // Start with a change password statement.
  // This run async, no waiting for it to come back
  sendStatments("Change password", [generateChangePwStatement()], driver);

  // Send a batch of statements
  // These run async, no waiting for each to come back
  sendStatments("Queries", statements, driver);

  // Wait
  await new Promise(resolve => setTimeout(() => resolve(), 2000));

  // Restore password to original
  console.log("Restoring password");
  await runQ(driver, "CALL dbms.security.changePassword($password)", {
    password: PASSWORD
  });

  // Close driver
  driver.close();
}

main();
