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

import AbstractCommand, {CommandExecutor, CommandMeta} from '../Command'
import {InviteOptions, TextChannel} from 'discord.js'
import MessageUtil from '../../util/MessageUtil'
import {config, homeGuild} from '../../main'

// temporary invitation options
const OPTIONS: InviteOptions = {}

export default class InviteCommand extends AbstractCommand {

    constructor() {
        super(new CommandMeta(new Array<string>('invite'), undefined, 'Generiert einen Einladungslink.', '[#channel]'))
    }


    execute = (executor: CommandExecutor, args: Array<string>): boolean => {
        // check argument length
        if (1 < args.length)
            return false

        // check if first parameter starts with a hashtag (could be a channel tag)
        if (args.length == 1 && args[0].startsWith('#')) {
            // extract channel from mentions
            const channel: TextChannel = executor.mentions().channels.first()
            // exit command with invalid syntax if channel does not exist
            if (!channel)
                return false
            // create the actual invitation
            channel.createInvite(OPTIONS)
                .then(invite => MessageUtil.reply(executor, `Dein Einladungslink für <#${channel.id}>: ${invite}`))
                .catch(error => MessageUtil.reply(executor, `Konnte Einladungslink für <#${channel.id}> nicht anlegen: ${error.message}`))
            return true
        }
        // send permanent invitation link from config
        MessageUtil.reply(executor, `Einladungslink für \`${homeGuild.name}\`: ${config.services.discord.invitation}`)
        return true
    }


}