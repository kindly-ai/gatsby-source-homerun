const normalize = require("./normalize");

const axios = require("axios");

function httpExceptionHandler(e) {
  /** Handle axios HTTP exception */
  const {
    status,
    statusText,
    data: { message }
  } = e.response;
  console.log(`Homerun API server response was "${status} ${statusText}"`);
  if (message) {
    console.log(`Inner exception message : "${message}"`);
  }
}

async function fetch({ apiKey }) {
  /** Fetch job data from Homerun.co API
   *  Ref: https://developers.homerun.co
   */
  try {
    const res = await axios.get("https://api.homerun.co/v1/jobs", {
      auth: {
        username: apiKey,
        password: ""
      }
    });

    // FIXME: Handle 100+ jobs
    // if (res.has_more) {
    //   return Object.assign(res.data, fetch({apiKey}));
    // }
    return res.data.data;
  } catch (e) {
    httpExceptionHandler(e);
  }

  return [];
}

exports.sourceNodes = async (
  { boundActionCreators, getNode, store, cache, createNodeId },
  { apiKey }
) => {
  const { createNode } = boundActionCreators;

  let entities = await fetch({ apiKey });

  // Normalize data & create nodes

  // Creates entities from object collections of entities
  entities = normalize.normalizeEntities(entities);

  // Standardizes ids & cleans keys
  entities = normalize.standardizeKeys(entities);

  // Converts to use only UTC dates
  entities = normalize.standardizeDates(entities);

  // creates Gatsby IDs for each entity
  entities = normalize.createGatsbyIds(createNodeId, entities);

  // creates nodes for each entry
  normalize.createNodesFromEntities({ entities, createNode });
};
