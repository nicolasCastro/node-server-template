import Localize from 'localize';
import { StringKeys } from './keys';
import { Request } from 'express';
import { LANG_HEADER } from './constants';

export default class Localizables {

    private defaultTranslationsPath: string = './translations';
    private defaultLanguage: string = 'en';
    private defaultDates = {
        "es": {
            dayNames: [
                'Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb',
                'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'
            ],
            monthNames: [
                'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
                'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
            ],
            masks: {
                "default": "dddd, d 'de' mmmm yyyy"
            }
        }
    };

    constructor(request?: Request);
    constructor(request: Request) {
        const language = request.header(LANG_HEADER) ?? this.defaultLanguage;
        this.setLocale(language);
    }


    private appLocalizables: Localize = new Localize(this.defaultTranslationsPath, this.defaultDates, this.defaultLanguage);

    public setLocale(localeStr: string = this.defaultLanguage) {
        this.appLocalizables.setLocale(localeStr);
    }

    public getString(key: StringKeys): string {
        return this.appLocalizables.translate(key)
    }
}