import React from 'react';
import { render } from '@testing-library/react';
import {IntlProvider} from "react-intl";
import en from "../../lang/en.json";
import ForPatients from "./ForPatients";

test('Succesful rendering', () => {
  const element = render(
      <IntlProvider locale="en" messages={en}>
        <ForPatients/>
      </IntlProvider>
  );
  expect(element).toMatchSnapshot();
});
