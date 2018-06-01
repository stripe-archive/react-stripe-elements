# API Review

All API changes should go through API review, in addition to our normal code
review process. We define an API change as

- a change large enough to warrant updating documentation, or
- a change that increases the maintenance burden of features we offer to our
  users (i.e., the "API surface area")

For small changes, some or all of these changes can be omitted, but it's best to
**err on the side of being thorough**. Especially for large changes, you might
even consider drafting a full-fledged design document.

It's best to go through an API review **before** you start changing the code, so
that we can offer guidance on how to proceed before getting too caught in the
weeds.

## Template

Copy/paste this template into a new issue and fill it in to request an API
review from a maintainer. Remember: depending on the size of your change, it's
possible to omit some of the sections below.

```md
#### Summary

> A brief of the new API, including a code sample. Consider where this feature
> would fit into our documentation, and what the updated documentation would
> look like.

<!-- TODO -->

#### Motivation

> Describe the problem you are trying to solve with this API change. What does
> this API enable that was previously not possible?

<!-- TODO -->

#### Similar APIs

> Is this new API similar to an existing Stripe API? Are there similar APIs or
> prior art in other popular projects?

<!-- TODO -->

#### Alternatives

> How else could we implement this feature? Are there any existing workarounds
> that would offer the same functionality? Why should we chose this
> implementation over another?

<!-- TODO -->

#### Scope

> Which interfaces will this apply to? For example, is this specific to one
> component, or does it affect all Element components? Does this set a precedent
> for future interfaces we'll add?

<!-- TODO -->

#### Risks

> Are there any security implications (for example, XSS)? What are some ways
> users might get confused or misuse this feature?

<!-- TODO -->
```
