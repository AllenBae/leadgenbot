Design of Question Flow
====

Check `question_flow_default.json` for a sample.

Overview
====

Question flow represents a questionaire design for user. The questionaire can have greeting messages, ask for question with selectable options or user input, and show prompting message with link to terms and conditions. Check our `question_flow_default.json` for a sample.

Question flow is organized as an array of objects, in JSON format. The questions are inserted in order -- the next question is naturally the next one if not specially defined by conditional logic. The question's id is the index of it in the array.

Question flow is implemented and managed by file `server/store/questionFlow.js`, but we always access with the help of `server/store/DataHandler.js`.

Supported Types
====

* type: `greeting`
  * a greeting text message, need no response to it, auto advance to next question

* `question`
  * a question with `quick_reply` options, need user's response in `quick_reply`
  * in options array, each option must have `text` and `resp_payload`

* `input`
  * a prompting `text`, expect user's text input as response

* `t&c`
  * a prompting `text` with a link to terms&conditions

Anchor
====

Anchor can be attached to each question, such as 

```
{
  'text': '...',
  'anchor': '#yes'
}
```

then other question can look up it with its anchor name `#yes`

Conditional Logic
====

Conditional logic is implemented with `anchor` and `next` attributes. 

* The question who wants conditional logic defines `next` attribute with value '#x' to be `anchor` name, then question flow later knows its next question is the one with `anchor` attribute to be '#x'. 

* Or the question can define the `next` attribute for one of `option`, such as '#y', then question flow later knows when that option is matched with user's response, its next question should be the one with `anchor` attribute to be '#y'