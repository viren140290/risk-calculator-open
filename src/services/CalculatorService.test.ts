import CalculatorService from "./CalculatorService";
import {Dosage, P2Y12Inhibitors, PatientData, Treatments} from "./FHIRService";

const testPatientData: PatientData = {
    age: 45,
    comorbidities: {
        coronaryArteryDisease: true,
        cerebrovascularDisease: false,
        peripheralArteryDisease: false,
        atrialFibrillation: true,
        congestiveHeartFailure: false,
        diabetes: true,
        smoking: false
    },
    labResults: {
        systolicBloodPressure: {value: 155, unit: 'mmHg'},
        creatinine: {value: 5, unit: 'mg/dL'},
        totalCholesterol: {value: 188, unit: 'mg/dL'},
        ldlCholesterol: {value: 168, unit: 'mg/dL'},
    }
};

const testInitialTreatments_allSetNoRivaroxaban: Treatments = {
    statin: {intensity: Dosage.LOW},
    isPCSK9Ihibitor: true,
    isEzetimib: true,
    isSGLT2Inhibitors: true,
    isGLP1ReceptorAgonists: true,
    isAspirin: true,
    p2Y12Inhibitors: P2Y12Inhibitors.CLOPIDOGREL,
    isRivaroxaban: false,
};
const testInitialTreatments_allSetNoAntiplatelets: Treatments = {
    statin: {intensity: Dosage.LOW},
    isPCSK9Ihibitor: true,
    isEzetimib: true,
    isSGLT2Inhibitors: true,
    isGLP1ReceptorAgonists: true,
    isAspirin: false,
    isRivaroxaban: true,
};

const noTreatmentRiskScore: number = 16.384332726051763;
const treatmentRiskScore_allButRivaroxaban_noPreviousStatin: number = 7.446403808338238;
const treatmentRiskScore_allButRivaroxaban_withPreviousStatin: number = 8.902178641310492;
const treatmentRiskScore_allButAntiplatelets_noPreviousStatin: number = 7.846252990332415;
const treatmentRiskScore_allButAntiplatelets_withPreviousStatin: number = 9.380198493485066;


test('Ten years risk score. Happy path.', () => {
    const result = CalculatorService.computeTenYearsRiscScore(testPatientData);
    expect(result).toBe(noTreatmentRiskScore);
});

test('Ten years risk score. Incomplete data.', () => {
    const incompleteTestPatientData = {
        ...testPatientData,
        age: 15,
    };
    const incompleteTestPatientDataRiskScore = 0;

    const result = CalculatorService.computeTenYearsRiscScore(incompleteTestPatientData);
    expect(result).toBe(incompleteTestPatientDataRiskScore);
});

test('Apply treatments. All treatments but Rivaroxaban. No previous statin.', () => {
    const result = CalculatorService.computeTenYearsRiscScore(testPatientData);
    const resultWTreatment = CalculatorService.applyTreatments(
        result, testPatientData, undefined, testInitialTreatments_allSetNoRivaroxaban)
    expect(resultWTreatment).toBe(treatmentRiskScore_allButRivaroxaban_noPreviousStatin);
});

test('Apply treatments. All treatments but Rivaroxaban. W previous statin.', () => {
    const result = CalculatorService.computeTenYearsRiscScore(testPatientData);
    const resultWTreatment = CalculatorService.applyTreatments(
        result, testPatientData, Dosage.MODERATE, testInitialTreatments_allSetNoRivaroxaban)
    expect(resultWTreatment).toBe(treatmentRiskScore_allButRivaroxaban_withPreviousStatin);
});

test('Apply treatments. All treatments but Anti-platelets. No previous statin.', () => {
    const result = CalculatorService.computeTenYearsRiscScore(testPatientData);
    const resultWTreatment = CalculatorService.applyTreatments(
        result, testPatientData, undefined, testInitialTreatments_allSetNoAntiplatelets)
    expect(resultWTreatment).toBe(treatmentRiskScore_allButAntiplatelets_noPreviousStatin);
});

test('Apply treatments. All treatments but Anti-platelets. W previous statin.', () => {
    const result = CalculatorService.computeTenYearsRiscScore(testPatientData);
    const resultWTreatment = CalculatorService.applyTreatments(
        result, testPatientData, Dosage.MODERATE, testInitialTreatments_allSetNoAntiplatelets)
    expect(resultWTreatment).toBe(treatmentRiskScore_allButAntiplatelets_withPreviousStatin);
});
