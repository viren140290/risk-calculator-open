import React, {useRef} from 'react';
import styles from './ButtonGroup.module.scss';
import Row from "react-bootstrap/esm/Row";
import Col from "react-bootstrap/esm/Col";
import {ToggleButton, ToggleButtonGroup} from "react-bootstrap/esm/index";
import {SelectOption} from "../../../interfaces/FormBlocks.intefaces";

interface ButtonGroupProps {
  label: string,
  name: string,
  controlId: string,
  selectOptions: Array<SelectOption>,
  defaultValue?: SelectOption,
  error: any,
  isTouched: any,
  changeHanlder: (event: React.ChangeEvent<any>) => void,
  disabled?: boolean,
}

function ButtonGroup(props: ButtonGroupProps) {
  const buttonGroupRef = useRef(null);

  return (
      <Row className={styles.buttonGroupContainer} md="4">
        <Col md={5} className={styles.buttonGroupContainer__label}>
          <span>{props.label}</span>
        </Col>
        <Col md={6}>
          <ToggleButtonGroup
              className={styles.customToggleButtonGroup}
              name={props.name}
              aria-label="First group"
              value={props.defaultValue?.value}
              ref={buttonGroupRef}
          >
            {props.selectOptions
                .filter((option: SelectOption) => !!option.value)
                .map((option: any, index: number) => (
                <ToggleButton
                    key={index}
                    className={styles.customToggleButton}
                    variant={props.isTouched && props.error ? 'outline-danger' : 'outline-primary'}
                    value={option.value}
                    onChange={props.changeHanlder}
                    disabled={props.disabled}
                >
                  {option.label}
                </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Col>
      </Row>
  );
}

export default ButtonGroup;
