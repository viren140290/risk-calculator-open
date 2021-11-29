import {Treatments} from "../../services/FHIRService";
import _ from "lodash";
import {SelectOption} from "../../interfaces/FormBlocks.intefaces";

export const getMsg = (intl: any, key: string, params?: object): string =>
    intl.formatMessage({id: key}, {...params});

export const getMsgRange = (intl: any, min: number, max: number, unit?:string) =>
    getMsg(intl, 'calcform.validation.general.invalid_range', {min, max, unit})

export const treatmentsAreEqual = (treatmentsA?: Treatments, treatmentsB?: Treatments): boolean =>
    _.isEqualWith(treatmentsA, treatmentsB,
        (a: Treatments, b: Treatments) => {
            const {statin: statinA, ...restOfA} = a || {};
            const {statin: statinB, ...restOfB} = b || {};
            //Comparing statins separately as we only care about their `intensity`, but the object might
            //contain `label` as well which is irrelevant.
            return statinA?.intensity === statinB?.intensity && _.isEqual(restOfA, restOfB);
        }
    )

export const resolveSexOptions = (intl: any): Array<SelectOption> => [
    {value: 'male', label: getMsg(intl, 'calcform.options.sex.male')},
    {value: 'female', label: getMsg(intl,'calcform.options.sex.female')},
];

export const resolveResidenceOptions = (intl: any): Array<SelectOption> => [
    {value: 'NA', label: getMsg(intl,'calcform.options.residence.north_america')}
];

export const resolveStatinOptions = (intl: any): Array<SelectOption> =>  [
    {
        value: 'high',
        label: getMsg(intl,'calcform.options.treatments.statin.high_intensity.label'),
        description: getMsg(intl,'calcform.options.treatments.statin.high_intensity.description')
    },
    {
        value: 'moderate',
        label: getMsg(intl,'calcform.options.treatments.statin.moderate_intensity.label'),
        description: getMsg(intl,'calcform.options.treatments.statin.moderate_intensity.description')
    },
    {
        value: 'low',
        label: getMsg(intl,'calcform.options.treatments.statin.low_intensity.label'),
        description: getMsg(intl,'calcform.options.treatments.statin.low_intensity.description')
    },
];

export const resolveP2y12Options = (intl: any): Array<SelectOption> => [
    {value: 'clopidogrel', label: getMsg(intl,'calcform.options.treatments.p2y12.clopidogrel')},
    {value: 'prasugrel', label: getMsg(intl,'calcform.options.treatments.p2y12.prasugrel')},
    {value: 'ticagrelor', label: getMsg(intl,'calcform.options.treatments.p2y12.ticagrelor')},
];
