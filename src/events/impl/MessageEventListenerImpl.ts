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

import {Message} from 'discord.js'
import {argv, commandHandler, config, Log} from '../../main'
import IEventListener from '../IEventListener'

export default class MessageEventListenerImpl implements IEventListener<Message> {

    name = (): string => 'message'

    run = (result: Message): void => {
        // stop if author of the message is a bot
        if (result.author.bot) {
            Log.debug(`Ignored message from bot ${result.author.tag} in #${result.channel.id}.`)
            return
        }
        // stop if message was sent in no text channel
        if ('text' !== result.channel.type) {
            Log.debug(`Ignored message from ${result.author.tag} in ${result.channel.type}-channel #${result.channel.id}.`)
            return
        }
        // stop if bot is in debug-mode and author of the message is no bot owner
        if (argv.get('debug') && !config.services.discord.owner.includes(result.author.id)) {
            Log.debug(`Ignored message from ${result.author.tag} in #${result.channel.id} for not being a bot owner.`)
            return
        }
        // handle commands
        if (!commandHandler.handle(result)) {
            // todo handle normal chat message
        }
    }
}