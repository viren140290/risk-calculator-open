import Client from "fhirclient/lib/Client";
import fhirCodes from '../data/fhirCodes.json';

export interface Measurement {
    value: number,
    unit: string,
    effectiveEpoch?: number
}

export interface Intensity {
    doseSize: number,
    type: string
}

export interface IntensityBundle {
    low: Intensity,
    moderate: Intensity,
    high: Intensity
}

export interface StatinCode {
    code: string,
    dose: number
}

export interface StatinIntensity {
    intensity?: Dosage,
    label?: string
};

export interface LabResults {
    systolicBloodPressure?: Measurement,
    creatinine?: Measurement,
    totalCholesterol?: Measurement,
    ldlCholesterol?: Measurement,
};

export interface Comorbidities {
    coronaryArteryDisease?: boolean,
    cerebrovascularDisease?: boolean,
    peripheralArteryDisease?: boolean,
    atrialFibrillation?: boolean,
    congestiveHeartFailure?: boolean,
    diabetes?: boolean,
    smoking?: boolean
};


export interface Treatments {
    statin?: StatinIntensity,
    isPCSK9Ihibitor?: boolean,
    isEzetimib?: boolean,
    isSGLT2Inhibitors?: boolean,
    isGLP1ReceptorAgonists?: boolean,
    isAspirin?: boolean,
    p2Y12Inhibitors?: P2Y12Inhibitors,
    isRivaroxaban?: boolean,
};

export interface PatientData {
    firstName?: string,
    lastName?: string,
    gender?: 'male' | 'female',
    dateOfBirth?: Date,
    age: number,
    residence?: string,
    labResults?: LabResults,
    comorbidities?: Comorbidities
};

export interface PatientBatch {
    patientData: PatientData,
    treatments: Treatments
};

enum FhirCodesetType {
    LOINC = 'LOINC',
    SNOMED = 'SNOMED CT',
    ICD10 = 'ICD-10-CM',
    RXNORM = 'RxNorm',
};

export enum Dosage {
    UNKNOWN = 'unknown',
    LOW = 'low',
    MODERATE = 'moderate',
    HIGH = 'high'
};

//WARN: The values should match the names of `p2Y12Inhibitors` group in `fhirCodes.json`
export enum P2Y12Inhibitors {
    CLOPIDOGREL = 'clopidogrel',
    PRASUGREL = 'prasugrel',
    TICAGRELOR = 'ticagrelor',
};

export const Utils = {
    /**
     * Method to calculate age from the provided date of birth.
     * @param birthDate - Date of birth in Date Object format
     * @returns {number} - Age calculated
     */
    computeAgeFromBirthDate: (birthDate: Date): number => {
        const diff_ms = Date.now() - birthDate.getTime();
        const age_dt = new Date(diff_ms);

        return Math.abs(age_dt.getUTCFullYear() - 1970);
    },

    /**
     * A helper method to resolve dose value (in milligrams) from text value.
     * E.g. if the element is looking like this
     * {
     *   dosageInstruction: [
     *    {text: '4 mg = 1 tab, Oral, Daily, 30 tab, 0 Refill(s)'}
     *   ]
     * }
     * the resolved value would be '4'
     *
     * @param matchingMedicine - an object containing dosage text
     * @returns {number} - dosage calculated, or undefined.
     */
    resolveDoseFromText: (matchingMedicine: any): number | undefined => {
        return !!matchingMedicine.dosageInstruction && Array.isArray(matchingMedicine?.dosageInstruction) ?
            matchingMedicine?.dosageInstruction
                .map((dosageInstruction: any) => dosageInstruction?.text?.toLowerCase()?.match(/(\d+)(?=\s*mg\W)/))
                .filter((match: any) => Array.isArray(match) && match.length > 0)
                .map((doseArray: Array<any>) => doseArray[0])
                .find((dosage: any) => !!dosage) : undefined;
    },

    collectCodesFromStorage: (kind: 'conditions' | 'labs' | 'meds', groupName: string): string[] => {
        const PRIORITY_CODESET_TYPE: FhirCodesetType = FhirCodesetType.LOINC;
        const resolvedCodes = fhirCodes[kind]
            .find((lab:any) => lab?.name === groupName)?.codesets
            .sort((a:any, b:any) => a.name === PRIORITY_CODESET_TYPE ? 0 : 1)
            .flatMap((codeset:any) => codeset.codes);

        // //console.log(`resolveCodesFromStorage [${kind}, ${groupName}] => ${JSON.stringify(resolvedCodes)}`);
        return resolvedCodes || [];
    },

    resolveIntensity: (doseValue: number | undefined, intensityBundle: IntensityBundle | undefined): Dosage | undefined => {
        if (!doseValue || !intensityBundle) {
            return undefined;
        }

        if (doseValue > 0 && doseValue <= intensityBundle.low.doseSize) {
            return Dosage.LOW;
        } else if (doseValue > intensityBundle.low.doseSize && doseValue <= intensityBundle.moderate.doseSize) {
            return Dosage.MODERATE;
        } else {
            return Dosage.HIGH;
        }
    },

    // @Andrii you might be able to refactor to use collectCodesFromStorage,
    //  but i wanted all the loinc codes in a single parameter
    // TODO: optimize nested forEach
    composeLabCodesFilter: (useCodeset: string): string => {
        let codes: string = '';
        fhirCodes.labs.forEach((lab: any) => {
            const codeset = lab.codesets.find((cs: any) => {
                return cs.name.toLowerCase() === useCodeset.toLowerCase()
            });
            codeset.codes.forEach((codeValue: string) => {
                codes += codeset.source + "|" + codeValue + ","
            });
        });
        codes = codes.slice(0, -1); // strip trailing ','
        return codes;
    },

    byCodes: (observations: any, property: any) => {
        const bank = Utils.byCode(observations, property);
        // @ts-ignore
        return (...codes: any[]) => codes.filter(code => code + "" in bank).reduce((prev, code) => prev.concat(bank[code + ""]), []);
    },

    byCode: (observations: any, property: string | number) => {
        const ret = {};

        const handleCodeableConcept = (concept: { coding: { code: any; }[]; }, observation: any) => {
            if (concept && Array.isArray(concept.coding)) {
                concept.coding.forEach(({code}) => {
                    if (code) {
                        // @ts-ignore
                        ret[code] = ret[code] || [];
                        // @ts-ignore
                        ret[code].push(observation);
                    }
                });
            }
        };

        const makeArray = (arg: any) => {
            if (Array.isArray(arg)) {
                return arg;
            }
            return [arg];
        }

        makeArray(observations).forEach(o => {
            if (o.resourceType === "Observation" && o[property]) {
                if (Array.isArray(o[property])) {
                    o[property].forEach((concept: { coding: { code: any; }[]; }) => handleCodeableConcept(concept, o));
                } else {
                    handleCodeableConcept(o[property], o);
                }
            }
        });

        return ret;
    }
};

export const FHIRServiceHelper = {
    prepareLabsRequest: (smart: Client): Promise<any> => {
        // this can probably be moved for 1-time execution
        const labCodes = Utils.composeLabCodesFilter('LOINC');

        const labsQuery = new URLSearchParams();
        labsQuery.set('patient', smart?.patient?.id || '');
        labsQuery.set('code', labCodes);
        labsQuery.set('_count', '500');

        return smart.request(`Observation?${labsQuery}`, {
            pageLimit: 0,
            flat: true,
        });
    },

    prepareMedicationsRequest: (smart: Client): Promise<any> => {
        const medicationsQuery = new URLSearchParams();
        medicationsQuery.set('patient', smart?.patient?.id || '');
        medicationsQuery.set('_count', '500');

        return smart.request(`MedicationRequest?${medicationsQuery}`)
    },

    prepareConditionsRequest: (smart: Client): Promise<any> => {
        const conditionsQuery = new URLSearchParams();
        conditionsQuery.set('patient', smart?.patient?.id || '');
        conditionsQuery.set('clinicial-status', 'active');
        conditionsQuery.set('_count', '500');

        return smart.request(`Condition?${conditionsQuery}`);
    },

    /**
     * The method prepares standard `smart.byCodes()` method shipped with fhir-client and makes it work with
     * `conditions`. By default, that resolver method only works with 'Observations' and expects an array of objects which have both
     * resourceType 'Observation' and codeable property in their roots.
     *
     * The method below converts the results to corresponding shape and creates the resolver based on that data.
     */
    prepareConditionsByCodesResolver: (smart: Client, conditionsResults: { entry: Array<any> }): (...codes: string[]) => any[] => {
        const conditionsByCodesResolver = Utils.byCodes(
            conditionsResults.entry.map((entryValue: any) => (
                {...entryValue.resource, resourceType: 'Observation'})
            ),
            'code'
        );

        return conditionsByCodesResolver;
    },

    /**
     * The method prepares standard `smart.byCodes()` method shipped with fhir-client and makes it work with
     * `medications`. By default, that resolver method only works with 'Observations' and expects an array of objects which have both
     * resourceType 'Observation' and codeable property in their roots.
     *
     * The method below converts the results to corresponding shape and creates the resolver based on that data.
     * E.g. med results such as
     *
     * entry: [
     *    {
     *      'fullUrl': 'url',
     *      'resource': {
     *          'resourceType': 'Medication',
     *          'medicationCodeableConcept': {
     *              'coding': [
     *                  ...
     *              ]
     *          }
     *      },
     *      ...
     *    },
     *    ...
     * ]
     *
     * will be mapped into:
     *
     * [
     *   {
     *          'resourceType': 'Observation',
     *          'medicationCodeableConcept': {
     *              'coding': [
     *                  ...
     *              ]
     *   },
     *   ...
     * ]
     *
     * And the 'medicationCodeableConcept' will be given to the .byCodes factory method as codes location element.
     */
    prepareMedicationsByCodesResolver: (smart: Client, medicationsResults: { entry: Array<any> }): (...codes: string[]) => any[] => {
        const medicationsByCodesResolver = Utils.byCodes(
            // Adjust medications results slightly to be able to use them with 'smart.byCodes()` method as
            // it expects an array of objects which have both resourceType 'Observation' and codeable property in their roots.
            medicationsResults.entry.map((entryValue: any) => (
                {...entryValue.resource, resourceType: 'Observation'})
            ),
            'medicationCodeableConcept'
        );

        return medicationsByCodesResolver;
    },

    resolveMeasurableObservation: (
        kind: 'conditions' | 'labs' | 'meds',
        groupName: string,
        smartCodesResolver: (...codes: string[]) => any[]
    ): Measurement | undefined => {

        const codes: string[] = Utils.collectCodesFromStorage(kind, groupName)

        const sortedObservations = smartCodesResolver(...codes)
            .filter(observation => observation.status.toLowerCase() === 'final' || observation.status.toLowerCase() === 'amended')
            .sort((a, b) => Date.parse(b.effectiveDateTime) - Date.parse(a.effectiveDateTime));

        if (sortedObservations.length === 0) return undefined;

        const newestObservation: any[] = [];
        let matchingObservationComponent: any;
        newestObservation.push(sortedObservations[0]);  // use the single newest

        if (newestObservation[0].component) {  // if has components
            matchingObservationComponent = newestObservation[0].component
                .filter((obsComponent: any) => obsComponent?.valueQuantity?.value && obsComponent?.valueQuantity?.unit)
                .find((obsComponent: any) => obsComponent?.code?.coding?.some((codeEl: any) => codes.includes(codeEl.code)));
            if (!!matchingObservationComponent) {
              matchingObservationComponent.effectiveDateString = newestObservation[0].effectiveDateTime;
            }

        } else {// no .component, single observation
            matchingObservationComponent = newestObservation
                .map((observation: any) => ({...observation, effectiveDateString: observation.effectiveDateTime}))
                .filter((obsComponent: any) => obsComponent?.valueQuantity?.value && obsComponent?.valueQuantity?.unit)
                .find((obsComponent: any) => obsComponent?.code?.coding?.some((codeEl: any) => codes.includes(codeEl.code)));
        }

        const measurableObservation: Measurement | undefined = matchingObservationComponent ?
            {
                value: matchingObservationComponent.valueQuantity.value,
                unit: matchingObservationComponent.valueQuantity.unit,
                effectiveEpoch: Date.parse(matchingObservationComponent.effectiveDateString)
            } :
            undefined;

        //console.log(`Resolving measurable observation [${kind}, ${groupName}] => ${JSON.stringify(measurableObservation)}`)

        return measurableObservation;
    },

    resolveBooleanCondition: (
        kind: 'conditions',
        groupName: string,
        smartCodesResolver: (...codes: string[]) => any[]
    ): boolean | undefined => {

        const codes: string[] = Utils.collectCodesFromStorage(kind, groupName)

        const isConditionFound = smartCodesResolver(...codes)
            .filter(condition => !!condition?.abatementDateTime ?
                new Date((condition.abatementDateTime).replace(/-/g, '/')) >= new Date() :
                true
            )
            .some(condition => condition?.clinicalStatus?.text?.toLowerCase() === 'active');

        //console.log(`Resolving bool condition [${kind}, ${groupName}] => ${isConditionFound}`)
        return isConditionFound;
    },

    resolveBooleanObservation: (
        kind: 'labs' | 'meds',
        groupName: string,
        smartCodesResolver: (...codes: string[]) => any[]
    ): boolean | undefined => {

        const codes: string[] = Utils.collectCodesFromStorage(kind, groupName)
        const isObservationFound = smartCodesResolver(...codes)
            .some(observation =>
                observation?.status?.toLowerCase() === 'final' ||
                observation?.status?.toLowerCase() === 'amended' ||
                observation?.status?.toLowerCase() === 'active'
            );

        //console.log(`Resolving bool observation [${kind}, ${groupName}] => ${isObservationFound}`)
        return isObservationFound;
    },

    resolveStatins: (
        medicationsByCodeResolver: (...codes: string[]) => any[]
    ): StatinIntensity | undefined => {

        //console.log('resolveStatins')
        const foundStatinIntensities: StatinIntensity[] = [];

        fhirCodes.statins.forEach((statinGroup: {name: string, codesets: Array<any>, intensityRange: any}) => {
            //console.log(`lookup for ${statinGroup.name} ...`);

            const codeGroupCodeset: { codes: Array<any> } = statinGroup.codesets
                .find((codeset: any) => codeset.name === 'RxNorm');

            const codeGroupCodes: Array<string> = codeGroupCodeset.codes
                .map((codeGroup: { code: string }) => codeGroup.code);

            const foundMedications: Array<any> = medicationsByCodeResolver(...codeGroupCodes);

            foundMedications?.forEach(medication => {
                const doseFromText: number | undefined = Utils.resolveDoseFromText(medication);
                let useDose;
                if (!!doseFromText) {
                    useDose = doseFromText;
                } else {
                    const medicationCodes: Array<any> = medication.medicationCodeableConcept.coding.map((coding: any) => coding.code);
                    useDose = codeGroupCodeset.codes.find((statinCode: StatinCode) => medicationCodes.includes(statinCode.code))?.dose;
                }

                const foundStatinIntensity: StatinIntensity = {
                    intensity: Utils.resolveIntensity(useDose, statinGroup.intensityRange),
                    label: `${statinGroup.name} ${useDose}mg`
                };
                foundStatinIntensities.push(foundStatinIntensity);
                //console.log(`Resolve statin intensity. [${useDose}, ${doseFromText}] => ${JSON.stringify(foundStatinIntensity)}`)
            })
        });


        return foundStatinIntensities?.map((a: StatinIntensity): any => {
                let value = -1;
                switch (a.intensity) {
                    case Dosage.LOW: value = 0; break;
                    case Dosage.MODERATE: value = 1; break;
                    case Dosage.HIGH:  value = 2; break;
                };
                return {...a, intensityLevel: value}
            })
            .reduce((a: any, b: any): StatinIntensity => {
                const {intensityLevel, ...resultingIntensity} = a.intensityLevel > b.intensityLevel ? a : b;
                return resultingIntensity;
            }) || undefined;
    }
};

const FHIRService = {
    resolvePatientData: (smart: Client): Promise<PatientBatch | void> => {
        if (smart?.patient?.id) {
            const patientRequest = smart.patient.read();
            const labsRequest = FHIRServiceHelper.prepareLabsRequest(smart);
            const medicationsRequest = FHIRServiceHelper.prepareMedicationsRequest(smart);
            const conditionsRequest = FHIRServiceHelper.prepareConditionsRequest(smart);

            return Promise.all([patientRequest, labsRequest, medicationsRequest, conditionsRequest])
                .then((results: any[]): PatientBatch => {

                    const patientQueryResults: any = results[0];
                    const labsQueryResults: any = results[1];
                    const medicationsResults: any = results[2];
                    const conditionsResults: any = results[3];

                    //console.log('patient data', patientQueryResults);
                    //console.log('labs raw', labsQueryResults);
                    //console.log('conditions raw', conditionsResults);
                    //console.log('medications raw', medicationsResults);

                    const dateOfBirth: Date = new Date((patientQueryResults.birthDate).replace(/-/g, '/'));
                    const patientData: PatientData = {
                        firstName: Array.from(patientQueryResults.name[0].given).join(''),
                        lastName: Array.from(patientQueryResults.name[0].family).join(''),
                        gender: patientQueryResults.gender,
                        dateOfBirth,
                        age: Utils.computeAgeFromBirthDate(new Date(dateOfBirth?.valueOf())),
                        residence: 'North-American'
                    };

                    const observationsByCodesResolver = Utils.byCodes(labsQueryResults, 'code');
                    patientData.labResults = {
                        // '14647-2', '2093-3'
                        totalCholesterol: FHIRServiceHelper.resolveMeasurableObservation(
                            'labs',
                            'Total Cholesterol',
                            observationsByCodesResolver
                        ),
                        ldlCholesterol: FHIRServiceHelper.resolveMeasurableObservation(
                            'labs',
                            'LDL-Cholesterol',
                            observationsByCodesResolver
                        ),
                        creatinine: FHIRServiceHelper.resolveMeasurableObservation(
                            'labs',
                            'Creatinine',
                            observationsByCodesResolver
                        ),
                        systolicBloodPressure: FHIRServiceHelper.resolveMeasurableObservation(
                            'labs',
                            'Systolic Blood Pressure',
                            observationsByCodesResolver
                        ),
                    };

                    let comorbidities: Partial<Comorbidities> = {};
                    if (conditionsResults.entry) {
                        //console.log('have some conditions')
                        const conditionsByCodesResolver = FHIRServiceHelper.prepareConditionsByCodesResolver(smart, conditionsResults);
                        comorbidities = {
                            //TODO: previously we were using '72166-2', '229819007' codes here, but those are not in the list atm
                            //      make sure we don't need them
                            smoking: FHIRServiceHelper.resolveBooleanCondition(
                                'conditions',
                                'Smoking',
                                conditionsByCodesResolver
                            ),
                            diabetes: FHIRServiceHelper.resolveBooleanCondition(
                                'conditions',
                                'Diabetes',
                                conditionsByCodesResolver
                            ),
                            congestiveHeartFailure: FHIRServiceHelper.resolveBooleanCondition(
                                'conditions',
                                'Congestive Heart Failure',
                                conditionsByCodesResolver
                            ),
                            atrialFibrillation: FHIRServiceHelper.resolveBooleanCondition(
                                'conditions',
                                'Atrial Fibrillation',
                                conditionsByCodesResolver
                            ),
                            cerebrovascularDisease: FHIRServiceHelper.resolveBooleanCondition(
                                'conditions',
                                'Cerebrovascular Disease',
                                conditionsByCodesResolver
                            ),
                            coronaryArteryDisease: FHIRServiceHelper.resolveBooleanCondition(
                                'conditions',
                                'Coronary Artery Disease',
                                conditionsByCodesResolver
                            ),
                            peripheralArteryDisease: FHIRServiceHelper.resolveBooleanCondition(
                                'conditions',
                                'Peripheral Arterial Disease',
                                conditionsByCodesResolver
                            ),
                        };
                    }
                    patientData.comorbidities = {...comorbidities};

                    let treatments: Partial<Treatments> = {};
                    if (medicationsResults.entry) {
                        const medicationsByCodesResolver = FHIRServiceHelper.prepareMedicationsByCodesResolver(smart, medicationsResults);
                        treatments = {
                            isPCSK9Ihibitor: FHIRServiceHelper.resolveBooleanObservation(
                                'meds',
                                'PCSK9 Inhibitor',
                                medicationsByCodesResolver
                            ),
                            isAspirin: FHIRServiceHelper.resolveBooleanObservation(
                                'meds',
                                'Aspirin',
                                medicationsByCodesResolver
                            ),
                            isEzetimib: FHIRServiceHelper.resolveBooleanObservation(
                                'meds',
                                'Ezetimibe',
                                medicationsByCodesResolver
                            ),
                            isGLP1ReceptorAgonists: FHIRServiceHelper.resolveBooleanObservation(
                                'meds',
                                'GLP1 Recepror Agonist',
                                medicationsByCodesResolver
                            ),
                            isRivaroxaban: FHIRServiceHelper.resolveBooleanObservation(
                                'meds',
                                'Rivaroxaban',
                                medicationsByCodesResolver
                            ),
                            isSGLT2Inhibitors: FHIRServiceHelper.resolveBooleanObservation(
                                'meds',
                                'SGLT2 Inhibitor',
                                medicationsByCodesResolver
                            ),
                            statin: FHIRServiceHelper.resolveStatins(medicationsByCodesResolver),
                            p2Y12Inhibitors: fhirCodes.meds.filter((medsItem: any) => medsItem.category === 'P2Y12 Inhibitor')
                                .filter((fhirGroup:any) => FHIRServiceHelper.resolveBooleanObservation('meds', fhirGroup.name, medicationsByCodesResolver))
                                .map((fhirGroup:any) => P2Y12Inhibitors[fhirGroup.name.toUpperCase() as keyof typeof P2Y12Inhibitors])
                                .find((name: string) => !!name)
                        };
                    }

                    return {
                        patientData,
                        treatments
                    }
                })

        } else {
            // Canadarm.error('Patient resource failure while loading the application.');
            return Promise.resolve(undefined);
        }
    },
};

export default FHIRService;
