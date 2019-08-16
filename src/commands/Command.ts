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

import Path from 'path'
import Lodash from 'lodash'
import {GuildMember, Message, MessageMentions, PermissionString, TextChannel, User} from 'discord.js'
import {Log} from '../main'
import MessageUtil from '../util/MessageUtil'

export class CommandExecutor {

    private readonly $member: GuildMember

    private readonly $channel: TextChannel

    private readonly $mentions: MessageMentions

    constructor(message: Message) {
        this.$member = message.member
        this.$channel = message.channel as TextChannel
        this.$mentions = message.mentions
    }

    member = (): GuildMember => this.$member

    user = (): User => this.$member.user

    channel = (): TextChannel => this.$channel

    mentions = (): MessageMentions => this.$mentions

}

export class CommandMeta {

    // noinspection JSMismatchedCollectionQueryUpdate
    private readonly $alias: Array<string>

    private readonly $description?: string

    private readonly $usage?: string

    private readonly $permission?: PermissionString

    constructor(alias: Array<string>, permission?: PermissionString, description?: string, usage?: string) {
        this.$alias = alias
        this.$permission = permission
        this.$description = description
        this.$usage = usage
    }

    alias = (): Array<string> => this.$alias

    permission = (): PermissionString | undefined => this.$permission

    permitted = (member: GuildMember): boolean => (this.$permission ? member.hasPermission(this.$permission) : true)

    description = (): string | undefined => this.$description

    usage = (): string | undefined => this.$usage

}

export class CommandHandler {

    private static readonly TAG: string = `[${Path.basename(__dirname)}/${Path.basename(__filename)}]`

    private readonly $commands: Array<AbstractCommand>

    private readonly $prefix: string

    constructor(commands: Array<AbstractCommand>, prefix: string) {
        this.$commands = commands
        this.$prefix = prefix
    }

    handle = (message: Message): boolean => {
        // split message in its components
        let content: Array<string> = message.cleanContent.toLowerCase().trim().split(/\s/)
        // check for prefix
        if (!content[0].startsWith(this.$prefix)) {
            // message is no command
            Log.debug(`${CommandHandler.TAG} Ignored message from ${message.author.tag} without prefix (${this.$prefix}) in #${message.channel.id}.`)
            return false
        }
        // extract name of the command
        const name: string = content[0].substring(this.$prefix.length)
        // check for empty command
        if ('' === name) {
            Log.debug(`${CommandHandler.TAG} Ignored empty command from ${message.author.tag} in ${message.channel.id}.`)
            return true
        }
        // remove command from arguments array
        content.shift()
        // lookup command
        const hits: Array<AbstractCommand> = Lodash.filter(this.$commands, command => command.meta().alias().includes(name))
        // check if no commands hit the query
        if (0 === hits.length)
        // command does not exist
            MessageUtil.reply(message, `Ich konnte leider keinen Befehl mit dem Namen "${name}" finden.\nDu kannst versuchen mit \`${this.$prefix}help\` eine Liste aller verfügbaren Befehle zu listen.`)
        else {
            // extract first command from array
            const command: AbstractCommand = hits[0]
            // check for permissions
            if (!command.meta().permitted(message.member))
                MessageUtil.reply(message, `Dir fehlt die Berechtigung \`${command.meta().permission()}\`.`)
            else {
                const result: boolean = command.execute(new CommandExecutor(message), content)
                // send usage on failure
                if (!result)
                    MessageUtil.reply(message, `Falsche Verwendung. Beispiel: \`${this.$prefix}${name}${command.meta().usage() ? ` ${command.meta().usage()}` : ''}\``)
            }
        }
        return true
    }

    commands = (): Array<AbstractCommand> => this.$commands

    prefix = (): string => this.$prefix

}

export default abstract class AbstractCommand {

    private readonly $meta: CommandMeta

    protected constructor(meta: CommandMeta) {
        this.$meta = meta
    }

    abstract execute(executor: CommandExecutor, args: Array<string>): boolean

    meta = (): CommandMeta => this.$meta

}