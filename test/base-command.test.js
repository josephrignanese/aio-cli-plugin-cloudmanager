/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/


const { resetCurrentOrgId, setCurrentOrgId, context } = require('@adobe/aio-lib-ims')
const Config = require('@adobe/aio-lib-core-config')
const BaseCommand = require('../src/base-command')

beforeEach(() => {
    resetCurrentOrgId()
})

test('base-command - missing config', async () => {
    expect.assertions(2)

    let runResult = new BaseCommand().withClient(undefined, () => undefined)
    await expect(runResult instanceof Promise).toBeTruthy()
    await expect(runResult).rejects.toEqual(new Error('Unable to find IMS context aio-cli-plugin-cloudmanager'))
})

test('base-command - no passphrase', async () => {
    setCurrentOrgId('not-found')

    expect.assertions(2)

    let runResult = new BaseCommand().withClient(undefined, () => true)
    await expect(runResult instanceof Promise).toBeTruthy()
    await expect(runResult).resolves.toBeTruthy()
})

test('base-command - passphrase', async () => {
    setCurrentOrgId('not-found')

    expect.assertions(7)

    let runResult = new BaseCommand().withClient('something', () => true)
    await expect(runResult instanceof Promise).toBeTruthy()
    await expect(runResult).resolves.toBeTruthy()
    await expect(context.set.mock.calls.length).toEqual(1)
    await expect(context.set.mock.calls[0][1].passphrase).toEqual('something')
    await expect(context.set.mock.calls[0][2]).toBeTruthy()

    const contextName = context.set.mock.calls[0][0]
    await expect(Config.delete.mock.calls.length).toEqual(1)
    await expect(Config.delete.mock.calls[0][0]).toEqual(`ims.contexts.${contextName}`)

})
