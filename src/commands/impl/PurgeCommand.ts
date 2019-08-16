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
import MessageUtil from '../../util/MessageUtil'

const MIN_MESSAGES: number = 2, MAX_MESSAGES: number = 100

export default class PurgeCommand extends AbstractCommand {

    constructor() {
        super(new CommandMeta(new Array<string>('purge', 'clear'), 'MANAGE_MESSAGES', 'Entfernt die letzten x Nachrichten aus dem aktuellen Channel.', '<Nachrichten>'))
    }

    execute = (executor: CommandExecutor, args: Array<string>): boolean => {
        // check argument length
        if (1 !== args.length)
            return false

        // parse number
        let messages: number
        try {
            messages = parseInt(args[0])
        } catch (error) {
            MessageUtil.reply(executor, 'Du musst eine gültige Zahl angeben.')
            return true
        }

        // check number
        if (MIN_MESSAGES > messages || MAX_MESSAGES < messages) {
            MessageUtil.reply(executor, `Die Zahl muss zwischen ${MIN_MESSAGES} und ${MAX_MESSAGES} liegen.`)
            return true
        }

        // purge messages
        executor.channel().bulkDelete(messages)
            .then(collection => MessageUtil.reply(executor, `Es wurden ${collection.size} Nachrichten gelöscht.`))
            .catch(error => MessageUtil.reply(executor, `Konnte Nachrichten nicht löschen: \`${error.message}\``))

        return true
    }

}