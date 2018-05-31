# Contributing to `react-stripe-elements`

Thanks for contributing to react-stripe-elements!

## Issues

`react-stripe-elements` is a thin wrapper around [Stripe.js] and [Stripe
Elements][elements] for React. Please only file issues here that you believe
represent bugs with react-stripe-elements, not Stripe.js itself.

If you're having general trouble with Stripe.js or your Stripe integration,
please reach out to us using the form at <https://support.stripe.com/email> or
come chat with us at #stripe on freenode. We're very proud of our level of
service, and we're more than happy to help you out with your integration.

If you've found a bug in `react-stripe-elements`, please [let us know][issue]!
You may also want to check out our [issue template][issue-template].

## API review

At Stripe, we scrutinize changes that affect the developer API more so than
implementation changes. If your code change involves adding, removing, or
modifying the surface area of the API, we ask that you go through an API review
by following [this guide][api-review]. It's best to go through API review before
implementing a feature. If you've already implemented a feature, address the
[API review][api-review] considerations within your pull request.

Going through an API review is not required, but it helps us to understand the
problem you are trying to solve, and enables us to collaborate and solve it
together.

## Code review

All pull requests will be reviewed by someone from Stripe before merging. At
Stripe, we believe that code review is for explaining and having a discussion
around code. For those new to code review, we strongly recommend [this
video][code-review] on "code review culture."

## Developing

We use a number of automated checks:

- Flow, for adding types to JavaScript
  - `yarn run flow`
- Jest, for testing
  - `yarn test`
- ESLint, for assorted warnings
  - `yarn run lint`
- Prettier, for code formatting
  - `yarn run prettier`

You might want to configure your editor to automatically run these checks. Not
passing any of these checks will cause the CI build to fail.

[code-review]: https://www.youtube.com/watch?v=PJjmw9TRB7s
[api-review]: .github/API_REVIEW.md
[stripe.js]: https://stripe.com/docs/stripe.js
[elements]: https://stripe.com/elements
[issue]: https://github.com/stripe/react-stripe-elements/issues/new
[issue-template]: .github/ISSUE_TEMPLATE.md
