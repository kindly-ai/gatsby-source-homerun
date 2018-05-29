# gatsby-source-homerun
Gatsby source plugin for building websites using [Homerun.co](https://www.homerun.co/) as a data source.

Note that it only supports the job API resource.

Get your API key by contacting Homerun.co support (API still in beta).

Based on [gatsby-source-lever](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-source-lever)

## Install

```bash
yarn add -D gatsby-source-homerun
```

## How to use

```javascript
// In your gatsby-config.js
plugins: [
  {
    resolve: "gatsby-source-homerun",
    options: {
      apiKey: "...",
    },
  },
];
```

### GraphQL Query to get all jobs

```graphql
allHomerunJob {
  edges {
    node {
      id
      homerunId
      title
      createdAt
      activeTime {
        openedAt
        ...
      }
      applicationFormUrl
      jobUrl
      status
      tmpLocation
      tmpDepartment
      totalCandidateCount
      type
      seoContent {
        ...
      }
    }
  }
}

```

### Wishlist

- [ ] Use [gatsby-node-helpers](https://github.com/angeloashmore/gatsby-node-helpers)
