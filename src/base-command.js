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

const { Command } = require('@oclif/command')
const Config = require('@adobe/aio-lib-core-config')
const { context, getToken } = require('@adobe/aio-lib-ims')
const { config } = require('./constants')
const Client = require('./client')


class BaseCommand extends Command {

    async withClient(passphrase, callback) {
        let temporaryContext
        await context.setCurrent(config.imsContext)
        const contextData = await context.get()
        if (!contextData || !contextData.data) {
            throw new Error(`Unable to find IMS context ${config.imsContext}`)
        }

        const apiKey = contextData.data.client_id
        const orgId = contextData.data.ims_org_id

        if (passphrase) {
            const temporaryContextData = {
                ...contextData.data,
                passphrase
            }
            temporaryContext = `temp-${config.imsContext}-${new Date().getTime()}`
            context.set(temporaryContext, temporaryContextData, true)
            context.setCurrent(temporaryContext)
        }

        const accessToken = await getToken(temporaryContext || config.imsContext)

        try {
            const client = new Client(orgId, accessToken, apiKey)
            return callback.call(undefined, client)
        } finally {
            if (temporaryContext) {
                Config.delete(`ims.contexts.${temporaryContext}`)
            }
        }
    }
}

module.exports = BaseCommand
