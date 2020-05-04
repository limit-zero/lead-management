const gql = require('graphql-tag');

const upsertSubscriberFragment = gql`
  fragment UpsertSubscriberFragment on Subscriber {
    id
    emailAddress
    attributes {
      name
      value
    }
  }
`;

const SUBSCRIBER_TO_UPSERT = gql`
  query SubscriberToUpsert($subscriberId: String!) {
    subscribers(input: {
      filter: {
        simple: {
          prop: "ID"
          operator: equals
          value: $subscriberId
        }
      },
    }) {
      pageInfo {
        hasMoreData
        requestId
      }
      edges {
        node {
          ...UpsertSubscriberFragment
        }
      }
    }
  }

  ${upsertSubscriberFragment}
`;

const SUBSCRIBERS_TO_UPSERT = gql`
  query SubscribersToUpsert($subscriberIds: [String!]!) {
    subscribers(input: {
      filter: {
        simple: {
          prop: "ID"
          operator: IN
          value: $subscriberIds
        }
      },
    }) {
      pageInfo {
        hasMoreData
        requestId
      }
      edges {
        node {
          ...UpsertSubscriberFragment
        }
      }
    }
  }

  ${upsertSubscriberFragment}
`;

module.exports = {
  SUBSCRIBER_TO_UPSERT,
  SUBSCRIBERS_TO_UPSERT,
};
