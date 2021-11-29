import React, {useState} from 'react';
import styles from './CheckDropGroup.module.scss';
import Row from "react-bootstrap/esm/Row";
import Col from "react-bootstrap/esm/Col";
import {Form, FormGroup, Tooltip} from "react-bootstrap/esm/index";
import Select from "react-select";
import {SelectOption} from "../../../interfaces/FormBlocks.intefaces";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {OverlayTrigger} from "react-bootstrap/cjs";

interface CheckDropGroupProps {
    label: string,
    name: string,
    selectOptions: Array<SelectOption>,
    defaultValue?: SelectOption,
    error?:any,
    disabled?:boolean,
    checked?:boolean,
    warnNoValue?:string;
    valueHanlder: (field: string, value: any, shouldValidate?: boolean) => void,
}

const CheckDropGroup = (props: CheckDropGroupProps) => {
    const [isChecked, setIsChecked] = useState(
        !!props?.defaultValue?.value || !!props?.defaultValue?.label || props.checked );
    const [selectedValue, setSelectedValue] = useState(props.defaultValue);

    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setIsChecked(event.target.checked)
        if(!event.target.checked) {
            props.valueHanlder(props.name, undefined);
            setSelectedValue(undefined);
        }
    };

    const handleDropdownChange = (option: any) => {
        setSelectedValue(option);
        props.valueHanlder(props.name, option?.value);
    };

    const formatOptionLabel = (option: SelectOption, labelState: any) => (
        <div style={{ display: "flex", flexFlow: "column" }}>
            <div>{option.label}</div>
            {
                labelState.context === 'menu' &&
                <div style={{color: "#ccc" }}>
                    {option.description}
                </div>
            }
        </div>
    );

    const customStyles = {
        menu: (provided: any, state: any) => ({
            ...provided,
             width: '300px'
        }),
        option: (provided: any, state: any) => ({
            ...provided,
            borderBottom: '1px solid lightgrey',
        })
    };

    return (
        <FormGroup as={Row} className={styles.checkDropGroupContainer} controlId={props.name}>
            <Col md={5} className={styles.flexContainer}>
                <Form.Check
                    type="checkbox"
                    className={styles.customCheckbox}
                    label={props.label}
                    checked={isChecked}
                    disabled={props.disabled}
                    isInvalid={props.error?.type === 'invalid'}
                    onChange={handleCheckboxChange}
                />
                {
                    !!props?.warnNoValue && !selectedValue?.value && selectedValue?.label &&
                    <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip id={props.name}>{props.warnNoValue}</Tooltip>}
                    >
                        <FontAwesomeIcon className={styles.warnMessage} icon='exclamation-triangle'/>
                    </OverlayTrigger>
                }
            </Col>
            <Col md={6}>
                <Select
                    placeholder="Select one..."
                    value={selectedValue && selectedValue?.value ?
                        props.selectOptions.find(opt => opt.value === selectedValue?.value) :
                        null
                    }
                    name={props.name}
                    label="Single select"
                    isDisabled={props.disabled || !isChecked}
                    options={props.selectOptions}
                    styles={customStyles}
                    formatOptionLabel={formatOptionLabel}
                    onChange={handleDropdownChange}
                />
            </Col>
            <Form.Control.Feedback type="invalid">
                {props.error?.message}
            </Form.Control.Feedback>
        </FormGroup>
    );
};

export default CheckDropGroup;
