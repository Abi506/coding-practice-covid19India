const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const app = express();
app.use(express.json());

let data = null;
const databaseandServerIntialization = async () => {
  let databasePath = path.join(__dirname, "covid19India.db");
  data = await open({
    filename: databasePath,
    driver: sqlite3.Database,
  });
  app.listen(3000, () => {
    console.log(`Server is running ${databasePath}`);
  });
};

const converDbObjectToResponseObject = (dbObject) => {
  return {
    stateId: dbObject.state_id,
    stateName: dbObject.state_name,
    population: dbObject.population,
  };
};

databaseandServerIntialization();

//get all states

app.get("/states/", async (request, response) => {
  const displayStatesQuery = `
    SELECT * FROM state
    `;
  const displayStatesArray = await data.all(displayStatesQuery);
  console.log(displayStatesArray);
  response.send(displayStatesArray.map(converDbObjectToResponseObject));
});

// get given state

app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const getStateDetailsQuery = `
    SELECT * FROM state
    WHERE state_id=${stateId};
    `;
  try {
    const getStateArray = await data.get(getStateDetailsQuery);
    response.send(
      getStateArray.map((state) => converDbObjectToResponseObject(state))
    );
    console.log(getStateArray);
  } catch (error) {
    console.log(error);
  }
});

module.exports = app;
