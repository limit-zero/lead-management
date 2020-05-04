const gql = require('graphql-tag');

const CLICK_LOG_OBJECTS = gql`
  query ClickLogObjects($since: String!, $notAfter: String!, $requestId: String) {
    dataExtension(input: { customerKey: "Click Log" }) {
      fields {
        edges {
          node {
            id
            type
            name
          }
        }
      }
      objects(input: {
        continueRequest: $requestId
        props: ["ID", "JobID", "SubscriberID", "EventDate", "LinkContent", "IsBot_V3"],
        filter: {
          complex: {
            left: {
              prop: "EventDate",
              operator: greaterThanOrEqual,
              value: [$since],
              isDate: true
            },
            operator: AND
            right: {
              prop: "EventDate",
              operator: lessThan,
              value: [$notAfter],
              isDate: true
            },
          },
        },
      }) {
        pageInfo {
          hasMoreData
          requestId
        }
        edges {
          node {
            properties {
              name
              value
            }
          }
        }
      }
    }
  }
`;

module.exports = {
  CLICK_LOG_OBJECTS,
};
