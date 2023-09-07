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
const getStateNameInResponsive = (each) => {
  return {
    stateId: each.state_id,
    stateName: each.state_name,
    population: each.population,
  };
};

app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const getStateQuery = `
    SELECT * FROM state
    WHERE state_id=${stateId};    
    `;
  const getStateArray = await data.get(getStateQuery);
  response.send(getStateNameInResponsive(getStateArray));
});

//post a district
app.post("/districts/", async (request, response) => {
  const postDistrictDetails = request.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = postDistrictDetails;
  const postDistrictDetailsQuery = `
  INSERT INTO district (district_name,state_id,cases,cured,active,deaths)
  VALUES(
      '${districtName}',
      ${stateId},
      ${cases},
      ${cured},
      ${active},
      ${deaths}
  )
  `;
  const postDistrictDetailsArray = await data.run(postDistrictDetailsQuery);
  response.send("District Successfully Added");
});

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    districtId: dbObject.district_id,
    districtName: dbObject.district_name,
    stateId: dbObject.state_id,
    cases: dbObject.cases,
    cured: dbObject.cured,
    active: dbObject.active,
    deaths: dbObject.deaths,
  };
};

const convertDistrictResponse = (each) => {
  return {
    districtId: each.district_id,
    districtName: each.district_name,
    stateId: each.state_id,
    cases: each.cases,
    cured: each.cured,
    active: each.active,
    deaths: each.deaths,
  };
};

//get a district by district id
app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const displayByDistricIdQuery = `
    SELECT * FROM district 
    WHERE district_id=${districtId};
    `;
  const displayByDistrictArray = await data.get(displayByDistricIdQuery);
  response.send(convertDistrictResponse(displayByDistrictArray));
  console.log(displayByDistrictArray);
});

//delete district by district Id
app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const deleteDistrictQuery = `
    DELETE FROM district 
    WHERE district_id=${districtId};
    
    `;
  const deleteDistrictRequest = await data.run(deleteDistrictQuery);
  response.send("District Removed");
});

//put a district
app.put("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const getDistrictdetails = request.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = getDistrictdetails;
  const updateDistrictQuery = `
 update district
 SET
 district_name='${districtName}',
state_id=${stateId},
 cases=${cases},
 cured=${cured},
 active=${active},
 deaths=${deaths}
 WHERE district_id=${districtId};
 
 `;

  await data.run(updateDistrictQuery);
  response.send("District Details Updated");
});
module.exports = app;
