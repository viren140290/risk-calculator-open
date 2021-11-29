import React from 'react';
import { render } from '@testing-library/react';
import {IntlProvider} from "react-intl";
import en from "../../lang/en.json";
import IntendedTreatments from "./IntendedTreatments";
import {Treatments} from "../../services/FHIRService";

jest.mock('@fortawesome/react-fontawesome', () => ({
    FontAwesomeIcon: (props: any) => {return <i className={`fa ${props.icon}`} />;}
}))

test('Succesful rendering', () => {
  const mockHandleTreatmentsChange = jest.fn((treatments: Treatments) => {});

  const element = render(
      <IntlProvider locale="en" messages={en}>
        <IntendedTreatments
            onTreatmentsChange={mockHandleTreatmentsChange}
        />
      </IntlProvider>
  );
  expect(element).toMatchSnapshot();
});
