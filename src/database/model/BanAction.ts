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

import {AbstractAction} from './Member'
import {BanOptions} from 'discord.js'

// noinspection JSUnusedGlobalSymbols
export default class BanAction extends AbstractAction {

    private readonly _target: string

    private readonly _reason: string

    private readonly _days: number

    constructor(target: string, options: BanOptions) {
        super(new Date())
        this._target = target
        this._days = options.days || 0
        this._reason = options.reason || ''
    }

    name = (): string => 'ban'

    // noinspection JSUnusedGlobalSymbols
    target = (): string => this._target

    // noinspection JSUnusedGlobalSymbols
    reason = (): string => this._reason

    // noinspection JSUnusedGlobalSymbols
    days = (): number => this._days

}