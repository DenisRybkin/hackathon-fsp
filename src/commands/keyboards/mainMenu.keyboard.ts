import { Markup } from 'telegraf'

export const getMainMenu = () => {
    return Markup.keyboard([
        ['Get Stats Activity']
    ]).resize()
}