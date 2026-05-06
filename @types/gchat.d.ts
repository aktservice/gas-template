declare namespace ChatEvent {
  interface Event {
    type: "MESSAGE" | "ADDED_TO_SPACE" | "seeGoogleChatEventTypeDoc";
    eventTime: string;
    token: string;
    threadKey: string;
    message: Message;
    user: User;
    space: Space;
    action: {
      object(FormAction);
    };
    configCompleteRedirectUrl: string;
    isDialogEvent: boolean;
    dialogEventType: "seeGoogleChatDialogEventType";
    common: {
      object(CommonEventObject);
    };
    appCommandMetadata: {
      object(AppCommandMetadata);
    };
  }
  interface Space {
    name: string;
    type: "ROOM" | "DM";
    spaceType: "ROOM" | "DM";
    singleUserBotDm: boolean;
    threaded: boolean;
    displayName: string;
    externalUserAllowed: boolean;
    spaceThreadingState:
      | "THREADED_MESSAGES"
      | "GROUPED_MESSAGES"
      | "UNTHREDED_MESSAGES";
    spaceDetails: {
      object(SpaceDetails);
    };
    spaceHistoryState: "HISTORY_OFF" | "HISTORY_ON";
    importMode: boolean;
    createTime: string;
    lastActiveTime: string;
    adminInstalled: boolean;
    membershipCount: number;
    accessSettings: AccessSettings;
    spaceUri: string;
    importModeExpireTime: string;
    customer: string;

    // Union field space_permission_settings can be only one of the following:
    predefinedPermissionSettings: PredefinedPermissionSettings;
    permissionSettings: {
      object(PermissionSettings);
    };
    // End of list of possible types for union field space_permission_settings.
  }

  interface Message {
    name: string;
    sender: {
      object(User);
    };
    createTime: string;
    lastUpdateTime: string;
    deleteTime: string;
    text: string;
    formattedText: string;
    cards: [
      {
        object(Card);
      },
    ];
    cardsV2: [
      {
        object(CardWithId);
      },
    ];
    annotations: [
      {
        object(Annotation);
      },
    ];
    thread: {
      object(Thread);
    };
    space: {
      object(Space);
    };
    fallbackText: string;
    actionResponse: {
      object(ActionResponse);
    };
    argumentText: string;
    slashCommand: {
      object(SlashCommand);
    };
    attachment: [
      {
        object(Attachment);
      },
    ];
    matchedUrl: {
      object(MatchedUrl);
    };
    threadReply: boolean;
    clientAssignedMessageId: string;
    emojiReactionSummaries: [
      {
        object(EmojiReactionSummary);
      },
    ];
    privateMessageViewer: {
      object(User);
    };
    deletionMetadata: {
      object(DeletionMetadata);
    };
    quotedMessageMetadata: {
      object(QuotedMessageMetadata);
    };
    attachedGifs: [
      {
        object(AttachedGif);
      },
    ];
    accessoryWidgets: [
      {
        object(AccessoryWidget);
      },
    ];
  }

  interface User {
    name: string;
    displayName: string;
    domainId: string;
    type: "HUMAN" | "BOT";
    isAnonymous: boolean;
  }

  interface AccessSettings {
    access_state: string;
    audience: string;
  }
  interface PredefinedPermissionSettings {
    COLLABORATION_SPACE: string;
    ANNOUNCEMENT_SPACE: string;
  }
}

interface tabletemplate {
  sections: [
    {
      header: "Section Header";
      collapsible: true;
      uncollapsibleWidgetsCount: 1;
      widgets: [
        {
          grid: {
            title: "A fine collection of items";
            columnCount: 4;
            items: [
              {
                title: "Item 1";
                textAlignment: "CENTER";
              },
              {
                title: "Item 2";
                textAlignment: "CENTER";
              },
              {
                title: "Item 1";
                textAlignment: "CENTER";
              },
              {
                title: "Item 2";
                textAlignment: "CENTER";
              },
            ];
          };
        },
        {
          grid: {
            columnCount: 4;
            items: [
              {
                title: "Item 1";
                textAlignment: "CENTER";
              },
              {
                title: "Item 2";
                textAlignment: "CENTER";
              },
              {
                title: "Item 1";
                textAlignment: "CENTER";
              },
              {
                title: "Item 2";
                textAlignment: "CENTER";
              },
            ];
          };
        },
      ];
    },
  ];
}
