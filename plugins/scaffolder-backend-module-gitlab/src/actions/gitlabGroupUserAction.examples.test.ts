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

import { ScmIntegrations } from '@backstage/integration';
import { createMockActionContext } from '@backstage/plugin-scaffolder-node-test-utils';
import yaml from 'yaml';
import { createGitlabGroupUserAction } from './gitlabGroupUserAction';
import { examples } from './gitlabGroupUserAction.examples';
import { mockServices } from '@backstage/backend-test-utils';

const mockGitlabClient = {
  GroupMembers: {
    add: jest.fn(),
    remove: jest.fn(),
  },
};

jest.mock('@gitbeaker/rest', () => ({
  Gitlab: class {
    constructor() {
      return mockGitlabClient;
    }
  },
}));

describe('gitlab:group:user examples', () => {
  const mockContext = createMockActionContext();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const config = mockServices.rootConfig({
    data: {
      integrations: {
        gitlab: [
          {
            host: 'gitlab.com',
            token: 'tokenlols',
            apiBaseUrl: 'https://gitlab.com/api/v4',
          },
        ],
      },
    },
  });
  const integrations = ScmIntegrations.fromConfig(config);

  const action = createGitlabGroupUserAction({ integrations });

  it(`Should ${examples[0].description}`, async () => {
    mockGitlabClient.GroupMembers.add.mockResolvedValue({});

    await action.handler({
      ...mockContext,
      input: yaml.parse(examples[0].example).steps[0].input,
    });

    expect(mockGitlabClient.GroupMembers.add).toHaveBeenCalledWith(
      123,
      456,
      30,
    );

    expect(mockContext.output).toHaveBeenCalledWith('userIds', [456]);
    expect(mockContext.output).toHaveBeenCalledWith('groupId', 123);
    expect(mockContext.output).toHaveBeenCalledWith('accessLevel', 30);
  });

  it(`Should ${examples[1].description}`, async () => {
    mockGitlabClient.GroupMembers.add.mockResolvedValue({});

    await action.handler({
      ...mockContext,
      input: yaml.parse(examples[1].example).steps[0].input,
    });

    expect(mockGitlabClient.GroupMembers.add).toHaveBeenCalledTimes(3);
    expect(mockGitlabClient.GroupMembers.add).toHaveBeenCalledWith(
      123,
      456,
      30,
    );
    expect(mockGitlabClient.GroupMembers.add).toHaveBeenCalledWith(
      123,
      789,
      30,
    );
    expect(mockGitlabClient.GroupMembers.add).toHaveBeenCalledWith(
      123,
      101,
      30,
    );

    expect(mockContext.output).toHaveBeenCalledWith('userIds', [456, 789, 101]);
    expect(mockContext.output).toHaveBeenCalledWith('groupId', 123);
    expect(mockContext.output).toHaveBeenCalledWith('accessLevel', 30);
  });

  it(`Should ${examples[2].description}`, async () => {
    mockGitlabClient.GroupMembers.add.mockResolvedValue({});

    await action.handler({
      ...mockContext,
      input: yaml.parse(examples[2].example).steps[0].input,
    });

    expect(mockGitlabClient.GroupMembers.add).toHaveBeenCalledTimes(2);
    expect(mockGitlabClient.GroupMembers.add).toHaveBeenCalledWith(
      123,
      456,
      40,
    );
    expect(mockGitlabClient.GroupMembers.add).toHaveBeenCalledWith(
      123,
      789,
      40,
    );

    expect(mockContext.output).toHaveBeenCalledWith('userIds', [456, 789]);
    expect(mockContext.output).toHaveBeenCalledWith('groupId', 123);
    expect(mockContext.output).toHaveBeenCalledWith('accessLevel', 40);
  });

  it(`Should ${examples[3].description}`, async () => {
    mockGitlabClient.GroupMembers.remove.mockResolvedValue(undefined);

    await action.handler({
      ...mockContext,
      input: yaml.parse(examples[3].example).steps[0].input,
    });

    expect(mockGitlabClient.GroupMembers.remove).toHaveBeenCalledTimes(2);
    expect(mockGitlabClient.GroupMembers.remove).toHaveBeenCalledWith(123, 456);
    expect(mockGitlabClient.GroupMembers.remove).toHaveBeenCalledWith(123, 789);

    expect(mockContext.output).toHaveBeenCalledWith('userIds', [456, 789]);
    expect(mockContext.output).toHaveBeenCalledWith('groupId', 123);
  });

  it(`Should ${examples[4].description}`, async () => {
    await action.handler({
      ...mockContext,
      isDryRun: yaml.parse(examples[4].example).steps[0].isDryRun,
      input: yaml.parse(examples[4].example).steps[0].input,
    });

    expect(mockGitlabClient.GroupMembers.add).not.toHaveBeenCalled();

    expect(mockContext.output).toHaveBeenCalledWith('userIds', [456, 789]);
    expect(mockContext.output).toHaveBeenCalledWith('groupId', 123);
    expect(mockContext.output).toHaveBeenCalledWith('accessLevel', 30);
  });

  it(`Should ${examples[5].description}`, async () => {
    mockGitlabClient.GroupMembers.add.mockResolvedValue({});

    await action.handler({
      ...mockContext,
      input: yaml.parse(examples[5].example).steps[0].input,
    });

    expect(mockGitlabClient.GroupMembers.add).toHaveBeenCalledWith(
      123,
      456,
      10,
    );

    expect(mockContext.output).toHaveBeenCalledWith('userIds', [456]);
    expect(mockContext.output).toHaveBeenCalledWith('groupId', 123);
    expect(mockContext.output).toHaveBeenCalledWith('accessLevel', 10);
  });

  it(`Should ${examples[6].description}`, async () => {
    mockGitlabClient.GroupMembers.add.mockResolvedValue({});

    await action.handler({
      ...mockContext,
      input: yaml.parse(examples[6].example).steps[0].input,
    });

    expect(mockGitlabClient.GroupMembers.add).toHaveBeenCalledTimes(2);
    expect(mockGitlabClient.GroupMembers.add).toHaveBeenCalledWith(
      123,
      456,
      30,
    );
    expect(mockGitlabClient.GroupMembers.add).toHaveBeenCalledWith(
      123,
      789,
      30,
    );

    expect(mockContext.output).toHaveBeenCalledWith('userIds', [456, 789]);
    expect(mockContext.output).toHaveBeenCalledWith('groupId', 123);
    expect(mockContext.output).toHaveBeenCalledWith('accessLevel', 30);
  });
});
