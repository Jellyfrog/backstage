/*
 * Copyright 2021 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { ScmIntegrationRegistry } from '@backstage/integration';
import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import { getClient, parseRepoUrl } from '../util';
import { examples } from './gitlabGroupUserAction.examples';

/**
 * Access level for GitLab group members.
 *
 * @public
 */
export const AccessLevel = {
  GUEST: 10,
  REPORTER: 20,
  DEVELOPER: 30,
  MAINTAINER: 40,
  OWNER: 50,
} as const;

/**
 * Creates a `gitlab:group:user` Scaffolder action.
 *
 * @public
 */
export const createGitlabGroupUserAction = (options: {
  integrations: ScmIntegrationRegistry;
}) => {
  const { integrations } = options;

  return createTemplateAction({
    id: 'gitlab:group:user',
    description: 'Adds or removes users from a GitLab group',
    supportsDryRun: true,
    examples,
    schema: {
      input: {
        repoUrl: z =>
          z.string({
            description: `Accepts the format 'gitlab.com?repo=project_name&owner=group_name' where 'project_name' is the repository name and 'group_name' is a group or username`,
          }),
        token: z =>
          z
            .string({
              description: 'The token to use for authorization to GitLab',
            })
            .optional(),
        groupId: z =>
          z.number({
            description: 'The ID of the group to add/remove users from',
          }),
        userIds: z =>
          z.array(z.number(), {
            description: 'The IDs of the users to add/remove',
          }),
        action: z =>
          z
            .enum(['add', 'remove'], {
              description:
                'The action to perform: add or remove the users. Defaults to "add".',
            })
            .default('add'),
        accessLevel: z =>
          z
            .number({
              description:
                'The access level for the users (10=Guest, 20=Reporter, 30=Developer, 40=Maintainer, 50=Owner). Required when action is "add".',
            })
            .optional(),
      },
      output: {
        userIds: z =>
          z
            .array(z.number(), {
              description: 'The IDs of the users that were added or removed',
            })
            .optional(),
        groupId: z =>
          z
            .number({
              description:
                'The ID of the group the users were added to or removed from',
            })
            .optional(),
        accessLevel: z =>
          z
            .number({
              description:
                'The access level granted to the users (only for add action)',
            })
            .optional(),
      },
    },
    async handler(ctx) {
      const { token, repoUrl, groupId, userIds, accessLevel } = ctx.input;
      const action = ctx.input.action ?? 'add';

      if (action === 'add' && accessLevel === undefined) {
        throw new Error(
          'accessLevel is required when action is "add". Valid values are: 10 (Guest), 20 (Reporter), 30 (Developer), 40 (Maintainer), 50 (Owner)',
        );
      }

      if (ctx.isDryRun) {
        ctx.output('userIds', userIds);
        ctx.output('groupId', groupId);
        if (action === 'add') {
          ctx.output('accessLevel', accessLevel);
        }
        return;
      }

      const { host } = parseRepoUrl(repoUrl, integrations);

      const api = getClient({ host, integrations, token });

      if (action === 'add') {
        ctx.logger.info(
          `Adding ${userIds.length} user(s) to group ${groupId} with access level ${accessLevel}`,
        );

        for (const userId of userIds) {
          await ctx.checkpoint({
            key: `gitlab.group.user.add.${groupId}.${userId}`,
            fn: async () => {
              await api.GroupMembers.add(groupId, userId, accessLevel!);
            },
          });
          ctx.logger.info(`Added user ${userId} to group ${groupId}`);
        }

        ctx.output('userIds', userIds);
        ctx.output('groupId', groupId);
        ctx.output('accessLevel', accessLevel);
      } else {
        ctx.logger.info(
          `Removing ${userIds.length} user(s) from group ${groupId}`,
        );

        for (const userId of userIds) {
          await ctx.checkpoint({
            key: `gitlab.group.user.remove.${groupId}.${userId}`,
            fn: async () => {
              await api.GroupMembers.remove(groupId, userId);
            },
          });
          ctx.logger.info(`Removed user ${userId} from group ${groupId}`);
        }

        ctx.output('userIds', userIds);
        ctx.output('groupId', groupId);
      }
    },
  });
};
