const crypto = require(`crypto`);
const deepMapKeys = require(`deep-map-keys`);
const stringify = require(`json-stringify-safe`);

const conflictFieldPrefix = `homerun_`;
// restrictedNodeFields from here https://www.gatsbyjs.org/docs/node-interface/
const restrictedNodeFields = [`id`, `children`, `parent`, `fields`, `internal`];

/** Encrypts a String using md5 hash of hexadecimal digest. */
const digest = str =>
  crypto
    .createHash(`md5`)
    .update(str)
    .digest(`hex`);

/** Create the Graph QL Node */
export async function createGraphQLNode(ent, type, createNode, store, cache) {
  let id = !ent.id ? (!ent.ID ? 0 : ent.ID) : ent.id;
  let node = {
    id: `${type}_${id.toString()}`,
    children: [],
    parent: null,
    internal: {
      type: type
    }
  };
  node = recursiveAddFields(ent, node, createNode);
  node.internal.content = JSON.stringify(node);
  node.internal.contentDigest = digest(stringify(node));
  createNode(node);
}

/** Add fields recursively */
export function recursiveAddFields(ent, newEnt) {
  for (let k of Object.keys(ent)) {
    if (!newEnt.hasOwnProperty(k)) {
      let key = getValidKey(k);
      newEnt[key] = ent[k];
      // Nested Objects & Arrays of Objects
      if (typeof ent[key] === `object`) {
        if (!Array.isArray(ent[key]) && ent[key] != null) {
          newEnt[key] = recursiveAddFields(ent[key], {});
        } else if (Array.isArray(ent[key])) {
          if (ent[key].length > 0 && typeof ent[key][0] === `object`) {
            ent[k].map((el, i) => {
              newEnt[key][i] = recursiveAddFields(el, {});
            });
          }
        }
      }
    }
  }
  return newEnt;
}

/** Validate the GraphQL naming convetions & protect specific fields. */
export function getValidKey({ key, verbose = false }) {
  let nkey = String(key);
  const NAME_RX = /^[_a-zA-Z][_a-zA-Z0-9]*$/;
  let changed = false;

  // Replace invalid characters
  if (!NAME_RX.test(nkey)) {
    changed = true;
    nkey = nkey.replace(/-|__|:|\.|\s/g, `_`);
  }
  // Prefix if first character isn't a letter.
  if (!NAME_RX.test(nkey.slice(0, 1))) {
    changed = true;
    nkey = `${conflictFieldPrefix}${nkey}`;
  }
  if (restrictedNodeFields.includes(nkey)) {
    changed = true;
    nkey = `${conflictFieldPrefix}${nkey}`.replace(/-|__|:|\.|\s/g, `_`);
  }
  if (changed && verbose)
    console.log(`Object with key "${key}" breaks GraphQL naming convention. Renamed to "${nkey}"`);

  return nkey;
}

// Create entities from the few the lever API returns as an object for presumably
// legacy reasons.
export const normalizeEntities = entities => entities.reduce((acc, e) => acc.concat(e), []);

// Standardize ids + make sure keys are valid + convert snake to camel case.
export const standardizeKeys = entities =>
  entities
    .map(e =>
      deepMapKeys(e, key => (key === `ID` ? getValidKey({ key: `id` }) : getValidKey({ key })))
    )
    .map(e => deepMapKeys(e, key => key.replace(/_(\w)/g, (match, char) => char.toUpperCase())));

// Standardize dates on ISO 8601 version.
const toDate = str => new Date(str * 1000).toJSON();
export const standardizeDates = entities =>
  entities.map(e => {
    if (e.createdAt) {
      e.createdAt = toDate(e.createdAt)
    }
    if (e.activeTime ) {
      e.activeTime.forEach((t, i) => {
        if(t.openedAt) {
          e.activeTime[i].openedAt = toDate(t.openedAt)
        }
        if(t.closedAt) {
          e.activeTime[i].closedAt = toDate(t.closedAt)
        }
      })
    }
    return e;
  });

export const createGatsbyIds = (createNodeId, entities) =>
  entities.map(e => {
    e.id = createNodeId(e.homerunId.toString());
    return e;
  });

export const createNodesFromEntities = ({ entities, createNode }) => {
  entities.forEach(e => {
    let { ...entity } = e;
    let node = {
      ...entity,
      parent: null,
      children: [],
      internal: {
        type: "homerunJob",
        contentDigest: digest(JSON.stringify(entity))
      }
    };
    createNode(node);
  });
};
