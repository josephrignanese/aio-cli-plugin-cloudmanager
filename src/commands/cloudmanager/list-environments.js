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

const BaseCommand = require('../../base-command')
const { getProgramId } = require('../../cloudmanager-helpers')
const { cli } = require('cli-ux')
const commonFlags = require('../../common-flags')

class ListEnvironmentsCommand extends BaseCommand {
    async run() {
        const { flags } = this.parse(ListEnvironmentsCommand)

        const programId = await getProgramId(flags)

        let result

        try {
            result = await this.listEnvironments(programId, flags.passphrase)
        } catch (error) {
            this.error(error.message)
        }

        cli.table(result, {
            id: {
                header: "Environment Id"
            },
            name: {},
            type: {},
            description: {
                header: "Description",
                get: item => item.description ? item.description : ""
              }
        }, {
                printLine: this.log
            })

        return result
    }

    async listEnvironments(programId, passphrase = null) {
        return this.withClient(passphrase, client => client.listEnvironments(programId))
    }
}

ListEnvironmentsCommand.description = 'lists environments available in a Cloud Manager program'

ListEnvironmentsCommand.flags = {
    ...commonFlags.global,
    ...commonFlags.programId
}

module.exports = ListEnvironmentsCommand
