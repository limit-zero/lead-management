const gql = require('graphql-tag');

const CLICK_LOG_OBJECTS = gql`
  query ClickLogObjects($since: String!) {
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
        props: ["ID", "JobID", "SubscriberID", "EventDate", "LinkContent", "IsBot_V3"],
        filter: {
          simple: {
            prop: "EventDate",
            operator: greaterThanOrEqual,
            value: [$since],
            isDate: true
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
