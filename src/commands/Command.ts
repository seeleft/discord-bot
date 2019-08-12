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

import { User, PermissionString, TextChannel } from 'discord.js'

export class CommandExecutor {

    private readonly $user: User

    private readonly $channel: TextChannel

    constructor(user: User, channel: TextChannel) {
        this.$user = user
        this.$channel = channel
    }

    user = (): User => this.$user

    channel = (): TextChannel => this.$channel

}

export class CommandMeta {

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

    description = (): string | undefined => this.$description

    usage = (): string | undefined => this.$usage

}

export default abstract class AbstractCommand {

    private readonly $meta: CommandMeta

    protected constructor(meta: CommandMeta) {
        this.$meta = meta
    }

    abstract execute(executor: CommandExecutor, args: Array<string>): boolean

    meta = (): CommandMeta => this.$meta

}