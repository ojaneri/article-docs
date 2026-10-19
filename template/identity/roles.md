# Roles — {{PROJECT_NAME}}

Roles control who may promote decisions and manage identity records.

| Role | Promote decisions | Manage identity | Submit to venue |
|------|-------------------|-----------------|-----------------|
| Owner | ✅ | ✅ | ✅ |
| Maintainer | ✅ | ✅ | ❌ |
| Contributor | ❌ | ❌ | ❌ |
| Reader | ❌ | ❌ | ❌ |

Only an **Owner** or **Maintainer** may move a decision from `proposed` to `accepted`.
An agent may never promote its own proposal, regardless of the human role it runs under.

Roles are assigned in `identity/humans.registry.json`. An agent's capabilities are declared
in `identity/agents.registry.json` and enforced by `artdocs promote` and `artdocs identity status`.