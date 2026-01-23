---
'@backstage/plugin-scaffolder-backend-module-gitlab': minor
---

Added new `gitlab:group:user` scaffolder action to add or remove users from GitLab groups. The action supports multiple users via the `userIds` array parameter, configurable access levels (Guest, Reporter, Developer, Maintainer, Owner), and defaults to the 'add' action when not specified.
