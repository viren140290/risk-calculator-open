import { Treatments } from "../../services/FHIRService";
import _ from "lodash";
import { SelectOption } from "../../interfaces/FormBlocks.intefaces";
const en = require("../../lang/en.json");

// export const getMsg = (intl: any, key: string, params?: object): string =>
//     intl.formatMessage({id: key}, {...params});

export const getMsg = (intl: any, key: string, params?: object): string => {
    let unsubstituted: string = en[key];
    let substituted = params ? substitute(unsubstituted, params) : unsubstituted;
    return substituted;
}

// @ts-ignore
const substitute = (original: string, params: object) => original.replace(/{(.*?)}/g, (match, offset) => params[offset]);

export const getGenderLabel = (gender: string): string => {
    let msg: string;
    switch (gender) {
        case 'male':
            msg = "calcform.patient_details_summary.gender.male";
            break;
        case 'female':
            msg = "calcform.patient_details_summary.gender.female";
            break;
        default:
            msg = "calcform.patient_details_summary.gender.unknown";
            break;
    }
    return getMsg(null, msg);
}

export const getDiabetesLabel = (diabetes: boolean): string | null => {
    if (diabetes) {
        return getMsg(null, "calcform.patient_details_summary.diabetes.diabetic")
    } else return null;
}

export const getSmokerLabel = (isSmoker: boolean, comm: any): string | null => {
    if (isSmoker) {
        return getMsg(null, "calcform.patient_details_summary.smoker.smoker", { comm_appendix: comm })
    } else {
        return getMsg(null, "calcform.patient_details_summary.smoker.nonsmoker", { comm_appendix: comm })
    }
}

export const getMsgRange = (intl: any, min: number, max: number, unit?: string) =>
    getMsg(intl, 'calcform.validation.general.invalid_range', { min, max, unit })

export const treatmentsAreEqual = (treatmentsA?: Treatments, treatmentsB?: Treatments): boolean =>
    _.isEqualWith(treatmentsA, treatmentsB,
        (a: Treatments, b: Treatments) => {
            const { statin: statinA, ...restOfA } = a || {};
            const { statin: statinB, ...restOfB } = b || {};
            //Comparing statins separately as we only care about their `intensity`, but the object might
            //contain `label` as well which is irrelevant.
            return statinA?.intensity === statinB?.intensity && _.isEqual(restOfA, restOfB);
        }
    )

export const resolveSexOptions = (intl: any): Array<SelectOption> => [
    { value: 'male', label: getMsg(intl, 'calcform.options.sex.male') },
    { value: 'female', label: getMsg(intl, 'calcform.options.sex.female') },
];

export const resolveResidenceOptions = (intl: any): Array<SelectOption> => [
    { value: 'NA', label: getMsg(intl, 'calcform.options.residence.north_america') }
];

export const resolveStatinOptions = (intl: any): Array<SelectOption> => [
    {
        value: 'high',
        label: getMsg(intl, 'calcform.options.treatments.statin.high_intensity.label'),
        description: getMsg(intl, 'calcform.options.treatments.statin.high_intensity.description')
    },
    {
        value: 'moderate',
        label: getMsg(intl, 'calcform.options.treatments.statin.moderate_intensity.label'),
        description: getMsg(intl, 'calcform.options.treatments.statin.moderate_intensity.description')
    },
    {
        value: 'low',
        label: getMsg(intl, 'calcform.options.treatments.statin.low_intensity.label'),
        description: getMsg(intl, 'calcform.options.treatments.statin.low_intensity.description')
    },
];

export const resolveP2y12Options = (intl: any): Array<SelectOption> => [
    { value: 'clopidogrel', label: getMsg(intl, 'calcform.options.treatments.p2y12.clopidogrel') },
    { value: 'prasugrel', label: getMsg(intl, 'calcform.options.treatments.p2y12.prasugrel') },
    { value: 'ticagrelor', label: getMsg(intl, 'calcform.options.treatments.p2y12.ticagrelor') },
];
