import FHIRService, {Dosage, PatientBatch, Utils, FHIRServiceHelper, StatinIntensity} from "./FHIRService";
import smart from "fhirclient";
import {when} from 'jest-when';

import patientQueryResults from './test_data/patient_v/patientQueryResult.json';
import conditionsQueryResults from './test_data/patient_v/conditionsQueryResult.json';
import medicationsQueryResults from './test_data/patient_v/medicationsQueryResult.json';
import labsQueryResults from './test_data/patient_v/labsQueryResult.json';

const mockReadPatient = jest.fn();
const mockRequest = jest.fn();

jest.mock('fhirclient', () => ({
    client: {
        request: (...args: any[]) => mockRequest(...args),
        patient: ({
            id: '1234',
            read: (...args: any[]) => mockReadPatient(...args)
        })
    }
}));

describe('FHIRService Core', () => {
    test('Happy path. Successfully resolved all the data.', async () => {
        mockReadPatient.mockReturnValue(Promise.resolve(patientQueryResults));

        when(mockRequest)
            .calledWith(
                `Observation?patient=1234&code=http%3A%2F%2Floinc.org%7C2093-3%2Chttp%3A%2F%2Floinc.org%7C48620-9%2Chttp%3A%2F%2Floinc.org%7C2160-0%2Chttp%3A%2F%2Floinc.org%7C38483-4%2Chttp%3A%2F%2Floinc.org%7C44784-7%2Chttp%3A%2F%2Floinc.org%7C72271-0%2Chttp%3A%2F%2Floinc.org%7C13457-7%2Chttp%3A%2F%2Floinc.org%7C14155-6%2Chttp%3A%2F%2Floinc.org%7C18261-8%2Chttp%3A%2F%2Floinc.org%7C18262-6%2Chttp%3A%2F%2Floinc.org%7C2089-1%2Chttp%3A%2F%2Floinc.org%7C2090-9%2Chttp%3A%2F%2Floinc.org%7C22748-8%2Chttp%3A%2F%2Floinc.org%7C35198-1%2Chttp%3A%2F%2Floinc.org%7C39469-2%2Chttp%3A%2F%2Floinc.org%7C43394-6%2Chttp%3A%2F%2Floinc.org%7C49132-4%2Chttp%3A%2F%2Floinc.org%7C50193-2%2Chttp%3A%2F%2Floinc.org%7C55440-2%2Chttp%3A%2F%2Floinc.org%7C69419-0%2Chttp%3A%2F%2Floinc.org%7C9346-8%2Chttp%3A%2F%2Floinc.org%7C11378-7%2Chttp%3A%2F%2Floinc.org%7C76534-7%2Chttp%3A%2F%2Floinc.org%7C8459-0%2Chttp%3A%2F%2Floinc.org%7C8480-6%2Chttp%3A%2F%2Floinc.org%7C8508-4%2Chttp%3A%2F%2Floinc.org%7C8546-4%2Chttp%3A%2F%2Floinc.org%7C8547-2%2Chttp%3A%2F%2Floinc.org%7C8577-9%2Chttp%3A%2F%2Floinc.org%7C8579-5%2Chttp%3A%2F%2Floinc.org%7C8580-3%2Chttp%3A%2F%2Floinc.org%7C8581-1%2Chttp%3A%2F%2Floinc.org%7C85354-9&_count=500`,
                {pageLimit: 0, flat: true}
            )
            .mockReturnValue(Promise.resolve(labsQueryResults));

        when(mockRequest).calledWith(`MedicationRequest?patient=1234&_count=500`)
            .mockReturnValue(Promise.resolve(medicationsQueryResults));

        when(mockRequest).calledWith(`Condition?patient=1234&clinicial-status=active&_count=500`)
            .mockReturnValue(Promise.resolve(conditionsQueryResults));

        // @ts-ignore
        const resultPromise: Promise<void | PatientBatch> = FHIRService.resolvePatientData(smart.client);

        expect(mockReadPatient).toBeCalledTimes(1);
        expect(mockRequest).toBeCalledTimes(3);
        expect(mockRequest.mock.calls).toEqual([
            [
                `Observation?patient=1234&code=http%3A%2F%2Floinc.org%7C2093-3%2Chttp%3A%2F%2Floinc.org%7C48620-9%2Chttp%3A%2F%2Floinc.org%7C2160-0%2Chttp%3A%2F%2Floinc.org%7C38483-4%2Chttp%3A%2F%2Floinc.org%7C44784-7%2Chttp%3A%2F%2Floinc.org%7C72271-0%2Chttp%3A%2F%2Floinc.org%7C13457-7%2Chttp%3A%2F%2Floinc.org%7C14155-6%2Chttp%3A%2F%2Floinc.org%7C18261-8%2Chttp%3A%2F%2Floinc.org%7C18262-6%2Chttp%3A%2F%2Floinc.org%7C2089-1%2Chttp%3A%2F%2Floinc.org%7C2090-9%2Chttp%3A%2F%2Floinc.org%7C22748-8%2Chttp%3A%2F%2Floinc.org%7C35198-1%2Chttp%3A%2F%2Floinc.org%7C39469-2%2Chttp%3A%2F%2Floinc.org%7C43394-6%2Chttp%3A%2F%2Floinc.org%7C49132-4%2Chttp%3A%2F%2Floinc.org%7C50193-2%2Chttp%3A%2F%2Floinc.org%7C55440-2%2Chttp%3A%2F%2Floinc.org%7C69419-0%2Chttp%3A%2F%2Floinc.org%7C9346-8%2Chttp%3A%2F%2Floinc.org%7C11378-7%2Chttp%3A%2F%2Floinc.org%7C76534-7%2Chttp%3A%2F%2Floinc.org%7C8459-0%2Chttp%3A%2F%2Floinc.org%7C8480-6%2Chttp%3A%2F%2Floinc.org%7C8508-4%2Chttp%3A%2F%2Floinc.org%7C8546-4%2Chttp%3A%2F%2Floinc.org%7C8547-2%2Chttp%3A%2F%2Floinc.org%7C8577-9%2Chttp%3A%2F%2Floinc.org%7C8579-5%2Chttp%3A%2F%2Floinc.org%7C8580-3%2Chttp%3A%2F%2Floinc.org%7C8581-1%2Chttp%3A%2F%2Floinc.org%7C85354-9&_count=500`,
                {pageLimit: 0, flat: true}
            ],
            [
                `MedicationRequest?patient=1234&_count=500`
            ],
            [
                `Condition?patient=1234&clinicial-status=active&_count=500`
            ]
        ]);
        await expect(resultPromise).resolves.toMatchSnapshot();
    });

    test('Smart client is not ready', async () => {
        mockReadPatient.mockReturnValue(Promise.resolve(patientQueryResults));

        // @ts-ignore
        const resultPromise: Promise<void | PatientBatch> = FHIRService.resolvePatientData(undefined);

        expect(mockReadPatient).toBeCalledTimes(0);
        expect(mockRequest).toBeCalledTimes(0);
        await expect(resultPromise).resolves.toBeUndefined();
    });
});

describe('FHIRService Utils', () => {
    test('Resolve dose from text. Valid text with `mg` dose', () => {
        const matchinMedicine: { dosageInstruction?: Array<{ text?: string }> }
            = {dosageInstruction: [{text: '4 mg = 1 tab, Oral, Daily, 30 tab, 0 Refill(s)'}]};

        const result = Utils.resolveDoseFromText(matchinMedicine);
        expect(result).toBe('4');
    });

    test('Resolve dose from text. Valid text but no `mg` dose', () => {
        const matchinMedicine: { dosageInstruction?: Array<{ text?: string }> }
            = {dosageInstruction: [{text: '1 tab, Oral, Daily, 30 tab, 0 Refill(s)'}]};

        const result = Utils.resolveDoseFromText(matchinMedicine);
        expect(result).toBeUndefined();
    });

    test('Resolve dose from text. No dosage instruction', () => {
        const matchinMedicine: { dosageInstruction?: Array<{ text?: string }> } = {};

        const result = Utils.resolveDoseFromText(matchinMedicine);
        expect(result).toBeUndefined();
    });

    test('Resolve dose from text. Dosage instruction is not an array', () => {
        const matchinMedicine: any = {dosageInstruction: {blah: 'blah'}};

        const result = Utils.resolveDoseFromText(matchinMedicine);
        expect(result).toBeUndefined();
    });

    test('Resolve intensity. No dose value, no intensity bundle', () => {
        expect(Utils.resolveIntensity(undefined, undefined)).toBeUndefined();
    });

    test('Resolve intensity. No intensity bundle', () => {
        expect(Utils.resolveIntensity(5, undefined)).toBeUndefined();
    });

    test('Resolve intensity. No dose', () => {
        expect(Utils.resolveIntensity(undefined, {
            low: {doseSize: 5, type: 'test'},
            moderate: {doseSize: 6, type: 'test'},
            high: {doseSize: 7, type: 'test'}
        })).toBeUndefined();
    });

    test('Resolve intensity. Resolve Low', () => {
        expect(Utils.resolveIntensity(3, {
            low: {doseSize: 5, type: 'test'},
            moderate: {doseSize: 9, type: 'test'},
            high: {doseSize: 15, type: 'test'}
        })).toEqual(Dosage.LOW);
    });

    test('Resolve intensity. Resolve Moderate', () => {
        expect(Utils.resolveIntensity(8, {
            low: {doseSize: 5, type: 'test'},
            moderate: {doseSize: 9, type: 'test'},
            high: {doseSize: 15, type: 'test'}
        })).toEqual(Dosage.MODERATE);
    });

    test('Resolve intensity. Resolve High', () => {
        expect(Utils.resolveIntensity(22, {
            low: {doseSize: 5, type: 'test'},
            moderate: {doseSize: 9, type: 'test'},
            high: {doseSize: 15, type: 'test'}
        })).toEqual(Dosage.HIGH);
    });
});

describe('FHIRService Helper', () => {
    test('Resolve boolean condition. 3 items (abatementDate in the past, Invalid status, Active)', () => {
        const mockSmartCodeResolver = jest.fn().mockReturnValue(
            [
                {
                    "abatementDateTime": "2020-04-29",
                    "clinicalStatus": {
                        "text": "Active"
                    },
                },
                {
                    "clinicalStatus": {
                        "text": "Entered in Error"
                    },
                },
                {
                    "abatementDateTime": "2022-04-29",
                    "clinicalStatus": {
                        "text": "Active"
                    },
                }
            ]
        );
        const result = FHIRServiceHelper
            .resolveBooleanCondition('conditions', 'Diabetes', mockSmartCodeResolver);
        expect(result).toBe(true)
    });

    test('Resolve boolean condition. Active, Abatement Date is the future', () => {
        const mockSmartCodeResolver = jest.fn().mockReturnValue(
            [
                {
                    "abatementDateTime": "2022-04-29",
                    "clinicalStatus": {
                        "text": "Active"
                    },
                },
                {
                    "clinicalStatus": {
                        "text": "Entered in Error"
                    },
                }
            ]
        );
        const result = FHIRServiceHelper
            .resolveBooleanCondition('conditions', 'Diabetes', mockSmartCodeResolver);
        expect(result).toBe(true)
    });

    test('Resolve boolean condition. Abatement Date is the past', () => {
        const mockSmartCodeResolver = jest.fn().mockReturnValue(
            [
                {
                    "abatementDateTime": "2020-04-29",
                    "clinicalStatus": {
                        "text": "Active"
                    },
                },
                {
                    "clinicalStatus": {
                        "text": "Entered in Error"
                    },
                }
            ]
        );
        const result = FHIRServiceHelper
            .resolveBooleanCondition('conditions', 'Diabetes', mockSmartCodeResolver);
        expect(result).toBe(false)
    });

    test('Resolve boolean observation. Found', () => {
        const mockSmartCodeResolver = jest.fn().mockReturnValue(
            [
                {
                    "status": "active",
                },
                {
                    "status": "inactive",
                }
            ]
        );
        const result = FHIRServiceHelper
            .resolveBooleanObservation('meds', 'PCSK9 Inhibitor', mockSmartCodeResolver);
        expect(result).toBe(true)
    });

    test('Resolve boolean observation. Not found', () => {
        const mockSmartCodeResolver = jest.fn().mockReturnValue(
            [
                {
                    "status": "inactive",
                },
                {
                    "status": "inactive",
                }
            ]
        );
        const result = FHIRServiceHelper
            .resolveBooleanObservation('meds', 'PCSK9 Inhibitor', mockSmartCodeResolver);
        expect(result).toBe(false)
    });

    test('Resolve statins. 2 valid entries; Resolved by text; Picked up one with highest intensity', () => {
        const mockSmartCodeResolver = jest.fn().mockReturnValueOnce(
            [
                {
                    "dosageInstruction": [
                        {
                            "extension": [
                                {
                                    "valueString": "1 tab, Oral, Daily, # 30 tab, 0 Refill(s), called to pharmacy (Rx)",
                                    "url": "https://fhir-ehr.cerner.com/r4/StructureDefinition/clinical-instruction"
                                }
                            ],
                            "text": "150 MG; 1 tab, Oral, Daily, 30 tab, 0 Refill(s)",
                            "patientInstruction": "1 tab Oral (given by mouth) every day. Refills: 0.",
                            "timing": {
                                "repeat": {
                                    "boundsPeriod": {
                                        "start": "2021-08-24T21:36:00Z"
                                    }
                                },
                                "code": {
                                    "coding": [
                                        {
                                            "system": "https://fhir.cerner.com/ec2458f2-1e24-41c8-b71b-0e701af7583d/codeSet/4003",
                                            "code": "696530",
                                            "display": "Daily",
                                            "userSelected": true
                                        },
                                        {
                                            "system": "http://snomed.info/sct",
                                            "code": "229797004",
                                            "display": "Once daily (qualifier value)",
                                            "userSelected": false
                                        },
                                        {
                                            "system": "http://terminology.hl7.org/CodeSystem/v3-GTSAbbreviation",
                                            "code": "QD",
                                            "display": "QD",
                                            "userSelected": false
                                        }
                                    ],
                                    "text": "Daily"
                                }
                            },
                            "route": {
                                "coding": [
                                    {
                                        "system": "https://fhir.cerner.com/ec2458f2-1e24-41c8-b71b-0e701af7583d/codeSet/4001",
                                        "code": "318185",
                                        "display": "Oral",
                                        "userSelected": true
                                    },
                                    {
                                        "system": "http://snomed.info/sct",
                                        "code": "26643006",
                                        "display": "Oral route (qualifier value)",
                                        "userSelected": false
                                    }
                                ],
                                "text": "Oral"
                            },
                            "doseAndRate": [
                                {
                                    "doseQuantity": {
                                        "value": 1,
                                        "unit": "tab",
                                        "system": "http://unitsofmeasure.org",
                                        "code": "{tbl}"
                                    }
                                }
                            ]
                        }
                    ],
                    "medicationCodeableConcept": {
                        "coding": [
                            {
                                "system": "http://www.nlm.nih.gov/research/umls/rxnorm",
                                "code": "476350",
                                "display": "ezetimibe 40 MG / Simvastatin 40 MG Oral Tablet",
                                "userSelected": false
                            },
                            {
                                "system": "https://fhir.cerner.com/ec2458f2-1e24-41c8-b71b-0e701af7583d/synonym",
                                "code": "3616707",
                                "display": "ezetimibe-simvastatin 40 mg-40 mg oral tablet",
                                "userSelected": true
                            }
                        ],
                        "text": "ezetimibe-simvastatin (ezetimibe-simvastatin oral tablet)"
                    },
                },
                {
                    "dosageInstruction": [
                        {
                            "extension": [
                                {
                                    "valueString": "1 tab, Oral, Daily, # 30 tab, 0 Refill(s), called to pharmacy (Rx)",
                                    "url": "https://fhir-ehr.cerner.com/r4/StructureDefinition/clinical-instruction"
                                }
                            ],
                            "text": "20 MG; 1 tab, Oral, Daily, 30 tab, 0 Refill(s)",
                            "patientInstruction": "1 tab Oral (given by mouth) every day. Refills: 0.",
                            "timing": {
                                "repeat": {
                                    "boundsPeriod": {
                                        "start": "2021-08-24T21:36:00Z"
                                    }
                                },
                                "code": {
                                    "coding": [
                                        {
                                            "system": "https://fhir.cerner.com/ec2458f2-1e24-41c8-b71b-0e701af7583d/codeSet/4003",
                                            "code": "696530",
                                            "display": "Daily",
                                            "userSelected": true
                                        },
                                        {
                                            "system": "http://snomed.info/sct",
                                            "code": "229797004",
                                            "display": "Once daily (qualifier value)",
                                            "userSelected": false
                                        },
                                        {
                                            "system": "http://terminology.hl7.org/CodeSystem/v3-GTSAbbreviation",
                                            "code": "QD",
                                            "display": "QD",
                                            "userSelected": false
                                        }
                                    ],
                                    "text": "Daily"
                                }
                            },
                            "route": {
                                "coding": [
                                    {
                                        "system": "https://fhir.cerner.com/ec2458f2-1e24-41c8-b71b-0e701af7583d/codeSet/4001",
                                        "code": "318185",
                                        "display": "Oral",
                                        "userSelected": true
                                    },
                                    {
                                        "system": "http://snomed.info/sct",
                                        "code": "26643006",
                                        "display": "Oral route (qualifier value)",
                                        "userSelected": false
                                    }
                                ],
                                "text": "Oral"
                            },
                            "doseAndRate": [
                                {
                                    "doseQuantity": {
                                        "value": 1,
                                        "unit": "tab",
                                        "system": "http://unitsofmeasure.org",
                                        "code": "{tbl}"
                                    }
                                }
                            ]
                        }
                    ],
                    "medicationCodeableConcept": {
                        "coding": [
                            {
                                "system": "http://www.nlm.nih.gov/research/umls/rxnorm",
                                "code": "476350",
                                "display": "ezetimibe 20 MG / Simvastatin 40 MG Oral Tablet",
                                "userSelected": false
                            },
                            {
                                "system": "https://fhir.cerner.com/ec2458f2-1e24-41c8-b71b-0e701af7583d/synonym",
                                "code": "3616707",
                                "display": "ezetimibe-simvastatin 40 mg-40 mg oral tablet",
                                "userSelected": true
                            }
                        ],
                        "text": "ezetimibe-simvastatin (ezetimibe-simvastatin oral tablet)"
                    }
                }
            ]
        );
        const result: StatinIntensity | undefined = FHIRServiceHelper.resolveStatins(mockSmartCodeResolver);
        expect(result).toStrictEqual({"intensity": "high", "label": "Atorvastatin 150mg"});
    });
});
