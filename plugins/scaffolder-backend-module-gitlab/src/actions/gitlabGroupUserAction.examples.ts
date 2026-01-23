/*
 * Copyright 2023 The Backstage Authors
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
import { TemplateExample } from '@backstage/plugin-scaffolder-node';
import yaml from 'yaml';

export const examples: TemplateExample[] = [
  {
    description: 'Add a single user to a group as a Developer (default action)',
    example: yaml.stringify({
      steps: [
        {
          id: 'gitlabGroupUser',
          name: 'Add User to Group',
          action: 'gitlab:group:user',
          input: {
            repoUrl: 'gitlab.com',
            groupId: 123,
            userIds: [456],
            accessLevel: 30,
          },
        },
      ],
    }),
  },
  {
    description: 'Add multiple users to a group as Developers',
    example: yaml.stringify({
      steps: [
        {
          id: 'gitlabGroupUser',
          name: 'Add Users to Group',
          action: 'gitlab:group:user',
          input: {
            repoUrl: 'gitlab.com',
            groupId: 123,
            userIds: [456, 789, 101],
            accessLevel: 30,
          },
        },
      ],
    }),
  },
  {
    description: 'Add multiple users to a group as Maintainers',
    example: yaml.stringify({
      steps: [
        {
          id: 'gitlabGroupUser',
          name: 'Add Users to Group',
          action: 'gitlab:group:user',
          input: {
            repoUrl: 'gitlab.com',
            groupId: 123,
            userIds: [456, 789],
            action: 'add',
            accessLevel: 40,
          },
        },
      ],
    }),
  },
  {
    description: 'Remove multiple users from a group',
    example: yaml.stringify({
      steps: [
        {
          id: 'gitlabGroupUser',
          name: 'Remove Users from Group',
          action: 'gitlab:group:user',
          input: {
            repoUrl: 'gitlab.com',
            groupId: 123,
            userIds: [456, 789],
            action: 'remove',
          },
        },
      ],
    }),
  },
  {
    description: 'Add users to a group in dry run mode',
    example: yaml.stringify({
      steps: [
        {
          id: 'gitlabGroupUser',
          name: 'Add Users to Group',
          action: 'gitlab:group:user',
          isDryRun: true,
          input: {
            repoUrl: 'gitlab.com',
            groupId: 123,
            userIds: [456, 789],
            accessLevel: 30,
          },
        },
      ],
    }),
  },
  {
    description: 'Add users to a group as Guests',
    example: yaml.stringify({
      steps: [
        {
          id: 'gitlabGroupUser',
          name: 'Add Users to Group',
          action: 'gitlab:group:user',
          input: {
            repoUrl: 'gitlab.com',
            groupId: 123,
            userIds: [456],
            accessLevel: 10,
          },
        },
      ],
    }),
  },
  {
    description: 'Add users to a group with a custom token',
    example: yaml.stringify({
      steps: [
        {
          id: 'gitlabGroupUser',
          name: 'Add Users to Group',
          action: 'gitlab:group:user',
          input: {
            repoUrl: 'gitlab.com',
            groupId: 123,
            userIds: [456, 789],
            accessLevel: 30,
            token: '${{ secrets.GITLAB_TOKEN }}',
          },
        },
      ],
    }),
  },
];
