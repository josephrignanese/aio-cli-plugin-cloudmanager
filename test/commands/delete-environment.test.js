/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const { cli } = require('cli-ux')
const { init, mockSdk } = require('@adobe/aio-lib-cloudmanager')
const { setStore } = require('@adobe/aio-lib-core-config')
const DeleteEnvironmentCommand = require('../../src/commands/cloudmanager/delete-environment')

beforeEach(() => {
  setStore({})
})

test('delete-environment - missing arg', async () => {
  expect.assertions(2)

  const runResult = DeleteEnvironmentCommand.run([])
  await expect(runResult instanceof Promise).toBeTruthy()
  await expect(runResult).rejects.toSatisfy(err => err.message.indexOf('Missing 1 required arg') === 0)
})

test('delete-environment - missing config', async () => {
  expect.assertions(3)

  const runResult = DeleteEnvironmentCommand.run(['--programId', '4', '10'])
  await expect(runResult instanceof Promise).toBeTruthy()
  await expect(runResult).resolves.toEqual(undefined)
  await expect(cli.action.stop.mock.calls[0][0]).toBe('missing config data: jwt-auth')
})

test('delete-environment - configured', async () => {
  setStore({
    'jwt-auth': JSON.stringify({
      client_id: '1234',
      jwt_payload: {
        iss: 'good'
      }
    })
  })

  expect.assertions(5)

  const runResult = DeleteEnvironmentCommand.run(['--programId', '4', '3'])
  await expect(runResult instanceof Promise).toBeTruthy()
  await runResult
  await expect(init.mock.calls.length).toEqual(1)
  await expect(init).toHaveBeenCalledWith('good', '1234', 'fake-token', 'https://cloudmanager.adobe.io')
  await expect(mockSdk.deleteEnvironment.mock.calls.length).toEqual(1)
  await expect(mockSdk.deleteEnvironment).toHaveBeenCalledWith('4', '3')
})
