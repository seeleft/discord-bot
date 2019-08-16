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
import {GuildMember} from 'discord.js'
import MessageUtil from '../../util/MessageUtil'
import {botMember} from '../../main'

export default class NickCommand extends AbstractCommand {

    constructor() {
        super(new CommandMeta(new Array<string>('nick'), 'MANAGE_NICKNAMES', 'Ändert den Nickname eines Users oder des Bots.', '[@user] <Nickname...>'))
    }

    execute = (executor: CommandExecutor, args: Array<string>): boolean => {
        // check argument length
        if (1 > args.length)
            return false

        // check if target is a member
        if (args[0].startsWith('@')) {
            // pick first member mention
            const member: GuildMember = executor.mentions().members.first()
            // check if member is actually available
            if (!member)
                return false
            // extract the nickname from the array
            args.shift()
            const name: string = args.join(' ')
            // update the member's nickname
            member.setNickname(name)
                .then(() => MessageUtil.reply(executor, `Du hast den Nickname von <@${member.id}> zu \`${name}\` geändert.`))
                .catch(error => MessageUtil.reply(executor, `Konnte den Nickname von <@${member.id}> nicht verändern: ${error.message}`))
            return true
        }

        // check if executor has administrative permissions
        if (!executor.member().hasPermission('ADMINISTRATOR')) {
            MessageUtil.reply(executor, 'Du bist kein Administrator. ¯\\_(ツ)_/¯')
            return true
        }

        // extract the nickname from the array
        const name: string = args.join(' ')
        // update the bot's nickname
        botMember.setNickname(name)
            .then(() => MessageUtil.reply(executor, `Du hast den Nickname vom Bot zu \`${name}\` geändert.`))
            .catch(error => MessageUtil.reply(executor, `Konnte den Nickname vom Bot nicht verändern: ${error.message}`))
        return true
    }

}