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

import {Message, RichEmbed, TextChannel, User} from 'discord.js'
import {client, config, Log} from '../main'
import {CommandExecutor} from '../commands/Command'

export default class MessageUtil {

    // prevent instantiaton
    private constructor() {
    }

    static sendToOwner = (message: string | RichEmbed): void => {
        const owners: Array<string> = config.services.discord.owner
        owners.forEach(owner => client.fetchUser(owner)
            .then(user => user.send(message))
            .catch(error => Log.warn(`Could not fetch user with ID: ${owner}: ${error.message}`)))
    }

    static reply = (target: CommandExecutor | Message, message: string | RichEmbed): void => {
        const channel: TextChannel = (target instanceof CommandExecutor ? target.channel() : target.channel) as TextChannel
        const user: User = (target instanceof CommandExecutor ? target.user() : target.author)
        switch (typeof message) {
            case 'string':
                channel.send(`<@${user.id}>\n${message}`)
                break
            case 'object':
                channel.send(message)
                break
        }
    }

}
