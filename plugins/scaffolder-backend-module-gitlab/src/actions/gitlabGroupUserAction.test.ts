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

import { ScmIntegrations } from '@backstage/integration';
import { createMockActionContext } from '@backstage/plugin-scaffolder-node-test-utils';
import { createGitlabGroupUserAction } from './gitlabGroupUserAction';
import { getClient } from '../util';
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

jest.mock('../util', () => ({
  getClient: jest.fn().mockImplementation(() => mockGitlabClient),
  parseRepoUrl: () => ({ host: 'gitlab.com', owner: 'owner', repo: 'repo' }),
}));

describe('gitlab:group:user', () => {
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

  const mockContext = createMockActionContext();

  it('should add a user to a group with the specified access level', async () => {
    mockGitlabClient.GroupMembers.add.mockResolvedValue({
      id: 1,
      user_id: 456,
      group_id: 123,
      access_level: 30,
    });

    await action.handler({
      ...mockContext,
      input: {
        repoUrl: 'gitlab.com?repo=repo&owner=owner',
        groupId: 123,
        userId: 456,
        action: 'add',
        accessLevel: 30,
      },
    });

    expect(mockGitlabClient.GroupMembers.add).toHaveBeenCalledWith(
      123,
      456,
      30,
    );

    expect(mockContext.output).toHaveBeenCalledWith('userId', 456);
    expect(mockContext.output).toHaveBeenCalledWith('groupId', 123);
    expect(mockContext.output).toHaveBeenCalledWith('accessLevel', 30);
  });

  it('should remove a user from a group', async () => {
    mockGitlabClient.GroupMembers.remove.mockResolvedValue(undefined);

    await action.handler({
      ...mockContext,
      input: {
        repoUrl: 'gitlab.com?repo=repo&owner=owner',
        groupId: 123,
        userId: 456,
        action: 'remove',
      },
    });

    expect(mockGitlabClient.GroupMembers.remove).toHaveBeenCalledWith(123, 456);

    expect(mockContext.output).toHaveBeenCalledWith('userId', 456);
    expect(mockContext.output).toHaveBeenCalledWith('groupId', 123);
    expect(mockContext.output).not.toHaveBeenCalledWith(
      'accessLevel',
      expect.anything(),
    );
  });

  it('should throw an error when adding a user without accessLevel', async () => {
    await expect(
      action.handler({
        ...mockContext,
        input: {
          repoUrl: 'gitlab.com?repo=repo&owner=owner',
          groupId: 123,
          userId: 456,
          action: 'add',
        },
      }),
    ).rejects.toThrow('accessLevel is required when action is "add"');

    expect(mockGitlabClient.GroupMembers.add).not.toHaveBeenCalled();
  });

  it('should not call API on dryRun for add action', async () => {
    await action.handler({
      ...mockContext,
      isDryRun: true,
      input: {
        repoUrl: 'gitlab.com?repo=repo&owner=owner',
        groupId: 123,
        userId: 456,
        action: 'add',
        accessLevel: 30,
      },
    });

    expect(mockGitlabClient.GroupMembers.add).not.toHaveBeenCalled();

    expect(mockContext.output).toHaveBeenCalledWith('userId', 456);
    expect(mockContext.output).toHaveBeenCalledWith('groupId', 123);
    expect(mockContext.output).toHaveBeenCalledWith('accessLevel', 30);
  });

  it('should not call API on dryRun for remove action', async () => {
    await action.handler({
      ...mockContext,
      isDryRun: true,
      input: {
        repoUrl: 'gitlab.com?repo=repo&owner=owner',
        groupId: 123,
        userId: 456,
        action: 'remove',
      },
    });

    expect(mockGitlabClient.GroupMembers.remove).not.toHaveBeenCalled();

    expect(mockContext.output).toHaveBeenCalledWith('userId', 456);
    expect(mockContext.output).toHaveBeenCalledWith('groupId', 123);
  });

  it('should use the token from the integration config when none is provided', async () => {
    mockGitlabClient.GroupMembers.add.mockResolvedValue({});

    await action.handler({
      ...mockContext,
      input: {
        repoUrl: 'gitlab.com?repo=repo&owner=owner',
        groupId: 123,
        userId: 456,
        action: 'add',
        accessLevel: 30,
      },
    });

    expect(getClient).toHaveBeenCalledWith(
      expect.not.objectContaining({
        token: expect.anything(),
      }),
    );
  });

  it('should use a provided token for authentication', async () => {
    mockGitlabClient.GroupMembers.add.mockResolvedValue({});

    await action.handler({
      ...mockContext,
      input: {
        repoUrl: 'gitlab.com?repo=repo&owner=owner',
        groupId: 123,
        userId: 456,
        action: 'add',
        accessLevel: 30,
        token: 'mysecrettoken',
      },
    });

    expect(getClient).toHaveBeenCalledWith(
      expect.objectContaining({
        token: 'mysecrettoken',
      }),
    );
  });

  it('should add a user as a Guest (accessLevel 10)', async () => {
    mockGitlabClient.GroupMembers.add.mockResolvedValue({});

    await action.handler({
      ...mockContext,
      input: {
        repoUrl: 'gitlab.com?repo=repo&owner=owner',
        groupId: 123,
        userId: 456,
        action: 'add',
        accessLevel: 10,
      },
    });

    expect(mockGitlabClient.GroupMembers.add).toHaveBeenCalledWith(
      123,
      456,
      10,
    );
  });

  it('should add a user as a Maintainer (accessLevel 40)', async () => {
    mockGitlabClient.GroupMembers.add.mockResolvedValue({});

    await action.handler({
      ...mockContext,
      input: {
        repoUrl: 'gitlab.com?repo=repo&owner=owner',
        groupId: 123,
        userId: 456,
        action: 'add',
        accessLevel: 40,
      },
    });

    expect(mockGitlabClient.GroupMembers.add).toHaveBeenCalledWith(
      123,
      456,
      40,
    );
  });

  it('should add a user as an Owner (accessLevel 50)', async () => {
    mockGitlabClient.GroupMembers.add.mockResolvedValue({});

    await action.handler({
      ...mockContext,
      input: {
        repoUrl: 'gitlab.com?repo=repo&owner=owner',
        groupId: 123,
        userId: 456,
        action: 'add',
        accessLevel: 50,
      },
    });

    expect(mockGitlabClient.GroupMembers.add).toHaveBeenCalledWith(
      123,
      456,
      50,
    );
  });
});
