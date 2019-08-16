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
import {GuildMember, RichEmbed} from 'discord.js'
import MessageUtil from '../../util/MessageUtil'
import {config, homeGuild} from '../../main'

export default class KickCommand extends AbstractCommand {

    constructor() {
        super(new CommandMeta(new Array<string>('kick'), 'KICK_MEMBERS', 'Wirft einen User vom Discord.', '<@user> <Grund...>'))
    }

    execute = (executor: CommandExecutor, args: Array<string>): boolean => {
        // check argument length
        if (2 > args.length)
            return false

        // get first mentioned member
        const member: GuildMember = executor.mentions().members.first()

        // check if mentioned member is actually available
        if (!member)
            return false

        // check if member is kickable
        if (!member.kickable) {
            MessageUtil.reply(executor, `Du kannst <@${member.id}> nicht vom Discord werfen.`)
            return true
        }

        // extract reason from arguments
        args.shift()
        const reason: string = args.join(' ')

        // kick the member
        member.kick(reason).then(() => {
                // send command reply
                MessageUtil.reply(executor, `Du hast <@${member.id}> vom Discord geworfen.\nAchtung: Dieses Aktion wurde der Leitung mitgeteilt.`)
                // inform target
                member.send(`Du wurdest vom "${homeGuild.name}" Discord geworfen: \`${reason}\``)
                // inform bot owner
                MessageUtil.sendToOwner(new RichEmbed({
                    author: {
                        name: `User: ${member.user.tag}`,
                        icon_url: member.user.avatarURL
                    },
                    description: `Wurde von der Guild geworfen: \`${reason}\``,
                    color: config.settings.baseColor,
                    timestamp: new Date(),
                    footer: {
                        icon_url: executor.user().avatarURL,
                        text: `Gekickt von ${executor.user().tag}`
                    }
                }))
            }
        ).catch(error => MessageUtil.reply(executor, `Du konntest <@${member.id}> nicht von der Guild werden: \`${error.message}\``))
        return true
    }

}