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

const { flags } = require('@oclif/command')
const { cli } = require('cli-ux')
const BaseCommand = require('../../base-command')
const commonFlags = require('../../common-flags')

class ListProgramsCommand extends BaseCommand {
    async run() {
        const { flags } = this.parse(ListProgramsCommand)
        let result

        try {
            result = await this.listPrograms(flags.passphrase)
        } catch (error) {
            this.error(error.message)
        }

        if (flags.enabledonly) {
            result = result.filter(p => p.enabled)
        }

        cli.table(result, {
            id: {
                header: "Program Id"
            },
            name: {},
            enabled: {}
        }, {
                printLine: this.log
            })

        return result
    }

    async listPrograms(passphrase = null) {
        return this.withClient(passphrase, client => client.listPrograms())
    }
}

ListProgramsCommand.description = 'lists programs available in Cloud Manager'

ListProgramsCommand.flags = {
    ...commonFlags.global,
    enabledonly: flags.boolean({ char: 'e', description: 'only output Cloud Manager-enabled programs' })
}

module.exports = ListProgramsCommand
