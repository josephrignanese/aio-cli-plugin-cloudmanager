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

class CancelCurrentExecutionCommand extends BaseCommand {
  async run () {
    const { args, flags } = this.parse(CancelCurrentExecutionCommand)

    const programId = await getProgramId(flags)

    let result

    cli.action.start("cancelling execution")

    try {
      result = await this.cancelCurrentExecution(programId, args.pipelineId, flags.passphrase)
    } catch (error) {
      cli.action.stop(error.message)
      return
    }

    cli.action.stop('cancelled')

    return result
  }

  async cancelCurrentExecution (programId, pipelineId, passphrase = null) {
    return this.withClient(passphrase, client => client.cancelCurrentExecution(programId, pipelineId))
  }
}

CancelCurrentExecutionCommand.description = 'cancel current pipeline execution either by cancelling the current step, rejecting a waiting quality gate, or rejecting the approval step'

CancelCurrentExecutionCommand.flags = {
  ...commonFlags.global,
  ...commonFlags.programId
}

CancelCurrentExecutionCommand.args = [
    {name: 'pipelineId', required: true, description: "the pipeline id"}
]

module.exports = CancelCurrentExecutionCommand
