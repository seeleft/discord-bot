/*
 * This file is licensed under the MIT License and is part of the 'discord-bot' project.
 * Copyright (c) 2019 Daniel Riegler
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the 'Software'), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import Lodash from 'lodash'
import AbstractCommand, {CommandExecutor, CommandMeta} from '../Command'
import {MessageEmbedField, RichEmbed} from 'discord.js'
import {commandHandler} from '../../main'

export default class HelpCommandImpl extends AbstractCommand {

    constructor() {
        super(new CommandMeta(new Array<string>('help', 'hilfe')))
    }

    execute = (executor: CommandExecutor, args: Array<string>): boolean => {
        // check argument length
        if (0 !== args.length)
            return false

        // lookup available commands for executor
        const fields: Array<MessageEmbedField> = []
        // noinspection TypeScriptValidateJSTypes
        Lodash.filter(commandHandler.commands())
            // filter out commmand if no description is set
            .filter(command => command.meta().description())
            // filter out command if executor is not permitted to execute it
            .filter(command => command.meta().permitted(executor.member()))
            // parse the actual commands to a discord.js readable embed-field
            .forEach(command =>
                // push an embed-field to the array
                fields.push({
                    name: `${commandHandler.prefix()}${command.meta().alias()[0]} ${command.meta().usage() || ''}`.trim(),
                    value: command.meta().description() || ''
                } as MessageEmbedField)
            )

        // send message to channel
        executor.channel().send(new RichEmbed({
            title: `Verfügbare Befehle (${fields.length})`,
            description: 'Angepasst an die aktuelle Rolle\n\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_',
            color: executor.member().displayColor,
            timestamp: new Date(),
            footer: {
                icon_url: executor.user().avatarURL,
                text: `Angefragt von ${executor.user().tag}`
            },
            fields
        }))
        return true
    }

}