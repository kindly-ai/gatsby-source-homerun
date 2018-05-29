const sourceNodes = require('../gatsby-node').sourceNodes;

describe('get sourceNodes from api', () => {
  it('does not crash', async () => {
    const apiKey = process.env.HOMERUN_API_KEY;
    // FIXME: mock API with data
    await sourceNodes(
      { boundActionCreators: {createNode: () => {}}, getNode: null, store: null, cache: null, createNodeId: () => {} },
      { apiKey }
    );
  })
});