/*!
 * Copyright (C) Microsoft Corporation. All rights reserved.
 * This file is auto-generated. Do not modify it manually.
 * Changes to this file may be overwritten.
 */

export const dataSourcesInfo = {
  "servicebus": {
    "tableId": "",
    "version": "",
    "primaryKey": "",
    "dataSourceType": "Connector",
    "apis": {
      "GetQueues": {
        "path": "/{connectionId}/queues",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "array"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "GetTopics": {
        "path": "/{connectionId}/topics",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "array"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "GetSubscriptions": {
        "path": "/{connectionId}/topics/{topicName}/subscriptions",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "topicName",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "array"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "GetEntities": {
        "path": "/{connectionId}/entities",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "array"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "GetSystemProperties": {
        "path": "/{connectionId}/systemproperties",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "array"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "GetSessionOptions": {
        "path": "/{connectionId}/sessionoptions",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "array"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "SendMessage": {
        "path": "/{connectionId}/{entityName}/messages",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "entityName",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "message",
            "in": "body",
            "required": true,
            "type": "object"
          },
          {
            "name": "systemProperties",
            "in": "query",
            "required": false,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "void"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "SendMessages": {
        "path": "/{connectionId}/{entityName}/messages/batch",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "entityName",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "messages",
            "in": "body",
            "required": true,
            "type": "object"
          },
          {
            "name": "systemProperties",
            "in": "query",
            "required": false,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "void"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "GetMessageFromQueue": {
        "path": "/{connectionId}/{queueName}/messages/head",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "queueName",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "queueType",
            "in": "query",
            "required": false,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "GetNewMessageFromQueueWithPeekLock": {
        "path": "/{connectionId}/{queueName}/messages/head/peek",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "queueName",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "queueType",
            "in": "query",
            "required": false,
            "type": "string"
          },
          {
            "name": "sessionId",
            "in": "query",
            "required": false,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "CompleteMessageInQueue": {
        "path": "/{connectionId}/{queueName}/messages/complete",
        "method": "DELETE",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "queueName",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "lockToken",
            "in": "query",
            "required": true,
            "type": "string"
          },
          {
            "name": "queueType",
            "in": "query",
            "required": false,
            "type": "string"
          },
          {
            "name": "sessionId",
            "in": "query",
            "required": false,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "void"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "AbandonMessageInQueue": {
        "path": "/{connectionId}/{queueName}/messages/abandon",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "queueName",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "lockToken",
            "in": "query",
            "required": true,
            "type": "string"
          },
          {
            "name": "queueType",
            "in": "query",
            "required": false,
            "type": "string"
          },
          {
            "name": "sessionId",
            "in": "query",
            "required": false,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "void"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "GetDeferredMessageFromQueue": {
        "path": "/{connectionId}/{queueName}/messages/defer",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "queueName",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "sequenceNumber",
            "in": "query",
            "required": true,
            "type": "integer"
          },
          {
            "name": "queueType",
            "in": "query",
            "required": false,
            "type": "string"
          },
          {
            "name": "sessionId",
            "in": "query",
            "required": false,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "DeferMessageInQueue": {
        "path": "/{connectionId}/{queueName}/messages/defer",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "queueName",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "lockToken",
            "in": "query",
            "required": true,
            "type": "string"
          },
          {
            "name": "queueType",
            "in": "query",
            "required": false,
            "type": "string"
          },
          {
            "name": "sessionId",
            "in": "query",
            "required": false,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "void"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "DeadLetterMessageInQueue": {
        "path": "/{connectionId}/{queueName}/messages/deadletter",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "queueName",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "lockToken",
            "in": "query",
            "required": true,
            "type": "string"
          },
          {
            "name": "sessionId",
            "in": "query",
            "required": false,
            "type": "string"
          },
          {
            "name": "deadLetterReason",
            "in": "query",
            "required": false,
            "type": "string"
          },
          {
            "name": "deadLetterErrorDescription",
            "in": "query",
            "required": false,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "void"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "RenewLockOnMessageInQueue": {
        "path": "/{connectionId}/{queueName}/messages/renewlock",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "queueName",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "lockToken",
            "in": "query",
            "required": true,
            "type": "string"
          },
          {
            "name": "queueType",
            "in": "query",
            "required": false,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "void"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "GetMessagesFromQueue": {
        "path": "/{connectionId}/{queueName}/messages/batch/head",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "queueName",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "maxMessageCount",
            "in": "query",
            "required": false,
            "type": "integer"
          },
          {
            "name": "queueType",
            "in": "query",
            "required": false,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "array"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "GetNewMessagesFromQueueWithPeekLock": {
        "path": "/{connectionId}/{queueName}/messages/batch/head/peek",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "queueName",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "maxMessageCount",
            "in": "query",
            "required": false,
            "type": "integer"
          },
          {
            "name": "queueType",
            "in": "query",
            "required": false,
            "type": "string"
          },
          {
            "name": "sessionId",
            "in": "query",
            "required": false,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "array"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "GetMessagesFromQueueWithPeekLock": {
        "path": "/{connectionId}/{queueName}/messages/batch/peek",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "queueName",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "maxMessageCount",
            "in": "query",
            "required": false,
            "type": "integer"
          },
          {
            "name": "queueType",
            "in": "query",
            "required": false,
            "type": "string"
          },
          {
            "name": "sessionId",
            "in": "query",
            "required": false,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "array"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "CloseSessionInQueue": {
        "path": "/{connectionId}/{queueName}/sessions/{sessionId}/close",
        "method": "DELETE",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "queueName",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "sessionId",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "void"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "RenewLockOnSessionInQueue": {
        "path": "/{connectionId}/{queueName}/sessions/{sessionId}/renewlock",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "queueName",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "sessionId",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "void"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "GetMessageFromTopic": {
        "path": "/{connectionId}/{topicName}/subscriptions/{subscriptionName}/messages/head",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "topicName",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "subscriptionName",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "subscriptionType",
            "in": "query",
            "required": false,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "GetNewMessageFromTopicWithPeekLock": {
        "path": "/{connectionId}/{topicName}/subscriptions/{subscriptionName}/messages/head/peek",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "topicName",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "subscriptionName",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "subscriptionType",
            "in": "query",
            "required": false,
            "type": "string"
          },
          {
            "name": "sessionId",
            "in": "query",
            "required": false,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "CompleteMessageInTopic": {
        "path": "/{connectionId}/{topicName}/subscriptions/{subscriptionName}/messages/complete",
        "method": "DELETE",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "topicName",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "subscriptionName",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "lockToken",
            "in": "query",
            "required": true,
            "type": "string"
          },
          {
            "name": "subscriptionType",
            "in": "query",
            "required": false,
            "type": "string"
          },
          {
            "name": "sessionId",
            "in": "query",
            "required": false,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "void"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "AbandonMessageInTopic": {
        "path": "/{connectionId}/{topicName}/subscriptions/{subscriptionName}/messages/abandon",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "topicName",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "subscriptionName",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "lockToken",
            "in": "query",
            "required": true,
            "type": "string"
          },
          {
            "name": "subscriptionType",
            "in": "query",
            "required": false,
            "type": "string"
          },
          {
            "name": "sessionId",
            "in": "query",
            "required": false,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "void"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "GetDeferredMessageFromTopic": {
        "path": "/{connectionId}/{topicName}/subscriptions/{subscriptionName}/messages/defer",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "topicName",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "subscriptionName",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "sequenceNumber",
            "in": "query",
            "required": true,
            "type": "integer"
          },
          {
            "name": "subscriptionType",
            "in": "query",
            "required": false,
            "type": "string"
          },
          {
            "name": "sessionId",
            "in": "query",
            "required": false,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "DeferMessageInTopic": {
        "path": "/{connectionId}/{topicName}/subscriptions/{subscriptionName}/messages/defer",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "topicName",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "subscriptionName",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "lockToken",
            "in": "query",
            "required": true,
            "type": "string"
          },
          {
            "name": "subscriptionType",
            "in": "query",
            "required": false,
            "type": "string"
          },
          {
            "name": "sessionId",
            "in": "query",
            "required": false,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "void"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "DeadLetterMessageInTopic": {
        "path": "/{connectionId}/{topicName}/subscriptions/{subscriptionName}/messages/deadletter",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "topicName",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "subscriptionName",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "lockToken",
            "in": "query",
            "required": true,
            "type": "string"
          },
          {
            "name": "sessionId",
            "in": "query",
            "required": false,
            "type": "string"
          },
          {
            "name": "deadLetterReason",
            "in": "query",
            "required": false,
            "type": "string"
          },
          {
            "name": "deadLetterErrorDescription",
            "in": "query",
            "required": false,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "void"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "RenewLockOnMessageInTopic": {
        "path": "/{connectionId}/{topicName}/subscriptions/{subscriptionName}/messages/renewlock",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "topicName",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "subscriptionName",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "lockToken",
            "in": "query",
            "required": true,
            "type": "string"
          },
          {
            "name": "subscriptionType",
            "in": "query",
            "required": false,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "void"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "CreateTopicSubscription": {
        "path": "/{connectionId}/{topicName}/subscriptions/{subscriptionName}",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "topicName",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "subscriptionName",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "subscriptionFilter",
            "in": "body",
            "required": true,
            "type": "object"
          },
          {
            "name": "subscriptionFilterType",
            "in": "query",
            "required": false,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "DeleteTopicSubscription": {
        "path": "/{connectionId}/{topicName}/subscriptions/{subscriptionName}",
        "method": "DELETE",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "topicName",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "subscriptionName",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "void"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "GetMessagesFromTopic": {
        "path": "/{connectionId}/{topicName}/subscriptions/{subscriptionName}/messages/batch/head",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "topicName",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "subscriptionName",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "maxMessageCount",
            "in": "query",
            "required": false,
            "type": "integer"
          },
          {
            "name": "subscriptionType",
            "in": "query",
            "required": false,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "array"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "GetNewMessagesFromTopicWithPeekLock": {
        "path": "/{connectionId}/{topicName}/subscriptions/{subscriptionName}/messages/batch/head/peek",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "topicName",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "subscriptionName",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "maxMessageCount",
            "in": "query",
            "required": false,
            "type": "integer"
          },
          {
            "name": "subscriptionType",
            "in": "query",
            "required": false,
            "type": "string"
          },
          {
            "name": "sessionId",
            "in": "query",
            "required": false,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "array"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "GetMessagesFromTopicWithPeekLock": {
        "path": "/{connectionId}/{topicName}/subscriptions/{subscriptionName}/messages/batch/peek",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "topicName",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "subscriptionName",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "maxMessageCount",
            "in": "query",
            "required": false,
            "type": "integer"
          },
          {
            "name": "subscriptionType",
            "in": "query",
            "required": false,
            "type": "string"
          },
          {
            "name": "sessionId",
            "in": "query",
            "required": false,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "array"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "CloseSessionInTopic": {
        "path": "/{connectionId}/{topicName}/subscriptions/{subscriptionName}/sessions/{sessionId}/close",
        "method": "DELETE",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "topicName",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "subscriptionName",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "sessionId",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "void"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "RenewLockOnSessionInTopic": {
        "path": "/{connectionId}/{topicName}/subscriptions/{subscriptionName}/sessions/{sessionId}/renewlock",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "topicName",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "subscriptionName",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "sessionId",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "void"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "GetSubscriptionFilter": {
        "path": "/{connectionId}/subscriptionfilter",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "subscriptionFilterType",
            "in": "query",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "GetSubscriptionFilterV2": {
        "path": "/{connectionId}/subscriptionfilterV2",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "subscriptionFilterType",
            "in": "query",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          },
          "default": {
            "type": "void"
          }
        }
      }
    }
  }
};
