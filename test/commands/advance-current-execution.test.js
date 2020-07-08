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
const fetchMock = require('node-fetch')
const { resetCurrentOrgId, setCurrentOrgId } = require('@adobe/aio-lib-ims')
const AdvanceCurrentExecution = require('../../src/commands/cloudmanager/advance-current-execution')

beforeEach(() => {
    resetCurrentOrgId()
})

test('advance-current-execution - missing arg', async () => {
    expect.assertions(2)

    let runResult = AdvanceCurrentExecution.run([])
    await expect(runResult instanceof Promise).toBeTruthy()
    await expect(runResult).rejects.toSatisfy(err => err.message.indexOf("Missing 1 required arg") === 0)
})

test('advance-current-execution - missing config', async () => {
    expect.assertions(3)

    let runResult = AdvanceCurrentExecution.run(["--programId", "5", "10"])
    await expect(runResult instanceof Promise).toBeTruthy()
    await expect(runResult).resolves.toEqual(undefined)
    await expect(cli.action.stop.mock.calls[0][0]).toBe("Unable to find IMS context aio-cli-plugin-cloudmanager")
})

test('advance-current-execution - bad pipeline', async () => {
setCurrentOrgId('good')

    expect.assertions(3)

    let runResult = AdvanceCurrentExecution.run(["--programId", "5", "10"])
    await expect(runResult instanceof Promise).toBeTruthy()
    await expect(runResult).resolves.toEqual(undefined)
    await expect(cli.action.stop.mock.calls[0][0]).toBe("Cannot get execution. Pipeline 10 does not exist.")
})

test('advance-current-execution - build running', async () => {
setCurrentOrgId('good')
    fetchMock.setPipeline7Execution("1005")

    expect.assertions(3)

    let runResult = AdvanceCurrentExecution.run(["--programId", "5", "7"])
    await expect(runResult instanceof Promise).toBeTruthy()
    await expect(runResult).resolves.toEqual(undefined)
    await expect(cli.action.stop.mock.calls[0][0]).toBe("Cannot find a waiting step for pipeline 7")
})

test('advance-current-execution - code quality waiting', async () => {
setCurrentOrgId('good')
    fetchMock.setPipeline7Execution("1006")

    expect.assertions(3)

    let runResult = AdvanceCurrentExecution.run(["--programId", "5", "7"])
    await expect(runResult instanceof Promise).toBeTruthy()
    await expect(runResult).resolves.toEqual({})
    await expect(fetchMock.called('advance-1006')).toBe(true)
})

test('advance-current-execution - approval waiting', async () => {
setCurrentOrgId('good')
    fetchMock.setPipeline7Execution("1007")

    expect.assertions(3)

    let runResult = AdvanceCurrentExecution.run(["--programId", "5", "7"])
    await expect(runResult instanceof Promise).toBeTruthy()
    await expect(runResult).resolves.toEqual({})
    await expect(fetchMock.called('advance-1007')).toBe(true)
})
