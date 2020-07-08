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
const { getProgramId, getCurrentStep } = require('../../cloudmanager-helpers')
const { cli } = require('cli-ux')
const commonFlags = require('../../common-flags')

class ListCurrentExecutionsCommand extends BaseCommand {
    async run() {
        const { flags } = this.parse(ListCurrentExecutionsCommand)

        let result;

        const programId = await getProgramId(flags)

        try {
          result = await this.listCurrentExecutions(programId, flags.passphrase)
        } catch (error) {
          this.error(error.message)
        }

        cli.table(result, {
          pipelineId: {
            header: "Pipeline Id"
          },
          id: {
            header: "Execution Id"
          },
          currentStep: {
            header: "Current Step Action",
            get: item => getCurrentStep(item).action
          },
          currentStepStatus: {
            header: "Current Step Status",
            get: item => getCurrentStep(item).status
          }
        }, {
          printLine: this.log
        })

        return result
    }

    async listCurrentExecutions(programId, passphrase = null) {
        return this.withClient(passphrase, async client => {
            const pipelines = await client.listPipelines(programId, {
                busy: true
            })
            return await Promise.all(pipelines.map(async pipeline => await client.getCurrentExecution(programId, pipeline.id)))
        })
    }
}

ListCurrentExecutionsCommand.description = 'list running pipeline executions'

ListCurrentExecutionsCommand.flags = {
    ...commonFlags.global,
    ...commonFlags.programId
}

module.exports = ListCurrentExecutionsCommand
