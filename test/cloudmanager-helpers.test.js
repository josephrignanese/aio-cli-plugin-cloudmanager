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

const { setStore } = require('@adobe/aio-lib-core-config')
const { isWithinFiveMinutesOfUTCMidnight, getBaseUrl } = require('../src/cloudmanager-helpers')

test('isWithinFiveMinutesOfUTCMidnight', async () => {
    const utcDate1 = new Date(Date.UTC(2019, 9, 12, 23, 55, 14));
    expect(isWithinFiveMinutesOfUTCMidnight(utcDate1)).toEqual(true)
    const utcDate2 = new Date(Date.UTC(2019, 9, 12, 23, 53, 14));
    expect(isWithinFiveMinutesOfUTCMidnight(utcDate2)).toEqual(false)
    const utcDate3 = new Date(Date.UTC(2019, 9, 12, 0, 4, 14));
    expect(isWithinFiveMinutesOfUTCMidnight(utcDate3)).toEqual(true)
    const utcDate4 = new Date(Date.UTC(2019, 9, 12, 0, 6, 0));
    expect(isWithinFiveMinutesOfUTCMidnight(utcDate4)).toEqual(false)
})

test('getting base url - bad value', async () => {
    setStore({
        'cloudmanager': '5'
    })
    const result = getBaseUrl()
    await expect(result instanceof Promise).toBeTruthy()
    await expect(result).resolves.toEqual('https://cloudmanager.adobe.io')
})

test('getting base url - default', async () => {
    const result = getBaseUrl()
    await expect(result instanceof Promise).toBeTruthy()
    await expect(result).resolves.toEqual('https://cloudmanager.adobe.io')
})

test('getting base url - custom', async () => {
    setStore({
        'cloudmanager': JSON.stringify({'base_url' : 'http://www.test.com'})
    })

    const result = getBaseUrl()
    await expect(result instanceof Promise).toBeTruthy()
    await expect(result).resolves.toEqual('http://www.test.com')
})
