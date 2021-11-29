import React, {useEffect, useState} from 'react';
import styles from './InputGroup.module.scss';
import Row from "react-bootstrap/esm/Row";
import Col from "react-bootstrap/esm/Col";
import {Form} from "react-bootstrap/esm/index";

interface InputGroupProps {
    label: string,
    name: string,
    controlId: string,
    value?: string | number,
    placeholder: string,
    error: any,
    isTouched: any,
    disabled?: boolean,
    changeHanlder: (event: React.ChangeEvent<any>) => void,
}

const InputGroup = (props: InputGroupProps) => {
    const [value, setValue] = useState(props.value);
    const [error, setError] = useState(props.error);

    useEffect(() => {
        setValue(props.value);
        setError(props.error);
    }, [props.value, props.error]);

    const hanldeChange = (event: React.ChangeEvent<any>): void => {
        setValue(event.target.value);
        props.changeHanlder(event);
    };

    return (
        <Form.Group as={Row} md="4" controlId={props.controlId}>
            <Col md={5} className={styles.inputGroupContainer__label}>
                <span>{props.label}</span>
            </Col>
            <Col md={6}>
                <Form.Control
                    type="number"
                    className={!!error?.type && !props.disabled ? styles[`formcontrol-${error.type}`] : ''}
                    name={props.name}
                    placeholder={props.placeholder}
                    value={value}
                    isInvalid={error?.type === 'invalid'}
                    disabled={props.disabled}
                    onChange={hanldeChange}
                />
                <Form.Control.Feedback type="invalid">
                    {error?.message}
                </Form.Control.Feedback>
            </Col>
        </Form.Group>
    );
}

export default InputGroup;
