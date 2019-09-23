import render_template from 'server/helper/TemplateHelper';
import ConfirmationHelper from 'server/helper/ConfirmationHelper';

const NEED_NO_ANSWER = true;
const NEED_ANSWER = false;

const URL_REGEXP = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/gi;

export let questionHandlerMap = {
  'greeting': (psid, question, userProfile) => {
    let message_payload;

    if (question.buttons && question.buttons.length > 0) {
      message_payload = {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'button',
            text: render_template(question.text, userProfile),
            buttons: question.buttons.map((button) => {
              return {
                type: 'web_url',
                url: button.url,
                title: button.title,
                webview_height_ratio: 'full',
              };
            }),
          }
        }
      };
    } else {
      message_payload = {
        text: render_template(question.text, userProfile),
      };
    }

    return [
      {
        recipient: { id: psid },
        message: message_payload,
      },
      NEED_NO_ANSWER,
    ];
  },

  'question': (psid, question, userProfile) => {
    return [
      {
        recipient: { id: psid },
        message: {
          text: render_template(question.text, userProfile),
          quick_replies: question.options.map((option) => {
            return {
              'content_type': 'text',
              'title': render_template(option.text, userProfile),
              'payload': option.resp_payload,
            };
          }),
        },
      },
      NEED_ANSWER,
    ];
  },

  'input': (psid, question, userProfile) => {
    let quick_replies = question.quick_replies || [];
    if (quick_replies.length === 0) {
      return [
        {
          recipient: { id: psid },
          message: { text: render_template(question.text, userProfile) },
        },
        NEED_ANSWER,
      ];
    }
    return [
      {
        recipient: { id: psid },
        message: {
          text: render_template(question.text, userProfile),
          quick_replies: quick_replies.map((quick_reply) => {
            return ({
              content_type: quick_reply.content_type,
            });
          })
        },
      },
      NEED_ANSWER,
    ];
  },

  't&c': (psid, question, userProfile) => {
    return [
      {
        recipient: { id: psid },
        message: {
          attachment: {
            type: 'template',
            payload: {
              template_type: 'button',
              text: render_template(question.text, userProfile),
              buttons:[{
                type: 'web_url',
                url: question.url,
                title: render_template(question.urlText, userProfile),
                'webview_height_ratio': 'compact'
              }]
            }
          }
        },
      },
      NEED_NO_ANSWER
    ];
  },

  'carousel': (psid, question, userProfile) => {
    return [
      {
        recipient: { id: psid },
        message: {
          attachment: {
            type: 'template',
            payload: {
              template_type: 'generic',
              elements: question.elements.map((element) => {
                var obj = {
                  title: render_template(element.title, userProfile),
                  subtitle: render_template(element.subtitle, userProfile),
                };

                if (element.image_url) {
                  obj.image_url = element.image_url;
                }

                if (element.buttons && element.buttons.length > 0) {
                  obj.buttons = element.buttons.map((button) => {
                    if (button.next || !(button.url.match(URL_REGEXP))) {
                      return {
                        type: 'postback',
                        title: render_template(button.title, userProfile),
                        payload: button.next,
                      };
                    } else {
                      return {
                        type: 'web_url',
                        title: render_template(button.title, userProfile),
                        url: button.url,
                      };
                    }
                  });
                }

                return obj;
              }),
            }
          }
        },
      },
      (question.next?NEED_NO_ANSWER:NEED_ANSWER)
    ];
  },
  'image': (psid, question, userProfile) => {
    return [
      {
        recipient: { id: psid },
        message: {
          attachment: {
            type:'image',
            payload:{
              url: question.url,
              is_reusable: true
            }
          }
        },
      },
      NEED_NO_ANSWER,
    ];
  },
  'confirmation': (psid, question, userProfile, questionFlow, userResponse) => {
    if (psid == 0) {
      // TODO: Hack. AppEvent.jsx is calling this without actual request
      // making render_text fail.
      // should extract NEED_ANSWER & NEED_NO_ANSWER to a separate method
      return [{}, NEED_ANSWER];
    } else {
      return [
        {
          recipient: { id: psid },
          message: {
            attachment: {
              type: 'template',
              payload: {
                template_type: 'button',
                text: ConfirmationHelper.render_text(question, userProfile, questionFlow, userResponse),
                buttons: [
                  {
                    type: 'postback',
                    title: (question.confirmation_prompt || 'Confirm'),
                    payload: '__confirm__',
                  }
                ],
              },
            },
            quick_replies: ConfirmationHelper.quick_replies(question, userProfile, userResponse),
          }
        },
        NEED_ANSWER,
      ];
    }
  },
};

export let questionExpectMap = {
  'question': 'quick_reply',
  'input': 'text_input',
  'carousel': 'postback',
  'confirmation': 'confirmation',
};
