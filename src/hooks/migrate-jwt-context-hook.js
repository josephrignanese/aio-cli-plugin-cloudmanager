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

const Config = require('@adobe/aio-lib-core-config')
const aioConsoleLogger = require('@adobe/aio-lib-core-logging')('@adobe/aio-cli-plugin-cloudmanager:migrate-jwt-context-hook', { provider: 'debug' })
const { config } = require('../constants')

const migrate = async () => {
  aioConsoleLogger.debug('hook running.')

  const oldConfigKey = 'jwt-auth'
  const newConfigKey = `ims.contexts.${config.imsContext}`

  const oldConfig = Config.get(oldConfigKey)
  const newConfig = Config.get(newConfigKey)

  if (oldConfig && !newConfig) {
    aioConsoleLogger.info(`Migrating JWT configuration from '${oldConfigKey}' to '${newConfigKey}'.`)

    const newConfigData = {
        client_id: oldConfig.client_id,
        client_secret: oldConfig.client_secret,
        technical_account_id: oldConfig.jwt_payload.sub,
        technical_account_email: 'unused',
        ims_org_id: oldConfig.jwt_payload.iss,
        private_key: oldConfig.jwt_private_key,
        meta_scopes: []
    }
    Object.keys(oldConfig.jwt_payload).
        filter(key => key.startsWith('https://ims-na1.adobelogin.com/s/') && typeof oldConfig.jwt_payload[key] === 'boolean' && oldConfig.jwt_payload[key]).
        forEach(key => newConfigData.meta_scopes.push(key.substring(33)))

    aioConsoleLogger.debug(`Writing to new config key '${newConfigKey}': ${JSON.stringify(newConfigData, null, 2)}`)
    Config.set(newConfigKey, newConfigData)
    aioConsoleLogger.info(`Your JWT configuration has been migrated. The original configuration has been left in place. If it is no longer needed, you may remove it using 'aio config:delete ${oldConfigKey}'`)
  }
}

module.exports = migrate
