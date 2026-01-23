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
    description: 'Adds or removes a user from a GitLab group',
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
            description: 'The ID of the group to add/remove the user from',
          }),
        userId: z =>
          z.number({
            description: 'The ID of the user to add/remove',
          }),
        action: z =>
          z.enum(['add', 'remove'], {
            description: 'The action to perform: add or remove the user',
          }),
        accessLevel: z =>
          z
            .number({
              description:
                'The access level for the user (10=Guest, 20=Reporter, 30=Developer, 40=Maintainer, 50=Owner). Required when action is "add".',
            })
            .optional(),
      },
      output: {
        userId: z =>
          z
            .number({
              description: 'The ID of the user that was added or removed',
            })
            .optional(),
        groupId: z =>
          z
            .number({
              description:
                'The ID of the group the user was added to or removed from',
            })
            .optional(),
        accessLevel: z =>
          z
            .number({
              description:
                'The access level granted to the user (only for add action)',
            })
            .optional(),
      },
    },
    async handler(ctx) {
      const { token, repoUrl, groupId, userId, action, accessLevel } =
        ctx.input;

      if (action === 'add' && accessLevel === undefined) {
        throw new Error(
          'accessLevel is required when action is "add". Valid values are: 10 (Guest), 20 (Reporter), 30 (Developer), 40 (Maintainer), 50 (Owner)',
        );
      }

      if (ctx.isDryRun) {
        ctx.output('userId', userId);
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
          `Adding user ${userId} to group ${groupId} with access level ${accessLevel}`,
        );

        await ctx.checkpoint({
          key: `gitlab.group.user.add.${groupId}.${userId}`,
          fn: async () => {
            await api.GroupMembers.add(groupId, userId, accessLevel!);
          },
        });

        ctx.output('userId', userId);
        ctx.output('groupId', groupId);
        ctx.output('accessLevel', accessLevel);
      } else {
        ctx.logger.info(`Removing user ${userId} from group ${groupId}`);

        await ctx.checkpoint({
          key: `gitlab.group.user.remove.${groupId}.${userId}`,
          fn: async () => {
            await api.GroupMembers.remove(groupId, userId);
          },
        });

        ctx.output('userId', userId);
        ctx.output('groupId', groupId);
      }
    },
  });
};
