import React from 'react';
import styles from './SelectGroup.module.scss';
import Row from "react-bootstrap/esm/Row";
import Col from "react-bootstrap/esm/Col";
import {Form} from "react-bootstrap/esm/index";
import {SelectOption} from "../../../interfaces/FormBlocks.intefaces";

interface SelectGroupProps {
    label: string,
    name: string,
    controlId: string,
    selectOptions: Array<SelectOption>,
    defaultValue?: SelectOption,
    error: any,
    isTouched: any,
    changeHanlder: (event: React.ChangeEvent<any>) => void,
    disabled?: boolean;
}

const SelectGroup = (props: SelectGroupProps) => (
    <Form.Group as={Row} md="4" controlId={props.controlId}>
        <Col md={5} className={styles.selectGroupContainer__label}>
            <span>{props.label}</span>
        </Col>
        <Col md={6}>
            <Form.Control
                as="select"
                type="select"
                className={props.isTouched && !!props.error ? styles['formcontrol-error'] : ''}
                name={props.name}
                value={props.defaultValue?.value}
                onChange={props.changeHanlder}
                isInvalid={props.isTouched && !!props.error}
                disabled={props.disabled}
            >
                <option value="">Select one...</option>
                {props.selectOptions.map((option, index) => (
                    <option key={index} value={option.value} >{option.label}</option>
                ))}
            </Form.Control>
            <Form.Control.Feedback type="invalid" tooltip>
               {props.error}
            </Form.Control.Feedback>
        </Col>
    </Form.Group>
);

export default SelectGroup;
