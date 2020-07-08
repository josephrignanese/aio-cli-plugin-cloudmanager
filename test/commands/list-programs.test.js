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

const { resetCurrentOrgId, setCurrentOrgId } = require('@adobe/aio-lib-ims')
const ListProgramsCommand = require('../../src/commands/cloudmanager/list-programs')

beforeEach(() => {
    resetCurrentOrgId()
})

test('list-programs - failure', async () => {
    setCurrentOrgId('not-found')
    expect.assertions(2)

    let runResult = ListProgramsCommand.run([])
    await expect(runResult instanceof Promise).toBeTruthy()
    await expect(runResult).rejects.toEqual(new Error('Cannot retrieve programs: https://cloudmanager.adobe.io/api/programs (404 Not Found)'))
})

test('list-programs - forbideen', async () => {
    setCurrentOrgId('forbidden')
    expect.assertions(2)

    let runResult = ListProgramsCommand.run([])
    await expect(runResult instanceof Promise).toBeTruthy()
    await expect(runResult).rejects.toEqual(new Error('Cannot retrieve programs: https://cloudmanager.adobe.io/api/programs (403 Forbidden) - Detail: some message (Code: 1234)'))
})

test('list-programs - success empty', async () => {
    setCurrentOrgId('empty')
    expect.assertions(2)

    let runResult = ListProgramsCommand.run([])
    await expect(runResult instanceof Promise).toBeTruthy()
    await expect(runResult).resolves.toEqual([])
})

test('list-programs - success', async () => {
    setCurrentOrgId('good')

    expect.assertions(2)

    let runResult = ListProgramsCommand.run([])
    await expect(runResult instanceof Promise).toBeTruthy()
    await expect(runResult).resolves.toMatchObject([{
        id: "4",
        name: "test0",
        enabled: true
    },{
        id: "5",
        name: "test1",
        enabled: true
    },
    {
        id: "6",
        name: "test2",
        enabled: false
    },
    {
        id: "7",
        name: "test3",
        enabled: true
    }])
})

test('list-programs - filtered', async () => {
    setCurrentOrgId('good')

    expect.assertions(2)

    let runResult = ListProgramsCommand.run(["-e"])
    await expect(runResult instanceof Promise).toBeTruthy()
    await expect(runResult).resolves.toMatchObject([{
        id: "4",
        name: "test0",
        enabled: true
    },{
        id: "5",
        name: "test1",
        enabled: true
    },{
        id: "7",
        name: "test3",
        enabled: true
    }])
})
