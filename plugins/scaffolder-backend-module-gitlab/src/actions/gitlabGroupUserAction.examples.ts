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
    description: 'Add a user to a group as a Developer',
    example: yaml.stringify({
      steps: [
        {
          id: 'gitlabGroupUser',
          name: 'Add User to Group',
          action: 'gitlab:group:user',
          input: {
            repoUrl: 'gitlab.com',
            groupId: 123,
            userId: 456,
            action: 'add',
            accessLevel: 30,
          },
        },
      ],
    }),
  },
  {
    description: 'Add a user to a group as a Maintainer',
    example: yaml.stringify({
      steps: [
        {
          id: 'gitlabGroupUser',
          name: 'Add User to Group',
          action: 'gitlab:group:user',
          input: {
            repoUrl: 'gitlab.com',
            groupId: 123,
            userId: 456,
            action: 'add',
            accessLevel: 40,
          },
        },
      ],
    }),
  },
  {
    description: 'Remove a user from a group',
    example: yaml.stringify({
      steps: [
        {
          id: 'gitlabGroupUser',
          name: 'Remove User from Group',
          action: 'gitlab:group:user',
          input: {
            repoUrl: 'gitlab.com',
            groupId: 123,
            userId: 456,
            action: 'remove',
          },
        },
      ],
    }),
  },
  {
    description: 'Add a user to a group in dry run mode',
    example: yaml.stringify({
      steps: [
        {
          id: 'gitlabGroupUser',
          name: 'Add User to Group',
          action: 'gitlab:group:user',
          isDryRun: true,
          input: {
            repoUrl: 'gitlab.com',
            groupId: 123,
            userId: 456,
            action: 'add',
            accessLevel: 30,
          },
        },
      ],
    }),
  },
  {
    description: 'Add a user to a group as a Guest',
    example: yaml.stringify({
      steps: [
        {
          id: 'gitlabGroupUser',
          name: 'Add User to Group',
          action: 'gitlab:group:user',
          input: {
            repoUrl: 'gitlab.com',
            groupId: 123,
            userId: 456,
            action: 'add',
            accessLevel: 10,
          },
        },
      ],
    }),
  },
  {
    description: 'Add a user to a group with a custom token',
    example: yaml.stringify({
      steps: [
        {
          id: 'gitlabGroupUser',
          name: 'Add User to Group',
          action: 'gitlab:group:user',
          input: {
            repoUrl: 'gitlab.com',
            groupId: 123,
            userId: 456,
            action: 'add',
            accessLevel: 30,
            token: '${{ secrets.GITLAB_TOKEN }}',
          },
        },
      ],
    }),
  },
];
