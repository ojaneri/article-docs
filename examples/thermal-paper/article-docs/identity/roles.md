# Roles

| Role | May do |
|---|---|
| **Owner** | everything, including promoting decisions to `accepted` and archiving memory. Usually the corresponding author |
| **Maintainer** | promote decisions, verify skills, edit any memory |
| **Contributor** | create memory entries and sessions; decisions stay `proposed`. A co-author without the final word on framing |
| **Agent** | create memory entries and sessions under a human's identity; may never self-promote a decision |

An agent's writes are attributed to the human whose identity is active in `.local/user.json`
— but the agent is recorded separately as the `actor`, and its own permissions are declared
in `agents.registry.json`. **A human's role is not inherited by an agent running under it.**
An agent may not accept a decision however senior the person at the keyboard is.
