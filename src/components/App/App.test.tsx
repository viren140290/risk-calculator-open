import React from 'react';
import {render, screen, waitFor} from '@testing-library/react';
import {IntlProvider} from "react-intl";
import App from './App';
import en from "../../lang/en.json";
import patientBatch from "./__test_data__/patientBatch.json";
import {act} from "react-dom/test-utils";

const mockResolvePatientBatch = jest.fn();
jest.mock("../../services/FHIRService", () => ({
    resolvePatientData: (...args: any[]) => mockResolvePatientBatch(...args)
}));

jest.mock('fhirclient', () => ({
    oauth2: {
        ready(onSuccess: any, onError: any) {
            onSuccess();
        }
    }
}))

test('Successful rendering App + CalcForm with real user data. Submittable form', async () => {
    mockResolvePatientBatch.mockReturnValue(Promise.resolve(patientBatch));

    await act(async () => {
        let view = await render(<IntlProvider locale="en" messages={en}><App/></IntlProvider>);
        expect(await view).toMatchSnapshot();
    })

    const submitButton = screen.getByRole('button', {name: 'Calculate Risk Score'})
    expect(submitButton).toBeEnabled();
});

test('Succesful rendering App + CalcForm with real user data. Incomplete data', async () => {
    mockResolvePatientBatch.mockReturnValue(Promise.resolve({...patientBatch, patientData:{...patientBatch.patientData, age: undefined}}));

    await act(async () => {
        let view = await render(<IntlProvider locale="en" messages={en}><App/></IntlProvider>);
        expect(await view).toMatchSnapshot();
    })

    const submitButton = await screen.getByRole('button', {name: 'Calculate Risk Score'})
    expect(submitButton).toBeDisabled();
});
