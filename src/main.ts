/*
 * This file is licensed under the MIT License and is part of the "discord-bot" project.
 * Copyright (c) 2019 Daniel Riegler
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import Toml from 'toml'
import Lodash from 'lodash'
import moment from 'moment'
import FileSystem from 'fs'
import { Client } from 'discord.js'
import DailyRotateFile from 'winston-daily-rotate-file'
import Winston, { Logger, transports, format } from 'winston'
import IEventListener from './events/IEventListener'
import MessageEventListenerImpl from './events/impl/MessageEventListenerImpl'

const argv: Map<string, any> = new Map()

// parse argv
Lodash.filter(process.argv).
    map(arg => arg.trim()).
    filter(arg => arg.startsWith('--')).
    map(arg => arg.replace('--', '')).
    filter(arg => /[A-Z-=]/i.test(arg)).
    forEach(arg => {
        if (!arg.includes('=') || arg.endsWith('='))
            argv.set((arg.endsWith('=') ? arg.substring(arg.length - 1) : arg), true)
        else {
            const parts: Array<any> = arg.split('=', 1)
            try {
                parts[1] = JSON.parse(parts[1])
            } catch (error) { }
            argv.set(parts[0], parts[1])
        }
    })

// parse config
export let config: any = Toml.parse(FileSystem.readFileSync('./config.toml', 'UTF-8'))

// parse debug config (config.debug.toml) if such a file exists
if (FileSystem.existsSync('./config.debug.toml'))
    config = Lodash.merge(config, Toml.parse(FileSystem.readFileSync('./config.debug.toml', 'UTF-8')))

// setup logger
export const Log: Logger = Winston.createLogger({
    exitOnError: !argv.get('debug'),
    level: (argv.get('debug') ? 'debug' : 'info'),
    format: format.printf(info => `[${moment().format('HH:mm:ss.SSS')} ${info.level.toUpperCase()}] ${info.message}`),
    transports: new transports.Console()
})

Log.debug(`Logger initialized with level '${Log.level.toUpperCase()}'.`)

// setup rotate file logger
if (!argv.get('no-file-log')) {
    const logs: string = argv.get('log-directory') || './logs'
    Log.debug(`Writing log-files into '${logs}'...`)
    Log.add(new DailyRotateFile({
        datePattern: 'MM-DD-YYYY',
        filename: '%DATE%.log',
        dirname: logs,
        zippedArchive: true,
        level: 'debug',
        maxSize: '20m',
        maxFiles: '7d'
    }))
} else Log.debug('Writing no log-files...')

if (argv.get('debug'))
    Log.warn('Running in debug-mode; REMOVE PARAMETER \'--debug\' IN PRODUCTION!')

// setup discord client
export const client: Client = new Client()

// register listener
new Array<IEventListener<any>>(
    new MessageEventListenerImpl()
).forEach(listener => {
    const name: string = listener.name()
    client.addListener(name, listener.run)
    Log.debug(`Hooked listener to '${name}'-event.`)
})

// login to discord
client.login(config.services.discord['bot-token']).then(() => {
    Log.info(`Bot logged in as ${client.user.tag}.`)

    const homeGuild: string = config.services.discord['home-guild']
    Log.debug(`Home-guild should be: ${homeGuild}`)

    // match guilds against home-guild
    client.guilds.forEach(guild => {
        if (homeGuild !== guild.id) {
            Log.warn(`Guild with ID: ${guild.id} doesn't match home-guild, leaving now...`)
            guild.leave().
                then(() => Log.debug(`Successfully left guild with ID: ${guild.id}`)).
                catch(error => Log.warn(`Could not leave guild with ID: ${guild.id}: ${error.message}`))
        } else Log.debug(`Found home-guild (${guild.name}).`)
    })
})