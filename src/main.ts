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
import Path from 'path'
import Lodash from 'lodash'
import moment from 'moment'
import FileSystem, {PathLike} from 'fs'
import {Client, Guild, GuildMember} from 'discord.js'
import DailyRotateFile from 'winston-daily-rotate-file'
import Winston, {format, Logger, transports} from 'winston'
import IEventListener from './events/IEventListener'
import MessageEventListenerImpl from './events/impl/MessageEventListenerImpl'
import AbstractCommand, {CommandHandler} from './commands/Command'
import HelpCommand from './commands/impl/HelpCommand'
import PurgeCommand from './commands/impl/PurgeCommand'
import KickCommand from './commands/impl/KickCommand'

const TAG: string = `[${Path.basename(__dirname)}/${Path.basename(__filename)}]`

export const argv: Map<string, any> = new Map()

// parse argv
Lodash.filter(process.argv).map(arg => arg.trim()).filter(arg => arg.startsWith('--')).map(arg => arg.replace('--', '')).filter(arg => /[A-Z-=]/i.test(arg)).forEach(arg => {
    if (!arg.includes('=') || arg.endsWith('='))
        argv.set((arg.endsWith('=') ? arg.substring(arg.length - 1) : arg), true)
    else {
        const parts: Array<any> = arg.split('=', 1)
        try {
            parts[1] = JSON.parse(parts[1])
        } catch (error) {
        }
        argv.set(parts[0], parts[1])
    }
})

// setup logger
export const Log: Logger = Winston.createLogger({
    exitOnError: !argv.get('debug'),
    level: (argv.get('debug') ? 'debug' : 'info'),
    format: format.printf(info => `[${moment().format('HH:mm:ss.SSS')} ${info.level.toUpperCase()}] ${info.message}`),
    transports: new transports.Console()
})

Log.debug(`${TAG} Logger initialized with level '${Log.level.toUpperCase()}'.`)

// setup rotate file logger
if (!argv.get('no-file-log')) {
    const logs: string = argv.get('log-directory') || './logs'
    Log.debug(`${TAG} Writing log-files into '${logs}'...`)
    Log.add(new DailyRotateFile({
        datePattern: 'MM-DD-YYYY',
        filename: '%DATE%.log',
        dirname: logs,
        zippedArchive: true,
        level: 'debug',
        maxSize: '20m',
        maxFiles: '7d'
    }))
} else Log.debug(`${TAG} Writing no log-files.`)

if (argv.get('debug'))
    Log.warn(`${TAG} Running in debug-mode; REMOVE PARAMETER '--debug' IN PRODUCTION!`)

// parse config
export let config: any = Toml.parse(FileSystem.readFileSync('./config.toml', 'UTF-8'))
Log.debug(`${TAG} Parsed config.`)

// parse debug config (config.debug.toml) if such a file exists
const debugConfig: PathLike = './config.debug.toml'
if (FileSystem.existsSync(debugConfig)) {
    config = Lodash.merge(config, Toml.parse(FileSystem.readFileSync(debugConfig, 'UTF-8')))
    Log.debug(`${TAG} Found and parsed '${debugConfig}' and appended values to existing config.`)
}

// setup discord client
export const client: Client = new Client()
Log.debug(`${TAG} Created discord client.`)

// register commands
export const commandHandler: CommandHandler = new CommandHandler(new Array<AbstractCommand>(
    new PurgeCommand(),
    new KickCommand(),
    new HelpCommand()
), config.settings.command.prefix)

// register listener
Log.debug(`${TAG} Hooking listener...`)
new Array<IEventListener<any>>(
    new MessageEventListenerImpl()
).forEach(listener => {
    const name: string = listener.name()
    client.addListener(name, listener.run)
    Log.debug(`${TAG} Hooked listener to '${name}'-event.`)
})

export let
    homeGuild: Guild,
    botMember: GuildMember

// login to discord
Log.debug(`${TAG} Logging into discord...`)
client.login(config.services.discord['bot-token']).then(() => {
    Log.info(`${TAG} Bot logged in as @${client.user.tag}.`)

    // extract home-guild from config
    const homeGuildId: string = config.services.discord['home-guild']
    Log.debug(`${TAG} Trying to find home-guild with id ${homeGuildId}...`)

    // match guilds against home-guild
    client.guilds.forEach(guild => {
        if (homeGuildId !== guild.id) {
            Log.warn(`${TAG} Guild with ID: ${guild.id} doesn't match home-guild, leaving now...`)
            guild.leave().then(() => Log.debug(`${TAG} Successfully left guild with ID: ${guild.id}`)).catch(error => Log.warn(`${TAG} Could not leave guild with ID: ${guild.id}: ${error.message}`))
        } else {
            Log.debug(`${TAG} Found home-guild: ${guild.name}`)
            homeGuild = guild
        }
    })

    // extract guild-member of the bot
    botMember = homeGuild.member(client.user)

})