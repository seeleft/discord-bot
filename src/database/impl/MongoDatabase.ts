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

import {Collection, MongoClient} from 'mongodb'
import {IDatabase} from '../Database'
import {Log} from '../../main'
import Path from 'path'
import Member from '../model/Member'


const TAG: string = `[${Path.join(Path.relative('.', __dirname), Path.basename(__filename))}]`

export default class MongoDatabase implements IDatabase {

    private client?: MongoClient

    private collection?: Collection

    connect = (uri: string, options: any): Promise<IDatabase> =>
        new Promise((resolve, reject) =>
            MongoClient.connect(uri, {useNewUrlParser: true}, (error, client) => {
                if (error) {
                    Log.error(`${TAG} Could not connect to mongodb server: ${error.message}`)
                    reject(error)
                    return
                }
                this.client = client
                Log.info(`${TAG} Connected to mongodb server.`)
                // extract collection from client
                const database: string = options.database || 'admin'
                const collection: string = options.collection || 'discord'
                this.collection = this.client.db(database).collection(collection)
                Log.info(`${TAG} Using collection '${collection}' from database '${database}'.`)
                resolve(this)
            }))

    close = (): void => {
        if (this.client)
            this.client.close(error => {
                if (error)
                    Log.warn(`${TAG} Could not close mongodb client: ${error.message}`)
                else
                    Log.warn(`${TAG} Closed mongodb client.`)
            })
    }

    get = (id: string): Promise<Member> => new Promise((resolve, reject) => {
        // todo get member
    })

    save = (member: Member): Promise<Member> => new Promise((resolve, reject) => {
        // todo save member
    })

}