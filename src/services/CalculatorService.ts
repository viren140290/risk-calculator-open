import calculationsData from '../data/calculationsData.json';
import {PatientData, Treatments, Dosage} from "./FHIRService";

interface CalculatorInputObject {
    age: number,
    male: number,
    currentSmoker: number,
    diabetes: number,
    systolicBP: number,
    totalCholesterol: number,
    creatinine: number,
    twoCVDLocations: number,
    threeCVDLocations: number,
    atrialFibHistory: number,
    chfHistory: number,
    northAmerica: number,
}

const cholesterolConversionFactor = 38.67;
const creatinineConversionFactor = 88.4;

const Utils = {
    buildInputObject: (patientInfo: PatientData): CalculatorInputObject => {
        const cad = patientInfo.comorbidities?.coronaryArteryDisease ? 1 : 0;
        const cvd = patientInfo.comorbidities?.cerebrovascularDisease ? 1 : 0;
        const pad = patientInfo.comorbidities?.peripheralArteryDisease ? 1 : 0;

        const inputs = {
            age: patientInfo.age || 0,
            male: patientInfo.gender === 'male' ? 1 : 0,
            currentSmoker: patientInfo.comorbidities?.smoking ? 1 : 0,
            diabetes: patientInfo.comorbidities?.diabetes ? 1 : 0,
            systolicBP: patientInfo.labResults?.systolicBloodPressure?.value || 0,
            totalCholesterol: patientInfo.labResults?.totalCholesterol?.value || 0,
            creatinine: patientInfo.labResults?.creatinine?.value || 0,
            twoCVDLocations: cad + cvd + pad === 2 ? 1 : 0,
            threeCVDLocations: cad + cvd + pad === 3 ? 1 : 0,
            atrialFibHistory: patientInfo.comorbidities?.atrialFibrillation ? 1 : 0,
            chfHistory: patientInfo.comorbidities?.congestiveHeartFailure ? 1 : 0,
            northAmerica: patientInfo.residence === 'north-america' ? 1 : 0,
        };
        // CVDLocations only one of the 'number of locations' factors, not both
        // count includes CAD, CVD, and PAD locations
        if (inputs.threeCVDLocations === 1) inputs.twoCVDLocations = 0;

        return inputs;
    },
    intensityFactor(statin: string | any): number {
        return (statin === 'high') ? 0.5 : (statin === 'moderate') ? 0.3 : (statin === 'low') ? 0.15 : 0;
    }
};

const CalculatorService = {
    /**
     * Cardiovascular model
     * 1-year survival = (age-specific 1-yr baseline survival¥)^exp(A)
     *
     * A = 0.0720 (if male) +
     *     0.4309 (if current smoker) +
     *     0.4357 (if diabetes mellitus) –
     *     0.0281 * systolic blood pressure (in mmHg) +
     *     0.0001 * squared systolic blood pressure (in mmHg) –
     *     0.3671 * total cholesterol (in mmol/L) +
     *     0.0356 * squared total cholesterol (in mmol/L) +
     *     0.0061 * creatinine (in µmol/L) +
     *     0.3176 (if two locations of cardiovascular disease)§ +
     *     0.2896 (if three locations of cardiovascular disease)§ +
     *     0.2143 (if history of atrial fibrillation) +
     *     0.4447 (if history of congestive heart failure) +
     *     0.1552 (if residence is North America)
     *
     * @param patientInfo a holder obeject with patient data
     * @param ageOverride an age value to calculate the mortality. Overrides the value inside patientInfo for convenience.
     * @returns {number} a single value representing constant baseline survival factor.
     */
    computeCVMortality(patientData: PatientData, ageOverride?: number): number {
        const cvModelCoefficients: any = calculationsData.cardiovascular.coefficients;
        const ageBaselineSurvival: number[] = calculationsData.cardiovascular.ageBaselineSurvival;
        const inputs: CalculatorInputObject = Utils.buildInputObject(patientData);
        const resolvedAge = ageOverride || inputs.age;

        // SEB
        // conversions
        // FHIR data comes in mg/dL, formula wants to be mmol/l
        const convertedTotalCholesterol = inputs.totalCholesterol / cholesterolConversionFactor;
        const convertedCreatinine = inputs.creatinine * creatinineConversionFactor;
        // suspect one of the conversions in the orange model is wrong direction, muliply vs divide


        // squares
        const systolicBPSquared = (inputs.systolicBP * inputs.systolicBP);
        const totalCholesterolSquared = (convertedTotalCholesterol * convertedTotalCholesterol);

        // cardiovascular model exponent
        /* eslint-disable no-mixed-operators */
        const A =
            (inputs.male * cvModelCoefficients.male)
            + (inputs.currentSmoker * cvModelCoefficients.currentSmoker)
            + (inputs.diabetes * cvModelCoefficients.diabetesMellitus)
            - (inputs.systolicBP * cvModelCoefficients.systolicBloodPressure)
            + (systolicBPSquared * cvModelCoefficients.systolicBloodPressureSquared)
            - (convertedTotalCholesterol * cvModelCoefficients.totalCholesterol)
            + (totalCholesterolSquared * cvModelCoefficients.totalCholesterolSquared)
            + (convertedCreatinine * cvModelCoefficients.creatinine)
            + (inputs.twoCVDLocations * cvModelCoefficients.twoLocationsCvd)
            + (inputs.threeCVDLocations * cvModelCoefficients.threeLocationsCvd)
            + (inputs.atrialFibHistory * cvModelCoefficients.atrialFibrillationHistory)
            + (inputs.chfHistory * cvModelCoefficients.congestiveHeartFailureHistory)
            + (1 * cvModelCoefficients.residence.northAmerica);
        /* eslint-enable no-mixed-operators */

        const cvSurvival = ageBaselineSurvival[resolvedAge - 45] ** Math.exp(A);
        //console.log(`A. computeCVMortality. Age: ${resolvedAge}, A: ${A}, Survival (baseline ^ exp(A)): ${cvSurvival}`);

        return cvSurvival;
    },

    /**
     * Non-cardiovsascular model.
     *
     * 1-year survival = (age-specific 1-yr baseline survival)^exp(B)
     *
     * B = 0.598602 (if male)
     *    + 4.25382 (if current smoker)
     *    – 0.04861788*age (if current smoker)
     *    + 0.406509 (if diabetes mellitus)
     *    – 0.007410907*systolic blood pressure (in mmHg)
     *    – 0.002985867*total cholesterol (in mmol/L)
     *    – 0.01886007*creatinine (in umol/L)
     *    + 0.00008048823*squared creatinine (in umol/L)
     *    + 0.1441609 (if two locations of cardiovascular disease)
     *    + 0.5693571 (if three locations of cardiovascular disease)
     *    + 0.3213421 (if history of atrial fibrillation)
     *    + 0.2060817 (if history of congestive heart failure)
     *    + 0.4134(if North American)
     *
     * @param patientInfo
     * @returns {number} a single value representing constant baseline survival factor.
     */
    computeNonCVMortality(patientData: PatientData, ageOverride?: number): number {
        const modelCoefficients: any = calculationsData.nonCardiovascular.coefficients;
        const ageBaselineSurvival: number[] = calculationsData.nonCardiovascular.ageBaselineSurvival;
        const inputs: CalculatorInputObject = Utils.buildInputObject(patientData);
        const resolvedAge = ageOverride || inputs.age;

        // conversions
        // FHIR data comes in mg/dL, formula wants to be mmol/l
        const convertedTotalCholesterol = inputs.totalCholesterol / cholesterolConversionFactor;
        const convertedCreatinine = inputs.creatinine * creatinineConversionFactor;

        // squares
        const creatinineSquared = (convertedCreatinine * convertedCreatinine);

        // non-cardiovascular model exponent
        /* eslint-disable no-mixed-operators */
        const B =
            (inputs.male * modelCoefficients.male)
            + (inputs.currentSmoker * modelCoefficients.currentSmoker)
            - (inputs.currentSmoker * resolvedAge * modelCoefficients.currentSmokerAge)
            + (inputs.diabetes * modelCoefficients.diabetesMellitus)
            - (inputs.systolicBP * modelCoefficients.systolicBloodPressure)
            - (convertedTotalCholesterol * modelCoefficients.totalCholesterol)
            - (convertedCreatinine * modelCoefficients.creatinine)
            + (creatinineSquared * modelCoefficients.creatinineSquared)
            + (inputs.twoCVDLocations * modelCoefficients.twoLocationsCvd)
            + (inputs.threeCVDLocations * modelCoefficients.threeLocationsCvd)
            + (inputs.atrialFibHistory * modelCoefficients.atrialFibrillationHistory)
            + (inputs.chfHistory * modelCoefficients.congestiveHeartFailureHistory)
            + (1 * modelCoefficients.residence.northAmerica);
        /* eslint-enable no-mixed-operators */

        const survival = ageBaselineSurvival[resolvedAge - 45] ** Math.exp(B);
        //console.log(`B. computeNONCVMortality. Age: ${resolvedAge}, B: ${B}, Survival (baseline ^ exp(B)): ${survival}`);

        return survival;
    },

    computeCVMortalityChanceByAge(patientInfo: PatientData, limit?: number): number[] {
        const ageBaselineOffset: number = calculationsData.cardiovascular.ageBaselineSurvivalOffset;
        const indexStart: number = patientInfo.age - ageBaselineOffset;
        const calculationLimit: number = limit || calculationsData.cardiovascular.ageBaselineSurvival.length;

        const cvMortalityChanceByAge = calculationsData.cardiovascular.ageBaselineSurvival
            //Making sure we're only picking up values in range: patient_age <= value >= (limit || baseline.length)
            .filter((ageBaseline: number, index: number) => index > indexStart && index <= indexStart + calculationLimit)
            .map((ageBaseline: number, index: number) => {
                const cvMortChance = 1 - this.computeCVMortality(patientInfo, patientInfo.age + index);
                // //console.log(`computeCVMortalityChancebyAge. ageBaseline: ${ageBaseline}, index: ${index}, result: ${cvMortChance}`);
                return cvMortChance;
            });
        //console.log(`computeCVMortalityChanceByAge (limit ${limit}): ${cvMortalityChanceByAge}`);

        return cvMortalityChanceByAge;
    },

    computeNonCVMortalityChanceByAge(patientInfo: PatientData, limit?: number): number[] {
        const ageBaselineOffset: number = calculationsData.nonCardiovascular.ageBaselineSurvivalOffset;
        const indexStart: number = patientInfo.age - ageBaselineOffset;
        const calculationLimit: number = limit || calculationsData.nonCardiovascular.ageBaselineSurvival.length;

        const nonCvMortalityChanceByAge = calculationsData.nonCardiovascular.ageBaselineSurvival
            //Making sure we're only picking up values in range: patient_age <= value >= (limit || baseline.length)
            .filter((ageBaseline: number, index: number) => index > indexStart && index <= indexStart + calculationLimit)
            .map((ageBaseline: number, index: number) => {
                const noncvMortChance = 1 - this.computeNonCVMortality(patientInfo, patientInfo.age + index);
                // //console.log(`computeNONCVMortalityChancebyAge. ageBaseline: ${ageBaseline}, index: ${index}, result: ${noncvMortChance}`);
                return noncvMortChance;
            });
        //console.log(`computeNonCvMortalityChanceByAge (limit ${limit}): ${nonCvMortalityChanceByAge}`);
        return nonCvMortalityChanceByAge;
    },

    computeTenYearsRiscScore(patientData: PatientData): number {
        const tenYearCvMortalityChances: number[] = this.computeCVMortalityChanceByAge(patientData, 10);
        const tenYearNonCvMortalityChances: number[] = this.computeNonCVMortalityChanceByAge(patientData, 10);

        //console.log(`computeTenYearsRiscScore. tenYearCvMortalityChances: ${JSON.stringify(tenYearCvMortalityChances)}`)
        //console.log(`computeTenYearsRiscScore. tenYearNONCvMortalityChances: ${JSON.stringify(tenYearNonCvMortalityChances)}`)

        let intermediateCalculations: number[] = [1];
        tenYearCvMortalityChances.forEach((value, index) =>
            intermediateCalculations.push(intermediateCalculations[index] * (1 - value - tenYearNonCvMortalityChances[index]))
        );

        //console.log(`computeTenYearsRiscScore. intermediateCalculations: ${JSON.stringify(intermediateCalculations)}`)

        const tenYearsRiskScore = intermediateCalculations.reduce(((previousValue, currentValue, currentIndex, array) => {
            if (currentIndex === (array.length - 1)) {
                return previousValue;
            }

            const currentCVMortality = tenYearCvMortalityChances[currentIndex];
            const currentNonCVMortality = tenYearNonCvMortalityChances[currentIndex];
            const currentIntCalc = currentValue;
            const nextIntCalc = array[currentIndex + 1];

            let iterationResult = currentCVMortality / (currentCVMortality + currentNonCVMortality) * (currentIntCalc - nextIntCalc);
            iterationResult = isNaN(iterationResult) ? 0 : iterationResult;

            //console.log(`computeTenYearsRiscScore. inside risk calc. Current akk: ${previousValue}, Iteration result: ${JSON.stringify(iterationResult)}`)

            return previousValue + iterationResult;
        }), 0);

        //console.log(`computeTenYearsRiscScore. Result: ${tenYearsRiskScore} (${tenYearsRiskScore * 100}%)`)
        return tenYearsRiskScore * 100;
    },

    applyTreatments(cvdRiskScoreNoTreatment: number,
                    patientData?: PatientData,
                    previoustStatinIntensity?: Dosage,
                    treatments?: Treatments): number {
        //console.log('applyTreatments', previoustStatinIntensity, treatments);
        const treatmentCoefficients = calculationsData.treatmentsEffects;
        let riskWithAppliedTreatments = cvdRiskScoreNoTreatment;

        if (treatments?.isPCSK9Ihibitor) {
            // && patientData?.labResults?.ldlCholesterol?.value || 0 > LDLThreshhold) {
            riskWithAppliedTreatments = riskWithAppliedTreatments * (1 - treatmentCoefficients.PCSK9Ihibitors);
        }
        if (treatments?.isEzetimib) {
            // && ((patientData?.labResults?.ldlCholesterol?.value || 0) > LDLThreshhold)
            // && patientData?.comorbidities?.coronaryArteryDisease) {
            riskWithAppliedTreatments = riskWithAppliedTreatments * (1 - treatmentCoefficients.ezetimibe);
        }

        if (treatments?.isRivaroxaban
            && !(treatments?.p2Y12Inhibitors)) {
            // SEB: unknown if dual antiplatelet or p2y12
            riskWithAppliedTreatments = riskWithAppliedTreatments * (1 - treatmentCoefficients.rivaroxaban);
        }

        if (treatments?.isAspirin
            && (patientData?.comorbidities?.coronaryArteryDisease
                || patientData?.comorbidities?.cerebrovascularDisease)) {
            riskWithAppliedTreatments = riskWithAppliedTreatments * (1 - treatmentCoefficients.aspirin);
        }

        if (treatments?.p2Y12Inhibitors) {
            if (patientData?.comorbidities?.peripheralArteryDisease) {
                riskWithAppliedTreatments = riskWithAppliedTreatments * (1 - treatmentCoefficients.P2Y12InhibitorsWithPAD);
            } else if (patientData?.comorbidities?.coronaryArteryDisease ||
                patientData?.comorbidities?.cerebrovascularDisease) {
                riskWithAppliedTreatments = riskWithAppliedTreatments * (1 - treatmentCoefficients.P2Y12InhibitorsWithCADCVD);
            }
        }

        if (treatments?.isSGLT2Inhibitors) {
            // Note: sb if type 2 diabetes only,
            // but did not implement constraint in requirements bc physicians know this
            riskWithAppliedTreatments = riskWithAppliedTreatments * (1 - treatmentCoefficients.SGLT2Inhibitors);
        }

        if (treatments?.isGLP1ReceptorAgonists) {
            // Note: sb if type 2 diabetes only,
            // but did not implement constraint in requirements bc physicians know this
            riskWithAppliedTreatments = riskWithAppliedTreatments * (1 - treatmentCoefficients.GLP1ReceptorAgonists);
        }

        // const currentStatinIntensity = currentStatinIntensity?.statin?.intensity;
        const treatmentStatinIntensity = treatments?.statin?.intensity;
        //console.log('previoustStatinIntensity', previoustStatinIntensity)
        //console.log('intendedStatinIntensity', treatmentStatinIntensity)

        if (previoustStatinIntensity && treatmentStatinIntensity && (previoustStatinIntensity !== treatmentStatinIntensity)) {
            const currentTreatedMmol = +(patientData?.labResults?.ldlCholesterol?.value || 0) / cholesterolConversionFactor;  // 6.475
            const untreatedMmol = currentTreatedMmol / (1 - Utils.intensityFactor(previoustStatinIntensity)); // back-calculate
            const reducedMmol = untreatedMmol * (1 - Utils.intensityFactor(treatmentStatinIntensity));
            const reduction = currentTreatedMmol - reducedMmol;
            const riskReduction = (reduction * treatmentCoefficients.statin);

            riskWithAppliedTreatments = riskWithAppliedTreatments * (1 - riskReduction);
        }

        return riskWithAppliedTreatments;
    },


};
export default CalculatorService;
