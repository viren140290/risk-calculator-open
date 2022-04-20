import { PatientData, Treatments } from "../../services/FHIRService";
import { FormikValues } from "formik";
import { getGenderLabel, getDiabetesLabel, getSmokerLabel, getMsg, getMsgRange } from "../App/utils";
import * as yup from "yup";

export const convertToPatientInfo = (values: FormikValues, currentPatientData: PatientData | undefined): PatientData => {
    return {
        firstName: currentPatientData?.firstName,
        lastName: currentPatientData?.lastName,
        dateOfBirth: currentPatientData?.dateOfBirth,
        age: values.age,
        gender: values.sex,
        residence: values.residence,
        comorbidities: {
            coronaryArteryDisease: values.isCAD,
            cerebrovascularDisease: values.isCVD,
            peripheralArteryDisease: values.isPAD,
            atrialFibrillation: values.isAtrialFibrillation,
            congestiveHeartFailure: values.isCHF,
            diabetes: values.isDiabetesMellitus,
            smoking: values.isSmoking
        },
        labResults: {
            systolicBloodPressure: {
                value: values.systolicBloodPressure,
                unit: 'mg/dL',
                effectiveEpoch: 0
            },
            creatinine: {
                value: values.creatinine,
                unit: 'mg/dL',
                effectiveEpoch: 0
            },
            totalCholesterol: {
                value: values.totalCholesterol,
                unit: 'mg/dL',
                effectiveEpoch: 0
            },
            ldlCholesterol: {
                value: values.ldlCholesterol,
                unit: 'mg/dL',
                effectiveEpoch: 0
            }
        }
    }
};

export const convertToTreatments = (values: FormikValues): Treatments => {
    return {
        statin: values?.statinIntensity ? {
            intensity: values.statinIntensity,
            label: values.statinMedication
        } : undefined,
        isPCSK9Ihibitor: values.isPCSK9Ihibitor,
        isEzetimib: values.isEzetimib,
        isSGLT2Inhibitors: values.isSGLT2Inhibitors,
        isGLP1ReceptorAgonists: values.isGLP1ReceptorAgonists,
        isAspirin: values.isAspirin,
        p2Y12Inhibitors: values.p2Y12Inhibitors,
        isRivaroxaban: values.isRivaroxaban
    };
};

/**
 * Resolve summary text to be displayed on collapsed Patient Details section.
 * @param values a form object
 * @return string representation of patient details.
 *         E.g. `Age 45. M. non-smoker with CAD. SBP 155 mmHG. Cr 5 mg/dl. Total Cholesterol 188 mg/dl.`
 */
export const resolvePatientDetailsSummary = (intl: any, values: FormikValues) => {
    const keyCVDComorbidities = [
        { key: values.isCAD, value: getMsg(intl, 'calcform.patient_details_summary.cad') },
        { key: values.isCHF, value: getMsg(intl, 'calcform.patient_details_summary.chf') },
        { key: values.isCVD, value: getMsg(intl, 'calcform.patient_details_summary.cvd') },
        { key: values.isPAD, value: getMsg(intl, 'calcform.patient_details_summary.pad') },
        { key: values.isAtrialFibrillation, value: 'AFib' },
    ].filter(((obj: { key: any; }) => !!obj.key))
        .map(obj => obj.value)
        .join(', ');

    const patientDetails = [
        {
            key: values.age,
            value: getMsg(intl, `calcform.patient_details_summary.age`, { age: values.age })
        },
        {
            key: values.sex,
            value: getGenderLabel(values.sex)
        },
        //e.g. 'smoker with CAD, CHF'
        {
            key: values.isSmoking,
            value: getSmokerLabel(values.isSmoking, keyCVDComorbidities)
        },
        {
            key: values.systolicBloodPressure,
            value: getMsg(intl, `calcform.patient_details_summary.sbp`, { sbp: values.systolicBloodPressure })
        },
        {
            key: values.creatinine,
            value: getMsg(intl, `calcform.patient_details_summary.creatinine`, { cr: values.creatinine })
        },
        {
            key: values.totalCholesterol,
            value: getMsg(intl, `calcform.patient_details_summary.totalCl`, { totalCl: values.totalCholesterol })
        },
        {
            key: values.ldlCholesterol,
            value: getMsg(intl, `calcform.patient_details_summary.ldlCl`, { ldlCl: values.ldlCholesterol })
        },
        {
            key: values.isDiabetesMellitus,
            value: getDiabetesLabel(values.isDiabetesMellitus)

        }
    ].filter(((obj: { key: any; }) => obj.key !== undefined && obj.key !== null && obj.key !== ""))
        .map(obj => obj.value)
        .join('. ');

    return patientDetails || getMsg(intl, 'calcform.patient_details_summary.no_details');
};

/**
 * Resolve summary text to be displayed on collapsed Patient Treatments section.
 * @param values a form object
 * @return string representation of patient treatments.
 *         E.g. `Statin (low intensity). PCSK9 Ihibitors. Ezetimibe`
 */
export const resolvePatientTreatmentsSummary = (intl: any, values: FormikValues) => {
    const treatmentDetails = [
        {
            key: values.statinIntensity,
            value: getMsg(intl,
                'calcform.patient_treatments_summary.statin',
                { intensity: values?.statinIntensity?.toUpperCase(), medication: values.statinMedication })
        },
        {
            key: values.isPCSK9Ihibitor,
            value: getMsg(intl, 'calcform.patient_treatments_summary.pcsk9')
        },
        {
            key: values.isEzetimib,
            value: getMsg(intl, 'calcform.patient_treatments_summary.ezetimibe')
        },
        {
            key: values.isSGLT2Inhibitors,
            value: getMsg(intl, 'calcform.patient_treatments_summary.sglt2')
        },
        {
            key: values.isGLP1ReceptorAgonists,
            value: getMsg(intl, 'calcform.patient_treatments_summary.glp1')
        },
        {
            key: values.isAspirin,
            value: getMsg(intl, 'calcform.patient_treatments_summary.aspirin')
        },
        {
            key: values.p2Y12Inhibitors,
            value: getMsg(intl,
                'calcform.patient_treatments_summary.p2y12',
                { p2y12: values.p2Y12Inhibitors })
        },
        {
            key: values.isRivaroxaban,
            value: getMsg(intl, 'calcform.patient_treatments_summary.rivaroxaban')
        },
    ].filter(((obj: { key: any; }) => !!obj.key))
        .map(obj => obj.value)
        .join('. ');

    return treatmentDetails || getMsg(intl, 'calcform.patient_treatments_summary.no_details');
}

export const resolvePatientTreatmentsSummaryFromTreatments = (intl: any, treatments: Treatments = {}) => {
    const values: FormikValues = Object.entries(treatments).reduce((prevValue: any, [key, val]) => {
        if (key === 'statin') {
            prevValue['statinIntensity'] = val?.intensity;
            prevValue['statinMedication'] = val?.label;
        } else {
            prevValue[key] = val;
        }
        return prevValue;
    }, {}) || {};

    return resolvePatientTreatmentsSummary(intl, values);
};

export const initFormikValidationSchema = (intl: any): any => {
    const VALIDATION_REQUIRED_TEXT = getMsg(intl, 'calcform.validation.general.required');
    return yup.object().shape({
        age: yup.number()
            .required({ type: 'required', message: VALIDATION_REQUIRED_TEXT })
            .min(45, { type: 'invalid', message: getMsgRange(intl, 45, 89, 'years') })
            .max(89, { type: 'invalid', message: getMsgRange(intl, 45, 89, 'years') }),
        sex: yup.string()
            .required({ type: 'required', message: VALIDATION_REQUIRED_TEXT }),
        isSmoking: yup.boolean(),
        systolicBloodPressure: yup.number()
            .required({ type: 'required', message: VALIDATION_REQUIRED_TEXT })
            .min(100, { type: 'invalid', message: getMsgRange(intl, 100, 200, 'mmHg') })
            .max(200, { type: 'invalid', message: getMsgRange(intl, 100, 200, 'mmHg') }),
        creatinine: yup.number()
            .required({ type: 'required', message: VALIDATION_REQUIRED_TEXT })
            .min(0.3, { type: 'invalid', message: getMsgRange(intl, 0.3, 6, 'mg/dL') })
            .max(6, { type: 'invalid', message: getMsgRange(intl, 0.3, 6, 'mg/dL') }),
        totalCholesterol: yup.number()
            .required({ type: 'required', message: VALIDATION_REQUIRED_TEXT })
            .min(100, { type: 'invalid', message: getMsgRange(intl, 100, 400, 'mg/dL') })
            .max(400, { type: 'invalid', message: getMsgRange(intl, 100, 400, 'mg/dL') }),
        ldlCholesterol: yup.number()
            .required({ type: 'required', message: VALIDATION_REQUIRED_TEXT })
            .min(0, { type: 'invalid', message: getMsgRange(intl, 0, 400, 'mg/dL') })
            .max(400, { type: 'invalid', message: getMsgRange(intl, 0, 400, 'mg/dL') }),
        isDiabetesMellitus: yup.boolean().test(
            'diabTreatmentsRequireDiagnosis',
            {
                type: 'invalid',
                message: getMsg(intl, 'calcform.validation.general.diabetes_medications_no_diabetes')
            },
            function (item) {
                return item ||
                    (!item && !this.parent.isSGLT2Inhibitors && !this.parent.isGLP1ReceptorAgonists) ||
                    (!!item && (this.parent.isSGLT2Inhibitors || this.parent.isGLP1ReceptorAgonists));
            }
        ),
        isCAD: yup.boolean().test(
            'oneOfRequired',
            { type: 'required', message: '' },
            function (item) {
                return (item || this.parent.isCVD || this.parent.isPAD)
            }
        ),
        isCVD: yup.boolean().test(
            'oneOfRequired',
            { type: 'required', message: '' },
            function (item) {
                return (this.parent.isCAD || item || this.parent.isPAD)
            }
        ),
        isPAD: yup.boolean().test(
            'oneOfRequired',
            { type: 'required', message: '' },
            function (item) {
                return (this.parent.isCAD || this.parent.isCVD || item)
            }
        ),
        isAtrialFibrillation: yup.boolean(),
        isCHF: yup.boolean(),
        residence: yup.string().required({ type: 'required', message: VALIDATION_REQUIRED_TEXT }),
        statinIntensity: yup.string(),
        statinMedication: yup.string(),
        isEzetimib: yup.boolean(),
        isPCSK9Ihibitor: yup.boolean(),
        isSGLT2Inhibitors: yup.boolean(),
        isGLP1ReceptorAgonists: yup.boolean(),
        isAspirin: yup.boolean(),
        p2Y12Inhibitors: yup.string().test(
            'onlyOneRequired',
            { type: 'invalid', message: '' },
            function (item) {
                return !(this.parent.isRivaroxaban && item)
            }
        ),
        isRivaroxaban: yup.boolean().test(
            'onlyOneRequired',
            {
                type: 'invalid',
                message: getMsg(intl, 'calcform.validation.rivaroxaban.mixed_with_antiplatelets')
            },
            function (item) {
                return !(item && this.parent.p2Y12Inhibitors)
            }
        ),
    });
}
