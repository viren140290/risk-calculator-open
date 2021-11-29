import React, {useEffect, useState} from 'react';
import PatientBanner from "../PatientBanner/PatientBanner";
import Navbar from "../Navbar/Navbar";
import CalcForm from "../CalcForm/CalcForm";
import GraphResults from "../GraphResults/GraphResults";
import {useIntl} from "react-intl";
import FHIR from "fhirclient";
import Client from "fhirclient/lib/Client";
import FHIRService, {PatientBatch, PatientData, Treatments} from "../../services/FHIRService";
import CalculatorService from "../../services/CalculatorService";
import {Container} from "react-bootstrap/esm/index";
import ForPatients from "../ForPatients/ForPatients";
import ForProviders from "../ForProviders/ForProviders";
import styles from './App.module.scss';
import ScrollButton from "../shared/ScrollButton/ScrollButton";
import 'cerner-smart-embeddable-lib';
import {treatmentsAreEqual, getMsg} from "./utils";

interface AppState {
    initialPatientData?: PatientData,
    currentPatientData?: PatientData,
    initialTreatments?: Treatments,
    currentTreatments?: Treatments,
    intendedTreatments?: Treatments,
    cvdRiskScoreNoTreatment?: number,
    cvdRiskScoreCurrentTreatment?: number,
    cvdRiskScoreIntendedTreatment?: number,
    tabIndex: number,
    isPatientHeaderHidden: boolean,
    isProcessingData: boolean,
    isCurrentDataSubmitted: boolean
}

function App() {
    const [state, setState] = useState<AppState>({
        tabIndex: 0,
        isPatientHeaderHidden: false,
        isProcessingData: false,
        isCurrentDataSubmitted: false
    });

    const intl = useIntl();

    useEffect(() => {
        FHIR.oauth2.ready(
            (smart: Client) => {
                setState(prevState => {
                    return {
                        ...prevState,
                        isPatientHeaderHidden: true,
                        isProcessingData: true,
                    }
                })
                FHIRService.resolvePatientData(smart).then(
                    (patientBatch: PatientBatch | void) => {
                        if (!!patientBatch) {
                            // console.log(`Setting current patient data ${JSON.stringify(patientBatch, null, 2)}`);

                            setState(prevState => {
                                return {
                                    ...prevState,
                                    initialPatientData: patientBatch.patientData,
                                    initialTreatments: patientBatch.treatments,
                                    currentPatientData: patientBatch.patientData,
                                    currentTreatments: patientBatch.treatments,
                                    intendedTreatments: patientBatch.treatments,
                                    isProcessingData: false
                                }
                            })
                        } else {
                            setState(prevState => {
                                return {...prevState, isProcessingData: false}
                            })
                        }
                    },
                    (error: Error) => setState(prevState => {
                        console.warn(`Unable to resolve patient data. ${error.message}`)
                        return {...prevState, isProcessingData: false}
                    })
                );
            },
            (error: Error) => {
                console.log(`Unable to fetch the SMART client context. ${error.message}`)
            });
    }, []);

    const patientDataSubmitHandler = (patientData: PatientData, currentTreatments: Treatments) => {
        const noTreatmentScore = CalculatorService.computeTenYearsRiscScore(patientData);
        const currTreatmentScore = CalculatorService.applyTreatments(noTreatmentScore, patientData, undefined, currentTreatments);
        const intTreatmentScore = currTreatmentScore;

        setState(prevState => {
            return {
                ...prevState,
                currentTreatments,
                currentPatientData: patientData,
                intendedTreatments: currentTreatments,
                cvdRiskScoreNoTreatment: noTreatmentScore,
                cvdRiskScoreCurrentTreatment: currTreatmentScore,
                cvdRiskScoreIntendedTreatment: intTreatmentScore,
                isCurrentDataSubmitted: true
            }
        })
    }

    const patientDataRestoreHandler = (): void => {
        const initialPatientData: PatientData | undefined = state.initialPatientData;
        const initialTreatments: Treatments | undefined = state.initialTreatments;

        setState(prevState => {
            return {
                ...prevState,
                currentPatientData: initialPatientData,
                currentTreatments: initialTreatments,
                intendedTreatments: initialTreatments,
                isCurrentDataSubmitted: false,
                cvdRiskScoreNoTreatment: undefined,
                cvdRiskScoreCurrentTreatment: undefined,
                cvdRiskScoreIntendedTreatment: undefined
            }
        })
    }

    const tabIndexUpdateHandler = (newTabIndex: number) => {
        setState(prevState => {
            return {
                ...prevState,
                tabIndex: newTabIndex
            }
        })
    }

    const intendedTreatmentsSaveHandler = (treatments: Treatments, scoreWithTreatments: number) => {
        !treatmentsAreEqual(state.intendedTreatments, treatments) &&
        state.cvdRiskScoreIntendedTreatment !== scoreWithTreatments &&
        setState(prevState => {
            return {
                ...prevState,
                intendedTreatments: treatments,
                cvdRiskScoreIntendedTreatment: scoreWithTreatments
            }
        })
    }

    const RiskScore = () => (
        <>
            <CalcForm
                isProcessing={state.isProcessingData}
                isSubmitted={state.isCurrentDataSubmitted}
                patientData={state.currentPatientData}
                treatments={state.currentTreatments}
                onPatientDataSubmit={patientDataSubmitHandler}
                onPatientDataRestore={patientDataRestoreHandler}
            />

            {
                typeof state.cvdRiskScoreNoTreatment !== "undefined" &&
                typeof state.cvdRiskScoreCurrentTreatment !== "undefined" &&
                typeof state.cvdRiskScoreIntendedTreatment !== "undefined" &&
                <Container className={styles.flexContainer}>
                    <GraphResults
                        cvdRiskScoreNoTreatment={state.cvdRiskScoreNoTreatment}
                        cvdRiskScoreCurrentTreatment={state.cvdRiskScoreCurrentTreatment}
                        cvdRiskScoreIntendedTreatment={state.cvdRiskScoreIntendedTreatment}
                        currentTreatments={state.currentTreatments}
                        intendedTreatments={state.intendedTreatments}
                        patientData={state.currentPatientData}
                        onIntendedTreatmentsSave={intendedTreatmentsSaveHandler}
                    />
                </Container>
            }

            <Container>
                <p><b>*</b> {getMsg(intl,`footer.footnote.statin`)}</p>
                {typeof state.cvdRiskScoreNoTreatment !== "undefined" &&
                <h6><b>{getMsg(intl,`footer.note.title`)}</b></h6>}
                {typeof state.cvdRiskScoreNoTreatment !== "undefined" &&
                <p>{getMsg(intl, `footer.note.text`)}</p>}
                <h6><b>{getMsg(intl, `footer.bp.title`)}</b></h6>
                <p>{getMsg(intl, `footer.bp.text`)}</p>
                <h6><b>{getMsg(intl, `footer.smoking.title`)}</b></h6>
                <p>{getMsg(intl,`footer.smoking.text`)}</p>
                <h6><b>{getMsg(intl, `footer.about.title`)}</b></h6>
                <p>{getMsg(intl,`footer.about.text`)}</p><br/>
            </Container>
        </>
    );

    return (
        <>
            <PatientBanner isPatientDataHidden={state.isPatientHeaderHidden} patientData={state.currentPatientData}/>
            <Navbar activeTabIndex={state.tabIndex} onActiveTabIndexUpdate={tabIndexUpdateHandler}/>

            {state.tabIndex === 0 && <RiskScore/>}
            {state.tabIndex === 1 && <ForPatients/>}
            {state.tabIndex === 2 && <ForProviders/>}

            <ScrollButton targetId='scrollButtonAnchor'/>
            <div id="scrollButtonAnchor"></div>
        </>
    );
};

export default App;
