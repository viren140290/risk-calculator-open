import React from 'react';
import styles from './SingleCheckboxGroup.module.scss';
import Row from "react-bootstrap/esm/Row";
import Col from "react-bootstrap/esm/Col";
import {Form, FormGroup} from "react-bootstrap/esm/index";

interface SelectGroupProps {
    label: string,
    name: string,
    checked?: boolean,
    valueHanlder: (field: string, value: any, shouldValidate?: boolean) => void,
    error?: any,
    disabled?: boolean;
}

const SingleCheckboxGroup = (props: SelectGroupProps) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        props.valueHanlder(props.name, event.currentTarget?.checked);
    };

    return (
        <FormGroup as={Row} className={styles.checkboxContainer} controlId={props.name}>
            <Col md="auto">
                <Form.Check
                    type="checkbox"
                    className={styles.customCheckbox}
                    name={props.name}
                    label={props.label}
                    checked={props.checked || false}
                    disabled={props.disabled}
                    isInvalid={props.error?.type === 'invalid'}
                    onChange={handleChange}
                />
                <Form.Control.Feedback type="invalid" className={styles.customCheckboxFeedback}>
                    {props.error?.message}
                </Form.Control.Feedback>
            </Col>
        </FormGroup>
    );
};

export default SingleCheckboxGroup;
