import React from 'react';
import {render} from '@testing-library/react';
import {IntlProvider} from "react-intl";
import en from "../../lang/en.json";
import CalcForm from "./CalcForm";
import {PatientData, Treatments} from "../../services/FHIRService";
import {act} from "react-dom/test-utils";

test('Succesful rendering', async () => {
    const mockHandleSubmitPatientData =
        jest.fn((patientData: PatientData, currentTreatments: Treatments) => {});
    const mockHandleRestorePatientData =
        jest.fn(() => {});

    await act(async () => {
        const element = render(
            <IntlProvider locale="en" messages={en}>
                <CalcForm
                    onPatientDataSubmit={mockHandleSubmitPatientData}
                    onPatientDataRestore={mockHandleRestorePatientData}
                />
            </IntlProvider>
        );
        expect(element).toMatchSnapshot();
    })
});
