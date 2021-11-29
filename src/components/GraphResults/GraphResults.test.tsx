import React from 'react';
import {render, screen} from '@testing-library/react';
import fireEvent from '@testing-library/user-event';
import GraphResults from "./GraphResults";
import patientBatch from "./__test_data__/patientBatch.json";
import {Dosage, PatientData, Treatments} from "../../services/FHIRService";
import {IntlProvider} from "react-intl";
import en from "../../lang/en.json";

jest.mock('patternomaly', () => ({
    draw: jest.fn()
}));

jest.mock('react-chartjs-2', () => ({
    Bar: () => null
}));

jest.mock('@fortawesome/react-fontawesome', () => ({
    FontAwesomeIcon: (props: any) => {return <i className={`fa ${props.icon}`} />;}
}))

//TODO: These tests need a little care (make sure to go beyond rendering verification with a snapshot).
test('Successful rendering', async () => {
    const cvdRiskScoreNoTreatment: number = 35;
    const cvdRiskScoreCurrentTreatment: number = 45;
    const cvdRiskScoreIntendedTreatment: number = 45;

    const intendedTreatmentsSaveHandler = jest.fn();

    //TODO: swallowing forwardRef warning - need to fix this
    jest.spyOn(console, 'error').mockImplementation()

    const element = render(
        <IntlProvider locale="en" messages={en}>
            <GraphResults
                cvdRiskScoreNoTreatment={cvdRiskScoreNoTreatment}
                cvdRiskScoreCurrentTreatment={cvdRiskScoreCurrentTreatment}
                cvdRiskScoreIntendedTreatment={cvdRiskScoreIntendedTreatment}
                onIntendedTreatmentsSave={intendedTreatmentsSaveHandler}
            />
        </IntlProvider>
    );
    expect(await element).toMatchSnapshot();

});

test('Successful update', async () => {
    const cvdRiskScoreNoTreatment: number = 35;
    const cvdRiskScoreCurrentTreatment: number = 45;
    const cvdRiskScoreIntendedTreatment: number = 45;

    const intendedTreatmentsSaveHandler = jest.fn();

    const patientData: PatientData = {...patientBatch.patientData, gender: 'male'}
    const treatments: Treatments = {...patientBatch.treatments, statin: {intensity: Dosage.LOW}}


    const element = render(
        <IntlProvider locale="en" messages={en}>
            <GraphResults
                cvdRiskScoreNoTreatment={cvdRiskScoreNoTreatment}
                cvdRiskScoreCurrentTreatment={cvdRiskScoreCurrentTreatment}
                cvdRiskScoreIntendedTreatment={cvdRiskScoreIntendedTreatment}
                onIntendedTreatmentsSave={intendedTreatmentsSaveHandler}
                patientData={patientData}
                currentTreatments={treatments}
            />
        </IntlProvider>
    );

    const inputCheckbox = await screen.getByRole('checkbox', {name: 'Ezetimibe'})
    fireEvent.click(inputCheckbox);

    expect(element).toMatchSnapshot();
    // expect(useRefSpy).toBeCalledWith(null);
});
